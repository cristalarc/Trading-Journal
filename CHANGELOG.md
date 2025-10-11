## [10/11/2025] - Enhanced Trade Import with Intelligent Tag Matching + Pending Review System

### Added
- **Pending Review System for Quick-Created Tags and Strategies**:
  - Tags and Strategies created via import dialog are automatically marked as "pending review"
  - Yellow badge indicator appears next to pending review items in management pages
  - Filter button to show only pending review items (e.g., "Show Pending (3)")
  - Pending count displayed in page header
  - Patterns and Sources are NOT marked for review (quick setup is sufficient)
  - Users can complete full configuration later at their convenience

- **Intelligent Tag Matching System**: Automatically recognizes and matches comma-separated tags from CSV import
  - Parses "Setups" and "Mistakes" columns from imported CSV files
  - Matches imported tags against existing Patterns, Strategies, Sources, and Tags
  - Fuzzy matching algorithm (case-insensitive, substring matching, special character handling)
  - Smart type suggestions based on keyword analysis

- **Interactive Tag Creation Dialog**: User-friendly interface for handling unmatched tags
  - Review unmatched tags one by one
  - Choose appropriate type (Pattern, Strategy, Source, or Tag)
  - Add descriptions and additional metadata
  - Progress tracking (created vs. skipped tags)
  - Skip unwanted tags option

- **API Endpoints for Tag Creation**:
  - `/api/config/tags/create` - Create new tags
  - `/api/config/patterns/create` - Create new patterns
  - `/api/config/strategies/create` - Create new strategies
  - `/api/config/sources/create` - Create new sources

### Changed
- **Import Response Enhanced**: Now includes warnings and unmatched tags
- **CSV Interface Updated**: Added Setups and Mistakes columns to TradersyncRow interface
- **Automatic Tag Assignment**: Matched tags automatically assigned to setup1-7 and mistake1-5 fields
- **Source Detection**: Sources detected in Setups column are automatically assigned to trade

### Technical Implementation
- Created `tagMatchingService.ts` with matching algorithms and type suggestion logic
- Created `UnmatchedTagsDialog.tsx` component for interactive tag creation
- Updated import route to integrate tag matching during CSV processing
- Enhanced import page to display warnings and handle unmatched tags dialog
- Implemented normalization and similarity checking for flexible matching
- Added `pendingReview` boolean field to TagConfig and StrategyConfig schemas
- Created `PendingReviewBadge` component for visual indicator
- Updated API routes to accept and update `pendingReview` flag
- Added filter functionality to Tags management page for pending review items

### User Benefits
- **Time Savings**: Automatic tag matching eliminates manual assignment
- **Consistency**: Ensures tags are consistently named across imports
- **Flexibility**: Create new tags on-the-fly during import process
- **Intelligence**: Smart type detection reduces manual decisions
- **Visibility**: Clear warnings when tags can't be automatically assigned

### Example Usage
CSV with: `Setups: "Waited, SWT, RW, OnMacro, MQ, DVOLLN"`
- System matches existing tags (e.g., "SWT", "RW")
- Suggests types for unmatched tags (e.g., "OnMacro" → Strategy)
- Dialog prompts to create missing tags
- All matched tags automatically assigned to trade

For detailed documentation, see [IMPORT_IMPROVEMENTS.md](./IMPORT_IMPROVEMENTS.md)

---

## [10/11/2025] - Tags Management UX Improvements

### Changed
- **Tag Category Selection**: Enhanced tag creation/editing modal with dropdown for existing categories
  - Displays all existing categories in a dropdown list
  - Added "+ Create new category" option for new categories
  - Toggle between dropdown selection and custom text input
  - Improved user experience with category reuse and consistency
- **Tags Table Sorting**: Implemented automatic sorting by category, display order, and name
  - Tags now grouped by category for better organization
  - Secondary sort by display order within each category
  - Tertiary sort by name as tiebreaker

### Technical Implementation
- Updated `TagEditModal` component with conditional rendering for category input
- Added `existingCategories` prop to modal for dropdown population
- Implemented category state management with `isCustomCategory` toggle
- Enhanced tags page with automatic category extraction and sorting logic

### Notes
- Category dropdown improves consistency across tag management
- Sorted table view provides better visual organization of tags by category
- Seamless toggle between existing and custom categories enhances workflow

---

## [10/09/2025] - Trade Import System Fixes

### Fixed
- **CSV Import Date Parsing**: Fixed date parsing for Tradersync CSV format (`16-Sep-25`) by implementing custom date parser with month abbreviation mapping
- **Date Object Handling**: Fixed `createTrade` function to properly handle Date objects instead of converting them to invalid strings
- **Field Mapping**: Updated CSV import to use correct field names from Tradersync format:
  - `Quantity` → `Size` field mapping
  - `Price` → `Entry Price`/`Exit Price` field mapping  
  - `Date` → `Open Date`/`Close Date` field mapping
- **Data Validation**: Enhanced import validation to skip invalid CSV rows with missing or zero quantity/price values
- **Error Handling**: Improved error messages and logging for debugging import issues

### Technical Implementation
- **Custom Date Parser**: Implemented robust date parsing for `DD-MMM-YY` format with month abbreviation mapping
- **Type Safety**: Added `instanceof Date` checks to prevent string concatenation with Date objects
- **Field Mapping**: Updated `TradersyncRow` interface to match actual CSV structure with proper field names
- **Validation Logic**: Enhanced data validation to handle edge cases and provide meaningful error messages

### Notes
- CSV import now correctly handles Tradersync export format with proper date parsing
- Date objects are preserved throughout the import process to prevent timezone issues
- Import system gracefully handles malformed CSV data with appropriate warnings
- All financial calculations maintain accuracy with proper Decimal type handling

---

## [10/08/2025] - Trade Log System Implementation

### Added
- **Complete Trade Log System** for comprehensive trade tracking and analysis:
  - Trade Log dashboard at `/trades` with advanced filtering and statistics
  - New Trade creation form at `/trades/new` with comprehensive trade data entry
  - Trade detail pages at `/trades/[id]` with full trade information display
  - Trade editing functionality at `/trades/[id]/edit` for updating trade data
  - Trade import system at `/trades/import` with Tradersync CSV support
  - Navigation integration with Trade Log tab and TrendingUp icon

- **Advanced Trade Management Features**:
  - **Comprehensive Trade Fields**: All required and optional trade data points
    - Basic Information: Trade ID (auto-incrementing), Ticker, Size, Open/Close Dates
    - Price Data: Entry Price, Exit Price, Average Buy/Sell, MAE, MFE
    - Performance Metrics: Net Return, Net Return %, Best Exit $, Best Exit %, Missed Exit
    - Trade Classification: Side (LONG/SHORT), Type (SHARE/OPTION), Status (OPEN/WIN/LOSS)
    - Source Integration: Dropdown selection from existing source configurations
    - Setup Tags: 7 setup tags for trade analysis and pattern recognition
    - Mistake Tags: 5 mistake tags for learning from trading errors
  - **Smart Status Management**: Automatic WIN/LOSS determination based on profit/loss
  - **Multiple Execution Support**: Sub-orders for trades with multiple buy/sell executions
  - **Import System**: Tradersync CSV import with automatic trade grouping and validation

- **Trade Log Dashboard Features**:
  - **Statistics Cards**: Total trades, open trades, closed trades, total net return
  - **Advanced Filtering**: By status (OPEN/WIN/LOSS), side (LONG/SHORT), ticker, date ranges
  - **Search Functionality**: Quick ticker search with real-time filtering
  - **Trade Table**: Comprehensive view with key metrics and performance indicators
  - **Status Badges**: Visual indicators for trade status (Open, Win, Loss)
  - **Performance Metrics**: Net return, return percentage, and missed exit calculations

- **Trade Import System**:
  - **Tradersync CSV Import**: Complete implementation with sample file download
  - **Smart Trade Grouping**: Automatically groups multiple executions by symbol and date
  - **Data Validation**: Identifies missing fields and provides clear error messages
  - **Import Results**: Success/error reporting with detailed feedback
  - **Future-Ready**: Structure prepared for ThinkorSwim import functionality

- **Advanced Calculation Engine**:
  - **Net Return Calculation**: Handles both LONG and SHORT positions with accurate formulas
  - **Percentage Calculations**: Precise return percentage computation
  - **MAE/MFE Processing**: From sub-orders or manual input with proper validation
  - **Best Exit Scenarios**: Optimal exit calculations using Maximum Favorable Excursion
  - **Missed Opportunity Analysis**: Performance gap analysis between potential and actual returns
  - **Automatic Status Determination**: WIN (≥ $0) vs LOSS (< $0) based on actual profit/loss

### Changed
- **Database Schema Updates**:
  - Added `Trade` model with comprehensive trade tracking fields
  - Added `TradeSubOrder` model for multiple execution support
  - Updated `TradeStatus` enum: OPEN, CLOSED, WIN, LOSS
  - Added new enums: `TradeSide` (LONG/SHORT), `TradeType` (SHARE/OPTION), `SubOrderType`
  - Enhanced `SourceConfig` and `TagConfig` with Trade relationships
  - Added proper indexing for trade queries and performance optimization

- **Navigation Structure**:
  - Added "Trade Log" navigation tab with TrendingUp icon
  - Integrated Trade Log into existing navigation patterns
  - Updated sidebar with proper active state handling

- **API Layer Enhancements**:
  - Added comprehensive Trade API endpoints (`/api/trades`)
  - Added Trade import API (`/api/trades/import`)
  - Enhanced error handling for trade validation and foreign key constraints
  - Added proper Decimal type handling for financial calculations
  - Implemented trade statistics and filtering endpoints

- **TypeScript Type System**:
  - Added comprehensive Trade interfaces with all required fields
  - Enhanced type safety with proper Prisma Decimal handling
  - Updated service layer with trade CRUD operations and calculations
  - Added proper enum type handling for trade status and classifications

### Fixed
- **Date Timezone Issues**: Fixed date handling to prevent one-day offset errors
- **Status Determination**: Fixed WIN/LOSS status logic for completed trades
- **Calculation Accuracy**: Fixed Missed Exit calculation to only show when MFE data is available
- **Form Validation**: Enhanced trade data validation with comprehensive error checking
- **UI Styling**: Fixed text field styling issues with proper background colors
- **Delete Confirmation**: Replaced browser alerts with custom modal for better UX
- **Edit Functionality**: Implemented complete trade editing with pre-populated forms

### Technical Implementation
- **Database Layer**: Prisma schema with Trade, TradeSubOrder models and comprehensive relationships
- **API Layer**: Full REST endpoints for Trade CRUD, import, and statistics operations
- **Service Layer**: Enhanced `tradeService.ts` with comprehensive calculations and status management
- **Component Layer**: Trade dashboard, forms, detail pages, and import interface
- **Hook Layer**: Custom hooks for trade data fetching and state management
- **Calculation Layer**: Advanced trade metrics with MAE, MFE, and performance analysis
- **Import Layer**: CSV parsing and trade creation with validation and error handling

### Performance Metrics Explained
- **Net Return**: Actual profit/loss from the trade (calculated from buy/sell prices)
- **Net Return %**: Percentage return based on investment amount
- **MAE (Maximum Adverse Excursion)**: Worst price movement against the position
- **MFE (Maximum Favorable Excursion)**: Best price movement in favor of the position
- **Best Exit $**: Potential profit if exited at MFE (Maximum Favorable Excursion)
- **Best Exit %**: Percentage return if exited at optimal time
- **Missed Exit**: Difference between potential profit (Best Exit) and actual profit (Net Return)

### Notes
- Trades automatically determine WIN/LOSS status when close date is provided
- Import system intelligently groups multiple executions into single trades
- All calculations handle both LONG and SHORT positions correctly
- Trade Log integrates with existing Sources and Tags for comprehensive tracking
- Sub-orders support complex trades with multiple buy/sell executions
- Import system includes sample CSV file for easy testing and setup
- All financial calculations use proper Decimal types for accuracy
- Full TypeScript type safety maintained throughout implementation
- Trade Log provides foundation for Analytics and Retrospective components

---

## [10/03/2025] - Tags Management System Implementation

### Added
- **Tags Management System** for organizing and categorizing trading activities:
  - Complete CRUD interface at `/settings/tags` with full tag management capabilities
  - Tag configuration with name, category, description, display order, and active status
  - Database model `TagConfig` with proper indexing and relationships
  - API endpoints for full tag management (`/api/config/tags`)
  - Tag edit modal with validation and duplicate checking
  - Bulk selection and deletion capabilities for tags
  - Integration with existing configuration system patterns

- **Enhanced Settings Page Organization**:
  - **Trading Configuration** section groups core trading elements:
    - Tags, Sources, Strategies, Patterns, and Timeframes
  - **Additional Configuration** section for supplementary settings:
    - Ideas Settings and Help Tooltips
  - Improved visual hierarchy with section headers and descriptions
  - Better navigation and logical grouping of related features

- **Tags Features**:
  - **Name**: Unique identifier for each tag
  - **Category**: Organizational grouping for tags (e.g., "Technical", "Fundamental", "Risk")
  - **Description**: Optional detailed description of tag purpose
  - **Display Order**: Configurable ordering for tag presentation
  - **Active Status**: Enable/disable tags without deletion
  - **Bulk Operations**: Select and manage multiple tags simultaneously

### Changed
- **Database Schema Updates**:
  - Added `TagConfig` model with comprehensive tag management fields
  - Updated Prisma schema with proper field mappings and constraints
  - Applied database migrations with new tag configuration table
  - Enhanced configuration system with tag support

- **Settings Page Structure**:
  - Reorganized settings into logical sections: Trading Configuration and Additional Configuration
  - Added Tags section to Trading Configuration alongside Sources, Strategies, Patterns, and Timeframes
  - Enhanced visual hierarchy with section headers and descriptive text
  - Improved responsive grid layout for better organization

- **TypeScript Type System**:
  - Added `Tag` type to `useConfig` hook with comprehensive tag interface
  - Added `useTags` hook for tag data management and state handling
  - Enhanced type safety with proper tag interface definitions
  - Updated service layer with tag CRUD operations

### Technical Implementation
- **Database Layer**: Prisma schema updates with TagConfig model and relationships
- **API Layer**: Full REST endpoints for Tags CRUD operations (`/api/config/tags`)
- **Service Layer**: Enhanced configuration service with tag management functions
- **Component Layer**: Reusable tag edit modal with form validation and duplicate checking
- **Hook Layer**: Custom `useTags` hook for data fetching and state management
- **Page Layer**: Dedicated tags settings page with full CRUD interface

### Notes
- Tags serve as text descriptors for future Trade Log development
- Tags complement existing Sources and Strategies in the trading configuration system
- Tags are organized by category for better management and filtering
- All tag features integrate seamlessly with existing configuration patterns
- Database migrations applied successfully with new tag configuration table
- Full TypeScript type safety maintained throughout implementation
- Tags will be available for attachment to trades when Trade Log functionality is developed

---

## [10/03/2025] - Ideas Management System Implementation

### Added
- **Complete Ideas Management System** for tracking and managing trading ideas:
  - Ideas dashboard at `/ideas` with comprehensive filtering and statistics
  - New Idea creation form at `/ideas/new` with real-time calculations
  - Ideas settings configuration at `/settings/ideas` for expiry and multiplier management
  - Navigation integration with Ideas tab under Weekly One Pager section

- **Advanced Ideas Features**:
  - **Comprehensive Idea Fields**: ticker, prices, RR ratio, quality, status, expiry tracking
  - **Real-time Calculations**: RR ratio, To Win Money, Money Risk with live updates
  - **Stock Multiplier Support**: Configurable multipliers for futures (ES, MES, etc.)
  - **Ideas Expiry System**: Automatic expiry after configurable period (default 365 days)
  - **Quality Classification**: HQ (High Quality), MQ (Medium Quality), LQ (Low Quality)
  - **Status Management**: Active, Inactive, Expired states with filtering
  - **Strategy & Source Integration**: Dropdown selection from existing configurations

- **Ideas Dashboard Features**:
  - **Statistics Cards**: Total, Active, Expired, Inactive idea counts
  - **Advanced Filtering**: By ticker, status, quality, direction, market
  - **Expandable Rows**: Detailed view with all idea information
  - **Bulk Operations**: Select and delete multiple ideas
  - **Real-time Updates**: Automatic refresh after operations

- **Ideas Settings & Configuration**:
  - **Expiry Settings**: Configurable idea expiry period (1-3650 days)
  - **Stock Multipliers**: Add/remove tickers with custom multipliers for futures
  - **Pre-configured Examples**: ES ($50 multiplier), MES ($5 multiplier)
  - **Settings Integration**: Dedicated settings page with full CRUD operations

- **Real-time Multiplier Calculations**:
  - **Frontend Calculations**: Live updates as user types in form
  - **Visual Multiplier Indicator**: Blue badge showing active multiplier
  - **Accurate Futures Support**: Proper dollar value calculations for ES/MES
  - **Settings Integration**: Fetches multipliers from Ideas settings on form load

### Changed
- **Database Schema Updates**:
  - Added `Idea` model with comprehensive trading idea fields
  - Added `IdeasExpiryConfig` model for configurable expiry periods
  - Added `StockMultiplierConfig` model for futures multiplier support
  - Updated `StrategyConfig` and `SourceConfig` with Ideas relationships
  - Added new enums: `TradeDirection`, `MarketDirection`, `TrendDirection`, `CloudPosition`, `Quality`, `IdeaStatus`

- **Navigation Structure**:
  - Added "Ideas" navigation tab under Weekly One Pager section
  - Updated navigation with Lightbulb icon for Ideas section
  - Integrated Ideas into existing navigation patterns

- **Settings Page Structure**:
  - Added Ideas Settings section to main settings page
  - Created dedicated `/settings/ideas` page for Ideas configuration
  - Integrated Ideas settings with existing settings navigation

- **API Layer Enhancements**:
  - Added comprehensive Ideas API endpoints (`/api/ideas`)
  - Added Ideas settings API (`/api/ideas/settings`)
  - Added Ideas statistics API (`/api/ideas/stats`)
  - Enhanced error handling for foreign key constraints
  - Added proper Decimal type handling for Prisma calculations

### Fixed
- **Decimal Type Issues**: Fixed Prisma Decimal type errors in frontend calculations
- **Foreign Key Constraints**: Fixed empty string handling for optional foreign keys
- **Real-time Calculations**: Fixed multiplier calculations to work in frontend form
- **Type Safety**: Updated interfaces to reflect actual Prisma Decimal types
- **User Experience**: Added visual feedback for multiplier calculations

### Technical Implementation
- **Database Layer**: Prisma schema with Ideas, IdeasExpiryConfig, StockMultiplierConfig models
- **API Layer**: Full REST endpoints for Ideas CRUD, settings, and statistics
- **Service Layer**: Enhanced `ideaService.ts` with comprehensive calculations and multiplier support
- **Component Layer**: Ideas dashboard, form, and settings pages with real-time updates
- **Hook Layer**: Custom hooks for Ideas data fetching and state management
- **Calculation Layer**: Real-time RR ratio, profit, and risk calculations with multiplier support

### Notes
- Ideas automatically expire based on configurable expiry period (default 365 days)
- Stock multipliers apply to futures trading (ES, MES, etc.) for accurate dollar calculations
- Real-time calculations update as user types in the New Idea form
- Ideas integrate with existing Strategies and Sources for comprehensive tracking
- All calculations account for both Long and Short trade directions
- Multiplier system supports any ticker with custom multiplier values
- Ideas dashboard provides comprehensive filtering and bulk operations
- Full TypeScript type safety maintained throughout implementation

---

## [09/30/2025] - Sources and Strategies Implementation

### Added
- **Sources Management System** for tracking trading idea origins:
  - Complete CRUD interface at `/settings/sources`
  - Source configuration with name, description, display order, and active status
  - Database model `SourceConfig` with proper indexing and relationships
  - API endpoints for full source management (`/api/config/sources`)
  - Source edit modal with validation and duplicate checking
  - Bulk selection and deletion capabilities for sources

- **Strategies Management System** for comprehensive trading methodology:
  - Advanced strategy configuration at `/settings/strategies`
  - Comprehensive strategy fields including:
    - Basic info: name, tag value, display order, active status
    - Multiple sourcing values (JSON array) for flexible source tracking
    - Trading criteria: enter, early entry, exit, and confirmation criteria
    - Quality management: considerations and criteria
    - Review system: execution review criteria and retrospective periods
    - Improvement tracking: kaizen and tagging systems
    - System integration: recording system and display ordering
  - Database model `StrategyConfig` with JSON support for multiple sourcing values
  - API endpoints for full strategy management (`/api/config/strategies`)
  - Advanced strategy edit modal with multi-field form
  - Quick add source functionality with settings icon integration
  - Multiple sourcing values support with visual tag management
  - Bulk selection and deletion capabilities for strategies

- **Enhanced User Experience Features**:
  - Quick add source modal accessible from strategy creation
  - Visual tag system for managing multiple sourcing values
  - Settings icon (cogwheel) for instant source creation workflow
  - Smart dropdown filtering to show only unselected sources
  - Responsive table displays with source tag visualization
  - Integrated source management within strategy workflow

### Changed
- **Database Schema Updates**:
  - Added `SourceConfig` model with standard configuration fields
  - Added `StrategyConfig` model with comprehensive trading methodology fields
  - Changed strategy sourcing from single value to multiple values (JSON array)
  - Updated Prisma schema with proper field mappings and constraints
  - Applied database migrations with data loss acceptance for development

- **Settings Page Structure**:
  - Added Sources and Strategies sections to main settings page
  - Updated navigation and routing for new configuration pages
  - Enhanced settings page with descriptive cards for each configuration type
  - Integrated new configuration options with existing patterns and timeframes

- **TypeScript Type System**:
  - Updated `useConfig` hook with new `Source` and `Strategy` types
  - Added `useSources` and `useStrategies` hooks for data management
  - Enhanced type safety with proper interface definitions
  - Updated service layer with comprehensive CRUD operations

### Technical Implementation
- **Database Layer**: Prisma schema updates with proper relationships and constraints
- **API Layer**: Full REST endpoints for Sources and Strategies CRUD operations
- **Service Layer**: Enhanced `configService.ts` with new entity management functions
- **Component Layer**: Reusable edit modals with advanced form handling
- **Hook Layer**: Custom hooks for data fetching and state management
- **Page Layer**: Dedicated settings pages with full CRUD interfaces

### Notes
- Sources serve as tags for identifying trading idea origins (Twitter, Journal, etc.)
- Strategies define complete trading methodologies with entry/exit criteria
- Multiple sourcing values allow strategies to be sourced from multiple channels
- Quick add source functionality eliminates workflow interruption
- All new features integrate seamlessly with existing configuration system
- Database migrations applied with development data loss acceptance
- Full TypeScript type safety maintained throughout implementation

---

## [09/28/2025] - Weekly One Pager Feature Implementation

### Added
- **Weekly One Pager page** (`/weekly-one-pager`) with dedicated navigation tab for prioritizing weekly trading entries.
- **Game Plan field** in database schema (`gamePlan` column) for storing trading strategies and plans.
- **Quick toggle functionality** in Journal dashboard Actions column to mark entries as eligible for Weekly One Pager.
- **Auto-save Game Plan feature** with debounced saving (1-second delay) and visual feedback indicators.
- **Custom confirmation modal** for "Clear All Entries" action with app-consistent design and keyboard support.
- **API endpoints** for Weekly One Pager operations:
  - `GET /api/weekly-one-pager` - Fetch eligible entries
  - `PATCH /api/weekly-one-pager` - Update game plans and eligibility
  - `DELETE /api/weekly-one-pager` - Clear all entries
- **Visual indicators** for Weekly One Pager eligibility:
  - Green CheckSquare icon when eligible
  - Gray Square icon when not eligible
  - Color-coded direction and sentiment badges

### Changed
- **Navigation structure** updated to include "Weekly One Pager" tab between Journal and Analysis.
- **Journal dashboard Actions column** now includes checkbox icon for quick Weekly One Pager eligibility toggle.
- **Database schema** updated with `gamePlan` field and proper mapping (`game_plan` column).
- **Service layer** enhanced with Weekly One Pager specific functions and game plan handling.

### Fixed
- **Game Plan auto-save bug** where changes weren't persisting due to incorrect comparison logic in `onBlur` handler.
- **Browser confirmation dialog** replaced with custom modal for better UX consistency.
- **State management** improved with proper original value tracking for game plan changes.

### Notes
- Weekly One Pager entries are identified by `isWeeklyOnePagerEligible` boolean field.
- Game plans are automatically cleared when entries are removed from Weekly One Pager.
- Custom modal supports Escape key and click-outside-to-close functionality.
- All Weekly One Pager features integrate seamlessly with existing Journal functionality.

---

## [Previous] - Retrospective Feature Overhaul

### Added
- Overdue status (`overdue`) to the `RetroStatus` enum in the Prisma schema and database.
- Backend logic to automatically update 7D and 30D retrospectives to `overdue` when their respective time periods have passed and the status is still `pending`.
- Toast notifications for user feedback when completing a retrospective.

### Changed
- Retrospectives page now only displays entries with `overdue` status for 7D or 30D retrospectives (not `pending`).
- Journal table now visually distinguishes between `Pending` (yellow), `Overdue` (amber/orange), `Win` (green), and `Loss` (red) tags.
- Backend logic for updating overdue status now updates 7D and 30D independently, preventing both from being set to `overdue` unless both are actually overdue.
- Only retrospectives with `overdue` status are counted for the "Retrospective Action Required" warning and shown for user action.

### Fixed
- Bug where both 7D and 30D retrospectives were marked as `overdue` even if only one was actually overdue.
- Bug where the UI would show `Loss` for overdue or new entries instead of the correct tag.
- Bug where the Retrospectives page would not show Win/Loss buttons for overdue retrospectives.
- Bug where the color for `Overdue` and `Loss` tags was the same; now `Overdue` is amber/orange and `Loss` is red.

### Notes
- Prisma Client must be regenerated after schema changes (`npx prisma generate`).
- Only retrospectives with `overdue` status require user action and are shown in the Retrospectives page.

---

## [05/23/2025] - Help Tooltips Loading Fix

### Fixed
- **Default Tooltip Text Flash**: Fixed quick visual bug where default tooltip text would briefly display before actual configured text loaded
- Improved loading state handling for tooltip configuration

### Notes
- Enhanced user experience by eliminating the brief flash of default tooltip text during page load

---

## [05/21/2025] - Help Tooltips and Configuration Pages Enhancement

### Added
- **Help Tooltips Page Enhancements**:
  - Made tooltip text editable with fallback to hard-coded default values when no custom text is provided
  - Enhanced user control over tooltip content management
- **Manage Patterns Page**:
  - Added functionality for Add Pattern button
  - Implemented duplicate name checker to prevent pattern conflicts
  - Fully operative Delete Pattern workflow
- **Manage Timeframes Page**:
  - Added functionality for Add Timeframe button
  - Implemented duplicate name checker to prevent timeframe conflicts
  - Fully operative Delete Timeframe workflow

### Fixed
- **Help Tooltips**: Fixed functionality of the Save Changes button
- **Manage Patterns**: Fixed Delete Pattern workflow, now fully operative
- **Manage Timeframes**: Fixed Delete Timeframe workflow, now fully operative

### Notes
- Configuration pages now have complete CRUD functionality
- Duplicate checking prevents data integrity issues
- All configuration management features are fully functional

---

## [05/18/2025] - Settings UI and Journal Backend Improvements

### Changed
- **Settings UI Enhancements**:
  - Fixed UI for Manage Patterns view with improved layout and styling
  - Fixed UI for Manage Timeframes view with improved layout and styling
  - Enhanced overall settings page consistency

### Added
- **Journal Time Table Panel Enhancements**:
  - Added Monthly column to Time Table (now displays Monthly, Weekly, Daily, Hourly)
  - Expanded Time Table panel to occupy 75% of screen for better visibility
  - Improved card stacking and expand/collapse functionality for all timeframe columns
- **Journal Entry Validation & Editing**:
  - Made ticker, timeframe, price, and comments mandatory for all journal entries (server-side validation)
  - Added entry deletion functionality
- **Filter & Search Improvements**:
  - Added Ticker filter input to filter panel for quick searching by ticker
  - Resetting filters now also clears the ticker filter

### Fixed
- **Backend Update Logic**:
  - Fixed backend update logic to properly handle decimals and relations (timeframe, pattern) when editing entries
  - Prevented DecimalError by only converting valid numeric values to Prisma.Decimal
  - Editing now reliably updates all fields, including clearing support/resistance
- **Time Table Improvements**:
  - Removed the Unknown column from Time Table (was used for debugging missing timeframes)
  - Improved error handling and user experience throughout the Journal UI

### Notes
- Entry validation ensures data quality with mandatory fields
- Time Table provides comprehensive multi-timeframe analysis view
- Enhanced filtering capabilities improve journal navigation

---

## [03/21/2025] - Journal UI and Backend Validation

### Added
- **Journal Time Table Panel Enhancements**:
  - Added Monthly column to Time Table (now shows Monthly, Weekly, Daily, Hourly)
  - Expanded Time Table panel to occupy 75% of the screen for better visibility
  - Improved card stacking and expand/collapse for all timeframe columns
- **Entry Validation & Editing**:
  - Made ticker, timeframe, price, and comments mandatory for all journal entries (server-side validation)
  - Added entry deletion functionality
- **Filter & Search Improvements**:
  - Added a Ticker filter input to the filter panel for quick searching by ticker
  - Resetting filters now also clears the ticker filter

### Fixed
- **Backend Update Logic**:
  - Fixed backend update logic to properly handle decimals and relations (timeframe, pattern) when editing entries
  - Prevented DecimalError by only converting valid numeric values to Prisma.Decimal
  - Editing now reliably updates all fields, including clearing support/resistance
- **General Bug Fixes**:
  - Removed the Unknown column from Time Table (was used for debugging missing timeframes)
  - Improved error handling and user experience throughout the Journal UI

### Notes
- Server-side validation ensures data integrity
- Enhanced Time Table provides better multi-timeframe analysis
- Improved filtering and search capabilities

---

## [03/20/2025] - Card-Based Edit Form and Settings Pages

### Added
- **Card-Based Edit Form Implementation**:
  - Created new JournalEditForm component with modal overlay and backdrop blur
  - Added proper form field styling and validation
  - Added ESC key functionality for closing modal
  - Implemented loading state during save operations
  - Enhanced error handling and feedback
  - Fixed black background issues on input fields
  - Improved modal positioning and visibility

- **Settings Pages Implementation**:
  - **Timeframes Management Page** (`/settings/timeframes`):
    - Table view of existing timeframes
    - Display order tracking
    - Active/Inactive status indicators
    - Basic Add/Edit UI placeholders
  - **Patterns Management Page** (`/settings/patterns`):
    - Table view of existing patterns
    - Description field display
    - Display order tracking
    - Active/Inactive status indicators
    - Basic Add/Edit UI placeholders

- **Tooltip System Enhancement**:
  - Created reusable Tooltip component with help icon (?) for explanations and settings icon (⚙️) for configuration
  - Hover-based display with proper positioning and styling
  - Settings page navigation integration
  - Enhanced `/settings/tooltips` page with 7D Retro and 30D Retro tooltip configuration
  - Implemented reusable input components with character limit enforcement (50 chars)
  - Added real-time character count display

- **Journal Table Integration**:
  - Added tooltips to table headers: Timeframe (settings), Pattern (settings), Direction (help), Sentiment (help), 7D Retro (help), 30D Retro (help)

### Technical Implementation
- Added TypeScript typing for new components
- Implemented reusable component patterns
- Enhanced error handling and state management
- Added keyboard navigation support
- Implemented consistent styling using Tailwind

### Notes
- Modal edit form provides better user experience than inline editing
- Tooltip system enhances user guidance throughout the application
- Settings pages provide centralized configuration management

---

## [03/19/2025] - Database Schema and Decimal Handling Fixes

### Fixed
- **Prisma Schema Relation Issues**: Resolved issues with relation modeling in Prisma by properly implementing connect format for timeframe and pattern relations
- **Non-Existent Schema Field**: Removed the `relevantWeek` property from database operations as it wasn't defined in the schema
- **Date Handling**: Corrected timezone issues when saving journal entries by using T12:00:00Z timestamp format to prevent dates from shifting backward by one day
- **Journal View Crash**: Resolved `TypeError: entry.price.toFixed is not a function` error by properly handling Prisma.Decimal objects
- **React Fragment Key Issues**: Fixed key issues in dynamically rendered lists

### Added
- **Utility Functions**: Created reusable helpers in `lib/utils.ts`:
  - `formatDecimal()`: Properly formats any decimal value (Prisma.Decimal, number, string)
  - `formatPrice()`: Adds currency symbol to formatted decimal values
- **Enhanced Error Handling**: Added more detailed error diagnostics in API responses for common Prisma errors including schema validation failures and foreign key constraint issues
- **Expanded Row Functionality**: Implemented dropdown details view for journal entries showing support/resistance levels, sentiment, Weekly One Pager eligibility, and comments
- **Inline Editing**: Created edit form within expanded rows allowing users to modify ticker, price, support/resistance levels, and comments

### Changed
- **Better User Experience**: Added visual feedback when rows are expanded
- **Code Quality**: Added comprehensive type handling to avoid runtime errors
- **Documentation**: Improved code comments throughout the application
- **Error Prevention**: Added validation to prevent common input errors when creating new entries

### Technical Implementation
- Properly handled Prisma's Decimal type conversions throughout the app
- Added robust fallback patterns for parsing and displaying numeric values
- Enhanced validation to prevent foreign key constraint violations

### Notes
- Decimal handling now properly manages Prisma.Decimal objects
- Date handling prevents timezone-related bugs
- Expanded rows provide better entry detail visibility

---

## [03/13/2025] - Project Structure Reorganization

### Changed
- **Project Directory**: Changed main directory of project to avoid path and configuration problems
- **Ignore Files**: Modified ignore files to help Cursor IDE better interact with the project

### Notes
- Project structure improvements for better development workflow
- Enhanced IDE integration and file management

---

## [03/10/2025] - Database Structure and Prisma Implementation

### Added
- **Database Configuration**:
  - Implemented PostgreSQL database setup with Prisma ORM
  - Created database schema with proper relationships and constraints
  - Added automated timestamp handling for `createdAt` and `updatedAt`
  - Implemented week calculation logic for entry relevance

- **Database Models**:
  - **TimeframeConfig**: ID, name, display order, active status tracking, relationship with journal entries
  - **PatternConfig**: ID, name, description, display order, active status tracking, relationship with journal entries
  - **TooltipConfig**: ID, key, text content, maximum length constraints, update tracking
  - **JournalEntry**: Core trade information (ticker, price, etc.), support and resistance levels, retrospective tracking (7D and 30D), Weekly One Pager eligibility flag

- **Configuration Files**:
  - Prisma configuration with schema definition, migration settings, seed script configuration
  - TypeScript configurations with `tsconfig.seed.json` for database seeding
  - Environment setup with `.env` for database connection

- **Utility Functions**:
  - Week calculation logic for entry relevance
  - Database connection management
  - Logging utility implementation

### Technical Implementation
- Full Prisma ORM integration with PostgreSQL
- Comprehensive database schema design
- Proper relationship modeling and constraints
- Seeding infrastructure for initial data

### Notes
- Foundation for all database operations
- Proper schema design ensures data integrity
- Seeding scripts facilitate development and testing

---

## [03/03/2025] - Enhanced Journal Table and Settings Infrastructure

### Added
- **Enhanced Journal Table Editing**:
  - Converted pattern field to dropdown using predefined values
  - Added gear icons for quick access to settings
  - Limited editing to one entry at a time
  - Added tooltips for Direction and Sentiment fields
  - Automatically expands rows when editing

- **Settings Infrastructure**:
  - Created main settings page with three sections: Trading Patterns management, Timeframes configuration, Help Tooltips customization
  - Implemented tooltips settings page with character limit enforcement
  - Added navigation between settings pages

- **Logging System**:
  - Implemented centralized logging utility (`/lib/logger.ts`) with multiple levels
  - Added colored console output for development
  - Structured JSON output for production
  - Added contextual information to all logs
  - Added logging for component initialization, user interactions, navigation events, state changes, and error conditions

### Changed
- **Code Documentation**:
  - Added comprehensive docstrings to all components
  - Documented all functions and their purposes
  - Added inline comments for complex logic
  - Improved code organization with section comments

- **UI/UX Improvements**:
  - Added visual feedback for editing state
  - Improved tooltip positioning and styling
  - Enhanced settings navigation with breadcrumbs
  - Added character count display for tooltip editing

### Fixed
- **Black Background**: Fixed black background on input fields by adding proper background classes
- **Component Imports**: Corrected component import statements
- **Variable Naming**: Fixed variable naming inconsistencies
- **Responsive Layout**: Improved responsive layout issues

### Technical Implementation
- Centralized logging system for better debugging
- Enhanced state management for editing mode
- Improved component organization and documentation

### Notes
- Settings infrastructure provides foundation for configuration management
- Logging system aids in debugging and monitoring
- Enhanced documentation improves code maintainability

---

## [02/27/2025] - Enhanced Journal Page UI and Inline Editing

### Added
- **Expandable Rows**: Added expandable rows in journal table to display additional information including support/resistance levels, full comments section, and retrospective status for 7-day and 30-day periods
- **Inline Editing Capability**: Added ability to edit journal entries directly from the main table with number inputs for support/resistance values, textarea for comments, and dropdown selectors for retrospective statuses
- **New Entry Form Improvements**: Added date field with calendar icon to the New Journal Entry form
- **Component Integration**:
  - Created and integrated `TimeTablePanel` component for detailed ticker analysis
  - Implemented `RetrospectiveReminder` component for overdue retrospectives

### Changed
- **UI/UX Improvements**:
  - Ensured consistent styling across all form elements
  - Enhanced filter section with better organization and visual feedback
  - Improved responsive design for better mobile experience
  - Added side panel for detailed views with proper close button
  - Implemented consistent styling across the application
  - Added visual indicators for expanded and edited rows

### Fixed
- **Black Background**: Fixed black background on input fields by adding `bg-background` class
- **Component Imports**: Fixed component imports to use named exports
- **Variable Naming**: Fixed variable naming inconsistencies for timeframe filters
- **Background Colors**: Ensured proper background colors on all form elements
- **Responsive Layout**: Improved responsive layout for mobile devices

### Technical Implementation
- Implemented proper state management for expanded rows and editing mode
- Added conditional rendering for UI elements based on state
- Ensured consistent styling with Tailwind classes
- Fixed type issues with component imports

### Notes
- Expandable rows provide better space utilization and detail visibility
- Inline editing improves workflow efficiency
- Component integration enhances overall application functionality

---

## [02/26/2025] - Initial MVP Foundation

### Added
- **Foundational Files**: Composer created the foundational files for the MVP app
- **Initial Application Setup**: Basic application structure and configuration
- **Development Environment**: Configured development server and dependencies

### Notes
- Ran app with `npm run dev` and confirmed basic functionality
- Initial version missing key functionality and UI elements
- Foundation for future feature development 