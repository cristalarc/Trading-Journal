import { NextResponse } from "next/server";
import { 
  getStrategyById,
  updateStrategy, 
  deleteStrategy 
} from "@/lib/services/configService";

// GET handler for retrieving a specific strategy
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const strategy = await getStrategyById(params.id);
    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a strategy
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedStrategy = await updateStrategy(params.id, body);
    return NextResponse.json(updatedStrategy);
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { error: "Failed to update strategy" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a strategy
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteStrategy(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: "Failed to delete strategy" },
      { status: 500 }
    );
  }
}
