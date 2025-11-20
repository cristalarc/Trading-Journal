# Phase 4: ThinkOrSwim Import Implementation - Preparation Guide

## Overview
Phase 4 focuses on implementing CSV import functionality for ThinkOrSwim (TOS) brokerage exports, allowing users to import their trades directly from TOS account statements.

## Prerequisites Completed ✅
- ✅ Phase 0: Portfolio infrastructure fully implemented
- ✅ Phase 1: Position Detection Service created
- ✅ Phase 2: Execution Merger Logic with validation
- ✅ Phase 3: Duplicate Detection Service

## What We Need to Implement

### 1. ThinkOrSwim CSV Parser Service
**File**: `lib/services/tosImportService.ts`

**Requirements**:
- Parse ThinkOrSwim CSV format (we need sample file to understand format)
- Map TOS fields to our Trade model fields
- Handle TOS-specific field names and date formats
- Group executions by symbol and date (similar to Tradersync)
- Extract all relevant trade data:
  - Ticker symbol
  - Buy/Sell side
  - Quantity
  - Price
  - Date/Time
  - Commissions/Fees
  - Order type
  - Any TOS-specific metadata

**Key Functions to Implement**:
```typescript
export interface TOSRow {
  // Fields TBD based on sample CSV
  // Example expected fields:
  date?: string;
  symbol?: string;
  side?: string;
  quantity?: string;
  price?: string;
  commissions?: string;
  fees?: string;
  // ... more fields
}

export interface TOSParsedTrade {
  ticker: string;
  side: 'LONG' | 'SHORT';
  type: 'SHARE' | 'OPTION';
  size: number;
  openDate: Date;
  closeDate?: Date;
  avgBuy?: number;
  avgSell?: number;
  entryPrice?: number;
  exitPrice?: number;
  commissions?: number;
  fees?: number;
  subOrders: Array<{
    orderDate: Date;
    orderType: 'BUY' | 'SELL' | 'ADD_TO_POSITION' | 'REDUCE_POSITION';
    quantity: number;
    price: number;
  }>;
  importData: any; // Store original TOS data for duplicate detection
}

/**
 * Parse ThinkOrSwim CSV file
 */
export async function parseTOSCsv(csvContent: string): Promise<{
  trades: TOSParsedTrade[];
  errors: string[];
  warnings: string[];
}>

/**
 * Group TOS executions by symbol
 */
export function groupTOSExecutions(rows: TOSRow[]): Map<string, TOSRow[]>

/**
 * Convert TOS row to our trade format
 */
export function convertTOSRowToTrade(rows: TOSRow[]): TOSParsedTrade

/**
 * Validate TOS trade data
 */
export function validateTOSTrade(trade: TOSParsedTrade): {
  valid: boolean;
  errors: string[];
}
```

### 2. ThinkOrSwim Import API Route
**File**: `app/api/trades/import/tos/route.ts`

**Requirements**:
- Accept CSV file upload via FormData
- Extract portfolioId from request
- Parse CSV using TOSImportService
- Validate all trades before import
- Return success/error results

**API Structure**:
```typescript
/**
 * POST /api/trades/import/tos
 * Import trades from ThinkOrSwim CSV
 */
export async function POST(request: NextRequest) {
  // 1. Extract FormData (CSV file + portfolioId)
  // 2. Validate portfolioId
  // 3. Parse CSV content
  // 4. Validate all trades
  // 5. Create trades in database
  // 6. Return results with success/error counts
}
```

### 3. Import UI Updates
**File**: `app/trades/import/page.tsx`

**Changes Needed**:
- Add "ThinkOrSwim" option to import source selection
- Add TOS-specific sample CSV file download
- Update import preview to work with TOS format
- Add TOS-specific validation messages
- Update import results display

**UI Flow**:
```
1. User selects "ThinkOrSwim" as import source
2. User selects portfolio
3. User uploads CSV file
4. System previews trades to import
5. User confirms import
6. System processes and displays results
```

### 4. Sample Files Needed
**Location**: `public/samples/`

We need from you:
- `tos-sample.csv` - Example ThinkOrSwim CSV export file
- Actual field names and structure from TOS
- Example of how TOS formats:
  - Dates and times
  - Buy/Sell indicators
  - Option symbols (if different from stocks)
  - Multiple executions for same trade
  - Commissions and fees

### 5. Documentation Updates
**File**: `docs/TOS_IMPORT_GUIDE.md` (to be created)

**Should Include**:
- How to export trades from ThinkOrSwim
- What data is imported
- How to format TOS CSV for best results
- Common issues and solutions
- Examples with screenshots

## Implementation Steps

### Step 1: Analyze Sample CSV
- [ ] Receive TOS CSV sample from user
- [ ] Analyze CSV structure and field names
- [ ] Document all fields and their meanings
- [ ] Identify date/time format
- [ ] Identify how executions are grouped
- [ ] Understand option symbol format (if applicable)

### Step 2: Create TOS Parser Service
- [ ] Create `tosImportService.ts`
- [ ] Implement CSV parsing logic
- [ ] Implement execution grouping
- [ ] Implement trade conversion
- [ ] Add comprehensive error handling
- [ ] Add validation logic
- [ ] Add unit tests

### Step 3: Create TOS Import API
- [ ] Create `/api/trades/import/tos/route.ts`
- [ ] Implement file upload handling
- [ ] Integrate with tosImportService
- [ ] Add portfolio validation
- [ ] Add error handling
- [ ] Test with sample files

### Step 4: Update Import UI
- [ ] Add TOS option to import source selector
- [ ] Create TOS sample CSV file
- [ ] Update file upload to support TOS
- [ ] Update preview display
- [ ] Add TOS-specific validation messages
- [ ] Test complete import flow

### Step 5: Testing & Documentation
- [ ] Test with various TOS CSV files
- [ ] Test with single executions
- [ ] Test with multiple executions
- [ ] Test with options (if applicable)
- [ ] Create user documentation
- [ ] Update CHANGELOG.md

## Questions for User

Before we start Phase 4, please provide:

1. **Sample TOS CSV File**: Upload a sample CSV export from ThinkOrSwim
   - Include examples of both stocks and options (if you trade options)
   - Include examples with multiple executions for same symbol
   - Scrub any sensitive data (account numbers, actual P&L if preferred)

2. **TOS Export Instructions**:
   - Where in TOS do you export this CSV?
   - What options/filters do you use when exporting?
   - What date range should users export?

3. **Special Requirements**:
   - Do you trade both stocks and options?
   - Do you need futures support?
   - Any other TOS-specific features we should handle?

4. **Field Mapping Preferences**:
   - What TOS fields should map to our Setup tags?
   - What TOS fields should map to our Mistake tags?
   - Any custom fields you'd like preserved?

## Integration with Existing Services

TOS import will leverage all existing services:

### Position Detection (Phase 1)
- Check for open positions before importing
- Merge executions into existing open trades
- Detect ticker + portfolio conflicts

### Execution Merger (Phase 2)
- Validate executions won't create negative positions
- Calculate weighted averages
- Update position tracking fields
- Handle partial closes

### Duplicate Detection (Phase 3)
- Check for duplicate imports via TOS order IDs
- Compare dates, sizes, and prices
- Warn user of potential duplicates
- Offer merge or skip options

## Expected Outcomes

After Phase 4 completion:
- ✅ Users can import TOS CSV files
- ✅ Automatic execution grouping by symbol
- ✅ Proper handling of buy/sell executions
- ✅ Commission and fee tracking
- ✅ Integration with position detection
- ✅ Duplicate prevention
- ✅ User-friendly error messages
- ✅ Sample CSV file available
- ✅ Complete documentation

## Next Steps

1. **User provides TOS sample CSV file**
2. **We analyze structure and create parser**
3. **Implement and test import flow**
4. **Move to Phase 5: Enhanced import flow with position detection**

---

## Notes
- TOS format may differ significantly from Tradersync
- May need to handle multiple TOS export formats (Account Statement, Trade History, etc.)
- Options have different symbol format than stocks in TOS
- TOS may include more detailed execution data (time stamps, order types)
- Consider supporting both detailed and summary export formats

## Ready to Start?

Once you provide the sample TOS CSV file, we can:
1. Analyze the exact format
2. Create the parser in ~2-3 hours
3. Integrate with existing services
4. Test the complete flow
5. Deploy Phase 4 complete!
