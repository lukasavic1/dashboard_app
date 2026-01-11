import { NextResponse } from "next/server";
import { getLastRefreshTime, getLatestReportDateInDb } from "@/lib/storage/repositories";

/**
 * Get information about the last refresh
 * Returns the last refresh timestamp and the latest report date
 */
export async function GET() {
  try {
    const lastRefreshTime = await getLastRefreshTime();
    const latestReportDate = await getLatestReportDateInDb();

    return NextResponse.json({
      lastRefreshTime: lastRefreshTime?.toISOString() ?? null,
      latestReportDate: latestReportDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error fetching last refresh info:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        lastRefreshTime: null,
        latestReportDate: null,
      },
      { status: 500 }
    );
  }
}
