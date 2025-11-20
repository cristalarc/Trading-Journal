import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '@/lib/services/portfolioService';

// GET /api/portfolios/[id]/stats - Get portfolio statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await PortfolioService.getPortfolioStats(params.id);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching portfolio stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolio statistics' },
      { status: 404 }
    );
  }
}
