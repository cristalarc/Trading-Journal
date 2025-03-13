/**
 * Database configuration and utilities
 * Uses Prisma ORM for database operations
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Calculates the relevant week number for a given date
 * Week starts on Monday (1) and ends on Sunday (0)
 * Friday, Saturday, and Sunday entries are relevant for the next week
 */
export function calculateRelevantWeek(date: Date): number {
  // Get the week number (1-based, Monday as first day)
  const weekNumber = getWeekNumber(date);
  
  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();
  
  // If entry is from Friday(5), Saturday(6) or Sunday(0), it's relevant for next week
  return (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) 
    ? weekNumber + 1 
    : weekNumber;
}

/**
 * Gets the week number for a given date
 * Week starts on Monday and ends on Sunday
 */
function getWeekNumber(date: Date): number {
  // Copy date so we don't modify the original
  const d = new Date(date);
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  
  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);
  
  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return weekNumber;
} 