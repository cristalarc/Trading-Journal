import { NextResponse } from "next/server";
import { 
  getWeeklyOnePagerEntries,
  clearAllWeeklyOnePagerEntries,
  updateJournalEntry
} from "@/lib/services/journalEntryService";

// GET handler for retrieving Weekly One Pager entries
export async function GET() {
  try {
    const entries = await getWeeklyOnePagerEntries();
    return NextResponse.json(entries);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching Weekly One Pager entries:', error);
    return NextResponse.json(
      { error: "Failed to fetch Weekly One Pager entries", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE handler for clearing all Weekly One Pager entries
export async function DELETE() {
  try {
    const result = await clearAllWeeklyOnePagerEntries();
    return NextResponse.json({ 
      message: "All entries cleared from Weekly One Pager",
      count: result.count 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error clearing Weekly One Pager entries:', error);
    return NextResponse.json(
      { error: "Failed to clear Weekly One Pager entries", details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH handler for updating individual entries (game plan, eligibility)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, gamePlan, isWeeklyOnePagerEligible } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (gamePlan !== undefined) updateData.gamePlan = gamePlan;
    if (isWeeklyOnePagerEligible !== undefined) updateData.isWeeklyOnePagerEligible = isWeeklyOnePagerEligible;
    
    const updatedEntry = await updateJournalEntry(id, updateData);
    return NextResponse.json(updatedEntry);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error updating Weekly One Pager entry:', error);
    return NextResponse.json(
      { error: "Failed to update entry", details: errorMessage },
      { status: 500 }
    );
  }
}
