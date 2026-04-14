import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

router.get("/", (req, res) => {
  const gymId = req.query.gymId as string | undefined;

  const classes = gymId
    ? db.prepare("SELECT * FROM group_classes WHERE gym_id = ?").all(gymId)
    : db.prepare("SELECT * FROM group_classes").all();

  res.json(
    classes.map((c: Record<string, unknown>) => ({
      id: c.id,
      gymId: c.gym_id,
      name: c.name,
      instructor: c.instructor,
      time: c.time,
      duration: c.duration,
      spotsLeft: c.spots_left,
      totalSpots: c.total_spots,
      color: c.color,
    }))
  );
});

router.post("/:id/book", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const cls = db.prepare("SELECT * FROM group_classes WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!cls) { res.status(404).json({ error: "Cours introuvable" }); return; }
  if ((cls.spots_left as number) <= 0) { res.status(400).json({ error: "Plus de places disponibles" }); return; }

  const existing = db.prepare("SELECT id FROM class_bookings WHERE user_id = ? AND class_id = ?").get(userId, id);
  if (existing) { res.status(400).json({ error: "Deja inscrit a ce cours" }); return; }

  db.prepare("INSERT INTO class_bookings (user_id, class_id) VALUES (?, ?)").run(userId, id);
  db.prepare("UPDATE group_classes SET spots_left = spots_left - 1 WHERE id = ?").run(id);

  res.json({ success: true, message: "Inscription confirmee" });
});

router.delete("/:id/book", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const booking = db.prepare("SELECT id FROM class_bookings WHERE user_id = ? AND class_id = ?").get(userId, id);
  if (!booking) { res.status(400).json({ error: "Pas inscrit a ce cours" }); return; }

  db.prepare("DELETE FROM class_bookings WHERE user_id = ? AND class_id = ?").run(userId, id);
  db.prepare("UPDATE group_classes SET spots_left = spots_left + 1 WHERE id = ?").run(id);

  res.json({ success: true, message: "Desinscription confirmee" });
});

export default router;
