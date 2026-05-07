import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase, seedDatabase } from "./database.js";
import authRoutes from "./routes/auth.js";
import machinesRoutes from "./routes/machines.js";
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import gymRoutes from "./routes/gym.js";
import gymsRoutes from "./routes/gyms.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(cors());
app.use(express.json());

initDatabase();
seedDatabase();

app.use("/api/auth", authRoutes);
app.use("/api/machines", machinesRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/gym", gymRoutes);
app.use("/api/gyms", gymsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// En production : servir le build Vite et fallback SPA
if (isProd) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`GymWatch API running on http://localhost:${PORT}`);
});
