import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TagAPI');

/**
 * GET /api/config/tags/[id]
 * Retrieves a specific tag by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    logger.debug(`Fetching tag: ${id}`);

    const tag = await prisma.tagConfig.findUnique({
      where: { id }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    logger.info(`Retrieved tag: ${id}`);
    return NextResponse.json(tag);
  } catch (error) {
    logger.error(`Error fetching tag ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/config/tags/[id]
 * Updates a specific tag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, category, description, displayOrder, isActive, pendingReview } = body;

    logger.debug(`Updating tag: ${id}`, { name, category });

    // Check if tag exists
    const existingTag = await prisma.tagConfig.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingTag.name) {
      const nameExists = await prisma.tagConfig.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (pendingReview !== undefined) updateData.pendingReview = pendingReview;

    const tag = await prisma.tagConfig.update({
      where: { id },
      data: updateData
    });

    logger.info(`Updated tag: ${id}`);
    return NextResponse.json(tag);
  } catch (error) {
    logger.error(`Error updating tag ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/config/tags/[id]
 * Deletes a specific tag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    logger.debug(`Deleting tag: ${id}`);

    // Check if tag exists
    const existingTag = await prisma.tagConfig.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    await prisma.tagConfig.delete({
      where: { id }
    });

    logger.info(`Deleted tag: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting tag ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
