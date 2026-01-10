import { prisma } from "./prisma";

const RETRY_DELAY_MINUTES = 5;

/**
 * Model to track failed refresh attempts for retry
 * We'll use a simple approach: store the last failure time
 */
interface RetryInfo {
  lastFailureTime: Date | null;
  failureReason: string | null;
  retryCount: number;
}

// In-memory cache for retry info (will reset on serverless cold start, but that's okay)
// For production, you might want to store this in a database or Redis
let retryInfo: RetryInfo = {
  lastFailureTime: null,
  failureReason: null,
  retryCount: 0,
};

/**
 * Records a failed refresh attempt
 */
export async function recordFailure(reason: string): Promise<void> {
  retryInfo = {
    lastFailureTime: new Date(),
    failureReason: reason,
    retryCount: retryInfo.retryCount + 1,
  };
  
  console.log(`[Retry] Recorded failure. Retry count: ${retryInfo.retryCount}. Reason: ${reason}`);
}

/**
 * Clears retry info after successful refresh
 */
export function clearRetryInfo(): void {
  retryInfo = {
    lastFailureTime: null,
    failureReason: null,
    retryCount: 0,
  };
}

/**
 * Checks if there's a pending retry that should be executed
 * Returns true if a retry should be attempted (failure occurred and 5 minutes have passed)
 */
export function shouldRetry(): boolean {
  if (!retryInfo.lastFailureTime) {
    return false;
  }

  const now = new Date();
  const timeSinceFailure = now.getTime() - retryInfo.lastFailureTime.getTime();
  const minutesSinceFailure = timeSinceFailure / (1000 * 60);

  // Retry if failure occurred more than 5 minutes ago
  // But limit retries to prevent infinite loops
  if (minutesSinceFailure >= RETRY_DELAY_MINUTES && retryInfo.retryCount < 3) {
    console.log(
      `[Retry] Should retry. ${minutesSinceFailure.toFixed(1)} minutes since failure. ` +
      `Retry count: ${retryInfo.retryCount}`
    );
    return true;
  }

  return false;
}

/**
 * Gets retry info for logging
 */
export function getRetryInfo(): RetryInfo {
  return { ...retryInfo };
}
