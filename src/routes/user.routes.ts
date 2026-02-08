import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth.middleware";


const router = Router();

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({
    id: req.userId,
    username: "demo",
    displayName: "Demo User",
    bio: null,
    profileImageUrl: null
  });
});

export default router;
