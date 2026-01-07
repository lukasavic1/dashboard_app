import { ASSETS } from "@/lib/assets/assets";
import { fetchCotFile } from "@/lib/data/cot/fetch";
import { 
  parseCotForMarket, 
  getLatestFridayDate 
} from "@/lib/data/cot/parse";
import { computeCotAnalysis } from "@/lib/processing/cot/analysis";
import { generateCotNotes } from "@/lib/processing/cot/llm";
import { isCotStale, saveCotSnapshot } from "@/lib/storage/repositories";
import { computeSeasonality } from "@/lib/data/seasonality/compute";
import {
  isSeasonalityStale,
  saveSeasonalitySnapshot,
} from "@/lib/storage/repositories";
import { prisma } from "@/lib/storage/prisma";

/**
 * Validates that the latest report is recent enough to be considered fresh.
 * 
 * COT reports are typically published on Fridays at 3:30 PM US Eastern Time, but:
 * - Due to timezone differences, the report date might appear as a different day
 * - During holidays, reports can be shifted to Thursday (or occasionally other days)
 * - The report date in the data is the "as of" date, not the publication date
 * 
 * Instead of requiring an exact Friday match, we check if the report is within
 * a reasonable window (default 10 days) to handle all these edge cases.
 */
function isReportDateRecent(reportDate: Date, maxAgeDays: number = 10): boolean {
  const now = new Date();
  const diffMs = now.getTime() - reportDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= maxAgeDays && diffDays >= 0;
}

/**
 * Gets the day name for logging purposes
 */
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export async function POST() {
  const currentYear = new Date().getFullYear();
  const latestFriday = getLatestFridayDate();
  
  console.log(`Fetching COT data, expecting latest report around ${latestFriday.toISOString().split('T')[0]}`);

  let rawFile: string | undefined;
  let yearUsed: number | undefined;
  
  // Try 2025 first (most recent year with data), then 2024, then current year
  const yearsToTry = [2025, 2024, currentYear].filter((y, i, arr) => arr.indexOf(y) === i);
  
  let lastError: Error | null = null;
  
  for (const year of yearsToTry) {
    try {
      rawFile = await fetchCotFile(year);
      yearUsed = year;
      console.log(`Successfully fetched COT data for ${year}`);
      break;
    } catch (error) {
      console.warn(`Failed to fetch COT data for ${year}:`, error instanceof Error ? error.message : String(error));
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }
  
  if (!rawFile || !yearUsed) {
    console.error("Failed to fetch COT file for all attempted years:", yearsToTry);
    const errorMessage = lastError?.message || "Unknown error";
    return Response.json({ 
      status: "error", 
      message: "Failed to fetch COT data",
      error: errorMessage,
      attemptedYears: yearsToTry,
      urls: yearsToTry.map(y => `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${y}.zip`)
    }, { status: 500 });
  }

  const results = [];

  // 🔐 Ensure all assets exist in DB
  for (const asset of ASSETS) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: {},
      create: {
        id: asset.id,
        name: asset.name,
        cotCode: asset.cotCode ?? null,
      },
    });
  }

  for (const asset of ASSETS) {
    if (!asset.cotCode) continue;

    try {
      const stale = await isCotStale(asset.id);
      if (!stale) {
        console.log(`Skipping ${asset.id} - data is fresh`);
        continue;
      }

      const history = parseCotForMarket(rawFile, asset.cotCode);
      if (history.length === 0) {
        console.log(`No data found for ${asset.id}`);
        continue;
      }

      // Get the latest report from history
      const latestReport = history[history.length - 1];
      const reportDateStr = latestReport.reportDate.toISOString().split('T')[0];
      const reportDayName = getDayName(latestReport.reportDate);
      
      // Validate the report is recent (within last 10 days)
      // This handles:
      // - Timezone differences (report might show as day before/after)
      // - Holiday shifts (Thursday releases instead of Friday)
      // - Weekend "as of" dates
      if (!isReportDateRecent(latestReport.reportDate, 10)) {
        const daysSinceReport = Math.floor(
          (new Date().getTime() - latestReport.reportDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        console.warn(
          `WARNING: ${asset.id} - Latest report date ${reportDateStr} (${reportDayName}) ` +
          `is ${daysSinceReport} days old, which exceeds the 10-day freshness threshold. ` +
          `Skipping update.`
        );
        results.push({
          asset: asset.id,
          status: "skipped",
          reason: `Report is ${daysSinceReport} days old (max allowed: 10 days)`,
          reportDate: reportDateStr,
        });
        continue;
      }

      // Log if the report date is not a typical Friday (for awareness, but don't skip)
      if (latestReport.reportDate.getDay() !== 5) {
        console.log(
          `INFO: ${asset.id} - Report date ${reportDateStr} is a ${reportDayName} ` +
          `(not Friday - likely due to holiday shift or timezone). Processing anyway.`
        );
      }

      // Need at least 2 weeks for analysis
      if (history.length < 2) {
        console.log(`Insufficient history for ${asset.id} (need at least 2 weeks)`);
        continue;
      }

      // Compute COT analysis
      const analysis = computeCotAnalysis(history);
      
      // Generate notes using Claude
      const previous = history[history.length - 2];
      let notes: string[];

      try {
        notes = await generateCotNotes(
          asset.name,
          latestReport,
          previous,
          analysis
        );
      } catch (e) {
        console.error(`Skipping ${asset.id} due to LLM failure`);
        continue;
      }


      // Update analysis with notes
      analysis.notes = notes;

      // Save COT snapshot with full analysis
      await saveCotSnapshot(
        asset.id,
        latestReport.reportDate,
        latestReport, // rawData
        {
          analysis, // derivedData with full analysis
          commercialMetrics: {
            netPosition: analysis.metrics.commercial.netPosition,
            cotIndex: analysis.metrics.commercial.cotIndex,
            range: {
              min: Math.min(...history.map(h => h.commercialLong - h.commercialShort)),
              max: Math.max(...history.map(h => h.commercialLong - h.commercialShort)),
            },
          },
        }
      );

      // Seasonality
      if (asset.seasonality) {
        const staleSeasonality = await isSeasonalityStale(asset.id);
        if (staleSeasonality) {
          const result = computeSeasonality(asset.id);
          await saveSeasonalitySnapshot(asset.id, result);
        }
      }

      results.push({
        asset: asset.id,
        status: "updated",
        reportDate: reportDateStr,
        reportDay: reportDayName,
        score: analysis.score,
        bias: analysis.bias,
      });

      console.log(`Updated ${asset.id}: ${analysis.bias} (${analysis.score})`);
    } catch (error) {
      console.error(`Error processing ${asset.id}:`, error);
      results.push({
        asset: asset.id,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return Response.json({ 
    status: "ok", 
    results,
    expectedDate: latestFriday.toISOString().split('T')[0],
  });
}