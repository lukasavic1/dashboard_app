import { prisma } from "./prisma";

const COT_STALE_DAYS = 10;

export async function isCotStale(assetId: string) {
  const latest = await prisma.cotSnapshot.findFirst({
    where: { assetId },
    orderBy: { reportDate: "desc" },
  });

  if (!latest) return true;

  const ageDays =
    (Date.now() - latest.reportDate.getTime()) /
    (1000 * 60 * 60 * 24);

  return ageDays > COT_STALE_DAYS;
}

export async function saveCotSnapshot(
  assetId: string,
  reportDate: Date,
  rawData: any,
  derivedData: any
) {
  // 🔐 Ensure asset exists (FK safety)
  const assetExists = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true },
  });

  if (!assetExists) {
    throw new Error(
      `Asset with id "${assetId}" does not exist. Seed assets before saving COT snapshots.`
    );
  }

  await prisma.cotSnapshot.upsert({
    where: {
      assetId_reportDate: { assetId, reportDate },
    },
    update: {
      rawData,
      derivedData,
    },
    create: {
      assetId,
      reportDate,
      rawData,
      derivedData,
    },
  });
}

export async function getLatestCotSnapshot(assetId: string) {
  return prisma.cotSnapshot.findFirst({
    where: { assetId },
    orderBy: { reportDate: "desc" },
  });
}

export async function getLatestSeasonality(assetId: string) {
  return prisma.seasonalitySnapshot.findFirst({
    where: { assetId },
    orderBy: { date: "desc" },
  });
}

export async function isSeasonalityStale(assetId: string) {
  const latest = await getLatestSeasonality(assetId);
  if (!latest) return true;

  const now = new Date();
  const last = new Date(latest.date);

  // Recompute only if month changed
  return (
    now.getFullYear() !== last.getFullYear() ||
    now.getMonth() !== last.getMonth()
  );
}

export async function saveSeasonalitySnapshot(
  assetId: string,
  result: any
) {
  await prisma.seasonalitySnapshot.create({
    data: {
      assetId,
      date: result.date,
      score: result.score,
      details: result,
    },
  });
}

/**
 * Gets the latest report date across all assets in the database
 * Returns null if no reports exist
 */
export async function getLatestReportDateInDb(): Promise<Date | null> {
  const latest = await prisma.cotSnapshot.findFirst({
    orderBy: { reportDate: "desc" },
    select: { reportDate: true },
  });

  return latest?.reportDate ?? null;
}

/**
 * Checks if a report date is newer than what we have in the database
 * Returns true if the report is newer, false if it's the same or older
 */
export async function isReportDateNewer(reportDate: Date): Promise<boolean> {
  const latestInDb = await getLatestReportDateInDb();
  
  if (!latestInDb) {
    // No data in DB, so any report is considered newer
    return true;
  }

  // Compare dates (ignore time, only compare dates)
  const reportDateOnly = new Date(reportDate);
  reportDateOnly.setHours(0, 0, 0, 0);
  
  const latestDateOnly = new Date(latestInDb);
  latestDateOnly.setHours(0, 0, 0, 0);

  return reportDateOnly.getTime() > latestDateOnly.getTime();
}

/**
 * Checks if any asset has stale data (older than threshold)
 * Returns true if at least one asset needs updating
 */
export async function hasAnyStaleData(): Promise<boolean> {
  const latestInDb = await getLatestReportDateInDb();
  
  if (!latestInDb) {
    return true; // No data at all, consider it stale
  }

  const ageDays =
    (Date.now() - latestInDb.getTime()) / (1000 * 60 * 60 * 24);

  return ageDays > COT_STALE_DAYS;
}

/**
 * Gets the timestamp of the last refresh (when the most recent snapshot was created)
 * Returns null if no snapshots exist
 */
export async function getLastRefreshTime(): Promise<Date | null> {
  const latest = await prisma.cotSnapshot.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return latest?.createdAt ?? null;
}
