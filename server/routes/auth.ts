import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../database.js";
import { signToken } from "../middleware.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Cet email est deja utilise" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash, goals) VALUES (?, ?, ?, ?)"
  ).run(name, email, hash, JSON.stringify([]));

  const token = signToken(result.lastInsertRowid as number);

  res.status(201).json({
    token,
    user: {
      id: result.lastInsertRowid,
      name,
      email,
      isAdmin: false,
      memberSince: new Date().toISOString().split("T")[0],
      goals: [],
    },
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const user = db.prepare(
    "SELECT id, name, email, password_hash, is_admin, member_since, goals FROM users WHERE email = ?"
  ).get(email) as { id: number; name: string; email: string; password_hash: string; is_admin: number; member_since: string; goals: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const token = signToken(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.is_admin),
      memberSince: user.member_since,
      goals: JSON.parse(user.goals),
    },
  });
});

export default router;
