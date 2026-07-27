/*
  Warnings:

  - You are about to drop the `allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budgets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "allocations" DROP CONSTRAINT "allocations_resource_id_fkey";

-- DropForeignKey
ALTER TABLE "allocations" DROP CONSTRAINT "allocations_work_package_id_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_project_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_budget_id_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_project_id_fkey";

-- DropTable
DROP TABLE "allocations";

-- DropTable
DROP TABLE "budgets";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "resources";

-- CreateTable
CREATE TABLE "ehs_incidents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "incident_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reported_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ehs_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehs_inspections" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "inspection_date" DATE NOT NULL,
    "score_pct" DECIMAL(5,2),
    "remarks" TEXT,
    "inspected_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ehs_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehs_checklist_items" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "item_description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due_date" DATE,

    CONSTRAINT "ehs_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "probability" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "owner_id" TEXT NOT NULL,
    "identified_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delays" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "work_package_id" TEXT,
    "reason" TEXT NOT NULL,
    "days_delayed" INTEGER NOT NULL,
    "root_cause" TEXT,
    "mitigation_plan" TEXT,
    "reported_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ehs_incidents_project_id_idx" ON "ehs_incidents"("project_id");

-- CreateIndex
CREATE INDEX "ehs_inspections_project_id_idx" ON "ehs_inspections"("project_id");

-- CreateIndex
CREATE INDEX "ehs_checklist_items_inspection_id_idx" ON "ehs_checklist_items"("inspection_id");

-- CreateIndex
CREATE INDEX "risks_project_id_idx" ON "risks"("project_id");

-- CreateIndex
CREATE INDEX "delays_project_id_idx" ON "delays"("project_id");

-- CreateIndex
CREATE INDEX "delays_work_package_id_idx" ON "delays"("work_package_id");

-- AddForeignKey
ALTER TABLE "ehs_incidents" ADD CONSTRAINT "ehs_incidents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehs_inspections" ADD CONSTRAINT "ehs_inspections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehs_checklist_items" ADD CONSTRAINT "ehs_checklist_items_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "ehs_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delays" ADD CONSTRAINT "delays_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delays" ADD CONSTRAINT "delays_work_package_id_fkey" FOREIGN KEY ("work_package_id") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
