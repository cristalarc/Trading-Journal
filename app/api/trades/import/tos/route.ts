import { NextRequest, NextResponse } from 'next/server';
import { parseTOSCsv, validateTOSTrade, detectExistingPositions, getImportSummary } from '@/lib/services/tosImportService';

/**
 * POST /api/trades/import/tos/preview
 * Preview TOS trades before importing
 * Includes position detection to show which trades will be merged
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const portfolioId = formData.get('portfolioId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required for position detection' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse TOS CSV
    const { trades, errors, warnings } = await parseTOSCsv(content);

    // Validate all trades
    const validatedTrades = trades.map(trade => {
      const validation = validateTOSTrade(trade);
      return {
        ...trade,
        validation: {
          valid: validation.valid,
          errors: validation.errors,
        },
      };
    });

    // Get valid trades for position detection
    const validTrades = validatedTrades.filter(t => t.validation.valid);
    const invalidTrades = validatedTrades.filter(t => !t.validation.valid);

    // Detect existing positions for valid trades
    const tradesWithPositionInfo = await detectExistingPositions(
      validTrades.map(t => ({
        ...t,
        validation: undefined, // Remove validation before position detection
      })),
      portfolioId
    );

    // Re-add validation to trades with position info
    const enrichedTrades = validatedTrades.map(trade => {
      const positionTrade = tradesWithPositionInfo.find(
        t => t.ticker === trade.ticker &&
        t.importData.execTime === trade.importData.execTime &&
        t.importData.qty === trade.importData.qty
      );
      return {
        ...trade,
        positionInfo: positionTrade?.positionInfo,
      };
    });

    // Get import summary
    const summary = getImportSummary(tradesWithPositionInfo);

    return NextResponse.json({
      success: true,
      preview: {
        totalTrades: trades.length,
        validTrades: validTrades.length,
        invalidTrades: invalidTrades.length,
        newTrades: summary.newTrades,
        mergedTrades: summary.mergedTrades,
        trades: enrichedTrades,
        errors,
        warnings,
      },
    });
  } catch (error) {
    console.error('Error previewing TOS import:', error);
    return NextResponse.json(
      { error: 'Failed to preview TOS import' },
      { status: 500 }
    );
  }
}
