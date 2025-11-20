import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '@/lib/services/portfolioService';

// GET /api/portfolios - Get all portfolios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const portfolios = await PortfolioService.getAllPortfolios(includeArchived);
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST /api/portfolios - Create a new portfolio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isDefault } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Portfolio name is required' },
        { status: 400 }
      );
    }

    const portfolio = await PortfolioService.createPortfolio({
      name: name.trim(),
      description: description?.trim(),
      isDefault: isDefault ?? false
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}
