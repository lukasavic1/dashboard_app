/**
 * Verification script: COT data and cron status.
 * Run: npx tsx scripts/verify-cot-status.ts
 *
 * Uses your current DB and optionally fetches from CFTC to compare.
 */
import { getLatestReportDateInDb, getLastRefreshTime, hasAnyStaleData } from "../lib/storage/repositories";
import { checkForNewerReport } from "../lib/data/cot/check";
import { getLatestFridayDate } from "../lib/data/cot/parse";
import { prisma } from "../lib/storage/prisma";

const COT_STALE_DAYS = 10;

async function main() {
  console.log("=== COT data & cron verification ===\n");

  const now = new Date();
  const expectedFriday = getLatestFridayDate();
  const expectedFridayStr = expectedFriday.toISOString().split("T")[0];

  // 1. Database state
  const latestReportDate = await getLatestReportDateInDb();
  const lastRefreshTime = await getLastRefreshTime();
  const isStale = await hasAnyStaleData();

  console.log("1. Your database");
  console.log("   Latest COT report date in DB:", latestReportDate ? latestReportDate.toISOString().split("T")[0] : "none");
  console.log("   Last refresh (snapshot created):", lastRefreshTime ? lastRefreshTime.toISOString() : "never");
  console.log("   Stale (>10 days)?", isStale ? "YES" : "No");
  console.log("");

  // 2. Expected vs actual
  console.log("2. Expected vs actual");
  console.log("   Today:", now.toISOString().split("T")[0], `(${now.toLocaleDateString("en-US", { weekday: "long" })})`);
  console.log("   Expected latest report (most recent Friday):", expectedFridayStr);
  if (latestReportDate) {
    const dbStr = latestReportDate.toISOString().split("T")[0];
    const daysDiff = Math.round(
      (expectedFriday.getTime() - latestReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const ageDays = Math.round(
      (now.getTime() - latestReportDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log("   DB report age (days):", ageDays);
    if (dbStr !== expectedFridayStr) {
      console.log("   Note: DB report date differs from expected Friday by", daysDiff, "day(s).");
    }
  }
  console.log("");

  // 3. Per-asset snapshot summary
  const snapshots = await prisma.cotSnapshot.groupBy({
    by: ["assetId"],
    _max: { reportDate: true },
    _count: { id: true },
  });
  console.log("3. Per-asset latest report dates in DB");
  for (const s of snapshots) {
    const d = s._max.reportDate;
    console.log("   ", s.assetId, ":", d ? d.toISOString().split("T")[0] : "—", `(${s._count.id} snapshot(s))`);
  }
  console.log("");

  // 4. Check CFTC (what cron uses)
  console.log("4. CFTC check (what the cron job uses)");
  try {
    const check = await checkForNewerReport();
    if (check.error) {
      console.log("   Error:", check.error);
    } else {
      console.log("   Latest report date available from CFTC:", check.latestReportDate?.toISOString().split("T")[0] ?? "—");
      console.log("   Cron would trigger refresh?", check.needsUpdate ? "YES" : "No (already up to date)");
    }
  } catch (e) {
    console.log("   Error:", e instanceof Error ? e.message : String(e));
  }
  console.log("");

  // 5. Cron schedule reminder
  console.log("5. Cron schedule (vercel.json)");
  console.log("   Runs at 20:35 UTC on Tue, Thu, Fri.");
  console.log("   If CFTC has newer data than DB, cron calls /api/refresh to update.");
  console.log("");

  if (isStale && latestReportDate) {
    console.log("--- Possible issues if data seems not up to date ---");
    console.log("  - Cron runs 20:35 UTC; CFTC may publish later → next run will pick it up.");
    console.log("  - CRON_SECRET / Vercel cron must be set so the job runs in production.");
    console.log("  - Refresh endpoint uses 10-day freshness; reports older than 10 days are skipped.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
