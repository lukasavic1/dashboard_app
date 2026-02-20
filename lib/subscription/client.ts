'use client';

import type { User } from 'firebase/auth';

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
}

/**
 * Fetch subscription status for the current user.
 * Optionally force token refresh (e.g. to retry after 401).
 */
export async function fetchSubscriptionStatus(
  user: User,
  options?: { forceRefresh?: boolean }
): Promise<{ ok: boolean; status: number; data?: SubscriptionStatusResponse }> {
  const token = await user.getIdToken(options?.forceRefresh ?? false);
  const response = await fetch('/api/subscription/status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = response.ok ? await response.json() : undefined;
  return { ok: response.ok, status: response.status, data };
}

/**
 * Fetch subscription status with one retry using a refreshed token on 401.
 * Use this so a briefly stale token does not cause a false 401.
 */
export async function fetchSubscriptionStatusWithRetry(
  user: User
): Promise<{ ok: boolean; status: number; data?: SubscriptionStatusResponse }> {
  let result = await fetchSubscriptionStatus(user);
  if (result.status === 401) {
    result = await fetchSubscriptionStatus(user, { forceRefresh: true });
  }
  return result;
}
