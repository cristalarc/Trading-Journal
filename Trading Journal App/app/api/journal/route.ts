import { NextResponse } from "next/server";

// Mock data for demonstration purposes
// In a real application, this would be stored in a database
const journalEntries = [
  {
    id: "1",
    entryDate: new Date("2023-01-01"),
    relevantWeek: 1,
    ticker: "AAPL",
    currentPrice: 150.25,
    timeframe: "daily",
    direction: "bullish",
    sentiment: "bullish",
    sentimentType: "technical",
    governingPattern: "Cup & Handle",
    keySupportLevel: 145.50,
    keyResistanceLevel: 155.75,
    comments: "Strong momentum with increasing volume",
    weeklyOnePagerToggle: true,
    isFollowUpToOpenTrade: false,
    retrospective7D: "win",
    retrospective30D: "win",
    updates: [
      {
        id: "1-1",
        journalEntryId: "1",
        updateDate: new Date("2023-01-02"),
        comments: "Price broke resistance as expected",
      },
    ],
  },
  {
    id: "2",
    entryDate: new Date("2023-01-02"),
    relevantWeek: 1,
    ticker: "TSLA",
    currentPrice: 220.15,
    timeframe: "weekly",
    direction: "bearish",
    sentiment: "bearish",
    sentimentType: "technical",
    governingPattern: "Head & Shoulders",
    keySupportLevel: 210.00,
    keyResistanceLevel: 230.50,
    comments: "Potential breakdown below neckline",
    weeklyOnePagerToggle: true,
    isFollowUpToOpenTrade: true,
    retrospective7D: "lose",
    retrospective30D: "win",
    updates: [],
  },
];

// GET handler for retrieving all journal entries
export async function GET() {
  return NextResponse.json(journalEntries);
}

// POST handler for creating a new journal entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, validate the input and save to database
    const newEntry = {
      id: (journalEntries.length + 1).toString(),
      ...body,
      entryDate: new Date(),
      relevantWeek: calculateRelevantWeek(new Date()),
      updates: [],
    };
    
    // In a real application, this would be saved to a database
    journalEntries.push(newEntry);
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 }
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