'use client';

import { useState } from 'react';
import { AssetCard } from './AssetCard';
import { AssetDetails } from './AssetDetails';
import { ASSETS } from '@/lib/assets/assets';
import { SeasonalityResult } from '@/lib/data/seasonality/types';

interface CotData {
  reportDate: string;
  derivedData: {
    netPosition: number;
    cotIndex: number;
    range: { min: number; max: number };
  };
  rawData: {
    commercialLong: number;
    commercialShort: number;
  };
}

interface AssetData {
  assetId: string;
  seasonality: SeasonalityResult | null;
  cotData: CotData | null;
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
    <div className="space-y-6">
      {/* Asset Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Assets
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ASSETS.map(asset => {
            const data = assetsData.find(d => d.assetId === asset.id);
            const score = data?.seasonality?.score ?? null;
            
            return (
              <AssetCard
                key={asset.id}
                assetId={asset.id}
                assetName={asset.name}
                seasonalityScore={score}
                isSelected={selectedAssetId === asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Asset Details */}
      {selectedAsset && selectedAssetInfo && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedAssetInfo.name} ({selectedAssetInfo.id}) Analysis
          </h2>
          <AssetDetails
            assetId={selectedAsset.assetId}
            assetName={selectedAssetInfo.name}
            seasonality={selectedAsset.seasonality}
            cotData={selectedAsset.cotData ? {
              ...selectedAsset.cotData,
              reportDate: new Date(selectedAsset.cotData.reportDate)
            } : null}
          />
        </div>
      )}
    </div>
  );
}
