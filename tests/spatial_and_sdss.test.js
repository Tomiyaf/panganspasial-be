import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Milestone D, E, F — WebGIS Spatial, Statistics, SDSS & Documentation Tests", () => {
  let adminToken = "";

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@panganspasial.id",
      password: "Admin#2026",
    });
    adminToken = res.body.data.token;
  });

  // ==================== SPATIAL WEBGIS TESTS (TASK-034 - 040) ====================
  describe("Spatial WebGIS GeoJSON Endpoints", () => {
    it("GET /api/spatial/farms should return valid GeoJSON FeatureCollection", async () => {
      const res = await request(app).get("/api/spatial/farms");
      expect(res.status).toBe(200);
      expect(res.body.type).toBe("FeatureCollection");
      expect(Array.isArray(res.body.features)).toBe(true);
      expect(res.body.features.length).toBe(40);

      const firstFeature = res.body.features[0];
      expect(firstFeature.type).toBe("Feature");
      expect(firstFeature.geometry.type).toBe("Point");
      expect(firstFeature.geometry.coordinates.length).toBe(2);
      expect(firstFeature.properties.farm_name).toBeDefined();
    });

    it("GET /api/spatial/farms with BBox should filter points within bounding box", async () => {
      // Bounding box around Adiluwih cluster
      const res = await request(app).get("/api/spatial/farms?bbox=105.00,-5.30,105.05,-5.20");
      expect(res.status).toBe(200);
      expect(res.body.type).toBe("FeatureCollection");
      expect(res.body.features.length).toBeGreaterThan(0);
    });

    it("GET /api/spatial/districts should return district polygon features", async () => {
      const res = await request(app).get("/api/spatial/districts");
      expect(res.status).toBe(200);
      expect(res.body.type).toBe("FeatureCollection");
      expect(res.body.features.length).toBeGreaterThanOrEqual(9);
    });

    it("GET /api/heatmap should return weighted coordinates for Leaflet Heatmap", async () => {
      const res = await request(app).get("/api/heatmap");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.points)).toBe(true);
      expect(res.body.data.points.length).toBe(40);
      expect(res.body.data.points[0].weight).toBeGreaterThan(0);
    });
  });

  // ==================== DASHBOARD STATISTICS TESTS (TASK-041 - 044) ====================
  describe("Dashboard Statistics Endpoints", () => {
    it("GET /api/statistics/overview should return KPI metrics", async () => {
      const res = await request(app).get("/api/statistics/overview");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpi.total_farms).toBe(40);
      expect(res.body.data.kpi.total_livestock_population).toBeGreaterThan(0);
      expect(res.body.data.category_distribution.length).toBeGreaterThanOrEqual(2);
    });

    it("GET /api/statistics/farms should return district farm aggregations", async () => {
      const res = await request(app).get("/api/statistics/farms");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /api/statistics/livestock should return statistics per type", async () => {
      const res = await request(app).get("/api/statistics/livestock");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==================== SDSS RECOMMENDATIONS (TASK-047 - 051) ====================
  describe("SDSS Multi-Criteria Recommendation Engine", () => {
    it("GET /api/recommendations should return ranked district potentials", async () => {
      const res = await request(app).get("/api/recommendations");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].rank).toBe(1);
      expect(res.body.data[0].score).toBeGreaterThan(0);
      expect(res.body.data[0].recommendation).toBeDefined();
    });

    it("POST /api/admin/recommendations/calculate should calculate and persist SDSS results", async () => {
      const res = await request(app)
        .post("/api/admin/recommendations/calculate")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/admin/sdss/criteria should reject invalid criteria_type", async () => {
      const res = await request(app)
        .post("/api/admin/sdss/criteria")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Kriteria Invalid",
          criteria_type: "invalid_type",
          weight: 0.2,
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // ==================== ADMIN MANAGEMENT & SUMMARY (TASK-052, 053) ====================
  describe("Admin Dashboard Summary & User Management", () => {
    it("GET /api/admin/dashboard/summary should return admin KPI cards", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard/summary")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_farms).toBeGreaterThanOrEqual(40);
    });

    it("GET /api/admin/users should return admin users list", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
