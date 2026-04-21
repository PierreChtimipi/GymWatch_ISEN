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

describe("GET /api/machines", () => {
  it("200 — retourne toutes les machines", async () => {
    const res = await request(app).get("/api/machines");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("available");
  });

  it("200 — filtre par gymId", async () => {
    const res = await request(app).get("/api/machines?gymId=g1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((m: { gymId: string }) => expect(m.gymId).toBe("g1"));
  });
});

describe("POST /api/machines/:id/reserve", () => {
  it("200 — réservation réussie", async () => {
    const res = await request(app)
      .post("/api/machines/m1/reserve")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("400 — machine déjà réservée", async () => {
    const res = await request(app)
      .post("/api/machines/m1/reserve")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("404 — machine inexistante", async () => {
    const res = await request(app)
      .post("/api/machines/inexistant/reserve")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("401 — sans token", async () => {
    const res = await request(app).post("/api/machines/m1/reserve");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/machines/:id/release", () => {
  it("200 — libération réussie", async () => {
    // m1 est réservée par Valentin (test précédent)
    const res = await request(app)
      .post("/api/machines/m1/release")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("400 — machine pas réservée par cet utilisateur", async () => {
    const res = await request(app)
      .post("/api/machines/m1/release")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("404 — machine inexistante", async () => {
    const res = await request(app)
      .post("/api/machines/inexistant/release")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
