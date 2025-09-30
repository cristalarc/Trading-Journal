import { NextResponse } from "next/server";
import { 
  getSources, 
  createSource
} from "@/lib/services/configService";

// GET handler for retrieving all sources
export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new source
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSource = await createSource(body);
    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: "Failed to create source" },
      { status: 500 }
    );
  }
}
