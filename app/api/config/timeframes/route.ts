import { NextResponse } from "next/server";
import { 
  getTimeframes, 
  createTimeframe, 
  updateTimeframe, 
  deleteTimeframe 
} from "@/lib/services/configService";

// GET handler for retrieving all timeframes
export async function GET() {
  try {
    const timeframes = await getTimeframes();
    return NextResponse.json(timeframes);
  } catch (error) {
    console.error('Error fetching timeframes:', error);
    return NextResponse.json(
      { error: "Failed to fetch timeframes" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new timeframe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTimeframe = await createTimeframe(body);
    return NextResponse.json(newTimeframe, { status: 201 });
  } catch (error) {
    console.error('Error creating timeframe:', error);
    return NextResponse.json(
      { error: "Failed to create timeframe" },
      { status: 500 }
    );
  }
} 