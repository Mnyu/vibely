import { RateLimiterPrisma } from 'rate-limiter-flexible';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const FREE_CREDITS = 2;
const PRO_CREDITS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATION_CREDIT_COST = 1;

export const getUsageTracker = async () => {
  const { has } = await auth();
  const hasProAccess = has({ plan: 'pro' });

  const usageTraker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: 'Usage',
    points: hasProAccess ? PRO_CREDITS : FREE_CREDITS,
    duration: DURATION,
  });
  return usageTraker;
};

export const consumeCredits = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const usageTraker = await getUsageTracker();
  const result = await usageTraker.consume(userId, GENERATION_CREDIT_COST);
  return result;
};

export const getUsageStatus = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const usageTraker = await getUsageTracker();
  const result = await usageTraker.get(userId);
  return result;
};
