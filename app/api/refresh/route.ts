import { ASSETS } from "@/lib/assets/assets";
import { fetchCotForMarket } from "@/lib/data/cot/fetch";
import { getLatestFridayDate } from "@/lib/data/cot/parse";
import { computeCotAnalysis } from "@/lib/processing/cot/analysis";
import { generateCotNotes } from "@/lib/processing/cot/llm";
import {
  isCotStale,
  saveCotSnapshot,
  isReportDateNewer,
  getLatestReportDateInDb,
  isSeasonalityStale,
  saveSeasonalitySnapshot,
} from "@/lib/storage/repositories";
import { computeSeasonality } from "@/lib/data/seasonality/compute";
import { prisma } from "@/lib/storage/prisma";
import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/verify";
import {
  canUserRefresh,
  recordRefreshAttempt,
  getRemainingRefreshes,
} from "@/lib/storage/refreshLimits";
import { getOrCreateUser } from "@/lib/storage/subscription";

/**
 * Returns true if the report date is within maxAgeDays of today.
 * Handles holiday shifts (Thu releases) and timezone edge cases.
 */
function isReportDateRecent(reportDate: Date, maxAgeDays = 10): boolean {
  const diffDays =
    (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= maxAgeDays && diffDays >= 0;
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth & rate-limiting ──────────────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    const isCronJob =
      request.headers.get("x-vercel-cron") === "1" ||
      request.headers.get("x-cron-internal") === "1";

    let userId: string | null = null;

    if (!isCronJob) {
      const userInfo = await verifyFirebaseToken(authHeader);
      if (!userInfo) {
        return Response.json(
          { status: "error", message: "Unauthorized. Please log in to refresh data." },
          { status: 401 }
        );
      }
      userId = userInfo.uid;
      await getOrCreateUser(userId, userInfo.email || "");

      const canRefresh = await canUserRefresh(userId);
      if (!canRefresh) {
        const remaining = await getRemainingRefreshes(userId);
        return Response.json(
          {
            status: "error",
            message: `Rate limit exceeded. You can refresh up to 3 times per day. Remaining today: ${remaining}`,
            rateLimited: true,
            remainingRefreshes: remaining,
          },
          { status: 429 }
        );
      }
    }

    // ── Expected date (logging only) ─────────────────────────────────────────
    const latestFriday = getLatestFridayDate();
    console.log(
      `COT refresh started. Expecting latest report around ${latestFriday.toISOString().split("T")[0]}`
    );

    // ── Ensure all assets exist in DB ─────────────────────────────────────────
    for (const asset of ASSETS) {
      await prisma.asset.upsert({
        where: { id: asset.id },
        update: {},
        create: { id: asset.id, name: asset.name, cotCode: asset.cotCode ?? null },
      });
    }

    // ── Quick pre-flight: is the API ahead of our DB? ─────────────────────────
    // Fetch just 1 record for one asset so we can bail early if already up-to-date.
    const probeAsset = ASSETS.find((a) => a.cotCode);
    if (probeAsset?.cotCode) {
      try {
        const probe = await fetchCotForMarket(probeAsset.cotCode, 1);
        if (probe.length > 0) {
          const latestInFile = probe[0].reportDate;
          const latestInDb = await getLatestReportDateInDb();
          const isNewer = await isReportDateNewer(latestInFile);

          if (!isNewer && latestInDb) {
            const inDbStr = latestInDb.toISOString().split("T")[0];
            const inFileStr = latestInFile.toISOString().split("T")[0];
            console.log(
              `Skipping refresh — DB (${inDbStr}) is same or newer than API (${inFileStr})`
            );
            return Response.json({
              status: "skipped",
              message: "No newer report available",
              latestInDb: inDbStr,
              latestInFile: inFileStr,
              results: [],
            });
          }
        }
      } catch (probeErr) {
        // Pre-flight is an optimisation; if it fails, log and continue to per-asset fetch
        console.warn(
          "Pre-flight check failed, proceeding to per-asset fetch:",
          probeErr instanceof Error ? probeErr.message : String(probeErr)
        );
      }
    }

    // ── Per-asset fetch & process ─────────────────────────────────────────────
    const results: unknown[] = [];

    for (const asset of ASSETS) {
      if (!asset.cotCode) continue;

      try {
        const stale = await isCotStale(asset.id);
        if (!stale) {
          console.log(`Skipping ${asset.id} — data is fresh`);
          continue;
        }

        // Fetch full history for this asset from the CFTC API
        const history = await fetchCotForMarket(asset.cotCode);
        if (history.length === 0) {
          console.log(`No data returned for ${asset.id}`);
          continue;
        }

        const latestReport = history[history.length - 1];
        const reportDateStr = latestReport.reportDate.toISOString().split("T")[0];
        const reportDayName = getDayName(latestReport.reportDate);

        // Skip if we already have this exact report date (or newer)
        const assetLatestInDb = await prisma.cotSnapshot.findFirst({
          where: { assetId: asset.id },
          orderBy: { reportDate: "desc" },
          select: { reportDate: true },
        });
        if (assetLatestInDb) {
          const reportDateOnly = new Date(latestReport.reportDate);
          reportDateOnly.setHours(0, 0, 0, 0);
          const dbDateOnly = new Date(assetLatestInDb.reportDate);
          dbDateOnly.setHours(0, 0, 0, 0);
          if (reportDateOnly.getTime() <= dbDateOnly.getTime()) {
            console.log(
              `Skipping ${asset.id} — already have report for ${reportDateStr} or newer`
            );
            continue;
          }
        }

        // Reject stale data (> 10 days old) — guards against API returning stale data
        if (!isReportDateRecent(latestReport.reportDate, 10)) {
          const daysSince = Math.floor(
            (Date.now() - latestReport.reportDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          console.warn(
            `WARNING: ${asset.id} — latest API report ${reportDateStr} (${reportDayName}) ` +
              `is ${daysSince} days old, exceeds 10-day threshold. Skipping.`
          );
          results.push({
            asset: asset.id,
            status: "skipped",
            reason: `Report is ${daysSince} days old (max allowed: 10 days)`,
            reportDate: reportDateStr,
          });
          continue;
        }

        if (latestReport.reportDate.getDay() !== 5) {
          console.log(
            `INFO: ${asset.id} — report date ${reportDateStr} is a ${reportDayName} ` +
              `(not Friday — likely holiday shift). Processing anyway.`
          );
        }

        if (history.length < 2) {
          console.log(`Insufficient history for ${asset.id} (need at least 2 weeks)`);
          continue;
        }

        // ── Analysis ───────────────────────────────────────────────────────────
        const analysis = computeCotAnalysis(history);
        const previous = history[history.length - 2];

        let notes: string[];
        try {
          notes = await generateCotNotes(asset.name, latestReport, previous, analysis);
        } catch (e) {
          console.error(`Skipping ${asset.id} — LLM note generation failed`);
          continue;
        }
        analysis.notes = notes;

        // ── Save snapshot ──────────────────────────────────────────────────────
        await saveCotSnapshot(
          asset.id,
          latestReport.reportDate,
          latestReport,
          {
            analysis,
            commercialMetrics: {
              netPosition: analysis.metrics.commercial.netPosition,
              cotIndex: analysis.metrics.commercial.cotIndex,
              range: {
                min: Math.min(...history.map((h) => h.commercialLong - h.commercialShort)),
                max: Math.max(...history.map((h) => h.commercialLong - h.commercialShort)),
              },
            },
          }
        );

        // ── Seasonality ────────────────────────────────────────────────────────
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
      } catch (assetErr) {
        console.error(`Error processing ${asset.id}:`, assetErr);
        results.push({
          asset: asset.id,
          status: "error",
          error: assetErr instanceof Error ? assetErr.message : "Unknown error",
        });
      }
    }

    // ── Response ──────────────────────────────────────────────────────────────
    if (userId) {
      await recordRefreshAttempt(userId);
      const remaining = await getRemainingRefreshes(userId);
      return Response.json({
        status: "ok",
        results,
        expectedDate: latestFriday.toISOString().split("T")[0],
        remainingRefreshes: remaining,
      });
    }

    return Response.json({
      status: "ok",
      results,
      expectedDate: latestFriday.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("POST /api/refresh error:", error);
    return Response.json(
      {
        status: "error",
        message: "Refresh failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
