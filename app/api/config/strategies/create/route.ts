import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, tagValue, description, pendingReview } = data;

    if (!name || !tagValue) {
      return NextResponse.json(
        { error: 'Name and tagValue are required' },
        { status: 400 }
      );
    }

    // Get the next display order
    const lastStrategy = await prisma.strategyConfig.findFirst({
      orderBy: { displayOrder: 'desc' }
    });
    const displayOrder = lastStrategy ? lastStrategy.displayOrder + 1 : 1;

    const strategy = await prisma.strategyConfig.create({
      data: {
        name,
        tagValue,
        recordingSystem: description || null,
        displayOrder,
        isActive: true,
        pendingReview: pendingReview ?? false
      }
    });

    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    );
  }
}
