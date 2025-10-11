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
    const lastSource = await prisma.sourceConfig.findFirst({
      orderBy: { displayOrder: 'desc' }
    });
    const displayOrder = lastSource ? lastSource.displayOrder + 1 : 1;

    const source = await prisma.sourceConfig.create({
      data: {
        name,
        description: description || null,
        displayOrder,
        isActive: true
      }
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
