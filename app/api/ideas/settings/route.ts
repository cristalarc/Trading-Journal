import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET handler for retrieving ideas settings
export async function GET() {
  try {
    // Get ideas expiry config
    const expiryConfig = await prisma.ideasExpiryConfig.findFirst();
    
    // Get stock multiplier configs
    const stockMultipliers = await prisma.stockMultiplierConfig.findMany({
      orderBy: { ticker: 'asc' }
    });
    
    return NextResponse.json({
      expiryDays: expiryConfig?.expiryDays || 365,
      stockMultipliers: stockMultipliers.map(sm => ({
        id: sm.id,
        ticker: sm.ticker,
        multiplier: Number(sm.multiplier)
      }))
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching ideas settings:', error);
    return NextResponse.json(
      { error: "Failed to fetch ideas settings", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST handler for updating ideas settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expiryDays, stockMultipliers } = body;
    
    // Update or create expiry config
    if (expiryDays !== undefined) {
      await prisma.ideasExpiryConfig.upsert({
        where: { id: 'default' },
        update: { expiryDays: Number(expiryDays) },
        create: { 
          id: 'default',
          expiryDays: Number(expiryDays) 
        }
      });
    }
    
    // Update stock multipliers
    if (stockMultipliers && Array.isArray(stockMultipliers)) {
      // Delete existing multipliers
      await prisma.stockMultiplierConfig.deleteMany();
      
      // Create new ones
      if (stockMultipliers.length > 0) {
        await prisma.stockMultiplierConfig.createMany({
          data: stockMultipliers.map((sm: any) => ({
            ticker: sm.ticker,
            multiplier: Number(sm.multiplier)
          }))
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error updating ideas settings:', error);
    return NextResponse.json(
      { error: "Failed to update ideas settings", details: errorMessage },
      { status: 500 }
    );
  }
}
