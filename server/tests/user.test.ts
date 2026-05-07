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

describe("GET /api/user/profile", () => {
  it("200 — retourne le profil complet", async () => {
    const res = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Valentin");
    expect(res.body.email).toBe("valentin@gymwatch.fr");
    expect(res.body.isAdmin).toBe(true);
    expect(Array.isArray(res.body.goals)).toBe(true);
    expect(res.body).toHaveProperty("weekPlan");
    expect(res.body).toHaveProperty("totalSessions");
  });

  it("401 — sans token", async () => {
    const res = await request(app).get("/api/user/profile");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/user/profile", () => {
  it("200 — met à jour le nom", async () => {
    const res = await request(app)
      .put("/api/user/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Valentin Updated" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Valentin Updated");
  });

  it("200 — met à jour les goals", async () => {
    const res = await request(app)
      .put("/api/user/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ goals: ["Cardio", "Force"] });
    expect(res.status).toBe(200);
    expect(res.body.goals).toContain("Cardio");
  });
});

describe("PUT /api/user/week-plan", () => {
  it("200 — met à jour le planning", async () => {
    const res = await request(app)
      .put("/api/user/week-plan")
      .set("Authorization", `Bearer ${token}`)
      .send({ weekPlan: { lun: "Push", mar: "Pull", mer: "Repos" } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("401 — sans token", async () => {
    const res = await request(app)
      .put("/api/user/week-plan")
      .send({ weekPlan: { lun: "Push" } });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/user/bookings", () => {
  it("200 — retourne les cours réservés (vide par défaut)", async () => {
    const res = await request(app)
      .get("/api/user/bookings")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
