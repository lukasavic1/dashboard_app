'use client';

import { useState, useEffect, useRef } from 'react';
import { SeasonalityResult } from '@/lib/data/seasonality/types';
import { scoreToBias, biasColor } from '@/lib/data/seasonality/utils';
import { TDW_BIAS } from '@/lib/assets/assets';

interface CotAnalysis {
  score: number;
  bias: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
  notes: string[];
  metrics: {
    commercial: {
      netPosition: number;
      netChange: number;
      isExtreme: boolean;
      cotIndex: number;
    };
    nonCommercial: {
      netPosition: number;
      netChange: number;
      isExtreme: boolean;
      isCrowded: boolean;
    };
    smallTrader: {
      netPosition: number;
      isExtreme: boolean;
    };
    openInterest: number;
    openInterestChange: number;
  };
}

interface CotData {
  reportDate: Date;
  derivedData: {
    analysis?: CotAnalysis;
    commercialMetrics?: {
      netPosition: number;
      cotIndex: number;
      range: { min: number; max: number };
    };
  };
  rawData: {
    commercialLong: number;
    commercialShort: number;
    nonCommercialLong?: number;
    nonCommercialShort?: number;
    smallTraderLong?: number;
    smallTraderShort?: number;
    openInterest?: number;
  };
}

function cotBiasColor(bias: CotAnalysis['bias'] | string): string {
  switch (bias) {
    case 'Strongly Bullish':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Bullish':
      return 'text-emerald-600 bg-emerald-50/50 border-emerald-200';
    case 'Neutral':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Bearish':
      return 'text-rose-600 bg-rose-50/50 border-rose-200';
    case 'Strongly Bearish':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

function getDailyBiasColor(bias: 'bullish' | 'bearish' | 'neutral'): string {
  switch (bias) {
    case 'bullish':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'bearish':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'neutral':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

function getDailyBiasLabel(bias: 'bullish' | 'bearish' | 'neutral'): string {
  switch (bias) {
    case 'bullish':
      return 'Bullish';
    case 'bearish':
      return 'Bearish';
    case 'neutral':
      return 'Neutral';
    default:
      return 'Unknown';
  }
}

interface DailyTendencyCardProps {
  assetId: string;
}

function DailyTendencyCard({ assetId }: DailyTendencyCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dailyBias = TDW_BIAS[assetId];
  
  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showTooltip &&
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTooltip]);
  
  if (!dailyBias) {
    return null;
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  
  // Get today's day name
  const getTodayDayName = (): string => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[dayIndex];
  };
  
  const todayDayName = getTodayDayName();
  const isToday = (day: string) => day === todayDayName;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-slate-900">Daily Tendency</h3>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-700 transition-colors text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Daily tendency explanation"
            aria-expanded={showTooltip}
          >
            ?
          </button>
          {showTooltip && (
            <div
              ref={tooltipRef}
              className="absolute left-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50"
              role="tooltip"
            >
              <p className="mb-2 font-semibold">Historical Tendencies</p>
              <p className="leading-relaxed">
                These daily tendencies are based on historical patterns and do not guarantee future performance. 
                Market conditions can change, and past performance is not indicative of future results.
              </p>
              <div className="absolute left-4 -top-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {days.map((day) => {
          const bias = dailyBias[day];
          if (!bias) return null;
          
          const isTodayDay = isToday(day);
          
          return (
            <div
              key={day}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all relative
                ${isTodayDay
                  ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-400/50'
                  : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                }
              `}
            >
              {isTodayDay && (
                <div className="absolute -top-1.5 -left-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  TODAY
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isTodayDay ? 'text-blue-900 font-semibold' : 'text-slate-700'}`}>
                  {day}
                </span>
                {isTodayDay && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                )}
              </div>
              <span
                className={`
                  inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold
                  ${getDailyBiasColor(bias)}
                  ${isTodayDay ? 'ring-1 ring-blue-400/30' : ''}
                `}
              >
                {getDailyBiasLabel(bias)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AssetDetailsProps {
  assetId: string;
  assetName: string;
  seasonality: SeasonalityResult | null;
  cotData: CotData | null;
  finalScore?: number;
  finalBias?: string;
  breakdown?: any;
}

export function AssetDetails({
  assetId,
  assetName,
  seasonality,
  cotData,
  finalScore,
  finalBias,
  breakdown
}: AssetDetailsProps) {
  if (!seasonality && !cotData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">No data available for {assetName}</p>
      </div>
    );
  }

  const bias = seasonality ? scoreToBias(seasonality.score) : null;
  const colorClasses = bias ? biasColor(bias) : '';
  const hasCombinedAnalysis = finalScore !== undefined && finalBias !== undefined && breakdown;

  return (
    <div className="space-y-6">
      {/* Hero Section - Asset Overview */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-white p-6 sm:p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {assetName}
          </h1>
          <p className="text-sm text-slate-500 font-mono">{assetId}</p>
        </div>

        {hasCombinedAnalysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Final Bias - Hero Display */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Final Bias</p>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-xl border-2 px-5 py-3 text-lg font-bold ${cotBiasColor(finalBias)}`}>
                  {finalBias}
                </span>
              </div>
            </div>

            {/* Final Score - Hero Display */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Final Score</p>
              <p className="text-4xl sm:text-5xl font-bold text-slate-900">
                {finalScore > 0 ? '+' : ''}{finalScore.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Score Breakdown - Compact */}
        {hasCombinedAnalysis && breakdown && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Score Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">COT Score</p>
                <p className="text-lg font-bold text-slate-900">
                  {breakdown.cotScore > 0 ? '+' : ''}{breakdown.cotScore}
                </p>
                <p className="text-xs text-slate-500 mt-1">70% weight</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Seasonality</p>
                <p className="text-lg font-bold text-slate-900">
                  {breakdown.seasonalityScore > 0 ? '+' : ''}{breakdown.seasonalityScore.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-1">30% weight</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Base Total</p>
                <p className="text-lg font-bold text-slate-900">
                  {breakdown.baseScore > 0 ? '+' : ''}{breakdown.baseScore.toFixed(1)}
                </p>
              </div>
              {breakdown.convictionBoostApplied && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <p className="text-xs text-orange-600 mb-1">Conviction Boost</p>
                  <p className="text-lg font-bold text-orange-700">
                    {breakdown.convictionBoostAmount > 0 ? '+' : ''}{breakdown.convictionBoostAmount.toFixed(1)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Aligned</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COT Analysis Card */}
        {cotData?.derivedData.analysis && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 mb-1">COT Analysis</h3>
              <p className="text-xs text-slate-500">
                Report Date: {new Date(cotData.reportDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Bias</p>
                <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-bold ${cotBiasColor(cotData.derivedData.analysis.bias)}`}>
                  {cotData.derivedData.analysis.bias}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {cotData.derivedData.analysis.score > 0 ? '+' : ''}{cotData.derivedData.analysis.score}
                </p>
              </div>
            </div>

            {cotData.derivedData.analysis.notes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Key Insights</p>
                <ul className="space-y-2">
                  {cotData.derivedData.analysis.notes.map((note, i) => (
                    <li key={i} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Seasonality Analysis Card */}
        {seasonality && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Seasonality Analysis</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Bias</p>
                {bias && (
                  <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-bold ${colorClasses}`}>
                    {bias}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {seasonality.score > 0 ? '+' : ''}{seasonality.score.toFixed(2)}
                </p>
              </div>
            </div>

            {seasonality.activeWindows.length > 0 ? (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Active Windows</p>
                <ul className="space-y-2">
                  {seasonality.activeWindows.map((window, i) => (
                    <li key={i} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">
                          {getMonthName(window.startMonth)} - {getMonthName(window.endMonth)}
                        </span>
                        <span className={`font-bold ${window.score > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {window.score > 0 ? '+' : ''}{window.score.toFixed(2)}
                        </span>
                      </div>
                      {window.note && (
                        <p className="text-xs text-slate-500 mt-1">{window.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-200">No active seasonal windows for this month.</p>
            )}
          </div>
        )}

        {/* Daily Tendency Card */}
        {TDW_BIAS[assetId] && <DailyTendencyCard assetId={assetId} />}
      </div>

      {/* COT Positioning Details - Full Width */}
      {cotData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">COT Positioning Details</h3>

          <div className="space-y-6">
            {/* Commercials */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Commercials (Smart Money)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Long</p>
                  <p className="text-base font-bold text-slate-900">
                    {cotData.rawData.commercialLong.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Short</p>
                  <p className="text-base font-bold text-slate-900">
                    {cotData.rawData.commercialShort.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Net Position</p>
                  <p className={`text-base font-bold ${
                    (cotData.derivedData.analysis?.metrics.commercial.netPosition ?? cotData.derivedData.commercialMetrics?.netPosition ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {(cotData.derivedData.analysis?.metrics.commercial.netPosition ?? cotData.derivedData.commercialMetrics?.netPosition ?? 0) > 0 ? '+' : ''}
                    {(cotData.derivedData.analysis?.metrics.commercial.netPosition ?? cotData.derivedData.commercialMetrics?.netPosition ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">COT Index</p>
                  <p className="text-base font-bold text-slate-900">
                    {cotData.derivedData.analysis
                      ? cotData.derivedData.analysis.metrics.commercial.cotIndex.toFixed(1) + '%'
                      : cotData.derivedData.commercialMetrics
                        ? cotData.derivedData.commercialMetrics.cotIndex.toFixed(1) + '%'
                        : 'N/A'
                    }
                    {cotData.derivedData.analysis?.metrics.commercial.isExtreme && (
                      <span className="ml-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">EXTREME</span>
                    )}
                  </p>
                </div>
              </div>
              {cotData.derivedData.analysis && (
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                  Week-over-week change: <span className="font-semibold text-slate-700">
                    {cotData.derivedData.analysis.metrics.commercial.netChange > 0 ? '+' : ''}
                    {cotData.derivedData.analysis.metrics.commercial.netChange.toLocaleString()}
                  </span> contracts
                </p>
              )}
            </div>

            {/* Non-Commercials */}
            {cotData.rawData.nonCommercialLong !== undefined && cotData.derivedData.analysis && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  Non-Commercials (Large Specs)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Long</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.rawData.nonCommercialLong.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Short</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.rawData.nonCommercialShort?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Net Position</p>
                    <p className={`text-base font-bold ${
                      cotData.derivedData.analysis.metrics.nonCommercial.netPosition > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {cotData.derivedData.analysis.metrics.nonCommercial.netPosition > 0 ? '+' : ''}
                      {cotData.derivedData.analysis.metrics.nonCommercial.netPosition.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.derivedData.analysis.metrics.nonCommercial.isExtreme ? (
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">EXTREME</span>
                      ) : cotData.derivedData.analysis.metrics.nonCommercial.isCrowded ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">CROWDED</span>
                      ) : (
                        'MODERATE'
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                  Week-over-week change: <span className="font-semibold text-slate-700">
                    {cotData.derivedData.analysis.metrics.nonCommercial.netChange > 0 ? '+' : ''}
                    {cotData.derivedData.analysis.metrics.nonCommercial.netChange.toLocaleString()}
                  </span> contracts
                </p>
              </div>
            )}

            {/* Small Traders */}
            {cotData.rawData.smallTraderLong !== undefined && cotData.derivedData.analysis && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  Small Traders
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Long</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.rawData.smallTraderLong.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Short</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.rawData.smallTraderShort?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Net Position</p>
                    <p className={`text-base font-bold ${
                      cotData.derivedData.analysis.metrics.smallTrader.netPosition > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {cotData.derivedData.analysis.metrics.smallTrader.netPosition > 0 ? '+' : ''}
                      {cotData.derivedData.analysis.metrics.smallTrader.netPosition.toLocaleString()}
                      {cotData.derivedData.analysis.metrics.smallTrader.isExtreme && (
                        <span className="ml-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">EXTREME</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Open Interest */}
            {cotData.rawData.openInterest !== undefined && cotData.derivedData.analysis && (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Open Interest</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Current</p>
                    <p className="text-base font-bold text-slate-900">
                      {cotData.rawData.openInterest.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Week-over-week</p>
                    <p className={`text-base font-bold ${
                      cotData.derivedData.analysis.metrics.openInterestChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {cotData.derivedData.analysis.metrics.openInterestChange > 0 ? '+' : ''}
                      {cotData.derivedData.analysis.metrics.openInterestChange.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* COT Index Visual */}
            {cotData.derivedData.commercialMetrics && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <p className="text-xs font-semibold text-slate-700 mb-3">Commercial COT Index</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, cotData.derivedData.commercialMetrics.cotIndex))}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 min-w-[3rem] text-right">
                    {cotData.derivedData.commercialMetrics.cotIndex.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Range: {cotData.derivedData.commercialMetrics.range.min.toLocaleString()} to {cotData.derivedData.commercialMetrics.range.max.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No COT Data Message */}
      {!cotData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">COT Report</h3>
          <p className="text-sm text-slate-500">No COT data available. Data will appear after refresh.</p>
        </div>
      )}
    </div>
  );
}

function getMonthName(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month - 1] || '';
}