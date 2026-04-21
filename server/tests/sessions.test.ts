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

describe("GET /api/sessions", () => {
  it("200 — retourne la liste des séances de l'utilisateur", async () => {
    const res = await request(app)
      .get("/api/sessions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("duration");
    expect(res.body[0]).toHaveProperty("caloriesBurned");
    expect(res.body[0]).toHaveProperty("exercisesCompleted");
  });

  it("401 — sans token", async () => {
    const res = await request(app).get("/api/sessions");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/sessions", () => {
  it("201 — crée une séance", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-04-21", duration: 60, caloriesBurned: 500, exercisesCompleted: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.duration).toBe(60);
    expect(res.body.caloriesBurned).toBe(500);
  });

  it("400 — champs manquants", async () => {
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-04-21" });
    expect(res.status).toBe(400);
  });

  it("401 — sans token", async () => {
    const res = await request(app).post("/api/sessions").send({
      date: "2026-04-21", duration: 60, caloriesBurned: 500, exercisesCompleted: 10,
    });
    expect(res.status).toBe(401);
  });
});
