/**
 * Trade Calculation Utilities
 * Provides functions for calculating trade metrics like Net Return, MAE, MFE, etc.
 */

import { TradeSide } from '@prisma/client';

export interface TradeCalculationInput {
  side: TradeSide;
  size: number;
  avgBuy?: number;
  avgSell?: number;
  entryPrice?: number;
  exitPrice?: number;
  mae?: number;
  mfe?: number;
}

export interface TradeCalculationResult {
  netReturn: number;
  netReturnPercent: number;
  bestExitDollar: number;
  bestExitPercent: number;
  missedExit: number;
}

/**
 * Calculate net return for a trade
 */
export function calculateNetReturn(input: TradeCalculationInput): number {
  const { side, size, avgBuy, avgSell, entryPrice, exitPrice } = input;
  
  // Use avgBuy/avgSell if available, otherwise use entryPrice/exitPrice
  const buyPrice = avgBuy || entryPrice;
  const sellPrice = avgSell || exitPrice;
  
  if (!buyPrice || !sellPrice) {
    return 0;
  }
  
  if (side === TradeSide.LONG) {
    return (sellPrice - buyPrice) * size;
  } else {
    return (buyPrice - sellPrice) * size;
  }
}

/**
 * Calculate net return percentage
 */
export function calculateNetReturnPercent(input: TradeCalculationInput): number {
  const { size, avgBuy, entryPrice } = input;
  const netReturn = calculateNetReturn(input);
  const buyPrice = avgBuy || entryPrice;
  
  if (!buyPrice || buyPrice === 0) {
    return 0;
  }
  
  return (netReturn / (buyPrice * size)) * 100;
}

/**
 * Calculate best exit dollar amount using MFE
 */
export function calculateBestExitDollar(input: TradeCalculationInput): number {
  const { side, size, avgBuy, entryPrice, mfe } = input;
  
  if (!mfe || mfe <= 0) {
    return 0;
  }
  
  const buyPrice = avgBuy || entryPrice;
  if (!buyPrice) {
    return 0;
  }
  
  if (side === TradeSide.LONG) {
    return mfe * size;
  } else {
    return mfe * size;
  }
}

/**
 * Calculate best exit percentage
 */
export function calculateBestExitPercent(input: TradeCalculationInput): number {
  const { size, avgBuy, entryPrice } = input;
  const bestExitDollar = calculateBestExitDollar(input);
  const buyPrice = avgBuy || entryPrice;
  
  if (!buyPrice || buyPrice === 0) {
    return 0;
  }
  
  return (bestExitDollar / (buyPrice * size)) * 100;
}

/**
 * Calculate missed exit opportunity
 */
export function calculateMissedExit(input: TradeCalculationInput): number {
  const netReturn = calculateNetReturn(input);
  const bestExitDollar = calculateBestExitDollar(input);
  
  return bestExitDollar - netReturn;
}

/**
 * Calculate all trade metrics at once
 */
export function calculateAllTradeMetrics(input: TradeCalculationInput): TradeCalculationResult {
  const netReturn = calculateNetReturn(input);
  const netReturnPercent = calculateNetReturnPercent(input);
  const bestExitDollar = calculateBestExitDollar(input);
  const bestExitPercent = calculateBestExitPercent(input);
  const missedExit = calculateMissedExit(input);
  
  return {
    netReturn,
    netReturnPercent,
    bestExitDollar,
    bestExitPercent,
    missedExit
  };
}

/**
 * Calculate MAE and MFE from sub-orders
 */
export function calculateMAEAndMFE(
  subOrders: Array<{
    orderType: string;
    quantity: number;
    price: number;
    orderDate: Date;
  }>,
  side: TradeSide,
  entryPrice: number
): { mae: number; mfe: number } {
  let maxAdverse = 0;
  let maxFavorable = 0;
  let currentPosition = 0;
  let positionStartPrice = entryPrice;
  
  // Sort orders by date
  const sortedOrders = [...subOrders].sort((a, b) => 
    new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
  );
  
  for (const order of sortedOrders) {
    const isBuy = order.orderType === 'BUY' || order.orderType === 'ADD_TO_POSITION';
    const isSell = order.orderType === 'SELL' || order.orderType === 'REDUCE_POSITION';
    
    if (isBuy) {
      if (currentPosition === 0) {
        positionStartPrice = order.price;
      }
      currentPosition += order.quantity;
    } else if (isSell) {
      currentPosition -= order.quantity;
    }
    
    // Calculate adverse and favorable movements
    if (currentPosition > 0) {
      const priceDiff = order.price - positionStartPrice;
      
      if (side === TradeSide.LONG) {
        const adverseDiff = -priceDiff; // Negative when price goes down
        const favorableDiff = priceDiff; // Positive when price goes up
        maxAdverse = Math.min(maxAdverse, adverseDiff);
        maxFavorable = Math.max(maxFavorable, favorableDiff);
      } else {
        const adverseDiff = priceDiff; // Positive when price goes up (bad for short)
        const favorableDiff = -priceDiff; // Negative when price goes down (good for short)
        maxAdverse = Math.max(maxAdverse, adverseDiff);
        maxFavorable = Math.min(maxFavorable, favorableDiff);
      }
    }
  }
  
  return {
    mae: Math.abs(maxAdverse),
    mfe: Math.abs(maxFavorable)
  };
}

/**
 * Validate trade data for completeness
 */
export function validateTradeData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.ticker) errors.push('Ticker is required');
  if (!data.size || data.size <= 0) errors.push('Size must be greater than 0');
  if (!data.openDate) errors.push('Open date is required');
  if (!data.side) errors.push('Side is required');
  if (!data.type) errors.push('Type is required');
  
  // Validate side
  if (data.side && !['LONG', 'SHORT'].includes(data.side)) {
    errors.push('Side must be either LONG or SHORT');
  }
  
  // Validate type
  if (data.type && !['SHARE', 'OPTION'].includes(data.type)) {
    errors.push('Type must be either SHARE or OPTION');
  }
  
  // Validate dates
  if (data.openDate && data.closeDate) {
    const openDate = new Date(data.openDate);
    const closeDate = new Date(data.closeDate);
    if (closeDate < openDate) {
      errors.push('Close date cannot be before open date');
    }
  }
  
  // Validate prices
  if (data.entryPrice && data.entryPrice <= 0) {
    errors.push('Entry price must be greater than 0');
  }
  if (data.exitPrice && data.exitPrice <= 0) {
    errors.push('Exit price must be greater than 0');
  }
  if (data.avgBuy && data.avgBuy <= 0) {
    errors.push('Average buy price must be greater than 0');
  }
  if (data.avgSell && data.avgSell <= 0) {
    errors.push('Average sell price must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number | null | undefined | any): string {
  if (amount === null || amount === undefined) return 'N/A';
  // Handle Prisma Decimal objects and other types
  const numValue = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
}

/**
 * Format percentage values
 */
export function formatPercentage(percent: number | null | undefined | any): string {
  if (percent === null || percent === undefined) return 'N/A';
  // Handle Prisma Decimal objects and other types
  const numValue = typeof percent === 'number' ? percent : parseFloat(percent.toString());
  if (isNaN(numValue)) return 'N/A';
  return `${numValue.toFixed(2)}%`;
}

/**
 * Get color class for return values
 */
export function getReturnColorClass(returnValue: number | null | undefined): string {
  if (returnValue === null || returnValue === undefined) return 'text-gray-500';
  return returnValue >= 0 ? 'text-green-600' : 'text-red-600';
}

