/**
 * Crée une instance Express de test (sans listen) avec DB en mémoire.
 * Chaque test importe cette fonction pour obtenir un serveur isolé.
 */
import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";

// ── DB en mémoire ─────────────────────────────────────────────────────────────
export function createTestDb() {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      member_since TEXT NOT NULL DEFAULT (date('now')),
      goals TEXT NOT NULL DEFAULT '[]',
      week_plan TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE gyms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      max_capacity INTEGER NOT NULL DEFAULT 120,
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      co2_level INTEGER NOT NULL DEFAULT 600,
      temperature REAL NOT NULL DEFAULT 22.0
    );
    CREATE TABLE user_gyms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      UNIQUE(user_id, gym_id)
    );
    CREATE TABLE machines (
      id TEXT PRIMARY KEY,
      gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      reserved INTEGER NOT NULL DEFAULT 0,
      reserved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE TABLE group_classes (
      id TEXT PRIMARY KEY,
      gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      instructor TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      spots_left INTEGER NOT NULL,
      total_spots INTEGER NOT NULL,
      color TEXT NOT NULL
    );
    CREATE TABLE class_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES group_classes(id) ON DELETE CASCADE,
      UNIQUE(user_id, class_id)
    );
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      calories_burned INTEGER NOT NULL,
      exercises_completed INTEGER NOT NULL
    );
    CREATE TABLE gym_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      max_capacity INTEGER NOT NULL DEFAULT 120,
      co2_level INTEGER NOT NULL DEFAULT 620,
      temperature REAL NOT NULL DEFAULT 22.5
    );
  `);

  // Seed
  const hash = bcrypt.hashSync("demo1234", 10);
  db.prepare("INSERT INTO users (name, email, password_hash, is_admin, goals, week_plan) VALUES (?,?,?,?,?,?)").run(
    "Valentin", "valentin@gymwatch.fr", hash, 1, '["Prise de masse"]', '{"lun":"Push"}'
  );
  db.prepare("INSERT INTO users (name, email, password_hash, is_admin, goals, week_plan) VALUES (?,?,?,?,?,?)").run(
    "Sophie", "sophie@gymwatch.fr", hash, 0, '["Cardio"]', '{}'
  );
  db.prepare("INSERT INTO gyms (id, name, address, city, description, max_capacity, current_occupancy, co2_level, temperature) VALUES (?,?,?,?,?,?,?,?,?)").run(
    "g1", "GymWatch Test", "1 rue Test", "Paris", "Salle de test", 100, 30, 600, 22.0
  );
  db.prepare("INSERT INTO user_gyms (user_id, gym_id) VALUES (?,?)").run(1, "g1");
  db.prepare("INSERT INTO machines (id, gym_id, name, category, available) VALUES (?,?,?,?,?)").run("m1", "g1", "Bench Press", "Pectoraux", 1);
  db.prepare("INSERT INTO group_classes (id, gym_id, name, instructor, time, duration, spots_left, total_spots, color) VALUES (?,?,?,?,?,?,?,?,?)").run(
    "c1", "g1", "Yoga", "Camille", "10:00", 60, 5, 20, "#f59e0b"
  );
  db.prepare("INSERT INTO gym_stats (id, current_occupancy, max_capacity) VALUES (1, 30, 100)").run();
  db.prepare("INSERT INTO sessions (user_id, date, duration, calories_burned, exercises_completed) VALUES (?,?,?,?,?)").run(1, "2026-04-20", 55, 430, 9);

  return db;
}

// ── JWT ───────────────────────────────────────────────────────────────────────
export const JWT_SECRET = "test-secret-gymwatch";

export function makeToken(userId: number, isAdmin = false) {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: "1h" });
}

// ── Middleware auth (utilise JWT_SECRET de test) ───────────────────────────────
export function makeAuthMiddleware(db: Database.Database) {
  return function authenticateToken(req: any, res: any, next: any) {
    const auth = req.headers["authorization"];
    const token = auth?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token manquant" });
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      req.userId = payload.userId;
      req.isAdmin = payload.isAdmin;
      next();
    } catch {
      res.status(403).json({ error: "Token invalide" });
    }
  };
}

export function makeAdminMiddleware() {
  return function requireAdmin(req: any, res: any, next: any) {
    if (!req.isAdmin) return res.status(403).json({ error: "Admin requis" });
    next();
  };
}
