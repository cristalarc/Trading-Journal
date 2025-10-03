import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TagsAPI');

/**
 * GET /api/config/tags
 * Retrieves all tags ordered by display order
 */
export async function GET() {
  try {
    logger.debug('Fetching all tags');
    
    const tags = await prisma.tagConfig.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    logger.info(`Retrieved ${tags.length} tags`);
    return NextResponse.json(tags);
  } catch (error) {
    logger.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/tags
 * Creates a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description, displayOrder } = body;

    logger.debug('Creating new tag:', { name, category });

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Check if tag with same name already exists
    const existingTag = await prisma.tagConfig.findFirst({
      where: { name }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    // Get the next display order if not provided
    let finalDisplayOrder = displayOrder;
    if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
      const maxOrder = await prisma.tagConfig.aggregate({
        _max: { displayOrder: true }
      });
      finalDisplayOrder = (maxOrder._max.displayOrder || 0) + 1;
    }

    const tag = await prisma.tagConfig.create({
      data: {
        name,
        category,
        description,
        displayOrder: finalDisplayOrder
      }
    });

    logger.info(`Created tag: ${tag.id}`);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    logger.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
