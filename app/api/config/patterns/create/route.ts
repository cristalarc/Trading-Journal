import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get the next display order
    const lastPattern = await prisma.patternConfig.findFirst({
      orderBy: { displayOrder: 'desc' }
    });
    const displayOrder = lastPattern ? lastPattern.displayOrder + 1 : 1;

    const pattern = await prisma.patternConfig.create({
      data: {
        name,
        description: description || null,
        displayOrder,
        isActive: true
      }
    });

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Error creating pattern:', error);
    return NextResponse.json(
      { error: 'Failed to create pattern' },
      { status: 500 }
    );
  }
}
