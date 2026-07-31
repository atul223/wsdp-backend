/*
  Warnings:

  - A unique constraint covering the columns `[project_id,ipc]` on the table `ipcs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "amendments" ADD COLUMN     "amendment_date" DATE,
ADD COLUMN     "scope" TEXT,
ALTER COLUMN "subject" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ipcs" ADD COLUMN     "ace_status" TEXT,
ADD COLUMN     "aoa_amount" DECIMAL(18,2),
ADD COLUMN     "client_status" TEXT,
ADD COLUMN     "percentage" DECIMAL(5,2),
ADD COLUMN     "period" TEXT,
ADD COLUMN     "usd_amount" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "bank_guarantees" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "guarantee" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "usd_amount" DECIMAL(18,2) NOT NULL,
    "valid_until" DATE,
    "status" TEXT NOT NULL DEFAULT 'valid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bank_guarantees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_guarantees_project_id_idx" ON "bank_guarantees"("project_id");

-- CreateIndex
CREATE INDEX "bank_guarantees_status_idx" ON "bank_guarantees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ipcs_project_id_ipc_key" ON "ipcs"("project_id", "ipc");

-- AddForeignKey
ALTER TABLE "bank_guarantees" ADD CONSTRAINT "bank_guarantees_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
