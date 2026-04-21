import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./testApp.js";
import type { Express } from "express";

let app: Express;
let token: string;

beforeAll(async () => {
  app = createTestApp();
  const res = await request(app).post("/api/auth/login").send({
    email: "valentin@gymwatch.fr",
    password: "demo1234",
  });
  token = res.body.token;
});

describe("GET /api/classes", () => {
  it("200 — retourne tous les cours", async () => {
    const res = await request(app).get("/api/classes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("spotsLeft");
  });

  it("200 — filtre par gymId", async () => {
    const res = await request(app).get("/api/classes?gymId=g1");
    expect(res.status).toBe(200);
    res.body.forEach((c: { gymId: string }) => expect(c.gymId).toBe("g1"));
  });
});

describe("POST /api/classes/:id/book", () => {
  it("200 — réservation réussie", async () => {
    const res = await request(app)
      .post("/api/classes/c1/book")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("400 — déjà inscrit", async () => {
    const res = await request(app)
      .post("/api/classes/c1/book")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/deja inscrit/i);
  });

  it("404 — cours inexistant", async () => {
    const res = await request(app)
      .post("/api/classes/inexistant/book")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("401 — sans token", async () => {
    const res = await request(app).post("/api/classes/c1/book");
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/classes/:id/book", () => {
  it("200 — désinscription réussie", async () => {
    // Valentin est inscrit à c1 (test précédent)
    const res = await request(app)
      .delete("/api/classes/c1/book")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("400 — pas inscrit", async () => {
    const res = await request(app)
      .delete("/api/classes/c1/book")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("401 — sans token", async () => {
    const res = await request(app).delete("/api/classes/c1/book");
    expect(res.status).toBe(401);
  });
});
