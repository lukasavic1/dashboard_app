// Script to manually set a user's subscription to active (for testing)
// Usage: npx tsx scripts/set-subscription.ts <firebase-uid>

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIREBASE_UID = 'qmOrmE7dHQUP6NwAJ697HV5aUZH2';
const SUBSCRIPTION_ENDS_AT = new Date('2026-12-31T23:59:59.000Z');

async function setSubscription() {
  try {
    const result = await prisma.user.upsert({
      where: { id: FIREBASE_UID },
      update: {
        subscriptionStatus: 'active',
        subscriptionEndsAt: SUBSCRIPTION_ENDS_AT,
      },
      create: {
        id: FIREBASE_UID,
        email: `${FIREBASE_UID}@test.local`,
        subscriptionStatus: 'active',
        subscriptionEndsAt: SUBSCRIPTION_ENDS_AT,
      },
    });

    console.log('✅ Subscription set to active for user:');
    console.log(`   ID: ${result.id}`);
    console.log(`   Email: ${result.email}`);
    console.log(`   subscriptionStatus: ${result.subscriptionStatus}`);
    console.log(`   subscriptionEndsAt: ${result.subscriptionEndsAt?.toISOString()}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setSubscription();
