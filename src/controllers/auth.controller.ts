import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { pool } from "../db";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/mailer";

const VERIFICATION_TTL_MINUTES =
  Number(process.env.VERIFICATION_CODE_TTL_MINUTES) || 10;

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { email, password, username, displayName } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "EMAIL_OR_USERNAME_TAKEN" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, display_name, is_verified)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id`,
      [email, passwordHash, username, displayName]
    );

    const user = result.rows[0];
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO verification_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
      [user.id, verificationCode, expiresAt]
    );

    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailErr) {
      console.error("Failed to send verification email", emailErr);
      return res
        .status(500)
        .json({ error: "FAILED_TO_SEND_VERIFICATION_EMAIL" });
    }

    return res.status(201).json({
      message: "VERIFICATION_REQUIRED",
      userId: user.id,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ error: "EMAIL_NOT_VERIFIED", userId: user.id });
    }

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    return res.json({
      user: mapUserRow(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "MISSING_REFRESH_TOKEN" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET!
    ) as any;

    const accessToken = signAccessToken({ userId: payload.userId });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }
};

// VERIFY ACCOUNT
export const verifyAccount = async (req: Request, res: Response) => {
  const { userId, code } = req.body as { userId?: string; code?: string };

  if (!userId || !code) {
    return res.status(400).json({ error: "USER_ID_AND_CODE_REQUIRED" });
  }

  try {
    const verification = await pool.query(
      `SELECT code, expires_at FROM verification_codes WHERE user_id = $1`,
      [userId]
    );

    if (verification.rows.length === 0) {
      return res.status(400).json({ error: "NO_VERIFICATION_REQUEST" });
    }

    const record = verification.rows[0];
    const expiresAt = new Date(record.expires_at);

    if (record.code !== code) {
      return res.status(400).json({ error: "INVALID_CODE" });
    }

    if (expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "CODE_EXPIRED" });
    }

    await pool.query(`UPDATE users SET is_verified = true WHERE id = $1`, [
      userId,
    ]);
    await pool.query(`DELETE FROM verification_codes WHERE user_id = $1`, [
      userId,
    ]);

    const userResult = await pool.query(
      `SELECT id, username, display_name, bio, profile_image_url
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const user = userResult.rows[0];

    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId });

    return res.json({
      user: mapUserRow(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

const mapUserRow = (user: any) => ({
  id: user.id,
  username: user.username,
  displayName: user.display_name,
  bio: user.bio,
  profileImageUrl: user.profile_image_url,
});

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
