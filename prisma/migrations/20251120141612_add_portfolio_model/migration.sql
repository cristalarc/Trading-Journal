-- CreateTable: portfolios
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolios_is_default_idx" ON "portfolios"("is_default");
CREATE INDEX "portfolios_is_archived_idx" ON "portfolios"("is_archived");

-- Insert default "Main" portfolio
INSERT INTO "portfolios" ("id", "name", "description", "is_default", "updated_at")
VALUES (gen_random_uuid(), 'Main', 'Default trading portfolio', true, CURRENT_TIMESTAMP);

-- AddColumn: portfolio_id to trades (nullable first)
ALTER TABLE "trades" ADD COLUMN "portfolio_id" TEXT;

-- AddColumn: position tracking fields to trades
ALTER TABLE "trades" ADD COLUMN "original_open_date" TIMESTAMP(3);
ALTER TABLE "trades" ADD COLUMN "last_modified_date" TIMESTAMP(3);
ALTER TABLE "trades" ADD COLUMN "execution_count" INTEGER NOT NULL DEFAULT 0;

-- Set portfolio_id for existing trades to the default portfolio
UPDATE "trades"
SET "portfolio_id" = (SELECT "id" FROM "portfolios" WHERE "is_default" = true LIMIT 1)
WHERE "portfolio_id" IS NULL;

-- Set original_open_date to openDate for existing trades
UPDATE "trades"
SET "original_open_date" = "open_date"
WHERE "original_open_date" IS NULL;

-- Make portfolio_id NOT NULL
ALTER TABLE "trades" ALTER COLUMN "portfolio_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "trades_portfolio_id_idx" ON "trades"("portfolio_id");
CREATE INDEX "trades_portfolio_id_ticker_status_idx" ON "trades"("portfolio_id", "ticker", "status");
