-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('Bullish', 'Bearish');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('Bullish', 'Neutral', 'Bearish');

-- CreateEnum
CREATE TYPE "RetroStatus" AS ENUM ('pending', 'completed', 'overdue');

-- CreateEnum
CREATE TYPE "RetroOutcome" AS ENUM ('win', 'loss');

-- CreateTable
CREATE TABLE "timeframe_configs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeframe_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_configs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pattern_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tooltip_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" VARCHAR(50) NOT NULL,
    "max_length" INTEGER NOT NULL DEFAULT 50,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tooltip_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "timeframe_id" TEXT,
    "direction" "Direction" NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "pattern_id" TEXT,
    "support" DECIMAL(10,2),
    "resistance" DECIMAL(10,2),
    "comments" TEXT,
    "is_weekly_one_pager_eligible" BOOLEAN NOT NULL DEFAULT false,
    "retro_7d_status" "RetroStatus" NOT NULL DEFAULT 'pending',
    "retro_7d_completed_at" TIMESTAMP(3),
    "retro_7d_outcome" "RetroOutcome",
    "retro_7d_notes" TEXT,
    "retro_30d_status" "RetroStatus" NOT NULL DEFAULT 'pending',
    "retro_30d_completed_at" TIMESTAMP(3),
    "retro_30d_outcome" "RetroOutcome",
    "retro_30d_notes" TEXT,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tooltip_configs_key_key" ON "tooltip_configs"("key");

-- CreateIndex
CREATE INDEX "journal_entries_entry_date_idx" ON "journal_entries"("entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_ticker_idx" ON "journal_entries"("ticker");

-- CreateIndex
CREATE INDEX "journal_entries_timeframe_id_idx" ON "journal_entries"("timeframe_id");

-- CreateIndex
CREATE INDEX "journal_entries_pattern_id_idx" ON "journal_entries"("pattern_id");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_timeframe_id_fkey" FOREIGN KEY ("timeframe_id") REFERENCES "timeframe_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "pattern_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
