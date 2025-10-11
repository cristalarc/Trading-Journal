import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, category, description, pendingReview } = data;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Get the next display order
    const lastTag = await prisma.tagConfig.findFirst({
      orderBy: { displayOrder: 'desc' }
    });
    const displayOrder = lastTag ? lastTag.displayOrder + 1 : 1;

    const tag = await prisma.tagConfig.create({
      data: {
        name,
        category,
        description: description || null,
        displayOrder,
        isActive: true,
        pendingReview: pendingReview ?? false
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
