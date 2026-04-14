import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

router.get("/", (_, res) => {
  const gyms = db.prepare("SELECT * FROM gyms").all();
  res.json(
    gyms.map((g: Record<string, unknown>) => ({
      id: g.id,
      name: g.name,
      address: g.address,
      city: g.city,
      description: g.description,
      maxCapacity: g.max_capacity,
      currentOccupancy: g.current_occupancy,
      co2Level: g.co2_level,
      temperature: g.temperature,
    }))
  );
});

router.get("/:id", (req, res) => {
  const gym = db.prepare("SELECT * FROM gyms WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
  if (!gym) { res.status(404).json({ error: "Salle introuvable" }); return; }
  res.json({
    id: gym.id,
    name: gym.name,
    address: gym.address,
    city: gym.city,
    description: gym.description,
    maxCapacity: gym.max_capacity,
    currentOccupancy: gym.current_occupancy,
    co2Level: gym.co2_level,
    temperature: gym.temperature,
  });
});

router.post("/:id/subscribe", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const gym = db.prepare("SELECT id FROM gyms WHERE id = ?").get(id);
  if (!gym) { res.status(404).json({ error: "Salle introuvable" }); return; }

  const existing = db.prepare("SELECT id FROM user_gyms WHERE user_id = ? AND gym_id = ?").get(userId, id);
  if (existing) { res.status(400).json({ error: "Deja inscrit dans cette salle" }); return; }

  db.prepare("INSERT INTO user_gyms (user_id, gym_id) VALUES (?, ?)").run(userId, id);
  res.json({ success: true, message: "Inscription confirmee" });
});

router.delete("/:id/subscribe", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const existing = db.prepare("SELECT id FROM user_gyms WHERE user_id = ? AND gym_id = ?").get(userId, id);
  if (!existing) { res.status(400).json({ error: "Pas inscrit dans cette salle" }); return; }

  db.prepare("DELETE FROM user_gyms WHERE user_id = ? AND gym_id = ?").run(userId, id);
  res.json({ success: true, message: "Desinscription confirmee" });
});

router.get("/user/subscriptions", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const subscriptions = db.prepare(
    "SELECT gym_id FROM user_gyms WHERE user_id = ?"
  ).all(userId) as { gym_id: string }[];
  res.json(subscriptions.map((s) => s.gym_id));
});

export default router;
