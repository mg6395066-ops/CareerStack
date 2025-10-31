#!/usr/bin/env node

/**
 * Script to promote a user to admin role
 * Usage: node scripts/promote-to-admin.js your-email@example.com
 */

const { db } = require('../dist/server/db');
const { users } = require('../dist/shared/schema');
const { eq } = require('drizzle-orm');

async function promoteToAdmin(email) {
  try {
    if (!email) {
      console.error('❌ Error: Please provide an email address');
      console.log('Usage: node scripts/promote-to-admin.js your-email@example.com');
      process.exit(1);
    }

    console.log(`⏳ Promoting ${email} to admin...`);

    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email.toLowerCase()))
      .returning({ id: users.id, email: users.email, role: users.role });

    if (result.length === 0) {
      console.error(`❌ Error: User with email ${email} not found`);
      process.exit(1);
    }

    console.log('✅ User promoted to admin successfully!');
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Role: ${result[0].role}`);
    console.log(`   ID: ${result[0].id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
promoteToAdmin(email);
