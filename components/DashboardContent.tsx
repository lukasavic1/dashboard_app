'use client';

import { useState, useMemo, useEffect } from 'react';
import { AssetCard } from './AssetCard';
import { AssetDetails } from './AssetDetails';
import { ASSETS } from '@/lib/assets/assets';
import { SeasonalityResult } from '@/lib/data/seasonality/types';

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

interface DashboardContentProps {
  assetsData: AssetData[];
}

type BiasFilter = 'All' | 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish' | 'No Data';
type SortOption = 'bias' | 'score' | 'name';

// Bias order for sorting: from most bullish to most bearish
const BIAS_ORDER: Record<string, number> = {
  'Strongly Bullish': 0,
  'Bullish': 1,
  'Neutral': 2,
  'Bearish': 3,
  'Strongly Bearish': 4,
  'No Data': 5,
};

export function DashboardContent({ assetsData }: DashboardContentProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    assetsData.length > 0 ? assetsData[0].assetId : null
  );
  const [biasFilter, setBiasFilter] = useState<BiasFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('bias');

  // Get all assets with their data
  const assetsWithData = useMemo(() => {
    return ASSETS.map(asset => {
      const data = assetsData.find(d => d.assetId === asset.id);
      return {
        asset,
        data,
        bias: data?.finalBias ?? 'No Data',
        score: data?.finalScore ?? -Infinity,
      };
    });
  }, [assetsData]);

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

  const selectedAsset = assetsData.find(a => a.assetId === selectedAssetId);
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Sidebar - Asset Cards */}
      <aside className="lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-24">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Assets
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an asset to view detailed analysis
            </p>
            
            {/* Filter and Sort Controls */}
            <div className="space-y-4 mb-4">
              {/* Filter by Bias */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Filter by Bias
                </label>
                <select
                  value={biasFilter}
                  onChange={(e) => setBiasFilter(e.target.value as BiasFilter)}
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
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
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
