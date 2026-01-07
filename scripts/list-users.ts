// Script to list all users in the database
// Usage: npx tsx scripts/list-users.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('📭 No users found in the database.');
      return;
    }

    console.log(`\n📋 Found ${users.length} user(s):\n`);
    console.log('─'.repeat(100));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Stripe Customer: ${user.stripeCustomerId || 'N/A'}`);
      console.log(`   Stripe Subscription: ${user.stripeSubscriptionId || 'N/A'}`);
      console.log(`   Status: ${user.subscriptionStatus || 'N/A'}`);
      console.log(`   Ends At: ${user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleString() : 'N/A'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log(`\n💡 To delete a user, run:`);
    console.log(`   npx tsx scripts/delete-user.ts <email|uid>`);
  } catch (error: any) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
