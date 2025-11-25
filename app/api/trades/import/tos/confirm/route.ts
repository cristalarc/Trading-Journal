import { NextRequest, NextResponse } from 'next/server';
import { createTrade } from '@/lib/services/tradeService';
import { PortfolioService } from '@/lib/services/portfolioService';
import type { TOSParsedTrade } from '@/lib/services/tosImportService';

/**
 * POST /api/trades/import/tos/confirm
 * Import confirmed TOS trades into database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trades, portfolioId } = body;

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio selection is required' },
        { status: 400 }
      );
    }

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json(
        { error: 'No trades provided for import' },
        { status: 400 }
      );
    }

    // Validate portfolio exists
    const portfolio = await PortfolioService.getPortfolioById(portfolioId);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Invalid portfolio ID' },
        { status: 400 }
      );
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      importedTrades: [] as any[],
    };

    // Import each trade
    for (const trade of trades as TOSParsedTrade[]) {
      try {
        // Convert date strings back to Date objects (they get serialized during JSON transfer)
        const openDate = typeof trade.openDate === 'string' ? new Date(trade.openDate) : trade.openDate;
        const closeDate = trade.closeDate ? (typeof trade.closeDate === 'string' ? new Date(trade.closeDate) : trade.closeDate) : undefined;

        // Convert subOrders dates
        const subOrders = trade.subOrders?.map(order => ({
          ...order,
          orderDate: typeof order.orderDate === 'string' ? new Date(order.orderDate) : order.orderDate,
        }));

        const createdTrade = await createTrade({
          ticker: trade.ticker,
          side: trade.side,
          type: trade.type,
          size: trade.size,
          openDate,
          closeDate,
          status: trade.status,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          avgBuy: trade.avgBuy,
          avgSell: trade.avgSell,
          portfolioId,
          importSource: 'thinkorswim',
          importData: trade.importData,
          subOrders,
        });

        results.successful++;
        results.importedTrades.push(createdTrade);
      } catch (error) {
        const err = error as Error;
        results.failed++;
        results.errors.push(`Failed to import ${trade.ticker}: ${err.message}`);
        console.error(`Error importing trade ${trade.ticker}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: trades.length,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors,
        trades: results.importedTrades,
      },
    });
  } catch (error) {
    console.error('Error confirming TOS import:', error);
    return NextResponse.json(
      { error: 'Failed to import TOS trades' },
      { status: 500 }
    );
  }
}
