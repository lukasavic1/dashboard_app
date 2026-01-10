import { fetchCotFile } from "./fetch";
import { parseCotForMarket } from "./parse";
import { ASSETS } from "@/lib/assets/assets";
import { getLatestReportDateInDb, isReportDateNewer } from "@/lib/storage/repositories";

/**
 * Checks if there's a newer COT report available than what's in the database.
 * This function fetches the COT file and compares the latest report date
 * with what we have stored.
 * 
 * Returns:
 * - { needsUpdate: true, latestReportDate: Date } if a newer report is available
 * - { needsUpdate: false, latestReportDate: Date | null } if we're up to date
 * - { needsUpdate: false, latestReportDate: null, error: string } if check failed
 */
export async function checkForNewerReport(): Promise<{
  needsUpdate: boolean;
  latestReportDate: Date | null;
  error?: string;
}> {
  try {
    // Get latest report date from database
    const latestInDb = await getLatestReportDateInDb();

    // Fetch COT file to check what's available
    const currentYear = new Date().getFullYear();
    const yearsToTry = [2025, 2024, currentYear].filter((y, i, arr) => arr.indexOf(y) === i);

    let rawFile: string | undefined;
    let yearUsed: number | undefined;
    let lastError: Error | null = null;

    for (const year of yearsToTry) {
      try {
        rawFile = await fetchCotFile(year);
        yearUsed = year;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (!rawFile || !yearUsed) {
      return {
        needsUpdate: false,
        latestReportDate: null,
        error: `Failed to fetch COT file: ${lastError?.message || "Unknown error"}`,
      };
    }

    // Find the latest report date across all assets
    let latestReportDate: Date | null = null;

    for (const asset of ASSETS) {
      if (!asset.cotCode) continue;

      const history = parseCotForMarket(rawFile, asset.cotCode);
      if (history.length === 0) continue;

      const latestReport = history[history.length - 1];
      
      if (!latestReportDate || latestReport.reportDate > latestReportDate) {
        latestReportDate = latestReport.reportDate;
      }
    }

    if (!latestReportDate) {
      return {
        needsUpdate: false,
        latestReportDate: null,
        error: "No report dates found in fetched COT data",
      };
    }

    // Compare with database
    if (!latestInDb) {
      // No data in DB, we need to update
      return {
        needsUpdate: true,
        latestReportDate,
      };
    }

    // Check if the fetched report is newer
    const needsUpdate = await isReportDateNewer(latestReportDate);

    return {
      needsUpdate,
      latestReportDate,
    };
  } catch (error) {
    return {
      needsUpdate: false,
      latestReportDate: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
