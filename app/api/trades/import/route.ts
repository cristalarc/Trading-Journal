import { NextRequest, NextResponse } from 'next/server';
import { createTrade } from '@/lib/services/tradeService';
import { parse } from 'csv-parse/sync';

interface TradersyncRow {
  Status: string;
  Symbol: string;
  Size: string;
  'Open Date': string;
  'Close Date': string;
  'Open Time': string;
  'Close Time': string;
  'Entry Price': string;
  'Exit Price': string;
  'Return $': string;
  'Return %': string;
  'Avg Buy': string;
  'Avg Sell': string;
  'Net Return': string;
  Commision?: string;
  Notes?: string;
  Expire?: string;
  Strike?: string;
  Type: string;
  Side: string;
  Spread?: string;
  Cost?: string;
  Executions?: string;
  Fees?: string;
  Swap?: string;
  Holdtime?: string;
  'Last Order'?: string;
  Portfolio?: string;
  Position?: string;
  Privacy?: string;
  'Return Share'?: string;
  Risk?: string;
  MAE?: string;
  MFE?: string;
  Expectancy?: string;
  'R-Multiple'?: string;
  'Best Exit $'?: string;
  'Best Exit %'?: string;
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
  const date = firstTrade['Open Date'];

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
    // Parse the size (quantity) from the Size field
    const quantity = parseFloat(trade.Size);
    
    // For this CSV format, we need to determine if it's a buy or sell based on the trade data
    // Since this appears to be a completed trade, we'll use the entry/exit prices
    const entryPrice = parseFloat(trade['Entry Price'].replace('$', ''));
    const exitPrice = parseFloat(trade['Exit Price'].replace('$', ''));
    const commission = parseFloat(trade.Commision || '0');
    const fees = parseFloat(trade.Fees || '0');

    // Validate that we have valid numeric values
    if (isNaN(quantity) || quantity <= 0) {
      console.warn(`Invalid quantity for trade: ${JSON.stringify(trade)}`);
      continue; // Skip this trade
    }
    if (isNaN(entryPrice) || entryPrice <= 0) {
      console.warn(`Invalid entry price for trade: ${JSON.stringify(trade)}`);
      continue; // Skip this trade
    }
    if (isNaN(exitPrice) || exitPrice <= 0) {
      console.warn(`Invalid exit price for trade: ${JSON.stringify(trade)}`);
      continue; // Skip this trade
    }

    // For completed trades, we'll treat the entire quantity as both buy and sell
    // This represents a completed round-trip trade
    totalBuyQuantity += quantity;
    totalSellQuantity += quantity;
    totalBuyValue += quantity * entryPrice;
    totalSellValue += quantity * exitPrice;
    hasBuy = true;
    hasSell = true;

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

  // Validate that we have at least some valid trades
  if (totalBuyQuantity === 0 && totalSellQuantity === 0) {
    console.warn(`No valid trades found for symbol ${symbol} on date ${date}`);
    return null;
  }

  // Calculate position size
  const positionSize = Math.abs(totalBuyQuantity - totalSellQuantity);
  
  // For this CSV format, we're dealing with completed trades
  // Use the first trade's data to get the close date
  const closeDate = firstTrade['Close Date'];
  
  // Parse dates properly - handle format like "16-Sep-25"
  const parseCustomDate = (dateStr: string): Date => {
    console.log(`Parsing date: "${dateStr}"`);
    
    // Handle format: "16-Sep-25" -> "16 Sep 2025"
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      // Convert 2-digit year to 4-digit
      const fullYear = year.length === 2 ? `20${year}` : year;
      
      // Create date using constructor with individual components
      // Month is 0-indexed in JavaScript Date constructor
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const monthIndex = monthMap[month];
      if (monthIndex !== undefined) {
        const parsedDate = new Date(parseInt(fullYear), monthIndex, parseInt(day));
        console.log(`Parsed date result:`, parsedDate);
        return parsedDate;
      }
    }
    
    // Fallback to standard parsing
    console.log(`Using fallback parsing for: "${dateStr}"`);
    return new Date(dateStr);
  };
  
  const openDate = parseCustomDate(date);
  const closeDateObj = parseCustomDate(closeDate);
  
  // Validate dates
  if (isNaN(openDate.getTime())) {
    console.warn(`Invalid open date: ${date} for symbol ${symbol}`);
    return null;
  }
  if (isNaN(closeDateObj.getTime())) {
    console.warn(`Invalid close date: ${closeDate} for symbol ${symbol}`);
    return null;
  }
  
  // For completed trades, the size is the quantity traded
  const tradeSize = totalBuyQuantity; // Should be the same as totalSellQuantity for completed trades
  if (tradeSize <= 0) {
    console.warn(`Invalid trade size calculated: ${tradeSize} for symbol ${symbol}`);
    return null;
  }
  
  return {
    ticker: symbol,
    size: tradeSize,
    openDate: openDate,
    closeDate: closeDateObj,
    side: firstTrade.Side.toUpperCase() as 'LONG' | 'SHORT',
    type: firstTrade.Type.toUpperCase() as 'SHARE' | 'OPTION',
    avgBuy: totalBuyQuantity > 0 ? totalBuyValue / totalBuyQuantity : undefined,
    avgSell: totalSellQuantity > 0 ? totalSellValue / totalSellQuantity : undefined,
    entryPrice: totalBuyValue / totalBuyQuantity,
    exitPrice: totalSellValue / totalSellQuantity,
    status: 'CLOSED'
  };
}

