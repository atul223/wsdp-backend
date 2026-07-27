-- CreateTable
CREATE TABLE "pipeline_sections" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "chainage_from" TEXT NOT NULL,
    "chainage_to" TEXT NOT NULL,
    "diameter" TEXT NOT NULL,
    "length_km" DECIMAL(8,2) NOT NULL,
    "laying_pct" DECIMAL(5,2) NOT NULL,
    "testing_pct" DECIMAL(5,2) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_connection_clusters" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "cluster_name" TEXT NOT NULL,
    "planned" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "in_progress" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "house_connection_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testing_activities" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "activity_name" TEXT NOT NULL,
    "planned_value" DECIMAL(8,2) NOT NULL,
    "actual_value" DECIMAL(8,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testing_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valve_chamber_summaries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "planned" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "in_progress" INTEGER NOT NULL,
    "not_started" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valve_chamber_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge_crossings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "crossing_name" TEXT NOT NULL,
    "crossing_type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_crossings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_snapshots" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "pipeline_laid_km" DECIMAL(8,2) NOT NULL,
    "pipeline_tested_km" DECIMAL(8,2) NOT NULL,
    "house_connections_completed" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "valve_chamber_summaries_project_id_key" ON "valve_chamber_summaries"("project_id");

-- AddForeignKey
ALTER TABLE "pipeline_sections" ADD CONSTRAINT "pipeline_sections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_connection_clusters" ADD CONSTRAINT "house_connection_clusters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testing_activities" ADD CONSTRAINT "testing_activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valve_chamber_summaries" ADD CONSTRAINT "valve_chamber_summaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridge_crossings" ADD CONSTRAINT "bridge_crossings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_snapshots" ADD CONSTRAINT "construction_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
