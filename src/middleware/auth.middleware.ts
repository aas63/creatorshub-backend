import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "NO_AUTH_HEADER" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
