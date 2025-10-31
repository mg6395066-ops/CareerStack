import 'dotenv/config'
import { db } from '../server/db'
import { AuthService } from '../server/services/authService'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

async function main() {
  try {
    console.log('🔍 Testing resend verification email...')
    
    // Use a test email (CHANGE THIS TO YOUR ACTUAL EMAIL)
    const testEmail = process.env.TEST_EMAIL_TO || '12shivamtiwari219@gmail.com'
    console.log(`📧 Sending to: ${testEmail}`)
    
    // Generate verification token
    const verification = AuthService.generateEmailVerificationToken()
    console.log('✅ Generated verification token')
    
    // Try to find or create test user
    let user = await db.query.users.findFirst({
      where: eq(users.email, testEmail)
    })
    
    if (!user) {
      console.log('👤 Creating test user...')
      const [newUser] = await db.insert(users).values({
        email: testEmail,
        password: 'test',
        emailVerificationToken: verification.tokenHash,
        emailVerificationExpires: verification.expiresAt,
        approvalStatus: 'pending_verification',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning()
      user = newUser
    } else {
      console.log('👤 Found existing user, updating token...')
      await db.update(users).set({
        emailVerificationToken: verification.tokenHash,
        emailVerificationExpires: verification.expiresAt,
        updatedAt: new Date(),
      }).where(eq(users.id, user.id))
    }
    
    console.log(`📧 User: ${testEmail}`)
    console.log(`🔑 Token: ${verification.token.substring(0, 20)}...`)
    
    // Send verification email
    console.log('\n📨 Sending verification email...')
    const result = await AuthService.sendVerificationEmail(testEmail, 'Test User', verification.token)
    
    console.log('\n📊 Email Result:')
    console.log(`  accepted: ${result.accepted}`)
    console.log(`  rejected: ${result.rejected}`)
    console.log(`  error: ${result.error}`)
    console.log(`  messageId: ${result.messageId}`)
    
    if (result.accepted?.length > 0) {
      console.log('\n✅ Email sent successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Email failed to send')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
