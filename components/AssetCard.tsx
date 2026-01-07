'use client';

import { scoreToBias, biasColor, type SeasonalityBias } from '@/lib/data/seasonality/utils';

interface AssetCardProps {
  assetId: string;
  assetName: string;
  seasonalityScore: number | null;
  finalScore?: number;
  finalBias?: string;
  cotScore?: number;
  cotBias?: string;
  isSelected: boolean;
  onClick: () => void;
}

function getFinalBiasColor(bias: string): string {
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

export function AssetCard({
  assetId,
  assetName,
  seasonalityScore,
  finalScore,
  finalBias,
  cotScore,
  cotBias,
  isSelected,
  onClick
}: AssetCardProps) {
  const seasonalityBias: SeasonalityBias = seasonalityScore !== null
    ? scoreToBias(seasonalityScore)
    : 'Neutral';

  const hasData = finalBias !== undefined;

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-50/50 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:bg-slate-50/50'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-blue-500 ring-2 ring-white shadow-sm" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
            {assetName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{assetId}</p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-2.5">
          {/* Final Bias - Large and prominent */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Final Bias</p>
            <div className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getFinalBiasColor(finalBias!)}`}>
              {finalBias}
            </div>
            <p className="mt-1.5 text-xs font-semibold text-slate-700">
              {finalScore! > 0 ? '+' : ''}{finalScore!.toFixed(1)}
            </p>
          </div>

          {/* COT and Seasonality - Smaller */}
          <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
            {cotScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">COT</span>
                <span className="font-medium text-slate-700">
                  {cotScore > 0 ? '+' : ''}{cotScore}
                </span>
              </div>
            )}
            {seasonalityScore !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Season</span>
                <span className="font-medium text-slate-700">
                  {seasonalityScore > 0 ? '+' : ''}{seasonalityScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
            No Data
          </span>
        </div>
      )}
    </button>
  );
}
