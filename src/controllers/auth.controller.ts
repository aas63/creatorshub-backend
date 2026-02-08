import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password, username, displayName } = req.body;

  // TEMP USER (DB comes later)
  const user = {
    id: "uuid-placeholder",
    username,
    displayName,
    bio: null,
    profileImageUrl: null
  };

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return res.status(201).json({
    user,
    accessToken,
    refreshToken
  });
};

export const login = async (_req: Request, res: Response) => {
  const user = {
    id: "uuid-placeholder",
    username: "demo",
    displayName: "Demo User",
    bio: null,
    profileImageUrl: null
  };

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return res.json({
    user,
    accessToken,
    refreshToken
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "MISSING_REFRESH_TOKEN" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;

    const accessToken = signAccessToken({ userId: payload.userId });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }
};
