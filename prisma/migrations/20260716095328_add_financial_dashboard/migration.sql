-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "end_date" DATE,
ADD COLUMN     "start_date" DATE;

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "allocated_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_date" DATE,
    "attachment_ids" JSONB,
    "submitted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_packages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planned_start" DATE NOT NULL,
    "planned_end" DATE NOT NULL,
    "actual_start" DATE,
    "actual_end" DATE,
    "weightage_pct" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_entries" (
    "id" TEXT NOT NULL,
    "work_package_id" TEXT NOT NULL,
    "reported_date" DATE NOT NULL,
    "physical_progress_pct" DECIMAL(5,2) NOT NULL,
    "remarks" TEXT,
    "attachment_ids" JSONB,
    "reported_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_project_id_idx" ON "budgets"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_project_id_category_fiscal_year_key" ON "budgets"("project_id", "category", "fiscal_year");

-- CreateIndex
CREATE INDEX "invoices_budget_id_idx" ON "invoices"("budget_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_budget_id_invoice_number_key" ON "invoices"("budget_id", "invoice_number");

-- CreateIndex
CREATE INDEX "work_packages_project_id_idx" ON "work_packages"("project_id");

-- CreateIndex
CREATE INDEX "progress_entries_work_package_id_idx" ON "progress_entries"("work_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_entries_work_package_id_reported_date_key" ON "progress_entries"("work_package_id", "reported_date");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_work_package_id_fkey" FOREIGN KEY ("work_package_id") REFERENCES "work_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
