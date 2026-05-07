import { Router } from "express";
import db from "../database.js";

const router = Router();

router.get("/stats", (_, res) => {
  const stats = db.prepare("SELECT * FROM gym_stats WHERE id = 1").get() as Record<string, unknown>;

  res.json({
    currentOccupancy: stats.current_occupancy,
    maxCapacity: stats.max_capacity,
    co2Level: stats.co2_level,
    temperature: stats.temperature,
  });
});

export default router;
