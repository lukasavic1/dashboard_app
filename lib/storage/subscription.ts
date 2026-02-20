import { prisma } from './prisma';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
}

/**
 * Get or create a user in the database.
 * Uses a unique placeholder email when none is provided (User.email is unique).
 */
export async function getOrCreateUser(firebaseUid: string, email: string) {
  const emailOrPlaceholder = email?.trim() || `${firebaseUid}@no-email.local`;
  return prisma.user.upsert({
    where: { id: firebaseUid },
    update: {
      email: emailOrPlaceholder, // Update email in case it changed
    },
    create: {
      id: firebaseUid,
      email: emailOrPlaceholder,
    },
  });
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(firebaseUid: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: firebaseUid },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user) {
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      subscriptionEndsAt: null,
    };
  }

  const now = new Date();
  const isActive =
    (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') &&
    (!user.subscriptionEndsAt || user.subscriptionEndsAt > now);

  return {
    hasActiveSubscription: isActive,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt,
  };
}

/**
 * Update user's Stripe customer ID
 */
export async function updateStripeCustomerId(
  firebaseUid: string,
  stripeCustomerId: string
) {
  return prisma.user.update({
    where: { id: firebaseUid },
    data: { stripeCustomerId },
  });
}

/**
 * Update user's subscription information
 */
export async function updateSubscription(
  firebaseUid: string,
  data: {
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionEndsAt?: Date | null;
  }
) {
  return prisma.user.update({
    where: { id: firebaseUid },
    data,
  });
}

/**
 * Get user by Stripe customer ID
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId },
  });
}

/**
 * Get user by Stripe subscription ID
 */
export async function getUserByStripeSubscriptionId(stripeSubscriptionId: string) {
  return prisma.user.findUnique({
    where: { stripeSubscriptionId },
  });
}

/**
 * Clear Stripe customer ID (useful when switching between test/live mode)
 */
export async function clearStripeCustomerId(firebaseUid: string) {
  return prisma.user.update({
    where: { id: firebaseUid },
    data: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionEndsAt: null,
    },
  });
}
