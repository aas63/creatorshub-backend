// src/routes/user.routes.ts
import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { pool } from "../db";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, display_name, bio, profile_image_url
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      profileImageUrl: user.profile_image_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;