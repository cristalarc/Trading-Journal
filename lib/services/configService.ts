/**
 * Configuration Service
 * Provides functions for managing configuration entities like timeframes, patterns, and tooltips
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Get all active timeframe configurations
 */
export async function getTimeframes() {
  return prisma.timeframeConfig.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });
}

/**
 * Get a timeframe by ID
 */
export async function getTimeframeById(id: string) {
  return prisma.timeframeConfig.findUnique({
    where: { id }
  });
}

/**
 * Create a new timeframe configuration
 */
export async function createTimeframe(data: Prisma.TimeframeConfigCreateInput) {
  return prisma.timeframeConfig.create({
    data
  });
}

/**
 * Update an existing timeframe configuration
 */
export async function updateTimeframe(id: string, data: Prisma.TimeframeConfigUpdateInput) {
  return prisma.timeframeConfig.update({
    where: { id },
    data
  });
}

/**
 * Delete a timeframe configuration
 * Note: This will fail if there are journal entries using this timeframe
 */
export async function deleteTimeframe(id: string) {
  return prisma.timeframeConfig.delete({
    where: { id }
  });
}

/**
 * Get all active pattern configurations
 */
export async function getPatterns() {
  return prisma.patternConfig.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });
}

/**
 * Get a pattern by ID
 */
export async function getPatternById(id: string) {
  return prisma.patternConfig.findUnique({
    where: { id }
  });
}

/**
 * Create a new pattern configuration
 */
export async function createPattern(data: Prisma.PatternConfigCreateInput) {
  return prisma.patternConfig.create({
    data
  });
}

/**
 * Update an existing pattern configuration
 */
export async function updatePattern(id: string, data: Prisma.PatternConfigUpdateInput) {
  return prisma.patternConfig.update({
    where: { id },
    data
  });
}

/**
 * Delete a pattern configuration
 * Note: This will fail if there are journal entries using this pattern
 */
export async function deletePattern(id: string) {
  return prisma.patternConfig.delete({
    where: { id }
  });
}

/**
 * Get all tooltip configurations
 */
export async function getTooltips() {
  return prisma.tooltipConfig.findMany();
}

/**
 * Get a tooltip by key
 */
export async function getTooltipByKey(key: string) {
  return prisma.tooltipConfig.findUnique({
    where: { key }
  });
}

/**
 * Create a new tooltip configuration
 */
export async function createTooltip(data: Prisma.TooltipConfigCreateInput) {
  return prisma.tooltipConfig.create({
    data
  });
}

/**
 * Update an existing tooltip configuration
 */
export async function updateTooltip(id: string, data: Prisma.TooltipConfigUpdateInput) {
  return prisma.tooltipConfig.update({
    where: { id },
    data
  });
}

/**
 * Delete a tooltip configuration
 */
export async function deleteTooltip(id: string) {
  return prisma.tooltipConfig.delete({
    where: { id }
  });
} 