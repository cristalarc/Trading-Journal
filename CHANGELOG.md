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