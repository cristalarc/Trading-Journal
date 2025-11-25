/**
 * ThinkOrSwim (TOS) CSV Import Service
 *
 * Parses ThinkOrSwim Account Statement CSV exports and converts them to trade data.
 * Focuses on the "Account Trade History" section which contains executed trades.
 */

export interface TOSTradeRow {
  execTime: string;
  spread: string;
  side: string; // BUY, SELL
  qty: string; // +2, -27, etc.
  posEffect: string; // TO OPEN, TO CLOSE
  symbol: string;
  exp: string; // Expiration for options
  strike: string; // Strike price for options
  type: string; // STOCK, ETF, OPTION
  price: string;
  netPrice: string;
  orderType: string; // LMT, MKT, etc.
}

export interface TOSParsedTrade {
  ticker: string;
  side: 'LONG' | 'SHORT';
  type: 'SHARE' | 'OPTION';
  size: number;
  openDate: Date;
  closeDate?: Date;
  entryPrice?: number;
  exitPrice?: number;
  avgBuy?: number;
  avgSell?: number;
  status: 'OPEN' | 'CLOSED';
  subOrders: Array<{
    orderDate: Date;
    orderType: 'BUY' | 'SELL' | 'ADD_TO_POSITION' | 'REDUCE_POSITION';
    quantity: number;
    price: number;
  }>;
  // Store original data for duplicate detection
  importData: {
    execTime: string;
    symbol: string;
    qty: number;
    price: number;
    posEffect: string;
  };
}

/**
 * Parse ThinkOrSwim CSV and extract trade history
 */
export async function parseTOSCsv(csvContent: string): Promise<{
  trades: TOSParsedTrade[];
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trades: TOSParsedTrade[] = [];

  try {
    // Split into lines
    const lines = csvContent.split('\n').map(line => line.trim());

    // Find "Account Trade History" section
    const tradeHistoryIndex = lines.findIndex(line =>
      line.includes('Account Trade History')
    );

    if (tradeHistoryIndex === -1) {
      errors.push('Could not find "Account Trade History" section in CSV file');
      return { trades, errors, warnings };
    }

    // Find the header row (next non-empty line after section title)
    let headerIndex = tradeHistoryIndex + 1;
    while (headerIndex < lines.length && !lines[headerIndex]) {
      headerIndex++;
    }

    if (headerIndex >= lines.length) {
      errors.push('Could not find trade history header row');
      return { trades, errors, warnings };
    }

    const headerLine = lines[headerIndex];
    const headers = parseCSVLine(headerLine);

    // Validate we have the expected headers
    const requiredHeaders = ['Side', 'Qty', 'Pos Effect', 'Symbol', 'Type', 'Price'];
    const missingHeaders = requiredHeaders.filter(h =>
      !headers.some(header => header.toLowerCase().includes(h.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return { trades, errors, warnings };
    }

    // Parse trade rows
    const dataStartIndex = headerIndex + 1;
    let tradeCount = 0;

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];

      // Stop if we hit an empty line or next section
      if (!line || line.startsWith('Equities') || line.startsWith('Profits')) {
        break;
      }

      const values = parseCSVLine(line);

      // Skip if not enough values
      if (values.length < headers.length - 2) {
        continue;
      }

      const row = parseRowToObject(headers, values);

      // Skip rows without required data
      if (!row.symbol || !row.side || !row.qty) {
        continue;
      }

      try {
        const trade = convertTOSRowToTrade(row);
        trades.push(trade);
        tradeCount++;
      } catch (error) {
        const err = error as Error;
        warnings.push(`Row ${i}: ${err.message}`);
      }
    }

    if (tradeCount === 0) {
      warnings.push('No valid trades found in Account Trade History section');
    }

  } catch (error) {
    const err = error as Error;
    errors.push(`Failed to parse CSV: ${err.message}`);
  }

  return { trades, errors, warnings };
}

/**
 * Parse a CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert arrays of headers and values to object
 */
function parseRowToObject(headers: string[], values: string[]): any {
  const obj: any = {};

  // Map headers to consistent property names
  const headerMap: Record<string, string> = {
    'exec time': 'execTime',
    'time': 'execTime',
    'spread': 'spread',
    'side': 'side',
    'qty': 'qty',
    'pos effect': 'posEffect',
    'symbol': 'symbol',
    'exp': 'exp',
    'strike': 'strike',
    'type': 'type',
    'price': 'price',
    'net price': 'netPrice',
    'order type': 'orderType',
  };

  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    const key = headerMap[normalizedHeader] || header.replace(/\s+/g, '');
    obj[key] = values[index] || '';
  });

  return obj;
}

/**
 * Convert TOS row to our trade format
 */
export function convertTOSRowToTrade(row: any): TOSParsedTrade {
  // Parse quantity (remove + or - sign, get absolute value)
  const qtyStr = row.qty.toString().replace(/[+\-,]/g, '');
  const quantity = parseFloat(qtyStr);

  if (isNaN(quantity) || quantity <= 0) {
    throw new Error(`Invalid quantity: ${row.qty}`);
  }

  // Parse price
  const priceStr = row.price.toString().replace(/[$,]/g, '');
  const price = parseFloat(priceStr);

  if (isNaN(price) || price <= 0) {
    throw new Error(`Invalid price: ${row.price}`);
  }

  // Parse date/time
  const execTime = row.execTime || '';
  const execDate = parseExecTime(execTime);

  // Determine if opening or closing
  const posEffect = row.posEffect?.toUpperCase() || '';
  const isOpening = posEffect.includes('OPEN');
  const isClosing = posEffect.includes('CLOSE');

  // Determine side
  const side = row.side?.toUpperCase() || '';
  const isBuy = side === 'BUY';
  const isSell = side === 'SELL';

  // Determine trade side (LONG/SHORT)
  // Opening with BUY = LONG, Opening with SELL = SHORT
  let tradeSide: 'LONG' | 'SHORT' = 'LONG';
  if (isOpening && isSell) {
    tradeSide = 'SHORT';
  } else if (isOpening && isBuy) {
    tradeSide = 'LONG';
  } else if (isClosing) {
    // For closing, infer from whether it's buy or sell
    // Closing with SELL = was LONG, Closing with BUY = was SHORT
    tradeSide = isSell ? 'LONG' : 'SHORT';
  }

  // Determine order type for sub-order
  let orderType: 'BUY' | 'SELL' | 'ADD_TO_POSITION' | 'REDUCE_POSITION';
  if (isBuy) {
    orderType = isOpening ? 'BUY' : 'ADD_TO_POSITION';
  } else {
    orderType = isClosing ? 'SELL' : 'REDUCE_POSITION';
  }

  // Clean up symbol (replace / with .)
  const symbol = row.symbol.replace(/\//g, '.');

  // Determine type (STOCK, ETF -> SHARE; OPTION -> OPTION)
  const tosType = row.type?.toUpperCase() || 'STOCK';
  const tradeType: 'SHARE' | 'OPTION' = tosType === 'OPTION' ? 'OPTION' : 'SHARE';

  // Determine status
  const status: 'OPEN' | 'CLOSED' = isClosing ? 'CLOSED' : 'OPEN';

  // Build trade object
  const trade: TOSParsedTrade = {
    ticker: symbol,
    side: tradeSide,
    type: tradeType,
    size: quantity,
    openDate: execDate,
    closeDate: isClosing ? execDate : undefined,
    status,
    subOrders: [{
      orderDate: execDate,
      orderType,
      quantity,
      price,
    }],
    importData: {
      execTime: row.execTime || '',
      symbol: row.symbol,
      qty: quantity,
      price,
      posEffect: row.posEffect || '',
    },
  };

  // Set entry/exit prices
  if (isBuy) {
    trade.entryPrice = price;
    trade.avgBuy = price;
  } else {
    trade.exitPrice = price;
    trade.avgSell = price;
  }

  return trade;
}

/**
 * Parse execution time to Date
 * Format: "11/24/25 12:41:18" or just "11/24/25"
 */
function parseExecTime(execTime: string): Date {
  if (!execTime) {
    return new Date();
  }

  try {
    // TOS format: MM/DD/YY HH:MM:SS or MM/DD/YY
    const parts = execTime.trim().split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '00:00:00';

    const [month, day, year] = datePart.split('/').map(s => parseInt(s.trim(), 10));
    const timeComponents = timePart.split(':').map(s => parseInt(s.trim(), 10));
    const hours = timeComponents[0] || 0;
    const minutes = timeComponents[1] || 0;
    const seconds = timeComponents[2] || 0;

    // Validate parsed values
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      console.error('Invalid date components:', { month, day, year, execTime });
      return new Date();
    }

    // Convert 2-digit year to 4-digit (25 -> 2025)
    const fullYear = year < 100 ? 2000 + year : year;

    // Create date using UTC to avoid timezone issues
    const date = new Date(Date.UTC(fullYear, month - 1, day, hours, minutes, seconds));

    // Validate the created date
    if (isNaN(date.getTime())) {
      console.error('Created invalid date:', { execTime, fullYear, month, day, hours, minutes, seconds });
      return new Date();
    }

    return date;
  } catch (error) {
    console.error('Failed to parse exec time:', execTime, error);
    return new Date();
  }
}

/**
 * Validate TOS trade data
 */
export function validateTOSTrade(trade: TOSParsedTrade): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!trade.ticker) {
    errors.push('Ticker symbol is required');
  }

  if (!trade.size || trade.size <= 0) {
    errors.push('Size must be greater than 0');
  }

  if (!trade.openDate) {
    errors.push('Open date is required');
  }

  if (trade.subOrders.length === 0) {
    errors.push('At least one sub-order is required');
  }

  if (!['LONG', 'SHORT'].includes(trade.side)) {
    errors.push('Side must be LONG or SHORT');
  }

  if (!['SHARE', 'OPTION'].includes(trade.type)) {
    errors.push('Type must be SHARE or OPTION');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Group trades by symbol for position detection
 */
export function groupTradesBySymbol(trades: TOSParsedTrade[]): Map<string, TOSParsedTrade[]> {
  const grouped = new Map<string, TOSParsedTrade[]>();

  for (const trade of trades) {
    const existing = grouped.get(trade.ticker) || [];
    existing.push(trade);
    grouped.set(trade.ticker, existing);
  }

  return grouped;
}
