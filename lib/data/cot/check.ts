import { fetchCotForMarket } from "./fetch";
import { ASSETS } from "@/lib/assets/assets";
import { getLatestReportDateInDb, isReportDateNewer } from "@/lib/storage/repositories";

/**
 * Checks if there's a newer COT report available than what's in the database.
 *
 * Fetches just the single most recent record for the first tracked asset from
 * the CFTC Public Reporting API — fast and sufficient because CFTC publishes
 * all markets on the same date every week.
 *
 * Returns:
 * - { needsUpdate: true,  latestReportDate: Date }            – newer report available
 * - { needsUpdate: false, latestReportDate: Date | null }     – already up to date
 * - { needsUpdate: false, latestReportDate: null, error: string } – check failed
 */
export async function checkForNewerReport(): Promise<{
  needsUpdate: boolean;
  latestReportDate: Date | null;
  error?: string;
}> {
  try {
    // Pick any asset with a cotCode as the probe
    const probeAsset = ASSETS.find((a) => a.cotCode);
    if (!probeAsset?.cotCode) {
      return {
        needsUpdate: false,
        latestReportDate: null,
        error: "No assets with cotCode configured",
      };
    }

    // Fetch only 1 record (the most recent) to check the latest available date
    const recent = await fetchCotForMarket(probeAsset.cotCode, 1);
    if (recent.length === 0) {
      return {
        needsUpdate: false,
        latestReportDate: null,
        error: `CFTC API returned no records for ${probeAsset.cotCode}`,
      };
    }

    // After fetchCotForMarket reverses DESC→ASC, limit=1 gives us the single
    // newest record as the only element
    const latestReportDate = recent[0].reportDate;

    const latestInDb = await getLatestReportDateInDb();
    if (!latestInDb) {
      return { needsUpdate: true, latestReportDate };
    }

    const needsUpdate = await isReportDateNewer(latestReportDate);
    return { needsUpdate, latestReportDate };
  } catch (error) {
    return {
      needsUpdate: false,
      latestReportDate: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
