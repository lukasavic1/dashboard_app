'use client';

import { useState } from 'react';
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

export function DashboardContent({ assetsData }: DashboardContentProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    assetsData.length > 0 ? assetsData[0].assetId : null
  );

  const selectedAsset = assetsData.find(a => a.assetId === selectedAssetId);
  const selectedAssetInfo = ASSETS.find(a => a.id === selectedAssetId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Sidebar - Asset Cards */}
      <aside className="lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-24">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Assets
            </h2>
            <p className="text-xs text-slate-500">
              Select an asset to view detailed analysis
            </p>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {ASSETS.map(asset => {
              const data = assetsData.find(d => d.assetId === asset.id);

              return (
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
              );
            })}
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
