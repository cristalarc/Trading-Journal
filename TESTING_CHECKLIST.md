# Testing Checklist: Phases 4-7 Implementation

This checklist covers all features implemented in Phases 4-7 of the Trading Journal enhancement project.

---

## Phase 4: ThinkOrSwim Import System

### CSV Parsing & Validation
- [ ] Upload a valid TOS Account Statement CSV file
- [ ] Verify "Account Trade History" section is detected automatically
- [ ] Confirm date parsing handles MM/DD/YY format correctly (e.g., 11/24/25 → Nov 24, 2025)
- [ ] Check symbol cleanup (BRK/B → BRK.B)
- [ ] Verify position effect detection (TO OPEN, TO CLOSE)
- [ ] Test with stocks, ETFs, and options (all three types)

### Preview Workflow
- [ ] Click "Preview Trades" button
- [ ] Verify preview table displays all parsed executions
- [ ] Check summary cards show: Total, Valid, Invalid counts
- [ ] Confirm invalid trades are highlighted in red
- [ ] Verify valid trades show green "Valid" badge
- [ ] Review trade details: Symbol, Side, Type, Size, Price, Date

### Import Confirmation
- [ ] Click "Import X Valid Trade(s)" button
- [ ] Confirm trades are created in database
- [ ] Verify success message displays correct count
- [ ] Check imported trades appear in Trade Log
- [ ] Confirm sub-orders are created for each execution
- [ ] Verify trade metrics are calculated correctly

### Error Handling
- [ ] Upload non-CSV file → should show error
- [ ] Upload CSV without "Account Trade History" → should show error
- [ ] Upload CSV with invalid data → should show validation errors
- [ ] Test without selecting portfolio → should show error

---

## Phase 5: Position Detection in Import Flow

### Position Detection
- [ ] Create an open trade for a ticker (e.g., AAPL with 100 shares)
- [ ] Import TOS CSV with additional executions for same ticker
- [ ] Verify preview shows **MERGE** badge (orange) for matching ticker
- [ ] Confirm merge description shows: "Add X shares to existing position of Y shares (Trade #Z)"
- [ ] Check **NEW** badge (purple) appears for different tickers

### Preview Summary
- [ ] Verify 5 summary cards: Total, Valid, Invalid, New Trades, Merge to Existing
- [ ] Confirm "Merge to Existing" count is accurate
- [ ] Check "Position Merging Detected" notice appears when merges exist
- [ ] Verify Action column in table shows merge descriptions

### Import Execution
- [ ] Confirm import with merge-marked executions
- [ ] Verify executions are added to existing trade (not new trade created)
- [ ] Check trade size updates correctly (old size + new quantity)
- [ ] Confirm avgBuy recalculates with weighted average
- [ ] Verify trade metrics update (net return, MAE, MFE, etc.)
- [ ] Check execution history shows all executions in chronological order

### Import Results
- [ ] Verify success message shows: "X new trade(s), Y merged into existing positions"
- [ ] Confirm created and merged counts are accurate
- [ ] Check Trade Log shows updated position sizes

### Edge Cases
- [ ] Import SELL execution for existing LONG position → should reduce position
- [ ] Import SELL that closes position completely → should close trade
- [ ] Import for ticker with no open position → should create new trade
- [ ] Import for same ticker in different portfolio → should create new trade

---

## Phase 6: UI Enhancements - Open Position Indicators

### Trade List Visual Indicators
- [ ] Open trades show pulsing yellow dot in status badge
- [ ] Open trade rows have yellow background tint (bg-yellow-50/50)
- [ ] Open trade rows have yellow left border (border-l-4)
- [ ] Status badge shows "Open Position" text
- [ ] Closed trades do NOT show indicators
- [ ] WIN/LOSS trades do NOT show indicators

### Trade Detail Page
- [ ] Open trade shows pulsing indicator in status badge
- [ ] Badge text reads "Open Position" with animation
- [ ] Execution history table displays all executions
- [ ] Running position column shows cumulative totals
- [ ] Position summary shows total bought, total sold, final position
- [ ] Color coding: green for buys, red for sells, blue for position

### Dashboard Redesign
- [ ] Stats cards display: Total Trades, Open Positions, Closed Trades, Total P&L
- [ ] Open Positions card shows pulsing indicator when positions exist
- [ ] Open Positions panel displays top 5 open positions
- [ ] Each position card shows: Ticker, Side, Portfolio, Size, Entry Price, Open Date
- [ ] "View All" button links to filtered open trades view
- [ ] Empty state appears when no open positions exist
- [ ] Quick Actions panel shows: New Trade, Import Trades, Journal, Ideas, Analysis

### Animations & Visual Feedback
- [ ] Pulsing animation is smooth and not distracting
- [ ] Yellow theme is consistent across all indicators
- [ ] Hover effects work on trade list rows
- [ ] All icons display correctly
- [ ] Responsive layout works on mobile/tablet

---

## Phase 7: Manual Execution Entry

### Add Execution Dialog
- [ ] "Add Execution" button appears on OPEN trades only
- [ ] Button does NOT appear on CLOSED/WIN/LOSS trades
- [ ] Clicking button opens modal dialog
- [ ] Dialog shows: Trade ticker, Current position
- [ ] Four order type buttons display with correct colors:
  - BUY (green)
  - SELL (red)
  - ADD_TO_POSITION (blue)
  - REDUCE_POSITION (orange)

### Form Inputs & Validation
- [ ] Quantity field accepts decimal numbers
- [ ] Price field accepts decimal numbers
- [ ] Date picker defaults to today
- [ ] Time picker defaults to 09:30
- [ ] Notes field is optional
- [ ] Negative quantity → shows error
- [ ] Zero quantity → shows error
- [ ] Negative price → shows error
- [ ] Zero price → shows error
- [ ] Selling more than current position → shows error with message

### Position Preview
- [ ] Preview shows: Current position → New position
- [ ] BUY/ADD shows addition (e.g., 100 → 150 shares)
- [ ] SELL/REDUCE shows subtraction (e.g., 100 → 50 shares)
- [ ] Warning appears when execution will close position
- [ ] Preview updates in real-time as quantity changes

### Execution Submission
- [ ] Click "Add Execution" button
- [ ] Verify loading state appears
- [ ] Confirm execution is added to trade
- [ ] Check trade page refreshes automatically
- [ ] Verify new execution appears in execution history
- [ ] Confirm trade size updates correctly
- [ ] Check avgBuy/avgSell recalculates
- [ ] Verify all trade metrics update

### API Validation
- [ ] Cannot add execution to closed trade (API returns 400)
- [ ] Invalid order type → API returns 400
- [ ] Invalid date format → API returns 400
- [ ] Overselling validation works on server side
- [ ] Error messages are clear and helpful

### Edge Cases
- [ ] Add BUY execution → position increases
- [ ] Add SELL equal to position → trade closes (status → WIN/LOSS)
- [ ] Add SELL less than position → position decreases
- [ ] Add execution with notes → notes are saved
- [ ] Close dialog without saving → trade unchanged
- [ ] Add execution, then add another → both appear in history

---

## Cross-Phase Integration Testing

### Import + Manual Entry
- [ ] Import TOS trades
- [ ] Manually add execution to imported trade
- [ ] Verify both import and manual executions appear in history
- [ ] Confirm metrics calculate correctly with mixed sources

### Position Detection + Manual Entry
- [ ] Create trade manually
- [ ] Add execution manually
- [ ] Import TOS CSV for same ticker → should detect and merge
- [ ] Verify all executions combined in single trade

### UI Indicators + Execution Changes
- [ ] Open trade shows indicators
- [ ] Add execution that closes position
- [ ] Verify indicators disappear after close
- [ ] Confirm status badge updates to WIN/LOSS

### Dashboard + Position Changes
- [ ] Open dashboard with open positions
- [ ] Add/close positions via import or manual entry
- [ ] Refresh dashboard
- [ ] Verify counts and position list update correctly

---

## Data Integrity Checks

### Trade Metrics Accuracy
- [ ] avgBuy = (sum of buy prices × quantities) / total buy quantity
- [ ] avgSell = (sum of sell prices × quantities) / total sell quantity
- [ ] size = current position (total bought - total sold)
- [ ] netReturn calculated correctly for closed trades
- [ ] netReturnPercent = (netReturn / cost basis) × 100

### Execution History
- [ ] Executions sorted by orderDate ascending
- [ ] Running position column accurate at each step
- [ ] All execution types labeled correctly
- [ ] Dates display with proper formatting
- [ ] Prices display with 2 decimal places

### Database Consistency
- [ ] No duplicate trades for same position
- [ ] Sub-orders linked to correct trade
- [ ] Trade status updates when position closes
- [ ] Original open date preserved during merges
- [ ] Trade ID preserved during merges
- [ ] Execution count matches actual sub-orders count

---

## Performance & UX

### Load Times
- [ ] CSV preview loads in < 2 seconds for 100 rows
- [ ] Import completes in < 5 seconds for 50 trades
- [ ] Trade detail page loads in < 1 second
- [ ] Dashboard loads in < 2 seconds

### User Feedback
- [ ] Loading spinners appear during operations
- [ ] Success messages display after operations
- [ ] Error messages are clear and actionable
- [ ] Form validation messages are helpful
- [ ] Preview table is readable and well-formatted

### Responsive Design
- [ ] Import preview works on mobile
- [ ] Add Execution dialog works on mobile
- [ ] Dashboard layout adapts to screen size
- [ ] Trade list table scrolls horizontally on mobile
- [ ] Summary cards stack vertically on mobile

---

## Edge Cases & Error Recovery

### Invalid Data
- [ ] Malformed CSV → clear error message
- [ ] Missing required columns → specific error
- [ ] Invalid dates → validation error
- [ ] Non-numeric prices → validation error
- [ ] Empty CSV → appropriate message

### Network Errors
- [ ] API timeout → error message
- [ ] Server error → error message
- [ ] Network offline → error message
- [ ] Retry after error works

### Concurrent Operations
- [ ] Two users importing same ticker → handled correctly
- [ ] Add execution while import in progress → works correctly
- [ ] Multiple browser tabs → data stays consistent

---

## Regression Testing

### Existing Features
- [ ] Manual trade creation still works
- [ ] Trade editing still works
- [ ] Trade deletion still works
- [ ] Tradersync import still works
- [ ] Journal entries unaffected
- [ ] Ideas system unaffected
- [ ] Weekly One Pager unaffected
- [ ] Analysis pages unaffected

---

## Final Verification

### CHANGELOG Accuracy
- [ ] Phase 4 entry complete and accurate
- [ ] Phase 5 entry complete and accurate
- [ ] Phase 6 entry complete and accurate
- [ ] Phase 7 entry complete and accurate
- [ ] All dates correct
- [ ] All file paths correct

### Documentation
- [ ] Import instructions are clear
- [ ] Position detection explained
- [ ] Manual execution entry documented
- [ ] All badge meanings documented

### Code Quality
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code follows existing patterns
- [ ] Comments are clear and helpful

---

## Sign-Off

- [ ] All Phase 4 features tested and working
- [ ] All Phase 5 features tested and working
- [ ] All Phase 6 features tested and working
- [ ] All Phase 7 features tested and working
- [ ] No critical bugs found
- [ ] Performance meets requirements
- [ ] Ready for production use

**Tested By:** ___________________
**Date:** ___________________
**Notes:** ___________________
