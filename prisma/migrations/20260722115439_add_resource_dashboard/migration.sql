-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "total_capacity" DECIMAL(18,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "work_package_id" TEXT,
    "quantity" DECIMAL(18,2) NOT NULL,
    "allocation_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "remarks" TEXT,
    "allocated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resources_project_id_idx" ON "resources"("project_id");

-- CreateIndex
CREATE INDEX "resources_type_idx" ON "resources"("type");

-- CreateIndex
CREATE UNIQUE INDEX "resources_project_id_name_key" ON "resources"("project_id", "name");

-- CreateIndex
CREATE INDEX "allocations_resource_id_idx" ON "allocations"("resource_id");

-- CreateIndex
CREATE INDEX "allocations_work_package_id_idx" ON "allocations"("work_package_id");

-- CreateIndex
CREATE INDEX "allocations_status_idx" ON "allocations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "allocations_resource_id_work_package_id_allocation_date_key" ON "allocations"("resource_id", "work_package_id", "allocation_date");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
