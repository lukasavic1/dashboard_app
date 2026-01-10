import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/verify";
import { getRemainingRefreshes } from "@/lib/storage/refreshLimits";
import { getOrCreateUser } from "@/lib/storage/subscription";

/**
 * Get remaining manual refresh attempts for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const userInfo = await verifyFirebaseToken(authHeader);

    if (!userInfo) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ensure user exists in database
    await getOrCreateUser(userInfo.uid, userInfo.email || "");

    const remaining = await getRemainingRefreshes(userInfo.uid);

    return NextResponse.json({
      remaining,
    });
  } catch (error) {
    console.error("Error fetching remaining refreshes:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
