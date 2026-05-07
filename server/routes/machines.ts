import { Router } from "express";
import db from "../database.js";
import { authenticateToken, AuthRequest } from "../middleware.js";

const router = Router();

router.get("/", (req, res) => {
  const gymId = req.query.gymId as string | undefined;

  const machines = gymId
    ? db.prepare(`
        SELECT m.id, m.name, m.category, m.available, m.reserved, m.gym_id, u.name as reservedBy
        FROM machines m
        LEFT JOIN users u ON m.reserved_by = u.id
        WHERE m.gym_id = ?
      `).all(gymId)
    : db.prepare(`
        SELECT m.id, m.name, m.category, m.available, m.reserved, m.gym_id, u.name as reservedBy
        FROM machines m
        LEFT JOIN users u ON m.reserved_by = u.id
      `).all();

  res.json(
    machines.map((m: Record<string, unknown>) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      gymId: m.gym_id,
      available: Boolean(m.available),
      reserved: Boolean(m.reserved),
      reservedBy: m.reservedBy || undefined,
    }))
  );
});

router.post("/:id/reserve", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const machine = db.prepare("SELECT * FROM machines WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!machine) { res.status(404).json({ error: "Machine introuvable" }); return; }
  if (!machine.available || machine.reserved) { res.status(400).json({ error: "Machine non disponible" }); return; }

  db.prepare("UPDATE machines SET reserved = 1, reserved_by = ?, available = 0 WHERE id = ?").run(userId, id);
  res.json({ success: true, message: "Machine réservée" });
});

router.post("/:id/release", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  const machine = db.prepare("SELECT * FROM machines WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!machine) { res.status(404).json({ error: "Machine introuvable" }); return; }
  if (!machine.reserved || machine.reserved_by !== userId) {
    res.status(400).json({ error: "Vous n'avez pas réservé cette machine" }); return;
  }

  db.prepare("UPDATE machines SET reserved = 0, reserved_by = NULL, available = 1 WHERE id = ?").run(id);
  res.json({ success: true, message: "Réservation annulée" });
});

export default router;
