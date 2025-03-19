import { NextResponse } from "next/server";
import { 
  getAllJournalEntries, 
  createJournalEntry, 
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry
} from "@/lib/services/journalEntryService";
import { calculateRelevantWeek as getRelevantWeek } from "@/lib/db";

// GET handler for retrieving all journal entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const timeframeId = searchParams.get('timeframeId') || undefined;
    const patternId = searchParams.get('patternId') || undefined;
    const ticker = searchParams.get('ticker') || undefined;
    const direction = searchParams.get('direction') as 'Bullish' | 'Bearish' | undefined;
    const sentiment = searchParams.get('sentiment') as 'Bullish' | 'Neutral' | 'Bearish' | undefined;
    
    // Get entries with filters
    const entries = await getAllJournalEntries({
      timeframeId: timeframeId,
      patternId: patternId,
      ticker: ticker,
      direction: direction,
      sentiment: sentiment
    });
    
    return NextResponse.json(entries);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST handler for creating a new journal entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Received request body:', body);
    
    // Set default entry date if not provided
    if (!body.entryDate) {
      body.entryDate = new Date().toISOString();
    }
    
    // Ensure retro status fields are set to pending by default
    if (!body.retro7DStatus) {
      body.retro7DStatus = 'pending';
    }
    
    if (!body.retro30DStatus) {
      body.retro30DStatus = 'pending';
    }
    
    // Note: We've removed the relevantWeek calculation since it's not in our schema
    
    // Log the formatted data before creation
    console.log('Attempting to create journal entry with data:', body);
    
    try {
      // Create new entry
      const newEntry = await createJournalEntry(body);
      console.log('Created journal entry successfully:', newEntry);
      return NextResponse.json(newEntry, { status: 201 });
    } catch (dbError: unknown) {
      // Enhanced error for database operations
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      console.error('Database error creating journal entry:', dbError);
      
      // Check for common Prisma errors
      const errorString = String(dbError);
      
      // Handle specific Prisma validation errors
      if (errorString.includes('Unknown argument')) {
        // This catches errors like "Unknown argument `timeframeId`. Did you mean `timeframe`?"
        return NextResponse.json(
          { 
            error: "Failed to create journal entry", 
            details: "Database schema error: The request contains invalid field names. This is likely a bug in our code. Please try again or contact support if the issue persists."
          },
          { status: 500 }
        );
      }
      
      // Handle foreign key constraint errors
      if (errorString.includes('Foreign key constraint failed')) {
        return NextResponse.json(
          { 
            error: "Failed to create journal entry", 
            details: "The selected timeframe or pattern doesn't exist. Please select valid options."
          },
          { status: 400 }
        );
      }
      
      // Other Prisma errors
      const isPrismaError = errorString.includes('Prisma');
      const detailedMessage = isPrismaError 
        ? `Database error: ${errorMessage}`
        : `Error creating entry: ${errorMessage}`;
        
      return NextResponse.json(
        { error: "Failed to create journal entry", details: detailedMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // This catches JSON parsing errors and other request-level issues
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Request error creating journal entry:', error);
    
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 400 }
    );
  }
}

// Helper function to calculate the relevant week
function calculateRelevantWeek(date: Date): number {
  // Get the week number (1-52)
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // If it's Sunday, return next week, otherwise return current week
  return date.getDay() === 0 ? weekNumber + 1 : weekNumber;
} 