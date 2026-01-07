// Script to delete a user from the database
// Usage: npx tsx scripts/delete-user.ts <email|uid>

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser(identifier: string) {
  try {
    // Try to find user by email first
    let user = await prisma.user.findUnique({
      where: { email: identifier },
    });

    // If not found by email, try by ID (Firebase UID)
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: identifier },
      });
    }

    if (!user) {
      console.error(`❌ User not found: ${identifier}`);
      console.log('\n💡 Tip: You can search by:');
      console.log('   - Email address');
      console.log('   - Firebase UID');
      process.exit(1);
    }

    // Show user info before deletion
    console.log('\n📋 User to be deleted:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'N/A'}`);
    console.log(`   Stripe Subscription ID: ${user.stripeSubscriptionId || 'N/A'}`);
    console.log(`   Subscription Status: ${user.subscriptionStatus || 'N/A'}`);
    console.log(`   Created: ${user.createdAt}`);

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('\n✅ User deleted successfully!');
  } catch (error: any) {
    console.error('\n❌ Error deleting user:', error.message);
    if (error.code === 'P2003') {
      console.error('   This user has related records that need to be deleted first.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get identifier from command line
const identifier = process.argv[2];

if (!identifier) {
  console.error('❌ Please provide an email or Firebase UID');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/delete-user.ts <email|uid>');
  console.log('\nExamples:');
  console.log('  npx tsx scripts/delete-user.ts user@example.com');
  console.log('  npx tsx scripts/delete-user.ts abc123xyz');
  process.exit(1);
}

deleteUser(identifier);
