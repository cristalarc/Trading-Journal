# Trading Journal App

A personal trading journal application to track, analyze, and improve your trading performance.

## Features

- Create and manage journal entries for different timeframes (hourly, daily, weekly)
- Track sentiment, support/resistance levels, and patterns
- Add retrospective analysis after 7 and 30 days
- Filter and view entries by ticker, timeframe, week, or sentiment
- Generate weekly one-pager summaries

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev -- --turbo
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app`: Next.js app directory
  - `/components`: UI components
  - `/lib`: Utility functions and shared code
  - `/hooks`: Custom React hooks
  - `/api`: API routes
  - `/styles`: Global styles
  - `/types`: TypeScript type definitions
  - `/utils`: Helper functions

## License

This project is licensed under the MIT License. 