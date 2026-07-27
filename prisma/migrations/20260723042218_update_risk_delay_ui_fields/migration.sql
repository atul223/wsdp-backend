-- AlterTable
ALTER TABLE "delays" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "risks" ADD COLUMN     "owner_name" TEXT;
