import { checkForNewerReport } from "@/lib/data/cot/check";
import { NextRequest, NextResponse } from "next/server";
import { shouldRetry, recordFailure, clearRetryInfo, getRetryInfo } from "@/lib/storage/retryQueue";

/**
 * Cron job endpoint — automatically checks for and fetches new COT reports.
 *
 * Schedule (vercel.json):
 *   - Primary:  Fridays 21:00 UTC  (4 PM EST / 5 PM EDT — 30–90 min after CFTC release)
 *   - Backup:   Fridays 23:30 UTC  (6:30 PM EST / 7:30 PM EDT — in case primary misses)
 *
 * Auth:
 *   - Vercel Cron automatically adds x-vercel-cron: 1  (always allowed)
 *   - External callers must send Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const isValidToken = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !isValidToken && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isRetry = await shouldRetry();
    if (isRetry) {
      const info = await getRetryInfo();
      console.log(
        `[Cron] Retry attempt #${info.retryCount}. Previous failure: ${info.failureReason}`
      );
    } else {
      console.log("[Cron] Starting COT report check...");
    }

    const checkResult = await checkForNewerReport();

    if (checkResult.error) {
      console.error("[Cron] Error checking for newer report:", checkResult.error);
      if (!isRetry) {
        await recordFailure(`Check error: ${checkResult.error}`);
      }
      return NextResponse.json({
        status: "error",
        message: "Failed to check for newer report",
        error: checkResult.error,
        willRetry: !isRetry,
        retryInMinutes: !isRetry ? 5 : undefined,
      });
    }

    if (!checkResult.needsUpdate) {
      const latestDateStr = checkResult.latestReportDate
        ? checkResult.latestReportDate.toISOString().split("T")[0]
        : "unknown";
      console.log(`[Cron] No update needed. Latest available: ${latestDateStr}`);
      return NextResponse.json({
        status: "skipped",
        message: "No newer report available",
        latestReportDate: checkResult.latestReportDate?.toISOString(),
      });
    }

    console.log(
      `[Cron] Newer report found: ${checkResult.latestReportDate?.toISOString()}. Triggering refresh...`
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    try {
      const refreshResponse = await fetch(`${baseUrl}/api/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-internal": "1",
        },
      });

      let refreshData: { status?: string; error?: string; message?: string; results?: unknown[] };
      try {
        refreshData = await refreshResponse.json();
      } catch {
        refreshData = {
          status: "error",
          message: refreshResponse.statusText || "Invalid response",
          error: `Refresh returned ${refreshResponse.status}`,
        };
      }

      if (!refreshResponse.ok || refreshData.status === "error") {
        const errorMessage = refreshData.error || refreshData.message || "Unknown error";
        console.error("[Cron] Refresh failed:", errorMessage);
        await recordFailure(errorMessage);
        return NextResponse.json({
          status: "error",
          message: "Failed to refresh COT data",
          error: errorMessage,
          willRetry: true,
          retryInMinutes: 5,
        });
      }

      await clearRetryInfo();
      console.log(
        `[Cron] Refresh completed. ${refreshData.results?.length ?? 0} assets processed.`
      );
      return NextResponse.json({
        status: "success",
        message: "COT data refreshed successfully",
        latestReportDate: checkResult.latestReportDate?.toISOString(),
        results: refreshData.results,
        wasRetry: isRetry,
      });
    } catch (fetchError) {
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[Cron] Error calling refresh endpoint:", msg);
      await recordFailure(`Fetch error: ${msg}`);
      return NextResponse.json({
        status: "error",
        message: "Failed to call refresh endpoint",
        error: msg,
        willRetry: true,
        retryInMinutes: 5,
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Cron] Unexpected error:", msg);
    await recordFailure(`Unexpected error: ${msg}`);
    return NextResponse.json({
      status: "error",
      message: "Unexpected error in cron job",
      error: msg,
      willRetry: true,
      retryInMinutes: 5,
    });
  }
}

// Support POST for external cron services that prefer POST
export const POST = GET;
