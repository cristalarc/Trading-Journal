import { NextResponse } from "next/server";
import { 
  getJournalEntryById, 
  updateRetrospective 
} from "@/lib/services/journalEntryService";

// PATCH handler for updating a retrospective
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: type and status" },
        { status: 400 }
      );
    }
    
    // Validate type
    if (body.type !== '7d' && body.type !== '30d') {
      return NextResponse.json(
        { error: "Type must be either '7d' or '30d'" },
        { status: 400 }
      );
    }
    
    // Validate status
    if (body.status !== 'completed' && body.status !== 'pending') {
      return NextResponse.json(
        { error: "Status must be either 'completed' or 'pending'" },
        { status: 400 }
      );
    }
    
    // Check if entry exists
    const existingEntry = await getJournalEntryById(params.id);
    
    if (!existingEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }
    
    // If status is completed, outcome is required
    if (body.status === 'completed' && !body.outcome) {
      return NextResponse.json(
        { error: "Outcome is required when status is completed" },
        { status: 400 }
      );
    }
    
    // Update the retrospective
    const updatedEntry = await updateRetrospective(
      params.id,
      body.type,
      {
        status: body.status,
        outcome: body.outcome,
        notes: body.notes
      }
    );
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating retrospective:', error);
    return NextResponse.json(
      { error: "Failed to update retrospective" },
      { status: 500 }
    );
  }
} 