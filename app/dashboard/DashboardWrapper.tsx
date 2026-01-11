'use client';

import { SubscriptionProtectedRoute } from '@/components/auth/SubscriptionProtectedRoute';
import { DashboardContent } from '@/components/DashboardContent';
import { RefreshButton } from '@/components/RefreshButton';
import { ScoreWeightSlider } from '@/components/ScoreWeightSlider';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { ScoringConfig } from '@/lib/processing/scoring/types';

interface DashboardWrapperProps {
  assetsData: any[];
}

export function DashboardWrapper({ assetsData }: DashboardWrapperProps) {
  const { user } = useAuth();
  const hasCheckedRef = useRef(false);
  const [scoreWeights, setScoreWeights] = useState<{ cotWeight: number; seasonalityWeight: number }>({
    cotWeight: 0.7,
    seasonalityWeight: 0.3,
  });

  // Check if data is stale on mount and trigger background refresh if needed
  useEffect(() => {
    // Only check once per mount
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check if data is stale (non-blocking, runs in background)
    const checkAndRefresh = async () => {
      try {
        const response = await fetch('/api/check-stale');
        const data = await response.json();

        if (data.stale) {
          console.log('Data is stale, triggering background refresh...');
          // Trigger the cron endpoint in the background (non-blocking)
          // This will check for newer reports and refresh if needed
          fetch('/api/cron/refresh-cot', {
            method: 'GET',
          }).catch((error) => {
            console.error('Background refresh failed:', error);
            // Silently fail - user can manually refresh if needed
          });
        }
      } catch (error) {
        console.error('Error checking stale data:', error);
        // Silently fail - don't interrupt user experience
      }
    };

    // Small delay to not interfere with initial page load
    const timeoutId = setTimeout(checkAndRefresh, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SubscriptionProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Logo and Title */}
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-4 min-w-0 flex-1">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={250}
                  height={250}
                  className="h-10 w-10 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain flex-shrink-0"
                  priority
                />
                <h1 className="text-base sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight leading-tight truncate min-w-0">
                  <span className="hidden min-[420px]:inline">Market Fundamentals Dashboard</span>
                  <span className="min-[420px]:hidden">Fundamentals</span>
                </h1>
              </div>
              {/* Actions: Score Weights, Refresh and Profile */}
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
                <div className="hidden md:block">
                  <ScoreWeightSlider onWeightsChange={setScoreWeights} />
                </div>
                <RefreshButton />
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg p-2 sm:px-3 sm:py-2 lg:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 whitespace-nowrap"
                  aria-label="Profile"
                >
                  <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Score Weights Slider */}
        <div className="md:hidden mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <ScoreWeightSlider onWeightsChange={setScoreWeights} />
        </div>

        {/* Main */}
        <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <DashboardContent assetsData={assetsData} scoreWeights={scoreWeights} />
        </main>
      </div>
    </SubscriptionProtectedRoute>
  );
}
