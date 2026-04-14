import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../database.js";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware.js";

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

// ─── Gyms ────────────────────────────────────────────────────────────────────

router.get("/gyms", (_, res) => {
  const gyms = db.prepare("SELECT * FROM gyms").all();
  res.json(gyms);
});

router.put("/gyms/:id/stats", (req, res) => {
  const { id } = req.params;
  const { currentOccupancy, co2Level, temperature } = req.body;

  db.prepare(`
    UPDATE gyms SET
      current_occupancy = COALESCE(?, current_occupancy),
      co2_level = COALESCE(?, co2_level),
      temperature = COALESCE(?, temperature)
    WHERE id = ?
  `).run(currentOccupancy ?? null, co2Level ?? null, temperature ?? null, id);

  res.json({ success: true });
});

// ─── Machines ────────────────────────────────────────────────────────────────

router.get("/machines", (_, res) => {
  const machines = db.prepare(`
    SELECT m.*, g.name as gym_name, u.name as reserved_by_name
    FROM machines m
    JOIN gyms g ON m.gym_id = g.id
    LEFT JOIN users u ON m.reserved_by = u.id
    ORDER BY g.name, m.category, m.name
  `).all();

  res.json(machines.map((m: Record<string, unknown>) => ({
    id: m.id,
    gymId: m.gym_id,
    gymName: m.gym_name,
    name: m.name,
    category: m.category,
    available: Boolean(m.available),
    reserved: Boolean(m.reserved),
    reservedBy: m.reserved_by_name || undefined,
  })));
});

router.post("/machines", (req, res) => {
  const { gymId, name, category } = req.body;
  if (!gymId || !name || !category) {
    res.status(400).json({ error: "gymId, name et category requis" }); return;
  }

  const id = `${gymId}m${uuidv4().slice(0, 6)}`;
  db.prepare("INSERT INTO machines (id, gym_id, name, category) VALUES (?, ?, ?, ?)").run(id, gymId, name, category);

  res.status(201).json({ id, gymId, name, category, available: true, reserved: false });
});

router.put("/machines/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, available } = req.body;

  const machine = db.prepare("SELECT id FROM machines WHERE id = ?").get(id);
  if (!machine) { res.status(404).json({ error: "Machine introuvable" }); return; }

  if (name) db.prepare("UPDATE machines SET name = ? WHERE id = ?").run(name, id);
  if (category) db.prepare("UPDATE machines SET category = ? WHERE id = ?").run(category, id);
  if (available !== undefined) {
    db.prepare("UPDATE machines SET available = ?, reserved = 0, reserved_by = NULL WHERE id = ?").run(available ? 1 : 0, id);
  }

  res.json({ success: true });
});

router.delete("/machines/:id", (req, res) => {
  const { id } = req.params;
  const machine = db.prepare("SELECT id FROM machines WHERE id = ?").get(id);
  if (!machine) { res.status(404).json({ error: "Machine introuvable" }); return; }

  db.prepare("DELETE FROM machines WHERE id = ?").run(id);
  res.json({ success: true });
});

// ─── Classes ─────────────────────────────────────────────────────────────────

router.get("/classes", (_, res) => {
  const classes = db.prepare(`
    SELECT gc.*, g.name as gym_name
    FROM group_classes gc
    JOIN gyms g ON gc.gym_id = g.id
    ORDER BY g.name, gc.time
  `).all();

  res.json(classes.map((c: Record<string, unknown>) => ({
    id: c.id,
    gymId: c.gym_id,
    gymName: c.gym_name,
    name: c.name,
    instructor: c.instructor,
    time: c.time,
    duration: c.duration,
    spotsLeft: c.spots_left,
    totalSpots: c.total_spots,
    color: c.color,
  })));
});

router.post("/classes", (req, res) => {
  const { gymId, name, instructor, time, duration, totalSpots, color } = req.body;
  if (!gymId || !name || !instructor || !time || !duration || !totalSpots) {
    res.status(400).json({ error: "Champs obligatoires manquants" }); return;
  }

  const id = `${gymId}c${uuidv4().slice(0, 6)}`;
  db.prepare(
    "INSERT INTO group_classes (id, gym_id, name, instructor, time, duration, spots_left, total_spots, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, gymId, name, instructor, time, duration, totalSpots, color || "var(--color-crossfit)");

  res.status(201).json({ id, gymId, name, instructor, time, duration, spotsLeft: totalSpots, totalSpots, color });
});

router.put("/classes/:id", (req, res) => {
  const { id } = req.params;
  const { name, instructor, time, duration, totalSpots, color } = req.body;

  const cls = db.prepare("SELECT id FROM group_classes WHERE id = ?").get(id);
  if (!cls) { res.status(404).json({ error: "Cours introuvable" }); return; }

  if (name) db.prepare("UPDATE group_classes SET name = ? WHERE id = ?").run(name, id);
  if (instructor) db.prepare("UPDATE group_classes SET instructor = ? WHERE id = ?").run(instructor, id);
  if (time) db.prepare("UPDATE group_classes SET time = ? WHERE id = ?").run(time, id);
  if (duration) db.prepare("UPDATE group_classes SET duration = ? WHERE id = ?").run(duration, id);
  if (totalSpots) db.prepare("UPDATE group_classes SET total_spots = ? WHERE id = ?").run(totalSpots, id);
  if (color) db.prepare("UPDATE group_classes SET color = ? WHERE id = ?").run(color, id);

  res.json({ success: true });
});

router.delete("/classes/:id", (req, res) => {
  const { id } = req.params;
  const cls = db.prepare("SELECT id FROM group_classes WHERE id = ?").get(id);
  if (!cls) { res.status(404).json({ error: "Cours introuvable" }); return; }

  db.prepare("DELETE FROM class_bookings WHERE class_id = ?").run(id);
  db.prepare("DELETE FROM group_classes WHERE id = ?").run(id);
  res.json({ success: true });
});

// ─── Users ───────────────────────────────────────────────────────────────────

router.get("/users", (_, res) => {
  const users = db.prepare(
    "SELECT id, name, email, is_admin, member_since FROM users"
  ).all();
  res.json(users.map((u: Record<string, unknown>) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isAdmin: Boolean(u.is_admin),
    memberSince: u.member_since,
  })));
});

export default router;
