import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Health Check & Server Root Endpoints", () => {
  it("GET / should return 200 and API metadata", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Panganspasial.id Backend API");
  });

  it("GET /health should return 200 and health info", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.database).toBe("ok");
    expect(res.body.data.postgisVersion).toBeDefined();
  });
});
