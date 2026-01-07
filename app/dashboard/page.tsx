// app/dashboard/page.tsx

import { DashboardContent } from "@/components/DashboardContent";
import { RefreshButton } from "@/components/RefreshButton";
import { ASSETS } from "@/lib/assets/assets";
import { computeSeasonality } from "@/lib/data/seasonality/compute";
import { getLatestCotSnapshot } from "@/lib/storage/repositories";

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

      return {
        assetId: asset.id,
        seasonality,
        cotData,
      };
    })
  );

  return assetsData;
}

export default async function Dashboard() {
  const assetsData = await getAssetData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-semibold text-gray-900">
            Market Fundamentals Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Larry Williams–style analysis based on COT reports and seasonality
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between rounded-xl border bg-white p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Data Status
              </h3>
              <p className="text-sm text-gray-500">
                Fundamental data is cached and refreshed only when stale
              </p>
            </div>

            <RefreshButton />
          </div>
          {/* Dashboard Content */}
          <DashboardContent assetsData={assetsData} />
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
