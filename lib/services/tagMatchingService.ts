/**
 * Tag Matching Service
 * Matches imported tag strings to existing Patterns, Strategies, Sources, and Tags
 */

import { prisma } from '@/lib/db';

export interface MatchedTag {
  originalName: string;
  matchedType: 'pattern' | 'strategy' | 'source' | 'tag' | null;
  matchedId: string | null;
  matchedName: string | null;
}

export interface UnmatchedTag {
  name: string;
  suggestedType: 'pattern' | 'strategy' | 'source' | 'tag';
}

export interface TagMatchingResult {
  matched: MatchedTag[];
  unmatched: UnmatchedTag[];
}

/**
 * Normalize a string for matching (lowercase, trim, remove special chars)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Check if two strings are similar enough to be considered a match
 */
function isSimilar(str1: string, str2: string): boolean {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  // Exact match
  if (normalized1 === normalized2) {
    return true;
  }

  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  return false;
}

/**
 * Match imported tag strings to existing database entities
 */
export async function matchTags(tagStrings: string[]): Promise<TagMatchingResult> {
  // Fetch all active entities from the database
  const [patterns, strategies, sources, tags] = await Promise.all([
    prisma.patternConfig.findMany({ where: { isActive: true } }),
    prisma.strategyConfig.findMany({ where: { isActive: true } }),
    prisma.sourceConfig.findMany({ where: { isActive: true } }),
    prisma.tagConfig.findMany({ where: { isActive: true } })
  ]);

  const matched: MatchedTag[] = [];
  const unmatched: UnmatchedTag[] = [];

  for (const tagString of tagStrings) {
    const trimmed = tagString.trim();
    if (!trimmed) continue;

    let matchFound = false;

    // Try to match against patterns first (most specific)
    for (const pattern of patterns) {
      if (isSimilar(trimmed, pattern.name)) {
        matched.push({
          originalName: trimmed,
          matchedType: 'pattern',
          matchedId: pattern.id,
          matchedName: pattern.name
        });
        matchFound = true;
        break;
      }
    }

    if (matchFound) continue;

    // Try to match against strategies
    for (const strategy of strategies) {
      if (isSimilar(trimmed, strategy.name) || isSimilar(trimmed, strategy.tagValue)) {
        matched.push({
          originalName: trimmed,
          matchedType: 'strategy',
          matchedId: strategy.id,
          matchedName: strategy.name
        });
        matchFound = true;
        break;
      }
    }

    if (matchFound) continue;

    // Try to match against sources
    for (const source of sources) {
      if (isSimilar(trimmed, source.name)) {
        matched.push({
          originalName: trimmed,
          matchedType: 'source',
          matchedId: source.id,
          matchedName: source.name
        });
        matchFound = true;
        break;
      }
    }

    if (matchFound) continue;

    // Try to match against general tags
    for (const tag of tags) {
      if (isSimilar(trimmed, tag.name)) {
        matched.push({
          originalName: trimmed,
          matchedType: 'tag',
          matchedId: tag.id,
          matchedName: tag.name
        });
        matchFound = true;
        break;
      }
    }

    // If no match found, add to unmatched list
    if (!matchFound) {
      // Suggest type based on common keywords
      const suggestedType = suggestTagType(trimmed);
      unmatched.push({
        name: trimmed,
        suggestedType
      });
    }
  }

  return { matched, unmatched };
}

/**
 * Suggest a tag type based on the tag name
 */
function suggestTagType(tagName: string): 'pattern' | 'strategy' | 'source' | 'tag' {
  const normalized = normalizeString(tagName);

  // Pattern keywords
  const patternKeywords = ['flag', 'triangle', 'wedge', 'channel', 'reversal', 'continuation', 'head', 'shoulder', 'double', 'bottom', 'top'];
  if (patternKeywords.some(keyword => normalized.includes(keyword))) {
    return 'pattern';
  }

  // Strategy keywords
  const strategyKeywords = ['breakout', 'momentum', 'scalp', 'swing', 'day trade', 'position', 'trend', 'strategy'];
  if (strategyKeywords.some(keyword => normalized.includes(keyword))) {
    return 'strategy';
  }

  // Source keywords
  const sourceKeywords = ['scanner', 'alert', 'watchlist', 'screener', 'discord', 'twitter', 'news', 'chat'];
  if (sourceKeywords.some(keyword => normalized.includes(keyword))) {
    return 'source';
  }

  // Default to generic tag
  return 'tag';
}

/**
 * Parse comma-separated tag string and match to database entities
 */
export async function parseAndMatchTags(tagString: string | undefined): Promise<TagMatchingResult> {
  if (!tagString || !tagString.trim()) {
    return { matched: [], unmatched: [] };
  }

  // Split by comma and clean up
  const tagStrings = tagString.split(',').map(s => s.trim()).filter(s => s.length > 0);

  return matchTags(tagStrings);
}

/**
 * Convert matched tags to trade setup/mistake IDs
 * Only Tags (not Patterns, Strategies, or Sources) can be used as setup/mistake tags
 */
export function matchedTagsToTradeFields(matched: MatchedTag[]): {
  setupIds: (string | null)[];
  mistakeIds: (string | null)[];
  sourceId: string | null;
  warnings: string[];
} {
  const setupIds: (string | null)[] = [];
  const mistakeIds: (string | null)[] = [];
  let sourceId: string | null = null;
  const warnings: string[] = [];

  for (const match of matched) {
    // Only tags can be used as setup/mistake tags
    if (match.matchedType === 'tag' && match.matchedId) {
      setupIds.push(match.matchedId);
    } else if (match.matchedType === 'source' && match.matchedId && !sourceId) {
      // Use the first matched source
      sourceId = match.matchedId;
    } else if (match.matchedType === 'pattern' || match.matchedType === 'strategy') {
      warnings.push(`"${match.originalName}" was matched to a ${match.matchedType} but can only be used as a tag. Consider creating a tag for it.`);
    }
  }

  return { setupIds, mistakeIds, sourceId, warnings };
}
