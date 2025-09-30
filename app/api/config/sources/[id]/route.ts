import { NextResponse } from "next/server";
import { 
  getSourceById,
  updateSource, 
  deleteSource 
} from "@/lib/services/configService";

// GET handler for retrieving a specific source
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const source = await getSourceById(params.id);
    if (!source) {
      return NextResponse.json(
        { error: "Source not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(source);
  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json(
      { error: "Failed to fetch source" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a source
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedSource = await updateSource(params.id, body);
    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json(
      { error: "Failed to update source" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a source
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteSource(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: "Failed to delete source" },
      { status: 500 }
    );
  }
}
