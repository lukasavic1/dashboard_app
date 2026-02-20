import { prisma } from "./prisma";

const CRON_KEY = "cot";
const RETRY_DELAY_MINUTES = 5;
const MAX_RETRIES = 3;

/**
 * Records a failed cron attempt in the database.
 * State is persisted across serverless cold starts so retries actually work.
 */
export async function recordFailure(reason: string): Promise<void> {
  const current = await prisma.cronState.findUnique({ where: { key: CRON_KEY } });
  const retryCount = (current?.retryCount ?? 0) + 1;

  await prisma.cronState.upsert({
    where: { key: CRON_KEY },
    update: {
      lastFailureAt: new Date(),
      failureReason: reason,
      retryCount,
    },
    create: {
      key: CRON_KEY,
      lastFailureAt: new Date(),
      failureReason: reason,
      retryCount: 1,
    },
  });

  console.log(`[Retry] Recorded failure #${retryCount}: ${reason}`);
}

/**
 * Clears retry state after a successful refresh.
 */
export async function clearRetryInfo(): Promise<void> {
  await prisma.cronState.upsert({
    where: { key: CRON_KEY },
    update: { lastFailureAt: null, failureReason: null, retryCount: 0 },
    create: { key: CRON_KEY, lastFailureAt: null, failureReason: null, retryCount: 0 },
  });
}

/**
 * Returns true if a previous failure was recorded and the retry delay has passed
 * (but we haven't exceeded MAX_RETRIES).
 */
export async function shouldRetry(): Promise<boolean> {
  const state = await prisma.cronState.findUnique({ where: { key: CRON_KEY } });
  if (!state?.lastFailureAt) return false;
  if (state.retryCount >= MAX_RETRIES) return false;

  const minutesSince =
    (Date.now() - state.lastFailureAt.getTime()) / (1000 * 60);
  return minutesSince >= RETRY_DELAY_MINUTES;
}

/**
 * Returns current retry info for logging.
 */
export async function getRetryInfo(): Promise<{
  retryCount: number;
  failureReason: string | null;
}> {
  const state = await prisma.cronState.findUnique({ where: { key: CRON_KEY } });
  return {
    retryCount: state?.retryCount ?? 0,
    failureReason: state?.failureReason ?? null,
  };
}
