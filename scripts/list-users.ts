#!/usr/bin/env node

/**
 * Script to list all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { db } from '../server/db';
import { users } from '../shared/schema';

async function listUsers() {
  try {
    console.log('⏳ Fetching users from database...\n');

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (allUsers.length === 0) {
      console.log('❌ No users found in the database');
      process.exit(0);
    }

    console.log('📋 Users in Database:');
    console.log('─'.repeat(100));
    console.table(allUsers.map((u: any) => ({
      Email: u.email,
      Role: u.role || 'user',
      Status: u.approvalStatus || 'approved',
      Verified: u.emailVerified ? '✓' : '✗',
      'Created At': new Date(u.createdAt).toLocaleString(),
    })));

    console.log('─'.repeat(100));
    console.log(`\nTotal users: ${allUsers.length}`);
    console.log('\n💡 To promote a user to admin, run:');
    console.log('   npx tsx scripts/promote-to-admin.ts your-email@example.com');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }
}

listUsers();
