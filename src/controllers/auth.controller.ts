import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  const { email, password, username, displayName } = req.body;

  // TEMP — no DB yet
  return res.status(201).json({
    user: {
      id: "uuid-placeholder",
      username,
      displayName,
      bio: null,
      profileImageUrl: null
    },
    accessToken: "access-token-placeholder",
    refreshToken: "refresh-token-placeholder"
  });
};

export const login = async (req: Request, res: Response) => {
  return res.json({
    user: {
      id: "uuid-placeholder",
      username: "demo",
      displayName: "Demo User",
      bio: null,
      profileImageUrl: null
    },
    accessToken: "access-token-placeholder",
    refreshToken: "refresh-token-placeholder"
  });
};

export const refresh = async (req: Request, res: Response) => {
  return res.json({
    accessToken: "new-access-token-placeholder"
  });
};
