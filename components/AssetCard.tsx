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
      return 'text-green-700 bg-green-100 border-green-300';
    case 'Bullish':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Neutral':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'Bearish':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Strongly Bearish':
      return 'text-red-700 bg-red-100 border-red-300';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300';
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
        relative rounded-xl border-2 p-4 text-left transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{assetName}</h3>
          <p className="text-xs text-gray-500">{assetId}</p>
        </div>
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>

      {hasData ? (
        <div className="space-y-2">
          {/* Final Bias - Large and prominent */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Final</p>
            <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold ${getFinalBiasColor(finalBias!)}`}>
              {finalBias}
            </div>
            <p className="mt-1 text-xs font-semibold text-gray-700">
              Score: {finalScore! > 0 ? '+' : ''}{finalScore!.toFixed(1)}
            </p>
          </div>

          {/* COT and Seasonality - Smaller */}
          <div className="pt-2 border-t border-gray-200 space-y-1">
            {cotScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">COT:</span>
                <span className="font-medium text-gray-900">
                  {cotScore > 0 ? '+' : ''}{cotScore} ({cotBias})
                </span>
              </div>
            )}
            {seasonalityScore !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium text-gray-900">
                  {seasonalityScore > 0 ? '+' : ''}{seasonalityScore.toFixed(2)} ({seasonalityBias})
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            No Data Available
          </span>
        </div>
      )}
    </button>
  );
}
