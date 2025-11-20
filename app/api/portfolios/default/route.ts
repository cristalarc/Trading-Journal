import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '@/lib/services/portfolioService';

// GET /api/portfolios/default - Get the default portfolio
export async function GET(request: NextRequest) {
  try {
    const portfolio = await PortfolioService.ensureDefaultPortfolio();
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching default portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default portfolio' },
      { status: 500 }
    );
  }
}
