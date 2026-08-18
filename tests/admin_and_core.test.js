import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Milestone C — Authentication, Master Data & Core Management API Tests", () => {
  let adminToken = "";

  beforeAll(async () => {
    // Login as admin seeded in DB
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@panganspasial.id",
      password: "Admin#2026",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  // ==================== AUTH TESTS ====================
  describe("Authentication & Role Authorization (TASK-015 - 017)", () => {
    it("should reject invalid login credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@panganspasial.id",
        password: "WrongPassword",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should get current user profile with valid JWT token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("admin@panganspasial.id");
      expect(res.body.data.role).toBe("Admin");
    });

    it("should reject protected admin endpoints without token", async () => {
      const res = await request(app).post("/api/admin/farm-categories").send({
        name: "Kategori Tanpa Auth",
      });
      expect(res.status).toBe(401);
    });
  });

  // ==================== MASTER DATA TESTS ====================
  describe("Master Data Management (TASK-018 - 022)", () => {
    it("GET /api/farm-categories should return farm categories", async () => {
      const res = await request(app).get("/api/farm-categories");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("GET /api/livestock-types should return types with categories", async () => {
      const res = await request(app).get("/api/livestock-types");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const sapi = res.body.data.find((t) => t.name === "Sapi");
      expect(sapi).toBeDefined();
      expect(sapi.category.name).toBe("Ruminansia");
    });
  });

  // ==================== FARM & LIVESTOCK API TESTS ====================
  describe("Farm & Livestock APIs (TASK-023 - 028)", () => {
    let createdFarmId = null;

    it("GET /api/farms should return paginated farm list", async () => {
      const res = await request(app).get("/api/farms?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.meta.total).toBe(40);
    });

    it("GET /api/farms?search=Ponidi should filter by name", async () => {
      const res = await request(app).get("/api/farms?search=Ponidi");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].farm_name).toContain("Ponidi");
    });

    it("POST /api/admin/farms should create a new farm with spatial coordinates", async () => {
      const res = await request(app)
        .post("/api/admin/farms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          farm_name: "Test Farm Pringsewu",
          owner_name: "Budi Peternak",
          address: "Jalan Merdeka No. 1, Pringsewu",
          phone: "08123456789",
          latitude: -5.2345678,
          longitude: 105.0123456,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.farm_name).toBe("Test Farm Pringsewu");
      createdFarmId = res.body.data.id;
    });

    it("POST /api/admin/farms/:farmId/livestock should add livestock to the farm", async () => {
      const types = await request(app).get("/api/livestock-types");
      const sapiType = types.body.data.find((t) => t.name === "Sapi");

      const res = await request(app)
        .post(`/api/admin/farms/${createdFarmId}/livestock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          livestock_type_id: sapiType.id,
          population: 15,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.population).toBe(15);
      expect(res.body.data.livestock_type.name).toBe("Sapi");
    });

    it("POST /api/admin/farms/:farmId/livestock should reject negative population", async () => {
      const types = await request(app).get("/api/livestock-types");
      const res = await request(app)
        .post(`/api/admin/farms/${createdFarmId}/livestock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          livestock_type_id: types.body.data[0].id,
          population: -5,
        });

      expect(res.status).toBe(400);
    });

    it("DELETE /api/admin/farms/:id should delete created farm", async () => {
      const res = await request(app)
        .delete(`/api/admin/farms/${createdFarmId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ==================== VALIDATIONS TESTS ====================
  describe("Data Validations (TASK-031 - 033)", () => {
    it("POST /api/admin/validations should create a validation record", async () => {
      const res = await request(app)
        .post("/api/admin/validations")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          entity_type: "farm",
          entity_id: "1",
          status: "valid",
          notes: "Data hasil verifikasi survey lapangan",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("valid");
    });

    it("GET /api/admin/validations should list validation history", async () => {
      const res = await request(app)
        .get("/api/admin/validations")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
