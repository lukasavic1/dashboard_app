'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setMessage({
          type: 'error',
          text: data.message || data.error || 'Failed to refresh data',
        });
      } else {
        setMessage({
          type: 'success',
          text: `Refresh completed. ${data.results?.length || 0} assets processed.`,
        });
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

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-black p-2 sm:px-3 sm:py-2 lg:px-4 text-xs sm:text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        aria-label={isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      >
        <ArrowPathIcon className={`h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
      </button>
      
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
