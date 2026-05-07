/**
 * Crée l'application Express complète pointant sur la DB :memory:
 * (process.env.GYMWATCH_DB doit être positionné avant tout import de database.ts)
 */
import express from "express";
import { initDatabase, seedDatabase } from "../database.js";
import authRoutes from "../routes/auth.js";
import sessionsRoutes from "../routes/sessions.js";
import userRoutes from "../routes/user.js";
import gymRoutes from "../routes/gym.js";
import gymsRoutes from "../routes/gyms.js";
import machinesRoutes from "../routes/machines.js";
import classesRoutes from "../routes/classes.js";
import adminRoutes from "../routes/admin.js";

export function createTestApp() {
  initDatabase();
  seedDatabase();

  const app = express();
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/sessions", sessionsRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/gym", gymRoutes);
  app.use("/api/gyms", gymsRoutes);
  app.use("/api/machines", machinesRoutes);
  app.use("/api/classes", classesRoutes);
  app.use("/api/admin", adminRoutes);

  return app;
}
