/**
 * Trade Service
 * Provides functions for CRUD operations on trades
 */

import { prisma } from '@/lib/db';
import { Prisma, TradeStatus, TradeSide, TradeType, SubOrderType } from '@prisma/client';
import { calculateAllTradeMetrics, calculateMAEAndMFE, validateTradeData } from '@/lib/utils/tradeCalculations';

/**
 * Get all trades with optional filtering
 */
export async function getAllTrades(options?: {
  status?: TradeStatus;
  ticker?: string;
  side?: TradeSide;
  type?: TradeType;
  sourceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const where: Prisma.TradeWhereInput = {};
  
  if (options?.status) {
    where.status = options.status;
  }
  
  if (options?.ticker) {
    where.ticker = {
      contains: options.ticker,
      mode: 'insensitive'
    };
  }
  
  if (options?.side) {
    where.side = options.side;
  }
  
  if (options?.type) {
    where.type = options.type;
  }
  
  if (options?.sourceId) {
    where.sourceId = options.sourceId;
  }
  
  if (options?.dateFrom || options?.dateTo) {
    where.openDate = {};
    if (options.dateFrom) {
      where.openDate.gte = options.dateFrom;
    }
    if (options.dateTo) {
      where.openDate.lte = options.dateTo;
    }
  }
  
  return prisma.trade.findMany({
    where,
    include: {
      portfolio: true,
      source: true,
      setup1: true,
      setup2: true,
      setup3: true,
      setup4: true,
      setup5: true,
      setup6: true,
      setup7: true,
      mistake1: true,
      mistake2: true,
      mistake3: true,
      mistake4: true,
      mistake5: true,
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    },
    orderBy: {
      tradeId: 'desc'
    }
  });
}

/**
 * Get a trade by ID
 */
export async function getTradeById(id: string) {
  return prisma.trade.findUnique({
    where: { id },
    include: {
      portfolio: true,
      source: true,
      setup1: true,
      setup2: true,
      setup3: true,
      setup4: true,
      setup5: true,
      setup6: true,
      setup7: true,
      mistake1: true,
      mistake2: true,
      mistake3: true,
      mistake4: true,
      mistake5: true,
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    }
  });
}

/**
 * Get the next trade ID (auto-incrementing)
 */
export async function getNextTradeId(): Promise<number> {
  const lastTrade = await prisma.trade.findFirst({
    orderBy: { tradeId: 'desc' },
    select: { tradeId: true }
  });
  
  return lastTrade ? lastTrade.tradeId + 1 : 1;
}

/**
 * Create a new trade
 */
export async function createTrade(data: any) {
  try {
    // Validate trade data
    const validation = validateTradeData(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Get next trade ID
    const tradeId = await getNextTradeId();

    // Convert decimal fields to Prisma Decimal properly
    const formattedData: any = {
      tradeId,
      ticker: data.ticker,
      size: typeof data.size === 'string'
        ? new Prisma.Decimal(data.size)
        : typeof data.size === 'number'
          ? new Prisma.Decimal(data.size.toString())
          : data.size,
      openDate: data.openDate instanceof Date
        ? data.openDate
        : new Date(data.openDate + 'T00:00:00'), // Force local timezone if string
      side: data.side,
      type: data.type,
      status: data.status || 'OPEN',
      importSource: data.importSource || 'manual',
      importData: data.importData,
      portfolio: {
        connect: { id: data.portfolioId }
      }
    };

    // Handle position tracking fields
    if (data.originalOpenDate) {
      formattedData.originalOpenDate = data.originalOpenDate instanceof Date
        ? data.originalOpenDate
        : new Date(data.originalOpenDate);
    }
    if (data.executionCount !== undefined) {
      formattedData.executionCount = data.executionCount;
    }

    // Handle optional fields
    if (data.closeDate) {
      formattedData.closeDate = data.closeDate instanceof Date 
        ? data.closeDate 
        : new Date(data.closeDate + 'T00:00:00'); // Force local timezone if string
      // Status will be determined after calculations
    }

    if (data.sourceId) {
      formattedData.source = {
        connect: { id: data.sourceId }
      };
    }

    // Handle price fields
    if (data.entryPrice) {
      formattedData.entryPrice = new Prisma.Decimal(data.entryPrice);
    }
    if (data.exitPrice) {
      formattedData.exitPrice = new Prisma.Decimal(data.exitPrice);
    }
    if (data.avgBuy) {
      formattedData.avgBuy = new Prisma.Decimal(data.avgBuy);
    }
    if (data.avgSell) {
      formattedData.avgSell = new Prisma.Decimal(data.avgSell);
    }

    // Calculate trade metrics if we have the necessary data
    const calculationInput = {
      side: data.side,
      size: parseFloat(data.size.toString()),
      avgBuy: data.avgBuy ? parseFloat(data.avgBuy.toString()) : undefined,
      avgSell: data.avgSell ? parseFloat(data.avgSell.toString()) : undefined,
      entryPrice: data.entryPrice ? parseFloat(data.entryPrice.toString()) : undefined,
      exitPrice: data.exitPrice ? parseFloat(data.exitPrice.toString()) : undefined,
      mae: data.mae ? parseFloat(data.mae.toString()) : undefined,
      mfe: data.mfe ? parseFloat(data.mfe.toString()) : undefined
    };

    const calculatedMetrics = calculateAllTradeMetrics(calculationInput);
    
    // Use calculated values or provided values
    formattedData.netReturn = new Prisma.Decimal(calculatedMetrics.netReturn);
    formattedData.netReturnPercent = new Prisma.Decimal(calculatedMetrics.netReturnPercent);
    formattedData.bestExitDollar = new Prisma.Decimal(calculatedMetrics.bestExitDollar);
    formattedData.bestExitPercent = new Prisma.Decimal(calculatedMetrics.bestExitPercent);
    formattedData.missedExit = new Prisma.Decimal(calculatedMetrics.missedExit);
    
    // Determine WIN/LOSS status if trade is closed
    if (data.closeDate) {
      // Use calculated net return or try to calculate from prices
      let netReturn = calculatedMetrics.netReturn;
      if (netReturn === 0 && data.avgBuy && data.avgSell && data.size) {
        // Calculate net return if not already calculated
        const buyPrice = parseFloat(data.avgBuy.toString());
        const sellPrice = parseFloat(data.avgSell.toString());
        const size = parseFloat(data.size.toString());
        netReturn = data.side === 'LONG' 
          ? (sellPrice - buyPrice) * size
          : (buyPrice - sellPrice) * size;
      }
      formattedData.status = netReturn >= 0 ? 'WIN' : 'LOSS';
    }
    
    // Handle MAE and MFE if provided
    if (data.mae) {
      formattedData.mae = new Prisma.Decimal(data.mae);
    }
    if (data.mfe) {
      formattedData.mfe = new Prisma.Decimal(data.mfe);
    }

    // Handle setup and mistake relations
    const setupFields = ['setup1', 'setup2', 'setup3', 'setup4', 'setup5', 'setup6', 'setup7'];
    const mistakeFields = ['mistake1', 'mistake2', 'mistake3', 'mistake4', 'mistake5'];
    
    setupFields.forEach(field => {
      if (data[`${field}Id`]) {
        formattedData[field] = {
          connect: { id: data[`${field}Id`] }
        };
      }
    });
    
    mistakeFields.forEach(field => {
      if (data[`${field}Id`]) {
        formattedData[field] = {
          connect: { id: data[`${field}Id`] }
        };
      }
    });

    console.log('Creating trade with formatted data:', formattedData);

    // Create the trade
    const trade = await prisma.trade.create({
      data: formattedData,
      include: {
        source: true,
        setup1: true,
        setup2: true,
        setup3: true,
        setup4: true,
        setup5: true,
        setup6: true,
        setup7: true,
        mistake1: true,
        mistake2: true,
        mistake3: true,
        mistake4: true,
        mistake5: true,
        subOrders: true
      }
    });

    // Calculate and update calculated fields if we have the necessary data
    await calculateTradeMetrics(trade.id);

    return trade;
  } catch (error: unknown) {
    console.error('Error in createTrade:', error);
    throw error;
  }
}

/**
 * Update an existing trade
 */
export async function updateTrade(id: string, data: any) {
  const updateData: any = {};

  // Handle basic fields
  if (data.ticker !== undefined) updateData.ticker = data.ticker;
  if (data.size !== undefined) updateData.size = new Prisma.Decimal(data.size);
  if (data.openDate !== undefined) {
    updateData.openDate = new Date(data.openDate + 'T00:00:00'); // Force local timezone
  }
  if (data.closeDate !== undefined) {
    if (data.closeDate) {
      updateData.closeDate = new Date(data.closeDate + 'T00:00:00'); // Force local timezone
      // Status will be determined after calculations
    } else {
      updateData.closeDate = null;
      updateData.status = 'OPEN';
    }
  }
  if (data.side !== undefined) updateData.side = data.side;
  if (data.type !== undefined) updateData.type = data.type;

  // Handle price fields
  if (data.entryPrice !== undefined) {
    updateData.entryPrice = data.entryPrice ? new Prisma.Decimal(data.entryPrice) : null;
  }
  if (data.exitPrice !== undefined) {
    updateData.exitPrice = data.exitPrice ? new Prisma.Decimal(data.exitPrice) : null;
  }
  if (data.avgBuy !== undefined) {
    updateData.avgBuy = data.avgBuy ? new Prisma.Decimal(data.avgBuy) : null;
  }
  if (data.avgSell !== undefined) {
    updateData.avgSell = data.avgSell ? new Prisma.Decimal(data.avgSell) : null;
  }

  // Handle relations
  if (data.sourceId) {
    updateData.source = { connect: { id: data.sourceId } };
  }

  // Handle setup and mistake relations
  const setupFields = ['setup1', 'setup2', 'setup3', 'setup4', 'setup5', 'setup6', 'setup7'];
  const mistakeFields = ['mistake1', 'mistake2', 'mistake3', 'mistake4', 'mistake5'];
  
  setupFields.forEach(field => {
    if (data[`${field}Id`] !== undefined) {
      updateData[field] = data[`${field}Id`] 
        ? { connect: { id: data[`${field}Id`] } }
        : { disconnect: true };
    }
  });
  
  mistakeFields.forEach(field => {
    if (data[`${field}Id`] !== undefined) {
      updateData[field] = data[`${field}Id`] 
        ? { connect: { id: data[`${field}Id`] } }
        : { disconnect: true };
    }
  });

  // If we're adding a close date, determine WIN/LOSS status before updating
  if (data.closeDate && data.closeDate !== undefined) {
    // Get current trade data to calculate status
    const currentTrade = await prisma.trade.findUnique({
      where: { id },
      include: {
        subOrders: {
          orderBy: {
            orderDate: 'asc'
          }
        }
      }
    });

    if (currentTrade) {
      // Calculate net return to determine status
      let netReturn = 0;
      
      // Try to calculate from avgBuy/avgSell if available
      if (data.avgBuy && data.avgSell && data.size) {
        const buyPrice = parseFloat(data.avgBuy.toString());
        const sellPrice = parseFloat(data.avgSell.toString());
        const size = parseFloat(data.size.toString());
        netReturn = data.side === 'LONG' 
          ? (sellPrice - buyPrice) * size
          : (buyPrice - sellPrice) * size;
      } else if (currentTrade.avgBuy && currentTrade.avgSell && currentTrade.size) {
        const buyPrice = currentTrade.avgBuy.toNumber();
        const sellPrice = currentTrade.avgSell.toNumber();
        const size = currentTrade.size.toNumber();
        netReturn = currentTrade.side === 'LONG' 
          ? (sellPrice - buyPrice) * size
          : (buyPrice - sellPrice) * size;
      } else if (data.entryPrice && data.exitPrice && data.size) {
        const entryPrice = parseFloat(data.entryPrice.toString());
        const exitPrice = parseFloat(data.exitPrice.toString());
        const size = parseFloat(data.size.toString());
        netReturn = data.side === 'LONG' 
          ? (exitPrice - entryPrice) * size
          : (entryPrice - exitPrice) * size;
      } else if (currentTrade.entryPrice && currentTrade.exitPrice && currentTrade.size) {
        const entryPrice = currentTrade.entryPrice.toNumber();
        const exitPrice = currentTrade.exitPrice.toNumber();
        const size = currentTrade.size.toNumber();
        netReturn = currentTrade.side === 'LONG' 
          ? (exitPrice - entryPrice) * size
          : (entryPrice - exitPrice) * size;
      }

      // Set status based on net return
      updateData.status = netReturn >= 0 ? 'WIN' : 'LOSS';
    }
  }

  const trade = await prisma.trade.update({
    where: { id },
    data: updateData,
    include: {
      source: true,
      setup1: true,
      setup2: true,
      setup3: true,
      setup4: true,
      setup5: true,
      setup6: true,
      setup7: true,
      mistake1: true,
      mistake2: true,
      mistake3: true,
      mistake4: true,
      mistake5: true,
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    }
  });

  // Recalculate metrics after update
  await calculateTradeMetrics(trade.id);

  return trade;
}

/**
 * Delete a trade
 */
export async function deleteTrade(id: string) {
  return prisma.trade.delete({
    where: { id }
  });
}

/**
 * Add a sub-order to a trade
 */
export async function addSubOrder(tradeId: string, data: {
  orderType: SubOrderType;
  quantity: number;
  price: number;
  orderDate: Date;
  notes?: string;
}) {
  return prisma.tradeSubOrder.create({
    data: {
      tradeId,
      orderType: data.orderType,
      quantity: new Prisma.Decimal(data.quantity),
      price: new Prisma.Decimal(data.price),
      orderDate: data.orderDate,
      notes: data.notes
    }
  });
}

/**
 * Calculate trade metrics (Net Return, MAE, MFE, etc.)
 */
export async function calculateTradeMetrics(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    }
  });

  if (!trade) {
    throw new Error('Trade not found');
  }

  const updateData: any = {};

  // Calculate all trade metrics using the utility functions
  const calculationInput = {
    side: trade.side,
    size: trade.size.toNumber(),
    avgBuy: trade.avgBuy?.toNumber(),
    avgSell: trade.avgSell?.toNumber(),
    entryPrice: trade.entryPrice?.toNumber(),
    exitPrice: trade.exitPrice?.toNumber(),
    mae: trade.mae?.toNumber(),
    mfe: trade.mfe?.toNumber()
  };

  const calculatedMetrics = calculateAllTradeMetrics(calculationInput);
  
  // Update with calculated values
  updateData.netReturn = new Prisma.Decimal(calculatedMetrics.netReturn);
  updateData.netReturnPercent = new Prisma.Decimal(calculatedMetrics.netReturnPercent);
  updateData.bestExitDollar = new Prisma.Decimal(calculatedMetrics.bestExitDollar);
  updateData.bestExitPercent = new Prisma.Decimal(calculatedMetrics.bestExitPercent);
  updateData.missedExit = new Prisma.Decimal(calculatedMetrics.missedExit);
  
  // Determine WIN/LOSS status if trade is closed
  if (trade.closeDate) {
    // Use calculated net return or try to calculate from prices
    let netReturn = calculatedMetrics.netReturn;
    if (netReturn === 0 && trade.avgBuy && trade.avgSell && trade.size) {
      // Calculate net return if not already calculated
      const buyPrice = trade.avgBuy.toNumber();
      const sellPrice = trade.avgSell.toNumber();
      const size = trade.size.toNumber();
      netReturn = trade.side === 'LONG' 
        ? (sellPrice - buyPrice) * size
        : (buyPrice - sellPrice) * size;
    }
    updateData.status = netReturn >= 0 ? 'WIN' : 'LOSS';
  }

  // Calculate MAE and MFE from sub-orders if available and not already set
  if (trade.subOrders && trade.subOrders.length > 0 && (!trade.mae || !trade.mfe)) {
    const entryPrice = trade.avgBuy?.toNumber() || trade.entryPrice?.toNumber() || 0;
    if (entryPrice > 0) {
      const { mae, mfe } = calculateMAEAndMFE(
        trade.subOrders.map(order => ({
          orderType: order.orderType,
          quantity: order.quantity.toNumber(),
          price: order.price.toNumber(),
          orderDate: order.orderDate
        })),
        trade.side,
        entryPrice
      );
      
      if (mae > 0) {
        updateData.mae = new Prisma.Decimal(mae);
      }
      if (mfe > 0) {
        updateData.mfe = new Prisma.Decimal(mfe);
      }
    }
  }

  // Update the trade with calculated metrics
  if (Object.keys(updateData).length > 0) {
    return prisma.trade.update({
      where: { id: tradeId },
      data: updateData
    });
  }

  return trade;
}

/**
 * Get trade statistics
 */
export async function getTradeStats() {
  const totalTrades = await prisma.trade.count();
  const openTrades = await prisma.trade.count({
    where: { status: TradeStatus.OPEN }
  });
  const closedTrades = await prisma.trade.count({
    where: { status: TradeStatus.CLOSED }
  });

  const totalNetReturn = await prisma.trade.aggregate({
    where: {
      status: TradeStatus.CLOSED,
      netReturn: { not: null }
    },
    _sum: {
      netReturn: true
    }
  });

  return {
    totalTrades,
    openTrades,
    closedTrades,
    totalNetReturn: totalNetReturn._sum.netReturn || 0
  };
}

/**
 * PHASE 2: EXECUTION MERGER LOGIC WITH VALIDATION
 */

/**
 * Validate that an execution won't result in a negative position
 * @throws Error if execution would create negative position
 */
export function validateExecution(
  currentPosition: number,
  executionQuantity: number,
  executionType: 'BUY' | 'SELL' | 'ADD_TO_POSITION' | 'REDUCE_POSITION',
  tradeSide: TradeSide
): { isValid: boolean; error?: string; newPosition?: number } {
  let newPosition = currentPosition;

  // Calculate new position based on execution type
  switch (executionType) {
    case 'BUY':
    case 'ADD_TO_POSITION':
      newPosition += executionQuantity;
      break;
    case 'SELL':
    case 'REDUCE_POSITION':
      newPosition -= executionQuantity;
      break;
  }

  // Check for negative position
  if (newPosition < 0) {
    return {
      isValid: false,
      error: `Cannot execute ${executionType} for ${executionQuantity} shares. Current position is ${currentPosition} shares. This would result in a negative position of ${newPosition} shares.`,
      newPosition
    };
  }

  return {
    isValid: true,
    newPosition
  };
}

/**
 * Calculate partial profit for a partial close/trim execution
 */
export function calculatePartialProfit(params: {
  side: TradeSide;
  avgEntryPrice: number;
  sellPrice: number;
  sellQuantity: number;
}): {
  partialProfit: number;
  partialProfitPercent: number;
} {
  const { side, avgEntryPrice, sellPrice, sellQuantity } = params;

  let partialProfit = 0;

  if (side === 'LONG') {
    partialProfit = (sellPrice - avgEntryPrice) * sellQuantity;
  } else {
    // SHORT
    partialProfit = (avgEntryPrice - sellPrice) * sellQuantity;
  }

  const partialProfitPercent = (partialProfit / (avgEntryPrice * sellQuantity)) * 100;

  return {
    partialProfit,
    partialProfitPercent
  };
}

/**
 * Add execution to existing trade with validation
 * This handles adding, trimming, or closing positions
 */
export async function addExecutionToTrade(
  tradeId: string,
  execution: {
    orderType: SubOrderType;
    quantity: number;
    price: number;
    orderDate: Date;
    notes?: string;
  }
) {
  // Get current trade with sub-orders
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    }
  });

  if (!trade) {
    throw new Error('Trade not found');
  }

  if (trade.status !== 'OPEN') {
    throw new Error(`Cannot add execution to a ${trade.status} trade. Only OPEN trades can receive new executions.`);
  }

  // Calculate current position from sub-orders or initial size
  let currentPosition = trade.size.toNumber();
  let totalBuyCost = currentPosition * (trade.avgBuy?.toNumber() || trade.entryPrice?.toNumber() || 0);
  let totalBuyQuantity = currentPosition;
  let totalSellRevenue = 0;
  let totalSellQuantity = 0;

  if (trade.subOrders && trade.subOrders.length > 0) {
    // Recalculate from sub-orders
    currentPosition = 0;
    totalBuyCost = 0;
    totalBuyQuantity = 0;
    totalSellRevenue = 0;
    totalSellQuantity = 0;

    for (const order of trade.subOrders) {
      const qty = order.quantity.toNumber();
      const price = order.price.toNumber();

      if (order.orderType === 'BUY' || order.orderType === 'ADD_TO_POSITION') {
        currentPosition += qty;
        totalBuyQuantity += qty;
        totalBuyCost += qty * price;
      } else {
        currentPosition -= qty;
        totalSellQuantity += qty;
        totalSellRevenue += qty * price;
      }
    }
  }

  // Validate the execution won't create negative position
  const validation = validateExecution(
    currentPosition,
    execution.quantity,
    execution.orderType,
    trade.side
  );

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Create the sub-order
  const subOrder = await prisma.tradeSubOrder.create({
    data: {
      tradeId,
      orderType: execution.orderType,
      quantity: new Prisma.Decimal(execution.quantity),
      price: new Prisma.Decimal(execution.price),
      orderDate: execution.orderDate,
      notes: execution.notes
    }
  });

  // Update position calculations with new execution
  if (execution.orderType === 'BUY' || execution.orderType === 'ADD_TO_POSITION') {
    totalBuyQuantity += execution.quantity;
    totalBuyCost += execution.quantity * execution.price;
  } else {
    totalSellQuantity += execution.quantity;
    totalSellRevenue += execution.quantity * execution.price;
  }

  const newPosition = validation.newPosition!;

  // Recalculate averages
  const newAvgBuy = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
  const newAvgSell = totalSellQuantity > 0 ? totalSellRevenue / totalSellQuantity : 0;

  // Update trade with new values
  const updateData: any = {
    size: new Prisma.Decimal(newPosition),
    avgBuy: new Prisma.Decimal(newAvgBuy),
    lastModifiedDate: new Date(),
    executionCount: (trade.subOrders?.length || 0) + 1
  };

  if (totalSellQuantity > 0) {
    updateData.avgSell = new Prisma.Decimal(newAvgSell);
  }

  // If position is fully closed, set close date and status
  if (newPosition === 0) {
    updateData.closeDate = execution.orderDate;
    updateData.status = 'CLOSED'; // Will be updated to WIN/LOSS by recalculation
  }

  await prisma.trade.update({
    where: { id: tradeId },
    data: updateData
  });

  // Recalculate all trade metrics
  await recalculateTradeFromExecutions(tradeId);

  return subOrder;
}

/**
 * Recalculate all trade metrics from sub-orders
 * This ensures avgBuy, avgSell, size, and all calculations are accurate
 */
export async function recalculateTradeFromExecutions(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      subOrders: {
        orderBy: {
          orderDate: 'asc'
        }
      }
    }
  });

  if (!trade) {
    throw new Error('Trade not found');
  }

  // If no sub-orders, use existing calculation
  if (!trade.subOrders || trade.subOrders.length === 0) {
    await calculateTradeMetrics(tradeId);
    return;
  }

  // Calculate from sub-orders
  let currentPosition = 0;
  let totalBuyQuantity = 0;
  let totalBuyCost = 0;
  let totalSellQuantity = 0;
  let totalSellRevenue = 0;

  for (const order of trade.subOrders) {
    const qty = order.quantity.toNumber();
    const price = order.price.toNumber();

    if (order.orderType === 'BUY' || order.orderType === 'ADD_TO_POSITION') {
      currentPosition += qty;
      totalBuyQuantity += qty;
      totalBuyCost += qty * price;
    } else {
      currentPosition -= qty;
      totalSellQuantity += qty;
      totalSellRevenue += qty * price;
    }
  }

  const avgBuy = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
  const avgSell = totalSellQuantity > 0 ? totalSellRevenue / totalSellQuantity : 0;

  // Calculate MAE/MFE from sub-orders if not already set
  let mae = trade.mae?.toNumber();
  let mfe = trade.mfe?.toNumber();

  if (!mae || !mfe) {
    const maeAndMfe = calculateMAEAndMFE(
      trade.subOrders,
      trade.side,
      avgBuy
    );
    mae = mae || maeAndMfe.mae;
    mfe = mfe || maeAndMfe.mfe;
  }

  // Calculate all metrics
  const metrics = calculateAllTradeMetrics({
    side: trade.side,
    size: currentPosition > 0 ? currentPosition : totalBuyQuantity, // Use total buy if closed
    avgBuy,
    avgSell: totalSellQuantity > 0 ? avgSell : undefined,
    entryPrice: avgBuy,
    exitPrice: totalSellQuantity > 0 ? avgSell : undefined,
    mae,
    mfe
  });

  // Determine status
  let status: TradeStatus = trade.status;
  if (currentPosition === 0) {
    // Position is closed
    status = metrics.netReturn >= 0 ? 'WIN' : 'LOSS';
  } else {
    status = 'OPEN';
  }

  // Update trade
  await prisma.trade.update({
    where: { id: tradeId },
    data: {
      size: new Prisma.Decimal(currentPosition > 0 ? currentPosition : totalBuyQuantity),
      avgBuy: new Prisma.Decimal(avgBuy),
      avgSell: totalSellQuantity > 0 ? new Prisma.Decimal(avgSell) : null,
      entryPrice: new Prisma.Decimal(avgBuy),
      exitPrice: totalSellQuantity > 0 ? new Prisma.Decimal(avgSell) : null,
      mae: mae ? new Prisma.Decimal(mae) : null,
      mfe: mfe ? new Prisma.Decimal(mfe) : null,
      netReturn: new Prisma.Decimal(metrics.netReturn),
      netReturnPercent: new Prisma.Decimal(metrics.netReturnPercent),
      bestExitDollar: new Prisma.Decimal(metrics.bestExitDollar),
      bestExitPercent: new Prisma.Decimal(metrics.bestExitPercent),
      missedExit: new Prisma.Decimal(metrics.missedExit),
      status,
      closeDate: currentPosition === 0 && trade.subOrders.length > 0
        ? trade.subOrders[trade.subOrders.length - 1].orderDate
        : trade.closeDate,
      executionCount: trade.subOrders.length
    }
  });
}

/**
 * Merge execution into an existing position or create new trade
 * This is the main entry point for adding executions during imports
 */
export async function mergeExecutionIntoPosition(params: {
  ticker: string;
  portfolioId: string;
  execution: {
    orderType: SubOrderType;
    quantity: number;
    price: number;
    orderDate: Date;
    notes?: string;
  };
  side?: TradeSide;
  type?: TradeType;
  sourceId?: string;
  importSource?: string;
  importData?: any;
}): Promise<{ trade: any; created: boolean; execution: any }> {
  const { ticker, portfolioId, execution, side, type, sourceId, importSource, importData } = params;

  // Try to find an open position
  const { PositionService } = await import('./positionService');
  const openTrade = await PositionService.findOpenTradeForSymbol(ticker, portfolioId);

  if (openTrade) {
    // Add to existing position
    const subOrder = await addExecutionToTrade(openTrade.id, execution);

    // Get updated trade
    const updatedTrade = await getTradeById(openTrade.id);

    return {
      trade: updatedTrade,
      created: false,
      execution: subOrder
    };
  }

  // No open position - create new trade
  if (!side || !type) {
    throw new Error('side and type are required when creating a new trade');
  }

  // Determine orderType for initial trade
  const isEntry = execution.orderType === 'BUY' || execution.orderType === 'ADD_TO_POSITION';

  const newTrade = await createTrade({
    ticker,
    portfolioId,
    size: execution.quantity,
    openDate: execution.orderDate,
    side,
    type,
    sourceId,
    importSource: importSource || 'manual',
    importData,
    avgBuy: isEntry ? execution.price : undefined,
    entryPrice: isEntry ? execution.price : undefined,
    originalOpenDate: execution.orderDate,
    executionCount: 1
  });

  // Create the sub-order for tracking
  const subOrder = await addSubOrder(newTrade.id, execution);

  return {
    trade: newTrade,
    created: true,
    execution: subOrder
  };
}
