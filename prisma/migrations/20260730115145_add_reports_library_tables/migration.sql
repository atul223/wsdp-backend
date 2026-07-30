-- CreateTable
CREATE TABLE "periodic_reports" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "latest_issue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "periodic_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipcs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "ipc" TEXT NOT NULL,
    "ipc_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ipcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amendments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "amendment" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "amendments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "method_statements" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "method_statement" TEXT NOT NULL,
    "statement_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "method_statements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodic_reports_project_id_idx" ON "periodic_reports"("project_id");

-- CreateIndex
CREATE INDEX "periodic_reports_status_idx" ON "periodic_reports"("status");

-- CreateIndex
CREATE INDEX "ipcs_project_id_idx" ON "ipcs"("project_id");

-- CreateIndex
CREATE INDEX "ipcs_status_idx" ON "ipcs"("status");

-- CreateIndex
CREATE INDEX "amendments_project_id_idx" ON "amendments"("project_id");

-- CreateIndex
CREATE INDEX "amendments_status_idx" ON "amendments"("status");

-- CreateIndex
CREATE INDEX "method_statements_project_id_idx" ON "method_statements"("project_id");

-- CreateIndex
CREATE INDEX "method_statements_status_idx" ON "method_statements"("status");

-- AddForeignKey
ALTER TABLE "periodic_reports" ADD CONSTRAINT "periodic_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ipcs" ADD CONSTRAINT "ipcs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amendments" ADD CONSTRAINT "amendments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "method_statements" ADD CONSTRAINT "method_statements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
