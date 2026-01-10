import { prisma } from "./prisma";

const MAX_REFRESHES_PER_DAY = 3;

/**
 * Checks if a user can perform a manual refresh (rate limit: 3 per day)
 * Returns true if allowed, false if rate limited
 */
export async function canUserRefresh(userId: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.refreshAttempt.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  return count < MAX_REFRESHES_PER_DAY;
}

/**
 * Records a manual refresh attempt
 */
export async function recordRefreshAttempt(userId: string): Promise<void> {
  await prisma.refreshAttempt.create({
    data: {
      userId,
    },
  });
}

/**
 * Gets the number of refreshes remaining for a user today
 */
export async function getRemainingRefreshes(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.refreshAttempt.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  return Math.max(0, MAX_REFRESHES_PER_DAY - count);
}
