import { NextRequest, NextResponse } from 'next/server';
import { createTrade } from '@/lib/services/tradeService';
import { parse } from 'csv-parse/sync';

interface TradersyncRow {
  Date: string;
  Time: string;
  Symbol: string;
  Quantity: string;
  Price: string;
  Side: string;
  Type: string;
  Commission?: string;
  Fees?: string;
  Notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('importType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (importType === 'thinkorswim') {
      return NextResponse.json(
        { error: 'ThinkorSwim import not yet implemented' },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const fileContent = await file.text();
    const records: TradersyncRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV file' },
        { status: 400 }
      );
    }

    // Group trades by symbol and date
    const tradeGroups = new Map<string, TradersyncRow[]>();
    
    for (const record of records) {
      const key = `${record.Symbol}-${record.Date}`;
      if (!tradeGroups.has(key)) {
        tradeGroups.set(key, []);
      }
      tradeGroups.get(key)!.push(record);
    }

    const results = {
      success: true,
      message: 'Trades imported successfully',
      tradesCreated: 0,
      errors: [] as string[]
    };

    // Process each trade group
    for (const [key, trades] of tradeGroups) {
      try {
        const tradeData = await processTradeGroup(trades);
        if (tradeData) {
          await createTrade({
            ...tradeData,
            importSource: 'tradersync',
            importData: trades
          });
          results.tradesCreated++;
        }
      } catch (error) {
        const errorMessage = `Failed to process trade ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        console.error(errorMessage, error);
      }
    }

    if (results.tradesCreated === 0 && results.errors.length > 0) {
      results.success = false;
      results.message = 'No trades were created due to errors';
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error importing trades:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to import trades',
        tradesCreated: 0,
        errors: ['Import process failed']
      },
      { status: 500 }
    );
  }
}

async function processTradeGroup(trades: TradersyncRow[]) {
  if (trades.length === 0) return null;

  const firstTrade = trades[0];
  const symbol = firstTrade.Symbol;
  const date = firstTrade.Date;

  // Calculate total quantities and average prices
  let totalBuyQuantity = 0;
  let totalSellQuantity = 0;
  let totalBuyValue = 0;
  let totalSellValue = 0;
  let totalCommission = 0;
  let totalFees = 0;
  let notes: string[] = [];

  // Determine if this is a long or short position
  let isLong = true;
  let hasBuy = false;
  let hasSell = false;

  for (const trade of trades) {
    const quantity = parseFloat(trade.Quantity);
    const price = parseFloat(trade.Price);
    const commission = parseFloat(trade.Commission || '0');
    const fees = parseFloat(trade.Fees || '0');

    if (trade.Side.toUpperCase() === 'BUY') {
      totalBuyQuantity += quantity;
      totalBuyValue += quantity * price;
      hasBuy = true;
    } else if (trade.Side.toUpperCase() === 'SELL') {
      totalSellQuantity += quantity;
      totalSellValue += quantity * price;
      hasSell = true;
    }

    totalCommission += commission;
    totalFees += fees;

    if (trade.Notes && trade.Notes.trim()) {
      notes.push(trade.Notes.trim());
    }
  }

  // Determine position side
  if (hasBuy && hasSell) {
    // Mixed trades - determine based on net position
    isLong = totalBuyQuantity > totalSellQuantity;
  } else if (hasBuy) {
    isLong = true;
  } else if (hasSell) {
    isLong = false;
  }

  // Calculate position size
  const positionSize = Math.abs(totalBuyQuantity - totalSellQuantity);
  
  if (positionSize === 0) {
    // Fully closed position
    return {
      ticker: symbol,
      size: Math.max(totalBuyQuantity, totalSellQuantity),
      openDate: new Date(date),
      closeDate: new Date(date), // Same day close
      side: isLong ? 'LONG' : 'SHORT',
      type: firstTrade.Type.toUpperCase() as 'SHARE' | 'OPTION',
      avgBuy: totalBuyQuantity > 0 ? totalBuyValue / totalBuyQuantity : undefined,
      avgSell: totalSellQuantity > 0 ? totalSellValue / totalSellQuantity : undefined,
      entryPrice: isLong ? (totalBuyValue / totalBuyQuantity) : (totalSellValue / totalSellQuantity),
      exitPrice: isLong ? (totalSellValue / totalSellQuantity) : (totalBuyValue / totalBuyQuantity),
      status: 'CLOSED'
    };
  } else {
    // Open position
    return {
      ticker: symbol,
      size: positionSize,
      openDate: new Date(date),
      side: isLong ? 'LONG' : 'SHORT',
      type: firstTrade.Type.toUpperCase() as 'SHARE' | 'OPTION',
      avgBuy: totalBuyQuantity > 0 ? totalBuyValue / totalBuyQuantity : undefined,
      avgSell: totalSellQuantity > 0 ? totalSellValue / totalSellQuantity : undefined,
      entryPrice: isLong ? (totalBuyValue / totalBuyQuantity) : (totalSellValue / totalSellQuantity),
      status: 'OPEN'
    };
  }
}

