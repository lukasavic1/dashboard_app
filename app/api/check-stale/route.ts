import { hasAnyStaleData } from "@/lib/storage/repositories";
import { NextResponse } from "next/server";

/**
 * Lightweight endpoint to check if COT data is stale.
 * Used by the dashboard to determine if a background refresh should be triggered.
 * 
 * This endpoint:
 * - Only checks the database (no external API calls)
 * - Returns quickly
 * - Can be called frequently without performance impact
 */
export async function GET() {
  try {
    const isStale = await hasAnyStaleData();

    return NextResponse.json({
      stale: isStale,
    });
  } catch (error) {
    console.error("Error checking stale data:", error);
    return NextResponse.json(
      {
        stale: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
