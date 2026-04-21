import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.GYMWATCH_DB ?? path.join(__dirname, "..", "gymwatch.db");

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
      is_admin INTEGER NOT NULL DEFAULT 0,
      member_since TEXT NOT NULL DEFAULT (date('now')),
      goals TEXT NOT NULL DEFAULT '[]',
      week_plan TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gyms (
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

    CREATE TABLE IF NOT EXISTS user_gyms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, gym_id)
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      reserved INTEGER NOT NULL DEFAULT 0,
      reserved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS group_classes (
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

  // Migration: add week_plan column if it doesn't exist yet
  try {
    db.exec("ALTER TABLE users ADD COLUMN week_plan TEXT NOT NULL DEFAULT '{}'");
  } catch {
    // Column already exists — ignore
  }

  // Migration: set default week plan for users with empty or invalid JSON plan
  const defaultPlan = JSON.stringify({
    lun: "Push — Pectoraux, Triceps",
    mar: "Pull — Dos, Biceps",
    mer: "Repos actif",
    jeu: "Legs — Cuisses, Fessiers",
    ven: "Cardio — HIIT 30 min",
    sam: "Full Body",
    dim: "Repos",
  });
  const usersToFix = db.prepare("SELECT id, week_plan FROM users").all() as { id: number; week_plan: string }[];
  for (const u of usersToFix) {
    let valid = true;
    try { const p = JSON.parse(u.week_plan); if (typeof p !== "object" || Array.isArray(p) || Object.keys(p).length === 0) valid = false; } catch { valid = false; }
    if (!valid) db.prepare("UPDATE users SET week_plan = ? WHERE id = ?").run(defaultPlan, u.id);
  }
}

export function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  const demoHash = "$2b$10$qy/s9JIgDGi81cgoA9D1weSsjLMX2pI96iOVYUjjVryQ41d/O/8.e";

  // Users — Valentin is admin
  const valentinPlan = JSON.stringify({
    lun: "Push — Pectoraux, Triceps",
    mar: "Pull — Dos, Biceps",
    mer: "Repos actif",
    jeu: "Legs — Cuisses, Fessiers",
    ven: "Cardio — HIIT 30 min",
    sam: "Full Body",
    dim: "Repos",
  });
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, is_admin, member_since, goals, week_plan) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  insertUser.run("Valentin", "valentin@gymwatch.fr", demoHash, 1, "2025-09-01", JSON.stringify(["Prise de masse", "Endurance", "Flexibilite"]), valentinPlan);
  insertUser.run("Sophie", "sophie@gymwatch.fr", demoHash, 0, "2025-10-15", JSON.stringify(["Cardio", "Tonicite"]), JSON.stringify({}));

  // Gyms
  const insertGym = db.prepare(
    "INSERT INTO gyms (id, name, address, city, description, max_capacity, current_occupancy, co2_level, temperature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insertGym.run("g1", "GymWatch Republique", "12 Rue de la Republique", "Paris", "Salle premium au coeur de Paris avec equipements haut de gamme.", 120, 47, 620, 22.5);
  insertGym.run("g2", "GymWatch Nation", "45 Boulevard de Nation", "Paris", "Grande salle spacieuse avec zone crossfit et piscine.", 200, 93, 580, 21.0);
  insertGym.run("g3", "GymWatch Vieux-Port", "8 Quai du Port", "Marseille", "Vue mer exceptionnelle, salle moderne et equipee.", 90, 21, 550, 23.5);
  insertGym.run("g4", "GymWatch Presqu'ile", "22 Place Bellecour", "Lyon", "Salle historique renovee au coeur de Lyon.", 110, 65, 640, 22.0);

  // Subscribe Valentin and Sophie to g1
  db.prepare("INSERT INTO user_gyms (user_id, gym_id) VALUES (?, ?)").run(1, "g1");
  db.prepare("INSERT INTO user_gyms (user_id, gym_id) VALUES (?, ?)").run(2, "g1");

  // Machines per gym
  const insertMachine = db.prepare(
    "INSERT INTO machines (id, gym_id, name, category, available, reserved, reserved_by) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  // g1 machines
  insertMachine.run("g1m1", "g1", "Bench Press", "Pectoraux", 1, 0, null);
  insertMachine.run("g1m2", "g1", "Squat Rack", "Jambes", 0, 0, null);
  insertMachine.run("g1m3", "g1", "Tapis de course #1", "Cardio", 1, 0, null);
  insertMachine.run("g1m4", "g1", "Tapis de course #2", "Cardio", 1, 0, null);
  insertMachine.run("g1m5", "g1", "Leg Press", "Jambes", 0, 1, 1);
  insertMachine.run("g1m6", "g1", "Poulie haute", "Dos", 1, 0, null);
  insertMachine.run("g1m7", "g1", "Vélo elliptique", "Cardio", 0, 0, null);
  insertMachine.run("g1m8", "g1", "Développé épaules", "Épaules", 1, 0, null);
  insertMachine.run("g1m9", "g1", "Curl biceps", "Bras", 1, 0, null);
  insertMachine.run("g1m10", "g1", "Presse à cuisses", "Jambes", 0, 1, 2);

  // g2 machines
  insertMachine.run("g2m1", "g2", "Rack Olympique", "Pectoraux", 1, 0, null);
  insertMachine.run("g2m2", "g2", "Rameur", "Cardio", 1, 0, null);
  insertMachine.run("g2m3", "g2", "Tapis de course #1", "Cardio", 0, 0, null);
  insertMachine.run("g2m4", "g2", "Box CrossFit", "CrossFit", 1, 0, null);
  insertMachine.run("g2m5", "g2", "Kettlebell Zone", "CrossFit", 1, 0, null);

  // g3 machines
  insertMachine.run("g3m1", "g3", "Chest Press", "Pectoraux", 1, 0, null);
  insertMachine.run("g3m2", "g3", "Leg Extension", "Jambes", 1, 0, null);
  insertMachine.run("g3m3", "g3", "Tapis de course", "Cardio", 0, 1, null);

  // g4 machines
  insertMachine.run("g4m1", "g4", "Bench Press", "Pectoraux", 1, 0, null);
  insertMachine.run("g4m2", "g4", "Cable Machine", "Dos", 1, 0, null);
  insertMachine.run("g4m3", "g4", "Velo stationnaire", "Cardio", 1, 0, null);

  // Classes per gym
  const insertClass = db.prepare(
    "INSERT INTO group_classes (id, gym_id, name, instructor, time, duration, spots_left, total_spots, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  // g1 classes
  insertClass.run("g1c1", "g1", "Zumba", "Marie", "10:00", 45, 8, 20, "var(--color-zumba)");
  insertClass.run("g1c2", "g1", "CrossFit", "Thomas", "12:00", 60, 2, 15, "var(--color-crossfit)");
  insertClass.run("g1c3", "g1", "Yoga", "Camille", "14:00", 60, 12, 25, "var(--color-yoga)");
  insertClass.run("g1c4", "g1", "Pilates", "Laura", "16:00", 45, 0, 18, "var(--color-pilates)");
  insertClass.run("g1c5", "g1", "Boxing", "Nico", "18:00", 45, 5, 12, "var(--color-boxing)");
  insertClass.run("g1c6", "g1", "Cycling", "Julien", "19:30", 30, 3, 20, "var(--color-cycling)");

  // g2 classes
  insertClass.run("g2c1", "g2", "CrossFit Avance", "Thomas", "07:00", 60, 5, 12, "var(--color-crossfit)");
  insertClass.run("g2c2", "g2", "HIIT", "Lucie", "09:00", 45, 3, 15, "var(--color-boxing)");
  insertClass.run("g2c3", "g2", "Aquagym", "Pierre", "11:00", 45, 10, 20, "var(--color-pilates)");

  // g3 classes
  insertClass.run("g3c1", "g3", "Yoga vue mer", "Camille", "08:00", 60, 4, 15, "var(--color-yoga)");
  insertClass.run("g3c2", "g3", "Stretching", "Marie", "17:00", 30, 7, 20, "var(--color-zumba)");

  // g4 classes
  insertClass.run("g4c1", "g4", "Pilates", "Sophie", "09:00", 45, 6, 18, "var(--color-pilates)");
  insertClass.run("g4c2", "g4", "Cycling", "Marc", "18:30", 45, 2, 15, "var(--color-cycling)");
  insertClass.run("g4c3", "g4", "Zumba", "Lisa", "20:00", 45, 9, 20, "var(--color-zumba)");

  // Sessions for Valentin
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
