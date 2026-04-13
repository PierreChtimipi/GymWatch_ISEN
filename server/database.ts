import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "gymwatch.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      member_since TEXT NOT NULL DEFAULT (date('now')),
      goals TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      reserved INTEGER NOT NULL DEFAULT 0,
      reserved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS group_classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      instructor TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      spots_left INTEGER NOT NULL,
      total_spots INTEGER NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS class_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES group_classes(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, class_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      calories_burned INTEGER NOT NULL,
      exercises_completed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gym_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      max_capacity INTEGER NOT NULL DEFAULT 120,
      co2_level INTEGER NOT NULL DEFAULT 620,
      temperature REAL NOT NULL DEFAULT 22.5
    );
  `);
}

export function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, member_since, goals) VALUES (?, ?, ?, ?, ?)"
  );

  const demoHash = "$2b$10$qy/s9JIgDGi81cgoA9D1weSsjLMX2pI96iOVYUjjVryQ41d/O/8.e";

  insertUser.run("Valentin", "valentin@gymwatch.fr", demoHash, "2025-09-01", JSON.stringify(["Prise de masse", "Endurance", "Flexibilite"]));
  insertUser.run("Sophie", "sophie@gymwatch.fr", demoHash, "2025-10-15", JSON.stringify(["Cardio", "Tonicite"]));

  const insertMachine = db.prepare(
    "INSERT INTO machines (id, name, category, available, reserved, reserved_by) VALUES (?, ?, ?, ?, ?, ?)"
  );

  insertMachine.run("m1", "Bench Press", "Pectoraux", 1, 0, null);
  insertMachine.run("m2", "Squat Rack", "Jambes", 0, 0, null);
  insertMachine.run("m3", "Tapis de course #1", "Cardio", 1, 0, null);
  insertMachine.run("m4", "Tapis de course #2", "Cardio", 1, 0, null);
  insertMachine.run("m5", "Leg Press", "Jambes", 0, 1, 1);
  insertMachine.run("m6", "Poulie haute", "Dos", 1, 0, null);
  insertMachine.run("m7", "Velo elliptique", "Cardio", 0, 0, null);
  insertMachine.run("m8", "Developpe epaules", "Epaules", 1, 0, null);
  insertMachine.run("m9", "Curl biceps", "Bras", 1, 0, null);
  insertMachine.run("m10", "Presse a cuisses", "Jambes", 0, 1, 2);

  const insertClass = db.prepare(
    "INSERT INTO group_classes (id, name, instructor, time, duration, spots_left, total_spots, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  insertClass.run("c1", "Zumba", "Marie", "10:00", 45, 8, 20, "var(--color-zumba)");
  insertClass.run("c2", "CrossFit", "Thomas", "12:00", 60, 2, 15, "var(--color-crossfit)");
  insertClass.run("c3", "Yoga", "Camille", "14:00", 60, 12, 25, "var(--color-yoga)");
  insertClass.run("c4", "Pilates", "Laura", "16:00", 45, 0, 18, "var(--color-pilates)");
  insertClass.run("c5", "Boxing", "Nico", "18:00", 45, 5, 12, "var(--color-boxing)");
  insertClass.run("c6", "Cycling", "Julien", "19:30", 30, 3, 20, "var(--color-cycling)");

  const insertSession = db.prepare(
    "INSERT INTO sessions (user_id, date, duration, calories_burned, exercises_completed) VALUES (?, ?, ?, ?, ?)"
  );

  insertSession.run(1, "2026-04-13", 65, 480, 8);
  insertSession.run(1, "2026-04-11", 45, 320, 6);
  insertSession.run(1, "2026-04-09", 55, 410, 7);
  insertSession.run(1, "2026-04-07", 70, 520, 10);
  insertSession.run(1, "2026-04-05", 50, 380, 6);
  insertSession.run(1, "2026-04-03", 60, 450, 9);
  insertSession.run(1, "2026-04-01", 40, 280, 5);

  db.prepare(
    "INSERT OR IGNORE INTO gym_stats (id, current_occupancy, max_capacity, co2_level, temperature) VALUES (1, 47, 120, 620, 22.5)"
  ).run();
}

export default db;
