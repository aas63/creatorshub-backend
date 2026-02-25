import { Router } from "express";
import {
  register,
  login,
  refresh,
  verifyAccount,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify", verifyAccount);

export default router;
