-- AlterEnum: Remove 'inactive' from IdeaStatus enum
-- First, update any existing 'inactive' ideas to 'expired'
UPDATE "ideas" SET "status" = 'expired' WHERE "status" = 'inactive';

-- Drop the default temporarily
ALTER TABLE "ideas" ALTER COLUMN "status" DROP DEFAULT;

-- Then, alter the enum type by creating a new one and switching over
ALTER TYPE "IdeaStatus" RENAME TO "IdeaStatus_old";
CREATE TYPE "IdeaStatus" AS ENUM ('active', 'expired');
ALTER TABLE "ideas" ALTER COLUMN "status" TYPE "IdeaStatus" USING "status"::text::"IdeaStatus";
DROP TYPE "IdeaStatus_old";

-- Restore the default
ALTER TABLE "ideas" ALTER COLUMN "status" SET DEFAULT 'active';
