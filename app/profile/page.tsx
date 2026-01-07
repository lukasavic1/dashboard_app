'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SubscriptionDetails {
  hasSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionStartDate: string | null;
  currentPeriodStart: string | null;
  nextBillingDate: string | null;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/subscription/details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionDetails(data);
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscriptionDetails();
  }, [user]);

  // Now we can do conditional returns after all hooks
  if (!user) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    );
  }

  const accountStatus = user.emailVerified ? 'Verified' : 'Unverified';
  const accountStatusColor = user.emailVerified 
    ? 'text-green-700 bg-green-100 border-green-300' 
    : 'text-yellow-700 bg-yellow-100 border-yellow-300';

  const createdAt = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'trialing':
        return 'bg-blue-100 text-blue-700';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-700';
      case 'canceled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return 'No Subscription';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Profile
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your account settings and view your information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-4xl px-6 py-8">
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <UserCircleIcon className="h-12 w-12 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.displayName || 'User'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${accountStatusColor}`}>
                      {user.emailVerified && (
                        <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                      )}
                      {accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <dl className="space-y-4">
                <div className="flex items-center gap-4">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{createdAt}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lastSignIn}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{user.uid}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Subscription Status */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subscription Status
              </h3>
              {loadingSubscription ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="ml-3 text-sm text-gray-600">Loading subscription details...</p>
                </div>
              ) : subscriptionDetails?.hasSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Current Plan</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">Premium</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(subscriptionDetails.subscriptionStatus)}`}>
                      {getStatusLabel(subscriptionDetails.subscriptionStatus)}
                    </span>
                  </div>
                  
                  <dl className="space-y-3 border-t pt-4">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500">Subscription Started</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(subscriptionDetails.subscriptionStartDate)}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(subscriptionDetails.nextBillingDate)}
                        </dd>
                      </div>
                    </div>
                    {subscriptionDetails.currentPeriodStart && (
                      <div className="flex items-start gap-3">
                        <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <dt className="text-sm font-medium text-gray-500">Current Period Started</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDate(subscriptionDetails.currentPeriodStart)}
                          </dd>
                        </div>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">No active subscription</p>
                  <Link
                    href="/subscription"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Subscribe Now
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
