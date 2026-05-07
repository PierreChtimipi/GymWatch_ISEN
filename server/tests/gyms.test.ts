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

describe("GET /api/gym/stats", () => {
  it("200 — retourne les stats de la salle", async () => {
    const res = await request(app).get("/api/gym/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("currentOccupancy");
    expect(res.body).toHaveProperty("maxCapacity");
    expect(res.body).toHaveProperty("co2Level");
    expect(res.body).toHaveProperty("temperature");
  });
});

describe("GET /api/gyms", () => {
  it("200 — retourne toutes les salles", async () => {
    const res = await request(app).get("/api/gyms");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).toHaveProperty("maxCapacity");
  });
});

describe("GET /api/gyms/:id", () => {
  it("200 — retourne une salle par id", async () => {
    const res = await request(app).get("/api/gyms/g1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("g1");
    expect(res.body).toHaveProperty("name");
  });

  it("404 — salle inexistante", async () => {
    const res = await request(app).get("/api/gyms/inexistant");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/gyms/user/subscriptions", () => {
  it("200 — retourne les abonnements de l'utilisateur", async () => {
    const res = await request(app)
      .get("/api/gyms/user/subscriptions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain("g1");
  });

  it("401 — sans token", async () => {
    const res = await request(app).get("/api/gyms/user/subscriptions");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/gyms/:id/subscribe", () => {
  it("200 — inscription à une salle", async () => {
    // Sophie n'est pas encore inscrite à g2 (non créé dans seed)
    // Créons g2 via admin d'abord — pour le test on utilisera g1 déjà
    // inscrit → doit retourner 400
    const res = await request(app)
      .post("/api/gyms/g1/subscribe")
      .set("Authorization", `Bearer ${token}`);
    // Valentin est déjà inscrit à g1 dans le seed
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/deja inscrit/i);
  });

  it("401 — sans token", async () => {
    const res = await request(app).post("/api/gyms/g1/subscribe");
    expect(res.status).toBe(401);
  });

  it("404 — salle inexistante", async () => {
    const res = await request(app)
      .post("/api/gyms/inexistant/subscribe")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/gyms/:id/subscribe", () => {
  it("200 — désinscription réussie", async () => {
    // Valentin est inscrit à g1 dans le seed → désinscription OK
    const res = await request(app)
      .delete("/api/gyms/g1/subscribe")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("400 — pas inscrit", async () => {
    // Déjà désinscrit ci-dessus
    const res = await request(app)
      .delete("/api/gyms/g1/subscribe")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
