import { NextResponse } from "next/server";
import { 
  getStrategies, 
  createStrategy
} from "@/lib/services/configService";

// GET handler for retrieving all strategies
export async function GET() {
  try {
    const strategies = await getStrategies();
    return NextResponse.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { error: "Failed to fetch strategies" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new strategy
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStrategy = await createStrategy(body);
    return NextResponse.json(newStrategy, { status: 201 });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { error: "Failed to create strategy" },
      { status: 500 }
    );
  }
}
