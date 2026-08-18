-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "farm_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_scales" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "farm_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "livestock_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_types" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "livestock_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_subtypes" (
    "id" BIGSERIAL NOT NULL,
    "livestock_type_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "livestock_subtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "geom" geometry(MultiPolygon, 4326),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" BIGSERIAL NOT NULL,
    "district_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "geom" geometry(MultiPolygon, 4326),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" BIGSERIAL NOT NULL,
    "source_farm_id" BIGINT,
    "farm_name" VARCHAR(150),
    "owner_name" VARCHAR(150),
    "address" TEXT,
    "phone" VARCHAR(30),
    "farm_category_id" BIGINT,
    "farm_scale_id" BIGINT,
    "district_id" BIGINT,
    "village_id" BIGINT,
    "notes" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "geom" geometry(Point, 4326),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock" (
    "id" BIGSERIAL NOT NULL,
    "source_livestock_id" BIGINT,
    "farm_id" BIGINT NOT NULL,
    "livestock_category_id" BIGINT NOT NULL,
    "livestock_type_id" BIGINT NOT NULL,
    "livestock_subtype_id" BIGINT,
    "population" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "livestock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_validations" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "notes" TEXT,
    "validated_by" BIGINT,
    "validated_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "data_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sdss_criteria" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "criteria_type" VARCHAR(20) NOT NULL,
    "weight" DECIMAL(8,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "sdss_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sdss_weights" (
    "id" BIGSERIAL NOT NULL,
    "criteria_id" BIGINT NOT NULL,
    "category" VARCHAR(100),
    "min_value" DECIMAL(12,4),
    "max_value" DECIMAL(12,4),
    "score" DECIMAL(8,4),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "sdss_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sdss_results" (
    "id" BIGSERIAL NOT NULL,
    "district_id" BIGINT,
    "score" DECIMAL(12,4),
    "rank" INTEGER,
    "recommendation" VARCHAR(50),
    "explanation" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "sdss_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_photos" (
    "id" BIGSERIAL NOT NULL,
    "farm_id" BIGINT NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "caption" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "farm_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "farm_categories_name_key" ON "farm_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "farm_scales_name_key" ON "farm_scales"("name");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_categories_name_key" ON "livestock_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_types_category_id_name_key" ON "livestock_types"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_subtypes_livestock_type_id_name_key" ON "livestock_subtypes"("livestock_type_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_key" ON "districts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "villages_code_key" ON "villages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "villages_district_id_name_key" ON "villages"("district_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "farms_source_farm_id_key" ON "farms"("source_farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "livestock_source_livestock_id_key" ON "livestock"("source_livestock_id");

-- CreateIndex
CREATE UNIQUE INDEX "sdss_criteria_name_key" ON "sdss_criteria"("name");

-- Create Spatial Indexes (GIST)
CREATE INDEX IF NOT EXISTS "districts_geom_idx" ON "districts" USING GIST ("geom");
CREATE INDEX IF NOT EXISTS "villages_geom_idx" ON "villages" USING GIST ("geom");
CREATE INDEX IF NOT EXISTS "farms_geom_idx" ON "farms" USING GIST ("geom");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_types" ADD CONSTRAINT "livestock_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "livestock_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_subtypes" ADD CONSTRAINT "livestock_subtypes_livestock_type_id_fkey" FOREIGN KEY ("livestock_type_id") REFERENCES "livestock_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farm_category_id_fkey" FOREIGN KEY ("farm_category_id") REFERENCES "farm_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farm_scale_id_fkey" FOREIGN KEY ("farm_scale_id") REFERENCES "farm_scales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock" ADD CONSTRAINT "livestock_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock" ADD CONSTRAINT "livestock_livestock_category_id_fkey" FOREIGN KEY ("livestock_category_id") REFERENCES "livestock_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock" ADD CONSTRAINT "livestock_livestock_type_id_fkey" FOREIGN KEY ("livestock_type_id") REFERENCES "livestock_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock" ADD CONSTRAINT "livestock_livestock_subtype_id_fkey" FOREIGN KEY ("livestock_subtype_id") REFERENCES "livestock_subtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_validations" ADD CONSTRAINT "data_validations_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdss_weights" ADD CONSTRAINT "sdss_weights_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "sdss_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdss_results" ADD CONSTRAINT "sdss_results_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_photos" ADD CONSTRAINT "farm_photos_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
