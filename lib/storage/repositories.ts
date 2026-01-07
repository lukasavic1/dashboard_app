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
