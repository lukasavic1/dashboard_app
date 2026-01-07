'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Professional</p>
                  <p className="mt-1 text-sm text-gray-500">$99/month</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  Active
                </span>
              </div>
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
