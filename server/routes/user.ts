import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

function safeParse<T>(raw: unknown, fallback: T): T {
  try { return JSON.parse(raw as string) as T; } catch { return fallback; }
}

function formatUser(user: Record<string, unknown>, sessionCount: number) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
    memberSince: user.member_since,
    goals: safeParse<string[]>(user.goals, []),
    weekPlan: safeParse<Record<string, string>>(user.week_plan, {}),
    totalSessions: sessionCount,
  };
}

router.get("/profile", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const user = db
    .prepare("SELECT id, name, email, is_admin, member_since, goals, week_plan FROM users WHERE id = ?")
    .get(userId) as Record<string, unknown>;

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?")
    .get(userId) as { count: number };

  res.json(formatUser(user, count));
});

router.put("/profile", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { name, goals } = req.body;

  if (name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
  if (goals) db.prepare("UPDATE users SET goals = ? WHERE id = ?").run(JSON.stringify(goals), userId);

  const user = db
    .prepare("SELECT id, name, email, is_admin, member_since, goals, week_plan FROM users WHERE id = ?")
    .get(userId) as Record<string, unknown>;

  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?")
    .get(userId) as { count: number };

  res.json(formatUser(user, count));
});

router.put("/week-plan", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { weekPlan } = req.body;

  if (!weekPlan || typeof weekPlan !== "object") {
    res.status(400).json({ error: "weekPlan requis" });
    return;
  }

  db.prepare("UPDATE users SET week_plan = ? WHERE id = ?").run(JSON.stringify(weekPlan), userId);
  res.json({ success: true });
});

router.get("/bookings", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const bookings = db
    .prepare(`
      SELECT gc.id, gc.gym_id, g.name as gym_name, gc.name, gc.instructor,
             gc.time, gc.duration, gc.spots_left, gc.total_spots, gc.color
      FROM class_bookings cb
      JOIN group_classes gc ON cb.class_id = gc.id
      JOIN gyms g ON gc.gym_id = g.id
      WHERE cb.user_id = ?
      ORDER BY gc.time
    `)
    .all(userId);

  res.json(
    bookings.map((b: Record<string, unknown>) => ({
      id: b.id,
      gymId: b.gym_id,
      gymName: b.gym_name,
      name: b.name,
      instructor: b.instructor,
      time: b.time,
      duration: b.duration,
      spotsLeft: b.spots_left,
      totalSpots: b.total_spots,
      color: b.color,
    }))
  );
});

export default router;
