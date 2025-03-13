// Enum for timeframe options
export enum Timeframe {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
}

// Enum for direction options
export enum Direction {
  BULLISH = "bullish",
  BEARISH = "bearish",
}

// Enum for sentiment type options
export enum SentimentType {
  TECHNICAL = "technical",
  FUNDAMENTAL = "fundamental",
}

// Enum for retrospective outcome
export enum RetrospectiveOutcome {
  WIN = "win",
  LOSE = "lose",
  PENDING = "pending",
}

// Interface for journal entry
export interface JournalEntry {
  id: string;
  entryDate: Date;
  relevantWeek: number; // Calculated based on entry date
  ticker: string;
  currentPrice: number;
  timeframe: Timeframe;
  direction: Direction;
  sentiment: Direction; // Using same enum as Direction
  sentimentType: SentimentType;
  governingPattern: string;
  keySupportLevel: number | null;
  keyResistanceLevel: number | null;
  comments: string;
  weeklyOnePagerToggle: boolean;
  isFollowUpToOpenTrade: boolean;
  retrospective7D: RetrospectiveOutcome;
  retrospective30D: RetrospectiveOutcome;
  updates: JournalEntryUpdate[];
}

// Interface for journal entry updates
export interface JournalEntryUpdate {
  id: string;
  journalEntryId: string;
  updateDate: Date;
  comments: string;
} 