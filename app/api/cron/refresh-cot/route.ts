import { checkForNewerReport } from "@/lib/data/cot/check";
import { NextRequest, NextResponse } from "next/server";
import { shouldRetry, recordFailure, clearRetryInfo, getRetryInfo } from "@/lib/storage/retryQueue";

/**
 * Cron job endpoint to automatically check for and fetch new COT reports.
 * 
 * This endpoint:
 * 1. Checks if there's a newer report available than what's in the database
 * 2. Only fetches and processes if a newer report exists (optimization)
 * 3. Handles edge cases (Tuesday/Thursday releases, holidays, etc.)
 * 
 * Can be called by:
 * - Vercel Cron Jobs (configure in vercel.json)
 * - External cron services (cron-job.org, EasyCron, etc.)
 * - Manual trigger for testing
 * 
 * Security: Should be protected with a secret token in production
 */
export async function GET(request: NextRequest) {
  // Optional: Add authentication/authorization check
  // For Vercel Cron, the header "x-vercel-cron" is automatically added
  // For other services, you might want to check a secret token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow Vercel cron or valid secret token
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const isValidToken = cronSecret && authHeader === `Bearer ${cronSecret}`;
  
  if (!isVercelCron && !isValidToken && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Check if this is a retry attempt
    const isRetry = shouldRetry();
    if (isRetry) {
      const retryInfo = getRetryInfo();
      console.log(
        `[Cron] Retry attempt #${retryInfo.retryCount}. ` +
        `Previous failure: ${retryInfo.failureReason}`
      );
    } else {
      console.log("[Cron] Starting COT report check...");
    }

    // Check if there's a newer report available
    const checkResult = await checkForNewerReport();

    if (checkResult.error) {
      const errorMessage = checkResult.error;
      console.error("[Cron] Error checking for newer report:", errorMessage);
      
      // Only retry if this wasn't already a retry attempt
      if (!isRetry) {
        await recordFailure(`Check error: ${errorMessage}`);
      }
      
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to check for newer report",
          error: errorMessage,
          willRetry: !isRetry,
          retryInMinutes: !isRetry ? 5 : undefined,
        },
        { status: 500 }
      );
    }

    if (!checkResult.needsUpdate) {
      const latestDateStr = checkResult.latestReportDate
        ? checkResult.latestReportDate.toISOString().split("T")[0]
        : "unknown";
      console.log(
        `[Cron] No update needed. Latest report in DB: ${latestDateStr}, Latest available: ${latestDateStr}`
      );
      return NextResponse.json({
        status: "skipped",
        message: "No newer report available",
        latestReportDate: checkResult.latestReportDate?.toISOString(),
      });
    }

    // There's a newer report, trigger the refresh
    console.log(
      `[Cron] Newer report found: ${checkResult.latestReportDate?.toISOString()}. Triggering refresh...`
    );

    // Call the refresh endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    
    const refreshUrl = `${baseUrl}/api/refresh`;
    
    try {
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-internal": "1", // Bypass rate limiting for cron jobs
        },
      });

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok || refreshData.status === "error") {
        const errorMessage = refreshData.error || refreshData.message || "Unknown error";
        console.error("[Cron] Refresh failed:", errorMessage);
        
        // Record failure for retry
        await recordFailure(errorMessage);
        
        return NextResponse.json(
          {
            status: "error",
            message: "Failed to refresh COT data",
            error: errorMessage,
            willRetry: true,
            retryInMinutes: 5,
          },
          { status: 500 }
        );
      }

      // Clear retry info on success
      clearRetryInfo();
      
      console.log(
        `[Cron] Refresh completed successfully. ${refreshData.results?.length || 0} assets processed.`
      );

      return NextResponse.json({
        status: "success",
        message: "COT data refreshed successfully",
        latestReportDate: checkResult.latestReportDate?.toISOString(),
        results: refreshData.results,
        wasRetry: isRetry,
      });
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[Cron] Error calling refresh endpoint:", errorMessage);
      
      // Record failure for retry
      await recordFailure(`Fetch error: ${errorMessage}`);
      
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to call refresh endpoint",
          error: errorMessage,
          willRetry: true,
          retryInMinutes: 5,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Cron] Unexpected error:", errorMessage);
    
    // Record failure for retry
    await recordFailure(`Unexpected error: ${errorMessage}`);
    
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error in cron job",
        error: errorMessage,
        willRetry: true,
        retryInMinutes: 5,
      },
      { status: 500 }
    );
  }
}

// Also support POST for external cron services that prefer POST
export const POST = GET;
