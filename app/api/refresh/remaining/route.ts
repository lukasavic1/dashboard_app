import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/verify";
import { getRemainingRefreshes } from "@/lib/storage/refreshLimits";
import { getOrCreateUser } from "@/lib/storage/subscription";

const MAX_REFRESHES_PER_DAY = 3;

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

    // Ensure user exists in database (best-effort; don't fail if upsert has a conflict)
    try {
      await getOrCreateUser(userInfo.uid, userInfo.email || "");
    } catch (userErr) {
      console.warn("getOrCreateUser failed (user may already exist):", userErr);
      // Continue to try getRemainingRefreshes
    }

    let remaining: number;
    try {
      remaining = await getRemainingRefreshes(userInfo.uid);
    } catch (dbErr) {
      console.error("Error fetching remaining refreshes:", dbErr);
      // Return safe default so UI doesn't break (e.g. DB/Prisma issue)
      return NextResponse.json({ remaining: MAX_REFRESHES_PER_DAY });
    }

    return NextResponse.json({
      remaining,
    });
  } catch (error) {
    console.error("Error in refresh/remaining:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
