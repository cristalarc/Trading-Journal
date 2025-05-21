import { NextResponse } from "next/server";
import { updateTimeframe, deleteTimeframe } from "@/lib/services/configService";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await updateTimeframe(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating timeframe:", error);
    return NextResponse.json({ error: "Failed to update timeframe" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteTimeframe(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timeframe:", error);
    return NextResponse.json({ error: "Failed to delete timeframe" }, { status: 500 });
  }
} 