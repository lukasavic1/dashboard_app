'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

function SubscriptionContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if returning from successful checkout
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setSuccess(true);
      // Wait a moment for webhook to process, then check status
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 2000);
    } else {
      checkSubscriptionStatus();
    }
  }, [user, searchParams]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setCheckingStatus(false);
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
        
        // If they have an active subscription, redirect to dashboard
        if (data.hasActiveSubscription) {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout process');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Checking subscription status...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              {success ? (
                <>
                  <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Payment Successful!
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Your subscription is being activated. Redirecting to dashboard...
                  </p>
                </>
              ) : (
                <>
                  <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Subscription Required
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    You need an active subscription to access the dashboard.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Premium Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Access to all trading insights and analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time COT data and seasonality analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced bias scoring and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automatic subscription renewal</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
