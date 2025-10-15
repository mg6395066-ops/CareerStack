import { Router } from 'express';
import { db } from '../db';
import { 
  sql, 
  eq, 
  desc 
} from 'drizzle-orm';
import { isAuthenticated } from '../localAuth';
import { 
  writeOperationsRateLimiter 
} from '../middleware/rateLimiter';
import { csrfProtection } from '../middleware/csrf';
import { logCreate, logUpdate, logDelete } from '../utils/auditLogger';
import { 
  requirements,
  nextStepComments,
  insertNextStepCommentSchema,
  type NextStepComment,
  type InsertNextStepComment
} from '@shared/schema';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

// Conditional CSRF protection - bypass in development for debugging
const conditionalCSRF = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('🔧 CSRF bypassed in development mode');
    return next();
  }
  return csrfProtection(req, res, next);
};

// Apply authentication to all routes
router.use(isAuthenticated);

// NEXT STEP COMMENTS ROUTES

// Get next step comments for a requirement
router.get('/requirements/:id/next-step-comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify requirement exists
    const requirement = await db.query.requirements.findFirst({
      where: eq(requirements.id, id),
    });
    
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    
    const comments = await db.query.nextStepComments.findMany({
      where: eq(nextStepComments.requirementId, id),
      with: {
        createdByUser: {
          columns: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: [desc(nextStepComments.createdAt)],
    });

    res.json(comments);
  } catch (error) {
    logger.error({ error: error }, 'Error fetching next step comments:');
    res.status(500).json({ message: 'Failed to fetch next step comments' });
  }
});

// Add next step comment to a requirement
router.post('/requirements/:id/next-step-comments', conditionalCSRF, writeOperationsRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment is required and cannot be empty' });
    }

    // Verify requirement exists
    const requirement = await db.query.requirements.findFirst({
      where: eq(requirements.id, id),
    });

    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    // Create new next step comment
    const commentData = insertNextStepCommentSchema.parse({
      requirementId: id,
      comment: comment.trim(),
      createdBy: req.user!.id,
    });

    const [newComment] = await db.insert(nextStepComments).values(commentData).returning();
    
    // Fetch the comment with user details
    const commentWithUser = await db.query.nextStepComments.findFirst({
      where: eq(nextStepComments.id, newComment.id),
      with: {
        createdByUser: {
          columns: { firstName: true, lastName: true, email: true }
        }
      },
    });

    // Log audit trail
    await logCreate(req.user!.id, 'next_step_comment', newComment.id, newComment, req);

    res.status(201).json(commentWithUser);
  } catch (error) {
    logger.error({ error: error }, 'Error adding next step comment:');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to add next step comment' });
  }
});

// Update next step comment
router.patch('/next-step-comments/:id', conditionalCSRF, writeOperationsRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment is required and cannot be empty' });
    }

    // Get old data for audit log and verify ownership
    const oldComment = await db.query.nextStepComments.findFirst({
      where: eq(nextStepComments.id, id),
    });

    if (!oldComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow the creator to edit their own comment
    if (oldComment.createdBy !== req.user!.id) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    const [updatedComment] = await db
      .update(nextStepComments)
      .set({ 
        comment: comment.trim(),
        updatedAt: new Date() 
      })
      .where(eq(nextStepComments.id, id))
      .returning();

    // Fetch the comment with user details
    const commentWithUser = await db.query.nextStepComments.findFirst({
      where: eq(nextStepComments.id, updatedComment.id),
      with: {
        createdByUser: {
          columns: { firstName: true, lastName: true, email: true }
        }
      },
    });

    // Log audit trail
    await logUpdate(req.user!.id, 'next_step_comment', id, oldComment, updatedComment, req);

    res.json(commentWithUser);
  } catch (error) {
    logger.error({ error: error }, 'Error updating next step comment:');
    res.status(500).json({ message: 'Failed to update next step comment' });
  }
});

// Delete next step comment
router.delete('/next-step-comments/:id', conditionalCSRF, writeOperationsRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    // Get comment data for audit log and verify ownership
    const comment = await db.query.nextStepComments.findFirst({
      where: eq(nextStepComments.id, id),
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow the creator to delete their own comment
    if (comment.createdBy !== req.user!.id) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await db.delete(nextStepComments).where(eq(nextStepComments.id, id));

    // Log audit trail
    await logDelete(req.user!.id, 'next_step_comment', id, comment, req);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error({ error: error }, 'Error deleting next step comment:');
    res.status(500).json({ message: 'Failed to delete next step comment' });
  }
});

export default router;
