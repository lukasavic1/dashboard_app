'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowPathIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface RefreshResult {
  asset: string;
  status: 'updated' | 'skipped' | 'error';
  reportDate?: string;
  reportDay?: string;
  score?: number;
  bias?: string;
  reason?: string;
  error?: string;
}

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remainingRefreshes, setRemainingRefreshes] = useState<number | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [latestReportDate, setLatestReportDate] = useState<Date | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [refreshResults, setRefreshResults] = useState<RefreshResult[]>([]);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'fetching' | 'processing' | 'completed' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLocalStorageRefreshes = (): number | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`refreshAttempts_${user?.uid}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date === today) {
        return Math.max(0, 3 - data.count);
      }
      return null; // Different day, return null to fetch from server
    } catch {
      return null;
    }
  };

  const updateLocalStorageRefreshes = (increment: boolean = false) => {
    if (typeof window === 'undefined' || !user) return;
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`refreshAttempts_${user.uid}`);
      let count = 0;
      
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          count = data.count;
        }
      }
      
      if (increment) {
        count += 1;
      }
      
      localStorage.setItem(`refreshAttempts_${user.uid}`, JSON.stringify({
        date: today,
        count: count,
      }));
      
      const remaining = Math.max(0, 3 - count);
      setRemainingRefreshes(remaining);
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const refreshRemainingRefreshes = async () => {
    if (!user) return;
    
    // Check localStorage first
    const localRemaining = getLocalStorageRefreshes();
    if (localRemaining !== null) {
      setRemainingRefreshes(localRemaining);
    }
    
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
        // Sync localStorage with server response
        const used = 3 - data.remaining;
        if (used >= 0) {
          const today = new Date().toDateString();
          localStorage.setItem(`refreshAttempts_${user.uid}`, JSON.stringify({
            date: today,
            count: used,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching remaining refreshes:', error);
      // Fallback to localStorage if server fails
      const localRemaining = getLocalStorageRefreshes();
      if (localRemaining !== null) {
        setRemainingRefreshes(localRemaining);
      }
    }
  };

  // Fetch refresh info on mount
  useEffect(() => {
    const fetchRefreshInfo = async () => {
      try {
        // Check localStorage first for immediate display
        if (user) {
          const localRemaining = getLocalStorageRefreshes();
          if (localRemaining !== null) {
            setRemainingRefreshes(localRemaining);
          }
          // Then fetch from server to sync
          await refreshRemainingRefreshes();
        }

        // Fetch last refresh time (no auth required)
        const lastRefreshResponse = await fetch('/api/refresh/last-refresh');
        if (lastRefreshResponse.ok) {
          const lastRefreshData = await lastRefreshResponse.json();
          if (lastRefreshData.lastRefreshTime) {
            setLastRefreshTime(new Date(lastRefreshData.lastRefreshTime));
          }
          if (lastRefreshData.latestReportDate) {
            setLatestReportDate(new Date(lastRefreshData.latestReportDate));
          }
        }
      } catch (error) {
        console.error('Error fetching refresh info:', error);
      }
    };

    fetchRefreshInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setShowProgressModal(true);
    setRefreshStatus('fetching');
    setRefreshResults([]);

    try {
      const token = await user.getIdToken();
      
      // Show processing status after a brief delay
      const processingTimeout = setTimeout(() => {
        setRefreshStatus('processing');
      }, 1000);
      
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      clearTimeout(processingTimeout);

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setRefreshStatus('error');
        if (data.rateLimited) {
          setMessage({
            type: 'error',
            text: data.message || 'Rate limit exceeded',
          });
          const remaining = data.remainingRefreshes ?? 0;
          setRemainingRefreshes(remaining);
          // Sync localStorage
          if (user) {
            const used = 3 - remaining;
            const today = new Date().toDateString();
            localStorage.setItem(`refreshAttempts_${user.uid}`, JSON.stringify({
              date: today,
              count: used,
            }));
          }
        } else {
          setMessage({
            type: 'error',
            text: data.message || data.error || 'Failed to refresh data',
          });
        }
        // Refresh remaining refreshes count
        await refreshRemainingRefreshes();
      } else if (data.status === 'skipped') {
        // Handle skipped refresh (no newer data available)
        setRefreshStatus('completed');
        setRefreshResults([]);
        // Don't show notification for skipped refresh - modal already shows the info
        setMessage(null);
        // Still update localStorage since user attempted
        updateLocalStorageRefreshes(true);
        // Refresh remaining refreshes from server
        await refreshRemainingRefreshes();
      } else {
        setRefreshStatus('completed');
        setRefreshResults(data.results || []);
        
        // Update remaining refreshes
        if (data.remainingRefreshes !== undefined) {
          setRemainingRefreshes(data.remainingRefreshes);
          // Sync localStorage
          const used = 3 - data.remainingRefreshes;
          if (used >= 0 && user) {
            const today = new Date().toDateString();
            localStorage.setItem(`refreshAttempts_${user.uid}`, JSON.stringify({
              date: today,
              count: used,
            }));
          }
        } else {
          // Update localStorage since refresh was successful
          updateLocalStorageRefreshes(true);
          // Refresh it if not provided
          await refreshRemainingRefreshes();
        }
        
        setMessage({
          type: 'success',
          text: `Refresh completed. ${data.results?.length || 0} assets processed.`,
        });
        
        // Refresh the refresh info after a short delay
        setTimeout(async () => {
          router.refresh();
          // Also refresh the last refresh time
          try {
            const lastRefreshResponse = await fetch('/api/refresh/last-refresh');
            if (lastRefreshResponse.ok) {
              const lastRefreshData = await lastRefreshResponse.json();
              if (lastRefreshData.lastRefreshTime) {
                setLastRefreshTime(new Date(lastRefreshData.lastRefreshTime));
              }
              if (lastRefreshData.latestReportDate) {
                setLatestReportDate(new Date(lastRefreshData.latestReportDate));
              }
            }
          } catch (error) {
            console.error('Error refreshing last refresh time:', error);
          }
        }, 1000);
      }
    } catch (error) {
      setRefreshStatus('error');
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefresh = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatReportDate = (date: Date | null): string => {
    if (!date) return 'No data';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getRemainingRefreshesDisplay = () => {
    if (remainingRefreshes === null) return null;
    if (remainingRefreshes === 0) {
      return { text: 'No refreshes left', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    }
    if (remainingRefreshes === 1) {
      return { text: '1 refresh left', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    }
    return { text: `${remainingRefreshes} refreshes left`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'updated':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'skipped':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'updated':
        return '✓';
      case 'skipped':
        return '⊘';
      case 'error':
        return '✗';
      default:
        return '•';
    }
  };

  const modalContent = showProgressModal && mounted ? (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300"
      style={{ paddingTop: '2rem', paddingBottom: '2rem', zIndex: 9999 }}
      onClick={(e) => {
        // Close modal if clicking backdrop and not processing
        if (e.target === e.currentTarget && (refreshStatus === 'completed' || refreshStatus === 'error')) {
          setShowProgressModal(false);
          setRefreshResults([]);
          setRefreshStatus('idle');
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[90vh] relative border border-slate-100 overflow-hidden" style={{ zIndex: 10000 }}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
              <div className="flex items-center gap-3">
                {refreshStatus === 'fetching' || refreshStatus === 'processing' ? (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : refreshStatus === 'completed' ? (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {refreshStatus === 'fetching' && 'Fetching COT Data'}
                    {refreshStatus === 'processing' && 'Processing Assets'}
                    {refreshStatus === 'completed' && 'Refresh Complete'}
                    {refreshStatus === 'error' && 'Refresh Failed'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {refreshStatus === 'fetching' && 'Downloading latest reports from CFTC'}
                    {refreshStatus === 'processing' && 'Analyzing data and computing insights'}
                    {refreshStatus === 'completed' && 'All assets have been updated'}
                    {refreshStatus === 'error' && 'An error occurred during refresh'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  if (refreshStatus === 'completed' || refreshStatus === 'error') {
                    setRefreshResults([]);
                    setRefreshStatus('idle');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-xl hover:bg-slate-100 active:scale-95"
                disabled={refreshStatus === 'fetching' || refreshStatus === 'processing'}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-slate-50/30">
              {refreshStatus === 'fetching' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg shadow-blue-100/50">
                      <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                    <div className="absolute -inset-1 bg-blue-200/20 rounded-2xl blur-xl animate-pulse"></div>
                  </div>
                  <p className="text-base text-slate-700 mt-4 font-semibold">Fetching latest COT reports from CFTC...</p>
                  <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                </div>
              )}

              {refreshStatus === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-lg shadow-indigo-100/50">
                      <ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-600" />
                    </div>
                    <div className="absolute -inset-1 bg-indigo-200/20 rounded-2xl blur-xl animate-pulse"></div>
                  </div>
                  <p className="text-base text-slate-700 mt-4 font-semibold">Processing assets and analyzing data...</p>
                  <p className="text-sm text-slate-500 mt-2">Generating insights and updating scores</p>
                </div>
              )}

              {refreshStatus === 'completed' && refreshResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-6 shadow-lg shadow-blue-100/50">
                    <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">No New Data Available</h3>
                  <p className="text-sm text-slate-600 text-center max-w-md leading-relaxed">
                    Your data is already up to date. The latest COT report in the database matches what's available from CFTC.
                  </p>
                  <div className="mt-6 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 text-center">
                      <span className="font-semibold">Reports are typically published</span> on Fridays at 3:30 PM EST. Check back later for new data.
                    </p>
                  </div>
                </div>
              )}

              {(refreshStatus === 'completed' || refreshStatus === 'error') && refreshResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      Processed {refreshResults.length} asset{refreshResults.length !== 1 ? 's' : ''}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        <span className="text-slate-600">
                          {refreshResults.filter(r => r.status === 'updated').length} Updated
                        </span>
                      </span>
                      {refreshResults.filter(r => r.status === 'skipped').length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                          <span className="text-slate-600">
                            {refreshResults.filter(r => r.status === 'skipped').length} Skipped
                          </span>
                        </span>
                      )}
                      {refreshResults.filter(r => r.status === 'error').length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-red-500"></span>
                          <span className="text-slate-600">
                            {refreshResults.filter(r => r.status === 'error').length} Errors
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {refreshResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getStatusColor(result.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getStatusIcon(result.status)}</span>
                              <span className="font-semibold text-slate-900">{result.asset}</span>
                            </div>
                            {result.status === 'updated' && (
                              <div className="text-sm text-slate-700 space-y-1 mt-2">
                                {result.reportDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Report Date:</span>
                                    <span>{result.reportDate}</span>
                                    {result.reportDay && (
                                      <span className="text-slate-500">({result.reportDay})</span>
                                    )}
                                  </div>
                                )}
                                {result.bias && result.score !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Bias:</span>
                                    <span className="capitalize">{result.bias}</span>
                                    <span className="text-slate-500">(Score: {result.score.toFixed(2)})</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {result.status === 'skipped' && result.reason && (
                              <div className="text-sm text-slate-700 mt-2">
                                <span className="font-medium">Reason:</span> {result.reason}
                              </div>
                            )}
                            {result.status === 'error' && result.error && (
                              <div className="text-sm text-red-700 mt-2">
                                <span className="font-medium">Error:</span> {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {refreshStatus === 'error' && refreshResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-6 shadow-lg shadow-red-100/50">
                    <XMarkIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Refresh Failed</h3>
                  <p className="text-sm text-slate-600 text-center max-w-md leading-relaxed">
                    An error occurred while refreshing the data. Please try again later.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setRefreshResults([]);
                  setRefreshStatus('idle');
                }}
                className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all text-sm font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95"
              >
                {refreshStatus === 'completed' ? 'Close' : refreshStatus === 'error' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
  ) : null;

  return (
    <>
      {/* Progress Modal - Rendered via Portal */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}

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
          <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 hover:text-slate-600 cursor-help ml-1 transition-colors" />
          
          {showTooltip && (
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-[420px] z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-none">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base font-bold text-white">Refresh Information</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {/* Last Refresh Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Refresh</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 ml-3.5">
                    {lastRefreshTime ? formatLastRefresh(lastRefreshTime) : 'Never'}
                  </p>
                </div>

                {/* Latest Report Date */}
                {latestReportDate && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Latest Report</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 ml-3.5">
                      {formatReportDate(latestReportDate)}
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2"></div>

                {/* Automatic Refresh Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Automatic Refresh</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-6">
                    Reports are automatically fetched on <span className="font-semibold text-slate-900">Tuesday, Thursday, and Friday at 3:35 PM EST</span> (after publication at 3:30 PM EST).
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed ml-6">
                    Failed fetches automatically retry after 5 minutes.
                  </p>
                </div>

                {/* Manual Refresh Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Manual Refresh</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-6">
                    You can manually refresh if you think there's newer data available.
                  </p>
                  {remainingRefreshes !== null && (
                    <div className={`ml-6 mt-2 px-3 py-2 rounded-xl border ${getRemainingRefreshesDisplay()?.bg || 'bg-slate-100'} ${getRemainingRefreshesDisplay()?.border || 'border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${remainingRefreshes === 0 ? 'bg-red-500' : remainingRefreshes === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className={`text-sm font-bold ${getRemainingRefreshesDisplay()?.color || 'text-slate-700'}`}>
                          {getRemainingRefreshesDisplay()?.text}
                        </span>
                        {remainingRefreshes > 0 && (
                          <span className="text-xs text-slate-500 ml-1">today</span>
                        )}
                      </div>
                      {remainingRefreshes > 0 && (
                        <p className="text-xs text-slate-500 mt-1 ml-4">Use them carefully!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tooltip arrow */}
              <div className="absolute bottom-full right-6">
                <div className="border-8 border-transparent border-b-white"></div>
                <div className="absolute top-0.5 left-0 border-8 border-transparent border-b-slate-200"></div>
              </div>
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
    </>
  );
}
