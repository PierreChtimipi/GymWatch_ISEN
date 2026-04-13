import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

router.get("/", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const sessions = db.prepare(
    "SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC"
  ).all(userId);

  res.json(
    sessions.map((s: Record<string, unknown>) => ({
      id: s.id,
      date: s.date,
      duration: s.duration,
      caloriesBurned: s.calories_burned,
      exercisesCompleted: s.exercises_completed,
    }))
  );
});

router.post("/", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { date, duration, caloriesBurned, exercisesCompleted } = req.body;

  if (!date || !duration || !caloriesBurned || !exercisesCompleted) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }

  const result = db.prepare(
    "INSERT INTO sessions (user_id, date, duration, calories_burned, exercises_completed) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, date, duration, caloriesBurned, exercisesCompleted);

  res.status(201).json({
    id: result.lastInsertRowid,
    date,
    duration,
    caloriesBurned,
    exercisesCompleted,
  });
});

export default router;
