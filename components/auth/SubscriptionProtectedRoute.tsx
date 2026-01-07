'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

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
      const token = await user.getIdToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasSubscription(data.hasActiveSubscription);

        // If they don't have an active subscription, redirect to subscription page
        if (!data.hasActiveSubscription && !isSubscriptionPage) {
          router.push('/subscription');
        }
      } else {
        // On error, try to parse response for error details
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Unknown error' };
        }
        console.error('Failed to check subscription status:', response.status, errorData);
        
        // On error, assume no subscription and redirect to subscription page
        // This prevents infinite loading states
        setHasSubscription(false);
        if (!isSubscriptionPage) {
          router.push('/subscription');
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // On error, assume no subscription and redirect to subscription page
      // This prevents infinite loading states
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
