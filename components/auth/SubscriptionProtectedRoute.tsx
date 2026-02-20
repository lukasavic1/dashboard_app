'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { fetchSubscriptionStatusWithRetry } from '@/lib/subscription/client';

export function SubscriptionProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Don't check subscription on the subscription page itself
  const isSubscriptionPage = pathname === '/subscription';

  useEffect(() => {
    if (authLoading || !user || isSubscriptionPage) {
      setCheckingSubscription(false);
      return;
    }

    checkSubscriptionStatus();
  }, [user, authLoading, isSubscriptionPage]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setCheckingSubscription(false);
      return;
    }

    try {
      const { ok, data } = await fetchSubscriptionStatusWithRetry(user);

      if (ok && data) {
        setHasSubscription(data.hasActiveSubscription);

        if (!data.hasActiveSubscription && !isSubscriptionPage) {
          router.push('/subscription');
        }
      } else {
        // On error (e.g. 401 when FIREBASE_SERVICE_ACCOUNT_KEY is missing), assume no subscription
        setHasSubscription(false);
        if (!isSubscriptionPage) {
          router.push('/subscription');
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasSubscription(false);
      if (!isSubscriptionPage) {
        router.push('/subscription');
      }
    } finally {
      setCheckingSubscription(false);
    }
  };

  if (authLoading || checkingSubscription) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If on subscription page, always show it
  if (isSubscriptionPage) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  // If no subscription and not on subscription page, don't render children
  // (redirect will happen in useEffect)
  if (!hasSubscription) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Redirecting...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
