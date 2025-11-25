import { NextRequest, NextResponse } from 'next/server';
import { parseTOSCsv, validateTOSTrade } from '@/lib/services/tosImportService';

/**
 * POST /api/trades/import/tos/preview
 * Preview TOS trades before importing
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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

    // Separate valid and invalid trades
    const validTrades = validatedTrades.filter(t => t.validation.valid);
    const invalidTrades = validatedTrades.filter(t => !t.validation.valid);

    return NextResponse.json({
      success: true,
      preview: {
        totalTrades: trades.length,
        validTrades: validTrades.length,
        invalidTrades: invalidTrades.length,
        trades: validatedTrades,
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
