import { NextResponse } from "next/server";
import { 
  getPatterns, 
  createPattern, 
  updatePattern, 
  deletePattern 
} from "@/lib/services/configService";

// GET handler for retrieving all patterns
export async function GET() {
  try {
    const patterns = await getPatterns();
    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json(
      { error: "Failed to fetch patterns" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new pattern
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPattern = await createPattern(body);
    return NextResponse.json(newPattern, { status: 201 });
  } catch (error) {
    console.error('Error creating pattern:', error);
    return NextResponse.json(
      { error: "Failed to create pattern" },
      { status: 500 }
    );
  }
} 