import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "./database.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "gymwatch-secret-key-dev";

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token manquant" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(403).json({ error: "Token invalide" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(req.userId) as { is_admin: number } | undefined;
  if (!user || !user.is_admin) {
    res.status(403).json({ error: "Acces admin requis" });
    return;
  }
  next();
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
