import { NextResponse } from "next/server";
import { 
  getTooltips, 
  createTooltip, 
  updateTooltip, 
  deleteTooltip, 
  getTooltipByKey 
} from "@/lib/services/configService";

// GET handler for retrieving all tooltips
export async function GET() {
  try {
    const tooltips = await getTooltips();
    
    // Convert array to object with keys for easier consumption in the UI
    const tooltipsObject = tooltips.reduce((acc, tooltip) => {
      acc[tooltip.key] = {
        text: tooltip.text,
        maxLength: tooltip.maxLength
      };
      return acc;
    }, {} as Record<string, { text: string, maxLength: number }>);
    
    return NextResponse.json(tooltipsObject);
  } catch (error) {
    console.error('Error fetching tooltips:', error);
    return NextResponse.json(
      { error: "Failed to fetch tooltips" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new tooltip
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTooltip = await createTooltip(body);
    return NextResponse.json(newTooltip, { status: 201 });
  } catch (error) {
    console.error('Error creating tooltip:', error);
    return NextResponse.json(
      { error: "Failed to create tooltip" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json(); // { key: text, ... }
    const results = [];
    for (const key of Object.keys(updates)) {
      // Find tooltip by key
      const tooltip = await getTooltipByKey(key);
      if (tooltip) {
        results.push(await updateTooltip(tooltip.id, { text: updates[key] }));
      }
    }
    return NextResponse.json({ success: true, updated: results });
  } catch (error) {
    console.error('Error updating tooltips:', error);
    return NextResponse.json(
      { error: "Failed to update tooltips" },
      { status: 500 }
    );
  }
} 