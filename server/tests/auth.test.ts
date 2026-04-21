import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./testApp.js";
import type { Express } from "express";

let app: Express;

beforeAll(() => {
  app = createTestApp();
});

describe("POST /api/auth/register", () => {
  it("201 — crée un utilisateur avec token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@test.fr",
      password: "motdepasse",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.name).toBe("Alice");
    expect(res.body.user.email).toBe("alice@test.fr");
    expect(res.body.user.isAdmin).toBe(false);
  });

  it("400 — champs manquants", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Bob" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("409 — email déjà utilisé", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Dup",
      email: "dup@test.fr",
      password: "pwd",
    });
    const res = await request(app).post("/api/auth/register").send({
      name: "Dup2",
      email: "dup@test.fr",
      password: "pwd",
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("200 — login valide retourne token + user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "valentin@gymwatch.fr",
      password: "demo1234",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.isAdmin).toBe(true);
  });

  it("401 — mauvais mot de passe", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "valentin@gymwatch.fr",
      password: "mauvais",
    });
    expect(res.status).toBe(401);
  });

  it("401 — email inconnu", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "inconnu@test.fr",
      password: "pwd",
    });
    expect(res.status).toBe(401);
  });

  it("400 — champs manquants", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});
