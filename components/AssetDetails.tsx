'use client';

import { SeasonalityResult } from '@/lib/data/seasonality/types';
import { scoreToBias, biasColor } from '@/lib/data/seasonality/utils';

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

function cotBiasColor(bias: CotAnalysis['bias']): string {
  switch (bias) {
    case 'Strongly Bullish':
      return 'text-green-700 bg-green-100 border-green-300';
    case 'Bullish':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Neutral':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'Bearish':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Strongly Bearish':
      return 'text-red-700 bg-red-100 border-red-300';
  }
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
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-500">No data available for {assetName}</p>
      </div>
    );
  }

  const bias = seasonality ? scoreToBias(seasonality.score) : null;
  const colorClasses = bias ? biasColor(bias) : '';
  const hasCombinedAnalysis = finalScore !== undefined && finalBias !== undefined && breakdown;

  return (
    <div className="space-y-6">
      {/* Combined Analysis Section */}
      {hasCombinedAnalysis && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Combined Analysis
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Final Bias</p>
              <span className={`inline-flex items-center rounded-full border px-4 py-2 text-base font-bold mt-2 ${cotBiasColor(finalBias as any)}`}>
                {finalBias}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Final Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {finalScore > 0 ? '+' : ''}{finalScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-300">
                  <th className="pb-2 font-medium text-gray-600">Component</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Score</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Weight</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-gray-900">COT</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {breakdown.cotScore > 0 ? '+' : ''}{breakdown.cotScore}
                  </td>
                  <td className="py-2 text-right text-gray-600">70%</td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {breakdown.cotContribution > 0 ? '+' : ''}{breakdown.cotContribution.toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Seasonality</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {breakdown.seasonalityScore > 0 ? '+' : ''}{breakdown.seasonalityScore.toFixed(1)}
                  </td>
                  <td className="py-2 text-right text-gray-600">30%</td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {breakdown.seasonalityContribution > 0 ? '+' : ''}{breakdown.seasonalityContribution.toFixed(1)}
                  </td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="py-2 text-gray-700" colSpan={3}>Base Total</td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {breakdown.baseScore > 0 ? '+' : ''}{breakdown.baseScore.toFixed(1)}
                  </td>
                </tr>
                {breakdown.convictionBoostApplied && (
                  <tr>
                    <td className="py-2 text-gray-700" colSpan={3}>
                      <span className="flex items-center gap-2">
                        Conviction Boost
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          Aligned signals
                        </span>
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold text-orange-600">
                      {breakdown.convictionBoostAmount > 0 ? '+' : ''}{breakdown.convictionBoostAmount.toFixed(1)}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-400">
                  <td className="py-2 font-bold text-gray-900" colSpan={3}>Final Score</td>
                  <td className="py-2 text-right font-bold text-lg text-gray-900">
                    {finalScore > 0 ? '+' : ''}{finalScore.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Seasonality Section */}
      {seasonality && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Seasonality Analysis
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Bias</p>
              {bias && (
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mt-1 ${colorClasses}`}>
                  {bias}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {seasonality.score > 0 ? '+' : ''}{seasonality.score.toFixed(2)}
              </p>
            </div>
          </div>

          {seasonality.activeWindows.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Active Seasonal Windows:
              </p>
              <ul className="space-y-2">
                {seasonality.activeWindows.map((window, i) => (
                  <li key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {getMonthName(window.startMonth)} - {getMonthName(window.endMonth)}
                      </span>
                      <span className={`font-semibold ${window.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {window.score > 0 ? '+' : ''}{window.score.toFixed(2)}
                      </span>
                    </div>
                    {window.note && (
                      <p className="text-xs text-gray-500 mt-1">{window.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active seasonal windows for this month.</p>
          )}
        </div>
      )}

      {/* COT Report Section */}
      {cotData ? (
        <div className="space-y-6">
          {/* COT Analysis Summary */}
          {cotData.derivedData.analysis && (
            <div className="rounded-xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                COT Analysis
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Bias</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mt-1 ${cotBiasColor(cotData.derivedData.analysis.bias)}`}>
                    {cotData.derivedData.analysis.bias}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {cotData.derivedData.analysis.score > 0 ? '+' : ''}{cotData.derivedData.analysis.score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Report Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(cotData.reportDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {cotData.derivedData.analysis.notes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Analysis Notes:</p>
                  <ul className="space-y-2">
                    {cotData.derivedData.analysis.notes.map((note, i) => (
                      <li key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* COT Detailed Metrics */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              COT Positioning Details
            </h3>

            {/* Commercials */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Commercials (Smart Money)</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Long</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cotData.rawData.commercialLong.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Short</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cotData.rawData.commercialShort.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Net Position</p>
                  <p className={`text-sm font-semibold ${
                    cotData.derivedData.analysis?.metrics.commercial.netPosition ?? 0 > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {cotData.derivedData.analysis 
                      ? (cotData.derivedData.analysis.metrics.commercial.netPosition > 0 ? '+' : '') + 
                        cotData.derivedData.analysis.metrics.commercial.netPosition.toLocaleString()
                      : (cotData.derivedData.commercialMetrics?.netPosition ?? 0).toLocaleString()
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">COT Index</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cotData.derivedData.analysis
                      ? cotData.derivedData.analysis.metrics.commercial.cotIndex.toFixed(1) + '%'
                      : cotData.derivedData.commercialMetrics
                        ? cotData.derivedData.commercialMetrics.cotIndex.toFixed(1) + '%'
                        : 'N/A'
                    }
                    {cotData.derivedData.analysis?.metrics.commercial.isExtreme && (
                      <span className="ml-1 text-xs text-orange-600">(EXTREME)</span>
                    )}
                  </p>
                </div>
              </div>
              {cotData.derivedData.analysis && (
                <p className="text-xs text-gray-500 mt-2">
                  Week-over-week change: {cotData.derivedData.analysis.metrics.commercial.netChange > 0 ? '+' : ''}
                  {cotData.derivedData.analysis.metrics.commercial.netChange.toLocaleString()} contracts
                </p>
              )}
            </div>

            {/* Non-Commercials */}
            {cotData.rawData.nonCommercialLong !== undefined && cotData.derivedData.analysis && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Non-Commercials (Large Specs)</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Long</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.rawData.nonCommercialLong.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Short</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.rawData.nonCommercialShort?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net Position</p>
                    <p className={`text-sm font-semibold ${
                      cotData.derivedData.analysis.metrics.nonCommercial.netPosition > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {cotData.derivedData.analysis.metrics.nonCommercial.netPosition > 0 ? '+' : ''}
                      {cotData.derivedData.analysis.metrics.nonCommercial.netPosition.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.derivedData.analysis.metrics.nonCommercial.isExtreme ? 'EXTREME' :
                       cotData.derivedData.analysis.metrics.nonCommercial.isCrowded ? 'CROWDED' : 'MODERATE'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Week-over-week change: {cotData.derivedData.analysis.metrics.nonCommercial.netChange > 0 ? '+' : ''}
                  {cotData.derivedData.analysis.metrics.nonCommercial.netChange.toLocaleString()} contracts
                </p>
              </div>
            )}

            {/* Small Traders */}
            {cotData.rawData.smallTraderLong !== undefined && cotData.derivedData.analysis && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Small Traders</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Long</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.rawData.smallTraderLong.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Short</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.rawData.smallTraderShort?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net Position</p>
                    <p className={`text-sm font-semibold ${
                      cotData.derivedData.analysis.metrics.smallTrader.netPosition > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {cotData.derivedData.analysis.metrics.smallTrader.netPosition > 0 ? '+' : ''}
                      {cotData.derivedData.analysis.metrics.smallTrader.netPosition.toLocaleString()}
                      {cotData.derivedData.analysis.metrics.smallTrader.isExtreme && (
                        <span className="ml-1 text-xs text-orange-600">(EXTREME)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Open Interest */}
            {cotData.rawData.openInterest !== undefined && cotData.derivedData.analysis && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Open Interest</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotData.rawData.openInterest.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Week-over-week</p>
                    <p className={`text-sm font-semibold ${
                      cotData.derivedData.analysis.metrics.openInterestChange > 0 ? 'text-green-600' : 'text-red-600'
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
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <p className="text-xs text-gray-500 mb-2">Commercial COT Index Range</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, cotData.derivedData.commercialMetrics.cotIndex))}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {cotData.derivedData.commercialMetrics.cotIndex.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Range: {cotData.derivedData.commercialMetrics.range.min.toLocaleString()} to {cotData.derivedData.commercialMetrics.range.max.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            COT Report
          </h3>
          <p className="text-sm text-gray-500">No COT data available. Data will appear after refresh.</p>
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
