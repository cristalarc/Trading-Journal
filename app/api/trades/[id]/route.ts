import { NextRequest, NextResponse } from 'next/server';
import { getTradeById, updateTrade, deleteTrade } from '@/lib/services/tradeService';

/**
 * GET /api/trades/[id]
 * Get a specific trade by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trade = await getTradeById(params.id);
    
    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error fetching trade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/trades/[id]
 * Update a specific trade
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const trade = await updateTrade(params.id, body);
    
    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id]
 * Delete a specific trade
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTrade(params.id);
    
    return NextResponse.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}

