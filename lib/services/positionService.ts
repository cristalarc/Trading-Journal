import { prisma } from '@/lib/db';
import type { Trade, TradeSubOrder, Prisma } from '@prisma/client';

export interface PositionDetails {
  trade: Trade & {
    subOrders: TradeSubOrder[];
  };
  currentPosition: number; // Net position (positive for long, negative for short)
  avgEntryPrice: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  isOpen: boolean;
}

/**
 * Position Detection Service
 * Handles detection and management of open trading positions within portfolios
 */
export class PositionService {
  /**
   * Find an open trade for a specific ticker in a portfolio
   * Returns null if no open position exists
   */
  static async findOpenTradeForSymbol(
    ticker: string,
    portfolioId: string
  ): Promise<Trade | null> {
    return prisma.trade.findFirst({
      where: {
        ticker: ticker.toUpperCase(),
        portfolioId,
        status: 'OPEN'
      },
      include: {
        subOrders: {
          orderBy: {
            orderDate: 'asc'
          }
        }
      }
    });
  }

  /**
   * Check if an open position exists for a ticker in a portfolio
   */
  static async hasOpenPosition(
    ticker: string,
    portfolioId: string
  ): Promise<boolean> {
    const count = await prisma.trade.count({
      where: {
        ticker: ticker.toUpperCase(),
        portfolioId,
        status: 'OPEN'
      }
    });
    return count > 0;
  }

  /**
   * Get detailed information about a position including current size and averages
   */
  static async getPositionDetails(
    ticker: string,
    portfolioId: string
  ): Promise<PositionDetails | null> {
    const trade = await this.findOpenTradeForSymbol(ticker, portfolioId);

    if (!trade) {
      return null;
    }

    // Calculate position details from sub-orders if they exist
    let currentPosition = Number(trade.size);
    let totalBuyQuantity = 0;
    let totalSellQuantity = 0;
    let avgEntryPrice = Number(trade.avgBuy || trade.entryPrice || 0);

    if (trade.subOrders && trade.subOrders.length > 0) {
      const calculations = this.calculatePositionFromSubOrders(
        trade.subOrders,
        trade.side
      );
      currentPosition = calculations.currentPosition;
      totalBuyQuantity = calculations.totalBuyQuantity;
      totalSellQuantity = calculations.totalSellQuantity;
      avgEntryPrice = calculations.avgEntryPrice;
    } else {
      // If no sub-orders, use the main trade data
      totalBuyQuantity = trade.side === 'LONG' ? currentPosition : 0;
      totalSellQuantity = trade.side === 'SHORT' ? currentPosition : 0;
    }

    return {
      trade,
      currentPosition: Math.abs(currentPosition),
      avgEntryPrice,
      totalBuyQuantity,
      totalSellQuantity,
      isOpen: currentPosition > 0
    };
  }

  /**
   * Get all open positions for a portfolio
   */
  static async getAllOpenPositions(
    portfolioId: string
  ): Promise<PositionDetails[]> {
    const openTrades = await prisma.trade.findMany({
      where: {
        portfolioId,
        status: 'OPEN'
      },
      include: {
        subOrders: {
          orderBy: {
            orderDate: 'asc'
          }
        }
      },
      orderBy: {
        ticker: 'asc'
      }
    });

    const positions: PositionDetails[] = [];

    for (const trade of openTrades) {
      let currentPosition = Number(trade.size);
      let totalBuyQuantity = 0;
      let totalSellQuantity = 0;
      let avgEntryPrice = Number(trade.avgBuy || trade.entryPrice || 0);

      if (trade.subOrders && trade.subOrders.length > 0) {
        const calculations = this.calculatePositionFromSubOrders(
          trade.subOrders,
          trade.side
        );
        currentPosition = calculations.currentPosition;
        totalBuyQuantity = calculations.totalBuyQuantity;
        totalSellQuantity = calculations.totalSellQuantity;
        avgEntryPrice = calculations.avgEntryPrice;
      } else {
        totalBuyQuantity = trade.side === 'LONG' ? currentPosition : 0;
        totalSellQuantity = trade.side === 'SHORT' ? currentPosition : 0;
      }

      positions.push({
        trade,
        currentPosition: Math.abs(currentPosition),
        avgEntryPrice,
        totalBuyQuantity,
        totalSellQuantity,
        isOpen: currentPosition > 0
      });
    }

    return positions;
  }

  /**
   * Calculate current position and averages from sub-orders
   */
  private static calculatePositionFromSubOrders(
    subOrders: TradeSubOrder[],
    tradeSide: 'LONG' | 'SHORT'
  ) {
    let currentPosition = 0;
    let totalBuyQuantity = 0;
    let totalSellQuantity = 0;
    let totalBuyCost = 0;
    let totalSellRevenue = 0;

    for (const order of subOrders) {
      const quantity = Number(order.quantity);
      const price = Number(order.price);

      switch (order.orderType) {
        case 'BUY':
        case 'ADD_TO_POSITION':
          currentPosition += quantity;
          totalBuyQuantity += quantity;
          totalBuyCost += quantity * price;
          break;

        case 'SELL':
        case 'REDUCE_POSITION':
          currentPosition -= quantity;
          totalSellQuantity += quantity;
          totalSellRevenue += quantity * price;
          break;
      }
    }

    // Calculate weighted average entry price
    const avgEntryPrice = totalBuyQuantity > 0
      ? totalBuyCost / totalBuyQuantity
      : 0;

    return {
      currentPosition: Math.abs(currentPosition),
      totalBuyQuantity,
      totalSellQuantity,
      avgEntryPrice,
      avgExitPrice: totalSellQuantity > 0
        ? totalSellRevenue / totalSellQuantity
        : 0
    };
  }

  /**
   * Get open positions count by portfolio
   */
  static async getOpenPositionsCount(portfolioId: string): Promise<number> {
    return prisma.trade.count({
      where: {
        portfolioId,
        status: 'OPEN'
      }
    });
  }

  /**
   * Get all unique tickers with open positions in a portfolio
   */
  static async getOpenPositionTickers(portfolioId: string): Promise<string[]> {
    const trades = await prisma.trade.findMany({
      where: {
        portfolioId,
        status: 'OPEN'
      },
      select: {
        ticker: true
      },
      distinct: ['ticker']
    });

    return trades.map(t => t.ticker);
  }

  /**
   * Check if a ticker has any trades (open or closed) in a portfolio
   */
  static async hasAnyTradeForSymbol(
    ticker: string,
    portfolioId: string
  ): Promise<boolean> {
    const count = await prisma.trade.count({
      where: {
        ticker: ticker.toUpperCase(),
        portfolioId
      }
    });
    return count > 0;
  }

  /**
   * Get all trades (open and closed) for a specific ticker in a portfolio
   * Useful for detecting duplicates or viewing trade history
   */
  static async getAllTradesForSymbol(
    ticker: string,
    portfolioId: string
  ): Promise<Trade[]> {
    return prisma.trade.findMany({
      where: {
        ticker: ticker.toUpperCase(),
        portfolioId
      },
      include: {
        subOrders: {
          orderBy: {
            orderDate: 'asc'
          }
        }
      },
      orderBy: {
        openDate: 'desc'
      }
    });
  }

  /**
   * Find trades that might be duplicates based on ticker, portfolio, and date range
   */
  static async findPotentialDuplicateTrades(
    ticker: string,
    portfolioId: string,
    openDate: Date,
    toleranceDays: number = 1
  ): Promise<Trade[]> {
    const startDate = new Date(openDate);
    startDate.setDate(startDate.getDate() - toleranceDays);

    const endDate = new Date(openDate);
    endDate.setDate(endDate.getDate() + toleranceDays);

    return prisma.trade.findMany({
      where: {
        ticker: ticker.toUpperCase(),
        portfolioId,
        openDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        subOrders: {
          orderBy: {
            orderDate: 'asc'
          }
        }
      },
      orderBy: {
        openDate: 'asc'
      }
    });
  }
}

export default PositionService;
