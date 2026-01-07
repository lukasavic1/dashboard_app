// app/dashboard/page.tsx

import { DashboardWrapper } from "./DashboardWrapper";
import { ASSETS } from "@/lib/assets/assets";
import { computeSeasonality } from "@/lib/data/seasonality/compute";
import { scoreToBias } from "@/lib/data/seasonality/utils";
import { getLatestCotSnapshot } from "@/lib/storage/repositories";
import { computeFinalBias } from "@/lib/processing/scoring/combinedBias";

async function getAssetData() {
  const assetsData = await Promise.all(
    ASSETS.map(async (asset) => {
      // Compute seasonality (always compute fresh, doesn't need DB)
      const seasonality = asset.seasonality
        ? computeSeasonality(asset.id)
        : null;

      // Get COT data from DB
      const cotSnapshot = await getLatestCotSnapshot(asset.id);
      const cotData = cotSnapshot
        ? {
            reportDate: cotSnapshot.reportDate.toISOString(),
            derivedData: cotSnapshot.derivedData as any,
            rawData: cotSnapshot.rawData as any,
          }
        : null;

      // Compute combined bias if both COT and seasonality data exist
      let finalScore: number | undefined;
      let finalBias: string | undefined;
      let cotScore: number | undefined;
      let cotBias: string | undefined;
      let breakdown: any;

      if (cotData?.derivedData?.analysis && seasonality) {
        const analysis = cotData.derivedData.analysis;
        cotScore = analysis.score;
        cotBias = analysis.bias;
        const seasonalityBias = scoreToBias(seasonality.score);

        const combined = computeFinalBias(
          analysis.score,
          seasonality.normalizedScore,
          analysis.bias,
          seasonalityBias
        );

        finalScore = combined.finalScore;
        finalBias = combined.finalBias;
        breakdown = combined.breakdown;
      }

      return {
        assetId: asset.id,
        seasonality,
        cotData,
        finalScore,
        finalBias,
        cotScore,
        cotBias,
        breakdown,
      };
    })
  );

  return assetsData;
}

export default async function Dashboard() {
  const assetsData = await getAssetData();

  return <DashboardWrapper assetsData={assetsData} />;
}

