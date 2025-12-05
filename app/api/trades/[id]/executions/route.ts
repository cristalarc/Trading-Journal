import { NextRequest, NextResponse } from 'next/server';
import { addExecutionToTrade, getTradeById } from '@/lib/services/tradeService';
import type { SubOrderType } from '@prisma/client';

/**
 * POST /api/trades/[id]/executions
 * Add a new execution to an existing trade
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradeId = params.id;
    const body = await request.json();

    const { orderType, quantity, price, orderDate, notes } = body;

    // Validate required fields
    if (!orderType || !quantity || !price || !orderDate) {
      return NextResponse.json(
        { error: 'Missing required fields: orderType, quantity, price, orderDate' },
        { status: 400 }
      );
    }

    // Validate order type
    const validOrderTypes: SubOrderType[] = ['BUY', 'SELL', 'ADD_TO_POSITION', 'REDUCE_POSITION'];
    if (!validOrderTypes.includes(orderType)) {
      return NextResponse.json(
        { error: 'Invalid order type. Must be BUY, SELL, ADD_TO_POSITION, or REDUCE_POSITION' },
        { status: 400 }
      );
    }

    // Validate quantity and price
    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Verify trade exists
    const trade = await getTradeById(tradeId);
    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    // Check if trade is open
    if (trade.status !== 'OPEN') {
      return NextResponse.json(
        { error: `Cannot add execution to a ${trade.status} trade. Only OPEN trades can receive new executions.` },
        { status: 400 }
      );
    }

    // Convert date string to Date object
    const executionDate = new Date(orderDate);
    if (isNaN(executionDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid order date' },
        { status: 400 }
      );
    }

    // Add execution to trade
    const execution = await addExecutionToTrade(tradeId, {
      orderType: orderType as SubOrderType,
      quantity,
      price,
      orderDate: executionDate,
      notes: notes || undefined,
    });

    // Get updated trade
    const updatedTrade = await getTradeById(tradeId);

    return NextResponse.json({
      success: true,
      message: 'Execution added successfully',
      execution,
      trade: updatedTrade,
    });
  } catch (error) {
    console.error('Error adding execution:', error);

    const err = error as Error;
    // Check for validation errors from addExecutionToTrade
    if (err.message.includes('Cannot execute') || err.message.includes('negative position')) {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add execution' },
      { status: 500 }
    );
  }
}
