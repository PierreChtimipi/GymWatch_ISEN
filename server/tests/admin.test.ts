import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./testApp.js";
import type { Express } from "express";

let app: Express;
let adminToken: string;
let userToken: string;

beforeAll(async () => {
  app = createTestApp();
  const adminRes = await request(app).post("/api/auth/login").send({
    email: "valentin@gymwatch.fr",
    password: "demo1234",
  });
  adminToken = adminRes.body.token;

  const userRes = await request(app).post("/api/auth/login").send({
    email: "sophie@gymwatch.fr",
    password: "demo1234",
  });
  userToken = userRes.body.token;
});

// ── Middleware ────────────────────────────────────────────────────────────────

describe("Admin middleware", () => {
  it("401 — sans token", async () => {
    const res = await request(app).get("/api/admin/gyms");
    expect(res.status).toBe(401);
  });

  it("403 — user non-admin", async () => {
    const res = await request(app)
      .get("/api/admin/gyms")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ── Gyms ─────────────────────────────────────────────────────────────────────

describe("GET /api/admin/gyms", () => {
  it("200 — retourne toutes les salles", async () => {
    const res = await request(app)
      .get("/api/admin/gyms")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("PUT /api/admin/gyms/:id", () => {
  it("200 — met à jour une salle", async () => {
    const res = await request(app)
      .put("/api/admin/gyms/g1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "GymWatch Test Updated", currentOccupancy: 50 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("GymWatch Test Updated");
  });

  it("404 — salle inexistante", async () => {
    const res = await request(app)
      .put("/api/admin/gyms/inexistant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
  });
});

// ── Machines ─────────────────────────────────────────────────────────────────

describe("GET /api/admin/machines", () => {
  it("200 — retourne toutes les machines avec gymName", async () => {
    const res = await request(app)
      .get("/api/admin/machines")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("gymName");
  });
});

describe("POST /api/admin/machines", () => {
  it("201 — crée une machine", async () => {
    const res = await request(app)
      .post("/api/admin/machines")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ gymId: "g1", name: "Nouvelle Machine", category: "Cardio" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Nouvelle Machine");
  });

  it("400 — champs manquants", async () => {
    const res = await request(app)
      .post("/api/admin/machines")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ gymId: "g1" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/admin/machines/:id", () => {
  it("200 — met à jour une machine", async () => {
    const res = await request(app)
      .put("/api/admin/machines/m1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Bench Press V2", available: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — machine inexistante", async () => {
    const res = await request(app)
      .put("/api/admin/machines/inexistant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/machines/:id", () => {
  it("200 — supprime une machine", async () => {
    const res = await request(app)
      .delete("/api/admin/machines/m1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — machine inexistante", async () => {
    const res = await request(app)
      .delete("/api/admin/machines/inexistant")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Classes ──────────────────────────────────────────────────────────────────

describe("GET /api/admin/classes", () => {
  it("200 — retourne tous les cours avec gymName", async () => {
    const res = await request(app)
      .get("/api/admin/classes")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("gymName");
  });
});

describe("POST /api/admin/classes", () => {
  it("201 — crée un cours", async () => {
    const res = await request(app)
      .post("/api/admin/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ gymId: "g1", name: "Pilates", instructor: "Laura", time: "09:00", duration: 45, totalSpots: 15, color: "#f59e0b" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Pilates");
  });

  it("400 — champs manquants", async () => {
    const res = await request(app)
      .post("/api/admin/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ gymId: "g1", name: "Pilates" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/admin/classes/:id", () => {
  it("200 — met à jour un cours", async () => {
    const res = await request(app)
      .put("/api/admin/classes/c1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ instructor: "Marc" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — cours inexistant", async () => {
    const res = await request(app)
      .put("/api/admin/classes/inexistant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/classes/:id", () => {
  it("200 — supprime un cours", async () => {
    const res = await request(app)
      .delete("/api/admin/classes/c1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — cours inexistant", async () => {
    const res = await request(app)
      .delete("/api/admin/classes/inexistant")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Users ─────────────────────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  it("200 — retourne tous les utilisateurs", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty("isAdmin");
    expect(res.body[0]).not.toHaveProperty("password_hash");
  });
});
