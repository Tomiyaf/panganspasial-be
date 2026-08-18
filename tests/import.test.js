import { describe, it, expect } from "vitest";
import prisma from "../src/lib/prisma.js";

describe("Milestone B — Database Data & GPKG Regression Tests (TASK-014, TASK-064)", () => {
  it("should have exactly 40 farms imported", async () => {
    const count = await prisma.farm.count();
    expect(count).toBe(40);
  });

  it("should have exactly 41 livestock imported", async () => {
    const count = await prisma.livestock.count();
    expect(count).toBe(41);
  });

  it("should have zero orphan livestock records", async () => {
    const orphan = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM livestock l 
      LEFT JOIN farms f ON l.farm_id = f.id 
      WHERE f.id IS NULL;
    `;
    expect(Number(orphan[0].count)).toBe(0);
  });

  it("should have all 40 farms with valid PostGIS geometry", async () => {
    const valid = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM farms 
      WHERE geom IS NOT NULL AND ST_IsValid(geom) AND ST_SRID(geom) = 4326;
    `;
    expect(Number(valid[0].count)).toBe(40);
  });

  it("should have master taxonomy intact", async () => {
    const categories = await prisma.livestockCategory.count();
    const types = await prisma.livestockType.count();
    const subtypes = await prisma.livestockSubtype.count();
    expect(categories).toBeGreaterThanOrEqual(2);
    expect(types).toBeGreaterThanOrEqual(3);
    expect(subtypes).toBeGreaterThanOrEqual(2);
  });
});
