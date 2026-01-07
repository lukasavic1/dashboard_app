import { hasActiveSubscription } from '@/lib/storage/subscription';

/**
 * Check subscription status for a Firebase user
 * This is used in server components and API routes
 */
export async function checkSubscriptionStatus(firebaseUid: string | null) {
  if (!firebaseUid) {
    return { hasActiveSubscription: false };
  }

  return hasActiveSubscription(firebaseUid);
}

/**
 * Valid subscription statuses that allow access
 */
export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];

/**
 * Check if a subscription status is considered active
 */
export function isSubscriptionActive(status: string | null): boolean {
  if (!status) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status);
}
