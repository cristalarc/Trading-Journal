import { prisma } from '@/lib/db';
import type { Portfolio } from '@prisma/client';

export interface CreatePortfolioData {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface UpdatePortfolioData {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * Portfolio Service
 * Handles CRUD operations for trading portfolios
 */
export class PortfolioService {
  /**
   * Get all portfolios (excluding archived unless specified)
   */
  static async getAllPortfolios(includeArchived = false): Promise<Portfolio[]> {
    return prisma.portfolio.findMany({
      where: includeArchived ? {} : { isArchived: false },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { trades: true }
        }
      }
    });
  }

  /**
   * Get a single portfolio by ID
   */
  static async getPortfolioById(id: string): Promise<Portfolio | null> {
    return prisma.portfolio.findUnique({
      where: { id },
      include: {
        _count: {
          select: { trades: true }
        }
      }
    });
  }

  /**
   * Get the default portfolio
   */
  static async getDefaultPortfolio(): Promise<Portfolio | null> {
    return prisma.portfolio.findFirst({
      where: {
        isDefault: true,
        isArchived: false
      }
    });
  }

  /**
   * Create a new portfolio
   */
  static async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    // If this is set as default, unset all other defaults first
    if (data.isDefault) {
      await prisma.portfolio.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    return prisma.portfolio.create({
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault ?? false
      }
    });
  }

  /**
   * Update a portfolio
   */
  static async updatePortfolio(
    id: string,
    data: UpdatePortfolioData
  ): Promise<Portfolio> {
    // If setting as default, unset all other defaults first
    if (data.isDefault) {
      await prisma.portfolio.updateMany({
        where: {
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    return prisma.portfolio.update({
      where: { id },
      data
    });
  }

  /**
   * Delete or archive a portfolio
   * - If portfolio has trades: archive it (soft delete)
   * - If portfolio has no trades: delete it permanently
   */
  static async deletePortfolio(id: string): Promise<{
    deleted: boolean;
    archived: boolean;
    message: string
  }> {
    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        _count: {
          select: { trades: true }
        }
      }
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Prevent deleting the default portfolio
    if (portfolio.isDefault) {
      throw new Error('Cannot delete the default portfolio. Set another portfolio as default first.');
    }

    // If portfolio has trades, archive it
    if (portfolio._count.trades > 0) {
      await prisma.portfolio.update({
        where: { id },
        data: { isArchived: true }
      });

      return {
        deleted: false,
        archived: true,
        message: `Portfolio "${portfolio.name}" has ${portfolio._count.trades} trade(s) and has been archived instead of deleted.`
      };
    }

    // If portfolio has no trades, delete it permanently
    await prisma.portfolio.delete({
      where: { id }
    });

    return {
      deleted: true,
      archived: false,
      message: `Portfolio "${portfolio.name}" has been permanently deleted.`
    };
  }

  /**
   * Set a portfolio as the default
   */
  static async setDefaultPortfolio(id: string): Promise<Portfolio> {
    // Unset all other defaults
    await prisma.portfolio.updateMany({
      where: {
        isDefault: true,
        id: { not: id }
      },
      data: { isDefault: false }
    });

    // Set this one as default
    return prisma.portfolio.update({
      where: { id },
      data: { isDefault: true }
    });
  }

  /**
   * Restore an archived portfolio
   */
  static async restorePortfolio(id: string): Promise<Portfolio> {
    return prisma.portfolio.update({
      where: { id },
      data: { isArchived: false }
    });
  }

  /**
   * Get portfolio statistics
   */
  static async getPortfolioStats(id: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        trades: {
          include: {
            subOrders: true
          }
        }
      }
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const totalTrades = portfolio.trades.length;
    const openTrades = portfolio.trades.filter(t => t.status === 'OPEN').length;
    const closedTrades = portfolio.trades.filter(t => ['CLOSED', 'WIN', 'LOSS'].includes(t.status)).length;
    const winTrades = portfolio.trades.filter(t => t.status === 'WIN').length;
    const lossTrades = portfolio.trades.filter(t => t.status === 'LOSS').length;

    const totalNetReturn = portfolio.trades
      .filter(t => t.netReturn !== null)
      .reduce((sum, t) => sum + Number(t.netReturn), 0);

    const winRate = closedTrades > 0 ? (winTrades / closedTrades) * 100 : 0;

    return {
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      totalTrades,
      openTrades,
      closedTrades,
      winTrades,
      lossTrades,
      winRate: winRate.toFixed(2),
      totalNetReturn: totalNetReturn.toFixed(2)
    };
  }

  /**
   * Ensure a default portfolio exists
   * If no default exists, create one called "Main"
   */
  static async ensureDefaultPortfolio(): Promise<Portfolio> {
    let defaultPortfolio = await this.getDefaultPortfolio();

    if (!defaultPortfolio) {
      // Check if ANY portfolio exists
      const anyPortfolio = await prisma.portfolio.findFirst({
        where: { isArchived: false }
      });

      if (anyPortfolio) {
        // Set the first active portfolio as default
        defaultPortfolio = await this.setDefaultPortfolio(anyPortfolio.id);
      } else {
        // Create a new default portfolio
        defaultPortfolio = await this.createPortfolio({
          name: 'Main',
          description: 'Default trading portfolio',
          isDefault: true
        });
      }
    }

    return defaultPortfolio;
  }
}

export default PortfolioService;
