/**
 * Journal Entry Service
 * Provides functions for CRUD operations on journal entries
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Get all journal entries with optional filtering
 */
export async function getAllJournalEntries(options?: {
  timeframeId?: string;
  patternId?: string;
  ticker?: string;
  direction?: 'Bullish' | 'Bearish';
  sentiment?: 'Bullish' | 'Neutral' | 'Bearish';
}) {
  // Build filter conditions based on provided options
  const where: Prisma.JournalEntryWhereInput = {};
  
  if (options?.timeframeId) {
    where.timeframeId = options.timeframeId;
  }
  
  if (options?.patternId) {
    where.patternId = options.patternId;
  }
  
  if (options?.ticker) {
    where.ticker = {
      contains: options.ticker,
      mode: 'insensitive'
    };
  }
  
  if (options?.direction) {
    where.direction = options.direction;
  }
  
  if (options?.sentiment) {
    where.sentiment = options.sentiment;
  }
  
  // Fetch entries with related timeframe and pattern data
  return prisma.journalEntry.findMany({
    where,
    include: {
      timeframe: true,
      pattern: true
    },
    orderBy: {
      entryDate: 'desc'
    }
  });
}

/**
 * Get a journal entry by ID
 */
export async function getJournalEntryById(id: string) {
  return prisma.journalEntry.findUnique({
    where: { id },
    include: {
      timeframe: true,
      pattern: true
    }
  });
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(data: any) {
  try {
    // Validate required fields based on schema
    if (!data.ticker) {
      throw new Error('Ticker is required');
    }

    if (!data.entryDate) {
      throw new Error('Entry date is required');
    }

    if (!data.price && data.price !== 0) {
      throw new Error('Price is required');
    }

    if (!data.direction) {
      throw new Error('Direction is required');
    }

    if (!data.sentiment) {
      throw new Error('Sentiment is required');
    }

    // Convert decimal fields to Prisma Decimal properly
    const formattedData: any = {
      // Include only fields that exist in the Prisma schema
      entryDate: data.entryDate,
      ticker: data.ticker,
      
      // Ensure price is properly formatted
      price: typeof data.price === 'string' 
        ? new Prisma.Decimal(data.price) 
        : typeof data.price === 'number' 
          ? new Prisma.Decimal(data.price.toString())
          : data.price,
          
      direction: data.direction,
      sentiment: data.sentiment,
      comments: data.comments,
      isWeeklyOnePagerEligible: data.isWeeklyOnePagerEligible,
      retro7DStatus: data.retro7DStatus,
      retro30DStatus: data.retro30DStatus,
      
      // Format optional decimal fields if present
      support: data.support 
        ? typeof data.support === 'string'
          ? new Prisma.Decimal(data.support)
          : typeof data.support === 'number'
            ? new Prisma.Decimal(data.support.toString())
            : data.support
        : undefined,
      
      resistance: data.resistance
        ? typeof data.resistance === 'string'
          ? new Prisma.Decimal(data.resistance)
          : typeof data.resistance === 'number'
            ? new Prisma.Decimal(data.resistance.toString())
            : data.resistance
        : undefined,
        
      // Note: relevantWeek is not included because it's not in the schema
    };
    
    // Handle relations properly
    if (data.timeframeId) {
      formattedData.timeframe = {
        connect: { id: data.timeframeId }
      };
    }
    
    if (data.patternId) {
      formattedData.pattern = {
        connect: { id: data.patternId }
      };
    }
    
    console.log('Creating journal entry with formatted data:', formattedData);

    // Create the journal entry
    return prisma.journalEntry.create({
      data: formattedData,
      include: {
        timeframe: true,
        pattern: true
      }
    });
  } catch (error: unknown) {
    console.error('Error in createJournalEntry:', error);
    
    // Enhance error message for relation errors
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      if (error.message.includes('timeframeId')) {
        throw new Error('Invalid timeframe selected');
      }
      if (error.message.includes('patternId')) {
        throw new Error('Invalid pattern selected');
      }
    }
    
    throw error;
  }
}

/**
 * Update an existing journal entry
 */
export async function updateJournalEntry(id: string, data: Prisma.JournalEntryUpdateInput) {
  return prisma.journalEntry.update({
    where: { id },
    data,
    include: {
      timeframe: true,
      pattern: true
    }
  });
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string) {
  return prisma.journalEntry.delete({
    where: { id }
  });
}

/**
 * Get count of overdue retrospectives
 */
export async function getOverdueRetrospectivesCount() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return prisma.journalEntry.count({
    where: {
      OR: [
        {
          entryDate: { lte: sevenDaysAgo },
          retro7DStatus: 'pending'
        },
        {
          entryDate: { lte: thirtyDaysAgo },
          retro30DStatus: 'pending'
        }
      ]
    }
  });
}

/**
 * Update retrospective status for a journal entry
 */
export async function updateRetrospective(
  id: string, 
  type: '7d' | '30d', 
  data: { 
    status: 'completed' | 'pending', 
    outcome?: 'win' | 'loss', 
    notes?: string 
  }
) {
  const updateData: any = {};
  
  if (type === '7d') {
    updateData.retro7DStatus = data.status;
    updateData.retro7DOutcome = data.outcome;
    updateData.retro7DNotes = data.notes;
    updateData.retro7DCompletedAt = data.status === 'completed' ? new Date() : null;
  } else {
    updateData.retro30DStatus = data.status;
    updateData.retro30DOutcome = data.outcome;
    updateData.retro30DNotes = data.notes;
    updateData.retro30DCompletedAt = data.status === 'completed' ? new Date() : null;
  }
  
  return prisma.journalEntry.update({
    where: { id },
    data: updateData
  });
} 