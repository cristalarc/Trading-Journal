import { NextResponse } from "next/server";
import { updatePattern, deletePattern } from "@/lib/services/configService";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await updatePattern(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pattern:", error);
    return NextResponse.json({ error: "Failed to update pattern" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deletePattern(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pattern:", error);
    return NextResponse.json({ error: "Failed to delete pattern" }, { status: 500 });
  }
} 