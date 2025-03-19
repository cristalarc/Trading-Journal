import { NextResponse } from "next/server";
import { 
  getJournalEntryById, 
  updateJournalEntry, 
  deleteJournalEntry 
} from "@/lib/services/journalEntryService";

// GET handler for retrieving a specific journal entry
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await getJournalEntryById(params.id);
    
    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json(
      { error: "Failed to fetch journal entry" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a journal entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check if entry exists
    const existingEntry = await getJournalEntryById(params.id);
    
    if (!existingEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }
    
    // Update the entry
    const updatedEntry = await updateJournalEntry(params.id, body);
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a journal entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if entry exists
    const existingEntry = await getJournalEntryById(params.id);
    
    if (!existingEntry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }
    
    // Delete the entry
    await deleteJournalEntry(params.id);
    
    return NextResponse.json(
      { message: "Journal entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
} 