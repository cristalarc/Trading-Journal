import { NextResponse } from "next/server";
import { getIdeasStats } from "@/lib/services/ideaService";

// GET handler for retrieving ideas statistics
export async function GET() {
  try {
    const stats = await getIdeasStats();
    return NextResponse.json(stats);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching ideas statistics:', error);
    return NextResponse.json(
      { error: "Failed to fetch ideas statistics", details: errorMessage },
      { status: 500 }
    );
  }
}
