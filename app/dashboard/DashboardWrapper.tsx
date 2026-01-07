'use client';

import { SubscriptionProtectedRoute } from '@/components/auth/SubscriptionProtectedRoute';
import { DashboardContent } from '@/components/DashboardContent';
import { RefreshButton } from '@/components/RefreshButton';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface DashboardWrapperProps {
  assetsData: any[];
}

export function DashboardWrapper({ assetsData }: DashboardWrapperProps) {
  const { user } = useAuth();

  return (
    <SubscriptionProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Market Fundamentals Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Larry Williams–style analysis based on COT reports and seasonality
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{user?.email}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between rounded-xl border bg-white p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Data Status
                </h3>
                <p className="text-sm text-gray-500">
                  Fundamental data is cached and refreshed only when stale
                </p>
              </div>

              <RefreshButton />
            </div>
            {/* Dashboard Content */}
            <DashboardContent assetsData={assetsData} />
          </div>
        </main>
      </div>
    </SubscriptionProtectedRoute>
  );
}
