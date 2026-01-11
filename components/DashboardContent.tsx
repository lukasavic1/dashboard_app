'use client';

import { useState, useMemo, useEffect } from 'react';
import { AssetCard } from './AssetCard';
import { AssetDetails } from './AssetDetails';
import { ASSETS } from '@/lib/assets/assets';
import { SeasonalityResult } from '@/lib/data/seasonality/types';
import { computeFinalBias } from '@/lib/processing/scoring/combinedBias';
import { scoreToBias } from '@/lib/data/seasonality/utils';
import { ScoringConfig } from '@/lib/processing/scoring/types';

interface CotData {
  reportDate: string;
  derivedData: any; // matches the type from dashboard/page.tsx
  rawData: any;
}

interface AssetData {
  assetId: string;
  seasonality: SeasonalityResult | null;
  cotData: CotData | null;
  finalScore?: number;
  finalBias?: string;
  cotScore?: number;
  cotBias?: string;
  breakdown?: any;
}

type BiasFilter = 'All' | 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish' | 'No Data';
type SortOption = 'bias' | 'score' | 'name';

interface DashboardContentProps {
  assetsData: AssetData[];
  scoreWeights: { cotWeight: number; seasonalityWeight: number };
  biasFilter: BiasFilter;
  onBiasFilterChange: (filter: BiasFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
}

// Bias order for sorting: from most bullish to most bearish
const BIAS_ORDER: Record<string, number> = {
  'Strongly Bullish': 0,
  'Bullish': 1,
  'Neutral': 2,
  'Bearish': 3,
  'Strongly Bearish': 4,
  'No Data': 5,
};

export function DashboardContent({ 
  assetsData, 
  scoreWeights,
  biasFilter,
  onBiasFilterChange,
  sortOption,
  onSortOptionChange,
}: DashboardContentProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    assetsData.length > 0 ? assetsData[0].assetId : null
  );

  // Recalculate scores with custom weights
  const recalculatedAssetsData = useMemo(() => {
    const config: ScoringConfig = {
      cotWeight: scoreWeights.cotWeight,
      seasonalityWeight: scoreWeights.seasonalityWeight,
      convictionBoostThreshold: 70,
      convictionBoostAmount: 10,
    };

    return assetsData.map(assetData => {
      // If we have both COT and seasonality data, recalculate
      if (assetData.cotData?.derivedData?.analysis && assetData.seasonality) {
        const analysis = assetData.cotData.derivedData.analysis;
        const cotScore = analysis.score;
        const cotBias = analysis.bias;
        const seasonalityBias = scoreToBias(assetData.seasonality.score);

        const combined = computeFinalBias(
          cotScore,
          assetData.seasonality.normalizedScore,
          cotBias,
          seasonalityBias,
          config
        );

        return {
          ...assetData,
          finalScore: combined.finalScore,
          finalBias: combined.finalBias,
          breakdown: combined.breakdown,
        };
      }

      // Otherwise return original data
      return assetData;
    });
  }, [assetsData, scoreWeights]);

  // Get all assets with their data
  const assetsWithData = useMemo(() => {
    return ASSETS.map(asset => {
      const data = recalculatedAssetsData.find(d => d.assetId === asset.id);
      return {
        asset,
        data,
        bias: data?.finalBias ?? 'No Data',
        score: data?.finalScore ?? -Infinity,
      };
    });
  }, [recalculatedAssetsData]);

  // Filter assets based on selected bias filter
  const filteredAssets = useMemo(() => {
    if (biasFilter === 'All') {
      return assetsWithData;
    }
    return assetsWithData.filter(item => item.bias === biasFilter);
  }, [assetsWithData, biasFilter]);

  // Sort filtered assets
  const sortedAssets = useMemo(() => {
    const sorted = [...filteredAssets];
    
    if (sortOption === 'bias') {
      sorted.sort((a, b) => {
        const biasDiff = BIAS_ORDER[a.bias] - BIAS_ORDER[b.bias];
        if (biasDiff !== 0) return biasDiff;
        // If same bias, sort by score descending
        return b.score - a.score;
      });
    } else if (sortOption === 'score') {
      sorted.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        // If same score, sort by bias order
        return BIAS_ORDER[a.bias] - BIAS_ORDER[b.bias];
      });
    } else if (sortOption === 'name') {
      sorted.sort((a, b) => a.asset.name.localeCompare(b.asset.name));
    }
    
    return sorted;
  }, [filteredAssets, sortOption]);

  const selectedAsset = recalculatedAssetsData.find(a => a.assetId === selectedAssetId);
  const selectedAssetInfo = ASSETS.find(a => a.id === selectedAssetId);

  // Update selected asset if current selection is filtered out
  useEffect(() => {
    const isCurrentSelectionValid = selectedAssetId && sortedAssets.some(item => item.asset.id === selectedAssetId);
    
    if (!isCurrentSelectionValid) {
      if (sortedAssets.length > 0) {
        setSelectedAssetId(sortedAssets[0].asset.id);
      } else {
        setSelectedAssetId(null);
      }
    }
  }, [sortedAssets, selectedAssetId]);

  // Format asset option label for dropdown
  const formatAssetOptionLabel = ({ asset: assetInfo, data }: typeof sortedAssets[0]) => {
    const bias = data?.finalBias ?? 'No Data';
    const score = data?.finalScore;
    
    if (score !== undefined && score !== -Infinity) {
      const scoreStr = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
      return `${assetInfo.name} (${assetInfo.id}) - ${bias} ${scoreStr}`;
    }
    return `${assetInfo.name} (${assetInfo.id}) - ${bias}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Mobile Asset Dropdown */}
      <div className="lg:hidden space-y-2">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide block">
          Select Asset
        </label>
        <select
          value={selectedAssetId || ''}
          onChange={(e) => setSelectedAssetId(e.target.value || null)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border-2 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {sortedAssets.length === 0 ? (
            <option value="">No assets available</option>
          ) : (
            sortedAssets.map((assetData) => (
              <option key={assetData.asset.id} value={assetData.asset.id}>
                {formatAssetOptionLabel(assetData)}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Sidebar - Asset Cards (Desktop only) */}
      <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-24">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Assets
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an asset to view detailed analysis
            </p>
            
            {/* Filter and Sort Controls - Desktop only */}
            <div className="space-y-4 mb-4">
              {/* Filter by Bias */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Filter by Bias
                </label>
                <select
                  value={biasFilter}
                  onChange={(e) => onBiasFilterChange(e.target.value as BiasFilter)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white border-2 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Strongly Bullish">Strongly Bullish</option>
                  <option value="Bullish">Bullish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Bearish">Bearish</option>
                  <option value="Strongly Bearish">Strongly Bearish</option>
                  <option value="No Data">No Data</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-white border-2 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bias">Bias (Bullish → Bearish)</option>
                  <option value="score">Score (High → Low)</option>
                  <option value="name">Name (A → Z)</option>
                </select>
              </div>

              {/* Results count */}
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                Showing {sortedAssets.length} of {assetsWithData.length} assets
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2 custom-scrollbar">
            {sortedAssets.map(({ asset, data }) => (
              <AssetCard
                key={asset.id}
                assetId={asset.id}
                assetName={asset.name}
                seasonalityScore={data?.seasonality?.score ?? null}
                finalScore={data?.finalScore}
                finalBias={data?.finalBias}
                cotScore={data?.cotScore}
                cotBias={data?.cotBias}
                isSelected={selectedAssetId === asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
              />
            ))}
            {sortedAssets.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-500">
                No assets match the selected filter
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Selected Asset Details */}
      <div className="flex-1 min-w-0">
        {selectedAsset && selectedAssetInfo ? (
          <AssetDetails
            assetId={selectedAsset.assetId}
            assetName={selectedAssetInfo.name}
            seasonality={selectedAsset.seasonality}
            cotData={selectedAsset.cotData ? {
              ...selectedAsset.cotData,
              reportDate: new Date(selectedAsset.cotData.reportDate)
            } : null}
            finalScore={selectedAsset.finalScore}
            finalBias={selectedAsset.finalBias}
            breakdown={selectedAsset.breakdown}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">Select an asset to view its analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
