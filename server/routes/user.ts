import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

router.get("/profile", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const user = db.prepare(
    "SELECT id, name, email, is_admin, member_since, goals FROM users WHERE id = ?"
  ).get(userId) as Record<string, unknown>;

  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  const sessionCount = db.prepare(
    "SELECT COUNT(*) as count FROM sessions WHERE user_id = ?"
  ).get(userId) as { count: number };

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
    memberSince: user.member_since,
    goals: JSON.parse(user.goals as string),
    totalSessions: sessionCount.count,
  });
});

router.put("/profile", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { name, goals } = req.body;

  if (name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
  if (goals) db.prepare("UPDATE users SET goals = ? WHERE id = ?").run(JSON.stringify(goals), userId);

  const user = db.prepare(
    "SELECT id, name, email, is_admin, member_since, goals FROM users WHERE id = ?"
  ).get(userId) as Record<string, unknown>;

  const sessionCount = db.prepare(
    "SELECT COUNT(*) as count FROM sessions WHERE user_id = ?"
  ).get(userId) as { count: number };

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
    memberSince: user.member_since,
    goals: JSON.parse(user.goals as string),
    totalSessions: sessionCount.count,
  });
});

router.get("/bookings", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const bookings = db.prepare(`
    SELECT gc.id, gc.name, gc.instructor, gc.time, gc.duration, gc.spots_left, gc.total_spots, gc.color
    FROM class_bookings cb
    JOIN group_classes gc ON cb.class_id = gc.id
    WHERE cb.user_id = ?
  `).all(userId);

  res.json(
    bookings.map((b: Record<string, unknown>) => ({
      id: b.id,
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
