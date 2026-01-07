'use client';

import { scoreToBias, biasColor, type SeasonalityBias } from '@/lib/data/seasonality/utils';

interface AssetCardProps {
  assetId: string;
  assetName: string;
  seasonalityScore: number | null;
  isSelected: boolean;
  onClick: () => void;
}

export function AssetCard({ 
  assetId, 
  assetName, 
  seasonalityScore, 
  isSelected,
  onClick 
}: AssetCardProps) {
  const bias: SeasonalityBias = seasonalityScore !== null 
    ? scoreToBias(seasonalityScore)
    : 'Neutral';
  
  const colorClasses = biasColor(bias);
  const hasSeasonality = seasonalityScore !== null;

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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{assetName}</h3>
          <p className="text-xs text-gray-500">{assetId}</p>
        </div>
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>

      {hasSeasonality ? (
        <div className="mt-3">
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorClasses}`}>
            {bias}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Score: {seasonalityScore > 0 ? '+' : ''}{seasonalityScore.toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            No Seasonality
          </span>
        </div>
      )}
    </button>
  );
}
