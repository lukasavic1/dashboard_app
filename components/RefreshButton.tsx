'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remainingRefreshes, setRemainingRefreshes] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch remaining refreshes on mount
  useEffect(() => {
    const fetchRemaining = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/refresh/remaining', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setRemainingRefreshes(data.remaining);
        }
      } catch (error) {
        console.error('Error fetching remaining refreshes:', error);
      }
    };

    fetchRemaining();
  }, [user]);

  const handleRefresh = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'Please log in to refresh data',
      });
      return;
    }

    setIsRefreshing(true);
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        if (data.rateLimited) {
          setMessage({
            type: 'error',
            text: data.message || 'Rate limit exceeded',
          });
          setRemainingRefreshes(data.remainingRefreshes ?? 0);
        } else {
          setMessage({
            type: 'error',
            text: data.message || data.error || 'Failed to refresh data',
          });
        }
      } else {
        setMessage({
          type: 'success',
          text: `Refresh completed. ${data.results?.length || 0} assets processed.`,
        });
        // Update remaining refreshes
        if (data.remainingRefreshes !== undefined) {
          setRemainingRefreshes(data.remainingRefreshes);
        }
        // Refresh the page data after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const tooltipText = `Automatic refresh: COT reports are automatically fetched on Tuesday, Thursday, and Friday at 3:35 PM EST (after publication at 3:30 PM EST). If a fetch fails, it will automatically retry after 5 minutes.${remainingRefreshes !== null ? ` You have ${remainingRefreshes} manual refresh${remainingRefreshes !== 1 ? 'es' : ''} remaining today.` : ''}`;

  return (
    <div className="relative flex items-center gap-1">
      <div className="relative">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || !user || (remainingRefreshes !== null && remainingRefreshes === 0)}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-black p-2 sm:px-3 sm:py-2 lg:px-4 text-xs sm:text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          aria-label={isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        >
          <ArrowPathIcon className={`h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
        
        {/* Info icon with tooltip */}
        <div 
          className="relative inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-600 cursor-help ml-1" />
          
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 z-50 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none">
              <div className="whitespace-normal">
                {tooltipText}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute bottom-full right-4 border-4 border-transparent border-b-slate-900"></div>
            </div>
          )}
        </div>
      </div>
      
      {message && (
        <div
          className={`absolute top-full right-0 mt-1 z-50 text-xs px-2 py-1 rounded shadow-lg max-w-[200px] sm:max-w-none ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
          style={{ wordBreak: 'break-word' }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
