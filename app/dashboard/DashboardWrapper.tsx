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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Market Fundamentals Dashboard
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  COT reports & seasonality analysis
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <RefreshButton />
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <DashboardContent assetsData={assetsData} />
        </main>
      </div>
    </SubscriptionProtectedRoute>
  );
}
