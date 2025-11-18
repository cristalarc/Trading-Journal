import { NextResponse } from "next/server";
import { 
  getAllIdeas, 
  createIdea, 
  getIdeasStats,
  markExpiredIdeas,
  type IdeaFilters
} from "@/lib/services/ideaService";

// GET handler for retrieving all ideas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const filters: IdeaFilters = {
      ticker: searchParams.get('ticker') || undefined,
      status: searchParams.get('status') as 'active' | 'expired' | undefined,
      strategyId: searchParams.get('strategyId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      quality: searchParams.get('quality') as 'HQ' | 'MQ' | 'LQ' | undefined,
      tradeDirection: searchParams.get('tradeDirection') as 'Long' | 'Short' | undefined,
      market: searchParams.get('market') as 'Bullish' | 'Bearish' | undefined
    };

    // Check if this is a stats request
    if (searchParams.get('stats') === 'true') {
      const stats = await getIdeasStats();
      return NextResponse.json(stats);
    }

    // Check if this is a request to mark expired ideas
    if (searchParams.get('markExpired') === 'true') {
      const result = await markExpiredIdeas();
      return NextResponse.json(result);
    }
    
    // Get ideas with filters
    const ideas = await getAllIdeas(filters);
    
    return NextResponse.json(ideas);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: "Failed to fetch ideas", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST handler for creating a new idea
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Received idea request body:', body);
    
    // Set default date if not provided
    if (!body.date) {
      body.date = new Date().toISOString();
    }
    
    // Validate required fields
    const requiredFields = [
      'ticker', 'currentPrice', 'targetEntry', 'targetPrice', 'stop', 
      'tradeDirection', 'market', 'relative', 'oneHourTrend', 'oneHourCloud',
      'intendedPosition', 'quality'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: "Missing required field", details: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate numeric fields
    const numericFields = ['currentPrice', 'targetEntry', 'targetPrice', 'stop', 'relative', 'intendedPosition'];
    for (const field of numericFields) {
      if (isNaN(Number(body[field]))) {
        return NextResponse.json(
          { error: "Invalid numeric value", details: `Field '${field}' must be a valid number` },
          { status: 400 }
        );
      }
    }
    
    // Convert numeric fields and handle optional foreign keys
    const processedBody = {
      ...body,
      currentPrice: Number(body.currentPrice),
      targetEntry: Number(body.targetEntry),
      targetPrice: Number(body.targetPrice),
      stop: Number(body.stop),
      relative: Number(body.relative),
      intendedPosition: Number(body.intendedPosition),
      // Convert empty strings to null for optional foreign keys
      strategyId: body.strategyId && body.strategyId.trim() !== '' ? body.strategyId : null,
      sourceId: body.sourceId && body.sourceId.trim() !== '' ? body.sourceId : null
    };
    
    console.log('Attempting to create idea with data:', processedBody);
    
    try {
      // Create new idea
      const newIdea = await createIdea(processedBody);
      console.log('Created idea successfully:', newIdea);
      return NextResponse.json(newIdea, { status: 201 });
    } catch (dbError: unknown) {
      // Enhanced error for database operations
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      console.error('Database error creating idea:', dbError);
      
      // Check for common Prisma errors
      const errorString = String(dbError);
      
      // Handle specific Prisma validation errors
      if (errorString.includes('Unknown argument')) {
        return NextResponse.json(
          { 
            error: "Failed to create idea", 
            details: "Database schema error: The request contains invalid field names. This is likely a bug in our code. Please try again or contact support if the issue persists."
          },
          { status: 500 }
        );
      }
      
      // Handle foreign key constraint errors
      if (errorString.includes('Foreign key constraint failed')) {
        return NextResponse.json(
          { 
            error: "Failed to create idea", 
            details: "The selected strategy or source doesn't exist. Please select valid options."
          },
          { status: 400 }
        );
      }
      
      // Other Prisma errors
      const isPrismaError = errorString.includes('Prisma');
      const detailedMessage = isPrismaError 
        ? `Database error: ${errorMessage}`
        : `Error creating idea: ${errorMessage}`;
        
      return NextResponse.json(
        { error: "Failed to create idea", details: detailedMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // This catches JSON parsing errors and other request-level issues
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Request error creating idea:', error);
    
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 400 }
    );
  }
}
