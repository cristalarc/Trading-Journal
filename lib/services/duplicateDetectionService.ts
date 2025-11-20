import type { Trade, TradeSubOrder } from '@prisma/client';
import { PositionService } from './positionService';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingTrade?: Trade & { subOrders: TradeSubOrder[] };
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
}

export interface MergeWarning {
  title: string;
  message: string;
  existingTradeDate: Date;
  importTradeDate: Date;
  existingTradeData: {
    ticker: string;
    size: number;
    openDate: Date;
    closeDate?: Date | null;
    avgBuy?: number;
    avgSell?: number;
    status: string;
  };
  importTradeData: {
    ticker: string;
    size: number;
    openDate: Date;
    closeDate?: Date | null;
    avgBuy?: number;
    avgSell?: number;
  };
  recommendedAction: 'merge' | 'skip' | 'create_new';
}

/**
 * Duplicate Detection Service
 * Handles detection of duplicate trades during imports
 */
export class DuplicateDetectionService {
  /**
   * Find potential duplicates for an import
   * Checks against trades in the same portfolio with similar dates
   */
  static async findPotentialDuplicates(
    ticker: string,
    portfolioId: string,
    openDate: Date,
    importSource?: string
  ): Promise<Trade[]> {
    return PositionService.findPotentialDuplicateTrades(
      ticker,
      portfolioId,
      openDate,
      2 // 2-day tolerance
    );
  }

  /**
   * Compare import data with existing trade to determine if it's a duplicate
   */
  static compareImportData(
    newImport: {
      ticker: string;
      size: number;
      openDate: Date;
      closeDate?: Date | null;
      avgBuy?: number;
      avgSell?: number;
      importSource?: string;
      importData?: any;
    },
    existingTrade: Trade & { subOrders?: TradeSubOrder[] }
  ): DuplicateCheckResult {
    const ticker = newImport.ticker.toUpperCase();
    const existingTicker = existingTrade.ticker.toUpperCase();

    // Must be same ticker
    if (ticker !== existingTicker) {
      return {
        isDuplicate: false,
        confidence: 'low',
        reason: 'Different ticker'
      };
    }

    // Check if dates match (within 24 hours)
    const openDateMatch = this.datesWithinTolerance(
      newImport.openDate,
      existingTrade.openDate,
      24 * 60 * 60 * 1000 // 24 hours in ms
    );

    // Check import source data if available
    if (newImport.importData && existingTrade.importData) {
      const isSameImportSource = this.compareImportSources(
        newImport.importData,
        existingTrade.importData as any
      );

      if (isSameImportSource) {
        return {
          isDuplicate: true,
          existingTrade: existingTrade as any,
          confidence: 'high',
          reason: 'Same import source data detected'
        };
      }
    }

    // If open dates match exactly
    if (openDateMatch) {
      // Check sizes
      const sizeMatch = Math.abs(newImport.size - existingTrade.size.toNumber()) < 0.01;

      // Check prices if available
      let priceMatch = false;
      if (newImport.avgBuy && existingTrade.avgBuy) {
        const existingAvgBuy = existingTrade.avgBuy.toNumber();
        priceMatch = Math.abs(newImport.avgBuy - existingAvgBuy) < 0.01;
      }

      if (sizeMatch && priceMatch) {
        return {
          isDuplicate: true,
          existingTrade: existingTrade as any,
          confidence: 'high',
          reason: 'Same open date, size, and entry price'
        };
      }

      if (sizeMatch) {
        return {
          isDuplicate: true,
          existingTrade: existingTrade as any,
          confidence: 'medium',
          reason: 'Same open date and size'
        };
      }

      return {
        isDuplicate: true,
        existingTrade: existingTrade as any,
        confidence: 'low',
        reason: 'Same open date but different details'
      };
    }

    return {
      isDuplicate: false,
      confidence: 'low',
      reason: 'No significant match'
    };
  }

  /**
   * Determine if we should merge with existing trade
   * This is used when importing a closed trade that matches an open position
   */
  static shouldMergeWithExisting(
    newImport: {
      ticker: string;
      size: number;
      openDate: Date;
      closeDate?: Date | null;
      avgBuy?: number;
      avgSell?: number;
    },
    existingTrade: Trade
  ): {
    shouldMerge: boolean;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    // If existing trade is OPEN and import has closeDate, likely an update
    if (existingTrade.status === 'OPEN' && newImport.closeDate) {
      const ticker = newImport.ticker.toUpperCase();
      const existingTicker = existingTrade.ticker.toUpperCase();

      if (ticker !== existingTicker) {
        return {
          shouldMerge: false,
          reason: 'Different ticker',
          confidence: 'high'
        };
      }

      // Check if open dates are within tolerance
      const openDateMatch = this.datesWithinTolerance(
        newImport.openDate,
        existingTrade.openDate,
        24 * 60 * 60 * 1000
      );

      if (openDateMatch) {
        return {
          shouldMerge: true,
          reason: 'Open trade matches imported closed trade - likely an update with exit data',
          confidence: 'high'
        };
      }

      return {
        shouldMerge: false,
        reason: 'Open dates do not match',
        confidence: 'medium'
      };
    }

    // If both are closed, check for exact duplicate
    if (existingTrade.status !== 'OPEN' && newImport.closeDate) {
      const duplicate = this.compareImportData(newImport, existingTrade);
      return {
        shouldMerge: duplicate.isDuplicate,
        reason: duplicate.reason || 'Duplicate closed trade',
        confidence: duplicate.confidence
      };
    }

    return {
      shouldMerge: false,
      reason: 'No match criteria met',
      confidence: 'low'
    };
  }

  /**
   * Generate a user-friendly warning message for potential duplicates
   */
  static generateMergeWarning(
    newImport: {
      ticker: string;
      size: number;
      openDate: Date;
      closeDate?: Date | null;
      avgBuy?: number;
      avgSell?: number;
    },
    existingTrade: Trade
  ): MergeWarning {
    const shouldMerge = this.shouldMergeWithExisting(newImport, existingTrade);

    let title = '';
    let message = '';
    let recommendedAction: 'merge' | 'skip' | 'create_new' = 'skip';

    if (shouldMerge.shouldMerge && existingTrade.status === 'OPEN' && newImport.closeDate) {
      title = 'Update Open Trade with Exit Data?';
      message = `An open trade for ${newImport.ticker} already exists with the same open date. The imported data includes exit information. Do you want to update the existing trade with the exit data?`;
      recommendedAction = 'merge';
    } else if (shouldMerge.shouldMerge) {
      title = 'Duplicate Trade Detected';
      message = `A trade for ${newImport.ticker} with the same details already exists. This appears to be a duplicate import.`;
      recommendedAction = 'skip';
    } else {
      title = 'Similar Trade Found';
      message = `A similar trade for ${newImport.ticker} was found, but details don't match exactly.`;
      recommendedAction = 'create_new';
    }

    return {
      title,
      message,
      existingTradeDate: existingTrade.openDate,
      importTradeDate: newImport.openDate,
      existingTradeData: {
        ticker: existingTrade.ticker,
        size: existingTrade.size.toNumber(),
        openDate: existingTrade.openDate,
        closeDate: existingTrade.closeDate,
        avgBuy: existingTrade.avgBuy?.toNumber(),
        avgSell: existingTrade.avgSell?.toNumber(),
        status: existingTrade.status
      },
      importTradeData: {
        ticker: newImport.ticker,
        size: newImport.size,
        openDate: newImport.openDate,
        closeDate: newImport.closeDate,
        avgBuy: newImport.avgBuy,
        avgSell: newImport.avgSell
      },
      recommendedAction
    };
  }

  /**
   * Check if two dates are within tolerance (in milliseconds)
   */
  private static datesWithinTolerance(
    date1: Date,
    date2: Date,
    toleranceMs: number
  ): boolean {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return diff <= toleranceMs;
  }

  /**
   * Compare import source data for exact matches
   * This helps detect if the same CSV/file was imported twice
   */
  private static compareImportSources(
    importData1: any,
    importData2: any
  ): boolean {
    if (!importData1 || !importData2) {
      return false;
    }

    // Check for Tradersync-specific fields
    if (importData1.tradersyncId && importData2.tradersyncId) {
      return importData1.tradersyncId === importData2.tradersyncId;
    }

    // Check for ThinkOrSwim-specific fields
    if (importData1.tosOrderId && importData2.tosOrderId) {
      return importData1.tosOrderId === importData2.tosOrderId;
    }

    // Generic comparison - check if key fields match
    const fieldsToCompare = ['orderId', 'tradeId', 'executionId', 'referenceId'];
    for (const field of fieldsToCompare) {
      if (importData1[field] && importData2[field]) {
        return importData1[field] === importData2[field];
      }
    }

    return false;
  }

  /**
   * Batch check for duplicates across multiple imports
   * Returns a map of import index to duplicate check results
   */
  static async batchCheckDuplicates(
    imports: Array<{
      ticker: string;
      size: number;
      openDate: Date;
      closeDate?: Date | null;
      avgBuy?: number;
      avgSell?: number;
      importSource?: string;
      importData?: any;
    }>,
    portfolioId: string
  ): Promise<Map<number, DuplicateCheckResult>> {
    const results = new Map<number, DuplicateCheckResult>();

    for (let i = 0; i < imports.length; i++) {
      const importItem = imports[i];
      const potentialDuplicates = await this.findPotentialDuplicates(
        importItem.ticker,
        portfolioId,
        importItem.openDate,
        importItem.importSource
      );

      let bestMatch: DuplicateCheckResult = {
        isDuplicate: false,
        confidence: 'low'
      };

      for (const existing of potentialDuplicates) {
        const checkResult = this.compareImportData(importItem, existing as any);

        // Keep the highest confidence match
        if (checkResult.isDuplicate) {
          if (!bestMatch.isDuplicate || checkResult.confidence === 'high') {
            bestMatch = checkResult;
          }
        }
      }

      results.set(i, bestMatch);
    }

    return results;
  }
}

export default DuplicateDetectionService;
