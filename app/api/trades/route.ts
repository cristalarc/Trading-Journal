import { NextRequest, NextResponse } from 'next/server';
import { getAllTrades, createTrade, getTradeStats } from '@/lib/services/tradeService';

/**
 * GET /api/trades
 * Get all trades with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status') as any;
    const ticker = searchParams.get('ticker');
    const side = searchParams.get('side') as any;
    const type = searchParams.get('type') as any;
    const sourceId = searchParams.get('sourceId');
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const tradeStats = await getTradeStats();
      return NextResponse.json(tradeStats);
    }

    const trades = await getAllTrades({
      status,
      ticker,
      side,
      type,
      sourceId,
      dateFrom,
      dateTo
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trades
 * Create a new trade
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }
    if (!body.size) {
      return NextResponse.json(
        { error: 'Size is required' },
        { status: 400 }
      );
    }
    if (!body.openDate) {
      return NextResponse.json(
        { error: 'Open date is required' },
        { status: 400 }
      );
    }
    if (!body.side) {
      return NextResponse.json(
        { error: 'Side is required' },
        { status: 400 }
      );
    }
    if (!body.type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    const trade = await createTrade(body);
    
    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}

