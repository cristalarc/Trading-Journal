import { PrismaClient } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const prisma = new PrismaClient();
const logger = createLogger('IdeaService');

export interface CreateIdeaData {
  ticker: string;
  date?: Date;
  currentPrice: number;
  targetEntry: number;
  targetPrice: number;
  stop: number;
  tradeDirection: 'Long' | 'Short';
  strategyId?: string;
  market: 'Bullish' | 'Bearish';
  relative: number;
  oneHourTrend: 'Bullish' | 'Bearish';
  oneHourCloud: 'Above' | 'Below';
  intendedPosition: number;
  notes?: string;
  sourceId?: string;
  quality: 'HQ' | 'MQ' | 'LQ';
  status?: 'active';
  tradeId?: string;
}

export interface UpdateIdeaData extends Partial<CreateIdeaData> {
  id: string;
}

export interface IdeaFilters {
  ticker?: string;
  status?: 'active' | 'expired';
  strategyId?: string;
  sourceId?: string;
  quality?: 'HQ' | 'MQ' | 'LQ';
  tradeDirection?: 'Long' | 'Short';
  market?: 'Bullish' | 'Bearish';
}

// Calculate RR Ratio
function calculateRRRatio(targetEntry: number, targetPrice: number, stop: number, tradeDirection: 'Long' | 'Short'): number {
  if (tradeDirection === 'Long') {
    const risk = targetEntry - stop;
    const reward = targetPrice - targetEntry;
    return risk > 0 ? reward / risk : 0;
  } else {
    const risk = stop - targetEntry;
    const reward = targetEntry - targetPrice;
    return risk > 0 ? reward / risk : 0;
  }
}

// Calculate To Win Money
function calculateToWinMoney(
  intendedPosition: number, 
  targetEntry: number, 
  targetPrice: number, 
  tradeDirection: 'Long' | 'Short',
  ticker: string,
  stockMultipliers: { ticker: string; multiplier: number }[]
): number {
  let multiplier = 1;
  const stockMultiplier = stockMultipliers.find(sm => sm.ticker === ticker);
  if (stockMultiplier) {
    multiplier = stockMultiplier.multiplier;
  }

  let profit;
  if (tradeDirection === 'Long') {
    profit = (targetPrice - targetEntry) * intendedPosition;
  } else {
    profit = (targetEntry - targetPrice) * intendedPosition;
  }

  return Math.abs(profit * multiplier);
}

// Calculate Money Risk
function calculateMoneyRisk(
  intendedPosition: number,
  targetEntry: number,
  stop: number,
  tradeDirection: 'Long' | 'Short',
  ticker: string,
  stockMultipliers: { ticker: string; multiplier: number }[]
): number {
  let multiplier = 1;
  const stockMultiplier = stockMultipliers.find(sm => sm.ticker === ticker);
  if (stockMultiplier) {
    multiplier = stockMultiplier.multiplier;
  }

  let risk;
  if (tradeDirection === 'Long') {
    risk = (targetEntry - stop) * intendedPosition;
  } else {
    risk = (stop - targetEntry) * intendedPosition;
  }

  return Math.abs(risk * multiplier);
}

// Get stock multipliers from database
async function getStockMultipliers(): Promise<{ ticker: string; multiplier: number }[]> {
  const multipliers = await (prisma as any).stockMultiplierConfig.findMany();
  return multipliers.map((m: any) => ({ ticker: m.ticker, multiplier: Number(m.multiplier) }));
}

// Get ideas expiry days from database
async function getIdeasExpiryDays(): Promise<number> {
  const config = await (prisma as any).ideasExpiryConfig.findFirst();
  return config?.expiryDays || 365;
}

// Create a new idea
export async function createIdea(data: CreateIdeaData) {
  try {
    const stockMultipliers = await getStockMultipliers();
    const expiryDays = await getIdeasExpiryDays();
    
    const rrRatio = calculateRRRatio(data.targetEntry, data.targetPrice, data.stop, data.tradeDirection);
    const toWinMoney = calculateToWinMoney(
      data.intendedPosition, 
      data.targetEntry, 
      data.targetPrice, 
      data.tradeDirection,
      data.ticker,
      stockMultipliers
    );
    const moneyRisk = calculateMoneyRisk(
      data.intendedPosition,
      data.targetEntry,
      data.stop,
      data.tradeDirection,
      data.ticker,
      stockMultipliers
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const idea = await (prisma as any).idea.create({
      data: {
        ...data,
        date: data.date || new Date(),
        rrRatio,
        toWinMoney,
        moneyRisk,
        expiresAt,
        status: data.status || 'active'
      },
      include: {
        strategy: true,
        sourced: true
      }
    });

    logger.info('Idea created successfully', { ideaId: idea.id, ticker: idea.ticker });
    return idea;
  } catch (error) {
    logger.error('Error creating idea', { error, data });
    throw error;
  }
}

// Get all ideas with optional filters
export async function getAllIdeas(filters: IdeaFilters = {}) {
  try {
    const ideas = await (prisma as any).idea.findMany({
      where: {
        ...(filters.ticker && { ticker: { contains: filters.ticker, mode: 'insensitive' } }),
        ...(filters.status && { status: filters.status }),
        ...(filters.strategyId && { strategyId: filters.strategyId }),
        ...(filters.sourceId && { sourceId: filters.sourceId }),
        ...(filters.quality && { quality: filters.quality }),
        ...(filters.tradeDirection && { tradeDirection: filters.tradeDirection }),
        ...(filters.market && { market: filters.market })
      },
      include: {
        strategy: true,
        sourced: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logger.info('Ideas retrieved successfully', { count: ideas.length, filters });
    return ideas;
  } catch (error) {
    logger.error('Error retrieving ideas', { error, filters });
    throw error;
  }
}

// Get idea by ID
export async function getIdeaById(id: string) {
  try {
    const idea = await (prisma as any).idea.findUnique({
      where: { id },
      include: {
        strategy: true,
        sourced: true
      }
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    logger.info('Idea retrieved successfully', { ideaId: id });
    return idea;
  } catch (error) {
    logger.error('Error retrieving idea', { error, ideaId: id });
    throw error;
  }
}

// Update an idea
export async function updateIdea(data: UpdateIdeaData) {
  try {
    const { id, ...updateData } = data;
    
    // If updating prices or position, recalculate derived fields
    if (updateData.targetEntry || updateData.targetPrice || updateData.stop || updateData.intendedPosition || updateData.tradeDirection) {
      const existingIdea = await (prisma as any).idea.findUnique({ where: { id } });
      if (!existingIdea) {
        throw new Error('Idea not found');
      }

      const stockMultipliers = await getStockMultipliers();
      
      const targetEntry = Number(updateData.targetEntry ?? existingIdea.targetEntry);
      const targetPrice = Number(updateData.targetPrice ?? existingIdea.targetPrice);
      const stop = Number(updateData.stop ?? existingIdea.stop);
      const tradeDirection = updateData.tradeDirection ?? existingIdea.tradeDirection;
      const intendedPosition = Number(updateData.intendedPosition ?? existingIdea.intendedPosition);
      const ticker = updateData.ticker ?? existingIdea.ticker;

      const rrRatio = calculateRRRatio(targetEntry, targetPrice, stop, tradeDirection);
      const toWinMoney = calculateToWinMoney(intendedPosition, targetEntry, targetPrice, tradeDirection, ticker, stockMultipliers);
      const moneyRisk = calculateMoneyRisk(intendedPosition, targetEntry, stop, tradeDirection, ticker, stockMultipliers);

      (updateData as any).rrRatio = rrRatio;
      (updateData as any).toWinMoney = toWinMoney;
      (updateData as any).moneyRisk = moneyRisk;
    }

    const idea = await (prisma as any).idea.update({
      where: { id },
      data: updateData,
      include: {
        strategy: true,
        sourced: true
      }
    });

    logger.info('Idea updated successfully', { ideaId: id });
    return idea;
  } catch (error) {
    logger.error('Error updating idea', { error, ideaId: data.id });
    throw error;
  }
}

// Delete an idea
export async function deleteIdea(id: string) {
  try {
    await (prisma as any).idea.delete({
      where: { id }
    });

    logger.info('Idea deleted successfully', { ideaId: id });
    return { success: true };
  } catch (error) {
    logger.error('Error deleting idea', { error, ideaId: id });
    throw error;
  }
}

// Get ideas statistics
export async function getIdeasStats() {
  try {
    const totalIdeas = await (prisma as any).idea.count();
    const activeIdeas = await (prisma as any).idea.count({ where: { status: 'active' } });
    const expiredIdeas = await (prisma as any).idea.count({ where: { status: 'expired' } });

    const qualityStats = await (prisma as any).idea.groupBy({
      by: ['quality'],
      _count: { quality: true }
    });

    const directionStats = await (prisma as any).idea.groupBy({
      by: ['tradeDirection'],
      _count: { tradeDirection: true }
    });

    logger.info('Ideas statistics retrieved successfully');
    return {
      total: totalIdeas,
      active: activeIdeas,
      expired: expiredIdeas,
      qualityBreakdown: qualityStats,
      directionBreakdown: directionStats
    };
  } catch (error) {
    logger.error('Error retrieving ideas statistics', { error });
    throw error;
  }
}

// Mark expired ideas
export async function markExpiredIdeas() {
  try {
    const now = new Date();
    const result = await (prisma as any).idea.updateMany({
      where: {
        expiresAt: { lt: now },
        status: 'active'
      },
      data: {
        status: 'expired'
      }
    });

    logger.info('Expired ideas marked', { count: result.count });
    return result;
  } catch (error) {
    logger.error('Error marking expired ideas', { error });
    throw error;
  }
}
