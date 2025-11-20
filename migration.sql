-- DropForeignKey
ALTER TABLE "trades" DROP CONSTRAINT "trades_portfolio_id_fkey";

-- DropIndex
DROP INDEX "trades_portfolio_id_idx";

-- DropIndex
DROP INDEX "trades_portfolio_id_ticker_status_idx";

-- AlterTable
ALTER TABLE "trades" DROP COLUMN "execution_count",
DROP COLUMN "last_modified_date",
DROP COLUMN "original_open_date",
DROP COLUMN "portfolio_id";

-- DropTable
DROP TABLE "portfolios";

