import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '@/lib/services/portfolioService';

// GET /api/portfolios/[id] - Get a single portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolio = await PortfolioService.getPortfolioById(params.id);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// PATCH /api/portfolios/[id] - Update a portfolio
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, isDefault } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const portfolio = await PortfolioService.updatePortfolio(params.id, updateData);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolios/[id] - Delete or archive a portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await PortfolioService.deletePortfolio(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete portfolio' },
      { status: 400 }
    );
  }
}
