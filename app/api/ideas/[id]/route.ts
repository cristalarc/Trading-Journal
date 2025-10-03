import { NextResponse } from "next/server";
import { 
  getIdeaById, 
  updateIdea, 
  deleteIdea 
} from "@/lib/services/ideaService";

// GET handler for retrieving a specific idea
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idea = await getIdeaById(params.id);
    return NextResponse.json(idea);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching idea:', error);
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch idea", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT handler for updating an idea
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    console.log('Received idea update request:', { id: params.id, body });
    
    // Validate numeric fields if provided
    const numericFields = ['currentPrice', 'targetEntry', 'targetPrice', 'stop', 'relative', 'intendedPosition'];
    for (const field of numericFields) {
      if (body[field] !== undefined && isNaN(Number(body[field]))) {
        return NextResponse.json(
          { error: "Invalid numeric value", details: `Field '${field}' must be a valid number` },
          { status: 400 }
        );
      }
    }
    
    // Convert numeric fields and handle optional foreign keys
    const processedBody = { ...body };
    for (const field of numericFields) {
      if (processedBody[field] !== undefined) {
        processedBody[field] = Number(processedBody[field]);
      }
    }
    
    // Convert empty strings to null for optional foreign keys
    if (processedBody.strategyId !== undefined) {
      processedBody.strategyId = processedBody.strategyId && processedBody.strategyId.trim() !== '' ? processedBody.strategyId : null;
    }
    if (processedBody.sourceId !== undefined) {
      processedBody.sourceId = processedBody.sourceId && processedBody.sourceId.trim() !== '' ? processedBody.sourceId : null;
    }
    
    const updatedIdea = await updateIdea({
      id: params.id,
      ...processedBody
    });
    
    console.log('Updated idea successfully:', updatedIdea);
    return NextResponse.json(updatedIdea);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error updating idea:', error);
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update idea", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an idea
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteIdea(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error deleting idea:', error);
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete idea", details: errorMessage },
      { status: 500 }
    );
  }
}
