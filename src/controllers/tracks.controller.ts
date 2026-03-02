import path from "path";
import fs from "fs/promises";
import { Response, Request } from "express";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middleware/auth.middleware";
import { pool } from "../db";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const FEED_LIMIT = Number(process.env.FEED_LIMIT) || 50;
const MAX_CAPTION_LENGTH = 150;
const MAX_COMMENT_LENGTH = 500;

type UploadRequest = AuthRequest & {
  file?: Express.Multer.File;
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[];
};

export const uploadTrack = async (req: UploadRequest, res: Response) => {
  const userId = req.userId;
  const files =
    (Array.isArray(req.files) ? undefined : (req.files as Record<
      string,
      Express.Multer.File[]
    > | undefined)) ?? undefined;
  const audioFile = files?.file?.[0] ?? req.file;
  const coverImageFile = files?.coverImage?.[0];
  const { title, description, caption } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  if (!audioFile || !title) {
    return res.status(400).json({ error: "FILE_AND_TITLE_REQUIRED" });
  }

  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const relativePath = path.relative(
      process.cwd(),
      audioFile.path ?? path.join(UPLOADS_DIR, audioFile.filename)
    );
    const publicUrl = `/${relativePath.split(path.sep).join("/")}`;
    let coverImageUrl: string | null = null;

    if (coverImageFile) {
      const coverRelative = path
        .relative(
          process.cwd(),
          coverImageFile.path ?? path.join(UPLOADS_DIR, coverImageFile.filename)
        )
        .split(path.sep)
        .join("/");
      coverImageUrl = `/${coverRelative}`;
    }

    const sanitizedCaption = (caption || "").trim().slice(0, MAX_CAPTION_LENGTH) || null;
    const trackId = randomUUID();
    const payload = {
      trackId,
      userId,
      title,
      description: description || null,
      caption: sanitizedCaption,
      fileUrl: publicUrl,
      coverImageUrl,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
    };

    try {
      await pool.query(
        `INSERT INTO tracks (id, user_id, title, description, caption, file_url, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          payload.trackId,
          payload.userId,
          payload.title,
          payload.description,
          payload.caption,
          payload.fileUrl,
          payload.coverImageUrl,
        ]
      );
    } catch (dbError) {
      console.warn(
        "[tracks] Failed to persist track record. Ensure the tracks table exists.",
        dbError
      );
    }

    return res.status(201).json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "UPLOAD_FAILED" });
  }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  try {
    const result = await pool.query(
      `SELECT
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.caption,
        t.file_url,
        t.cover_image_url,
        t.created_at,
        u.username,
        u.display_name,
        COALESCE(l.like_count, 0) AS likes_count,
        COALESCE(c.comment_count, 0) AS comments_count,
        EXISTS (
          SELECT 1 FROM likes WHERE likes.track_id = t.id AND likes.user_id = $2
        ) AS liked_by_me
       FROM tracks t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN (
        SELECT track_id, COUNT(*) AS like_count FROM likes GROUP BY track_id
       ) l ON l.track_id = t.id
       LEFT JOIN (
        SELECT track_id, COUNT(*) AS comment_count FROM comments GROUP BY track_id
       ) c ON c.track_id = t.id
       WHERE u.is_verified = true
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [FEED_LIMIT, userId]
    );

    return res.json(result.rows.map(mapTrackRow));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export const getTrackDetail = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { trackId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  try {
    const trackResult = await pool.query(
      `SELECT
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.caption,
        t.file_url,
        t.cover_image_url,
        t.created_at,
        u.username,
        u.display_name,
        COALESCE(l.like_count, 0) AS likes_count,
        COALESCE(c.comment_count, 0) AS comments_count,
        EXISTS (
          SELECT 1 FROM likes WHERE likes.track_id = t.id AND likes.user_id = $2
        ) AS liked_by_me
       FROM tracks t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN (
        SELECT track_id, COUNT(*) AS like_count FROM likes GROUP BY track_id
       ) l ON l.track_id = t.id
       LEFT JOIN (
        SELECT track_id, COUNT(*) AS comment_count FROM comments GROUP BY track_id
       ) c ON c.track_id = t.id
       WHERE t.id = $1`,
      [trackId, userId]
    );

    if (trackResult.rows.length === 0) {
      return res.status(404).json({ error: "TRACK_NOT_FOUND" });
    }

    const commentsResult = await pool.query(
      `SELECT
        comments.id,
        comments.track_id,
        comments.text,
        comments.created_at,
        comments.user_id,
        u.username,
        u.display_name
       FROM comments
       JOIN users u ON u.id = comments.user_id
       WHERE comments.track_id = $1
       ORDER BY comments.created_at DESC
       LIMIT 100`,
      [trackId]
    );

    return res.json({
      track: mapTrackRow(trackResult.rows[0]),
      comments: commentsResult.rows.map(mapCommentRow),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export const likeTrack = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { trackId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  try {
    await pool.query(
      `INSERT INTO likes (user_id, track_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, trackId]
    );

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export const unlikeTrack = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { trackId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  try {
    await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND track_id = $2`,
      [userId, trackId]
    );
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { trackId } = req.params;
  const { text } = req.body as { text?: string };

  if (!userId) {
    return res.status(401).json({ error: "USER_NOT_AUTHENTICATED" });
  }

  const trimmed = (text || "").trim();
  if (!trimmed) {
    return res.status(400).json({ error: "COMMENT_REQUIRED" });
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({ error: "COMMENT_TOO_LONG" });
  }

  try {
    const commentId = randomUUID();

    await pool.query(
      `INSERT INTO comments (id, track_id, user_id, text)
       VALUES ($1, $2, $3, $4)`,
      [commentId, trackId, userId, trimmed]
    );

    const result = await pool.query(
      `SELECT
        comments.id,
        comments.track_id,
        comments.text,
        comments.created_at,
        comments.user_id,
        u.username,
        u.display_name
       FROM comments
       JOIN users u ON u.id = comments.user_id
       WHERE comments.id = $1`,
      [commentId]
    );

    return res.status(201).json(mapCommentRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export const listComments = async (req: Request, res: Response) => {
  const { trackId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        comments.id,
        comments.track_id,
        comments.text,
        comments.created_at,
        comments.user_id,
        u.username,
        u.display_name
       FROM comments
       JOIN users u ON u.id = comments.user_id
       WHERE comments.track_id = $1
       ORDER BY comments.created_at DESC
       LIMIT 100`,
      [trackId]
    );

    return res.json(result.rows.map(mapCommentRow));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};

const mapTrackRow = (row: any) => ({
  trackId: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  caption: row.caption,
  fileUrl: row.file_url,
  coverImageUrl: row.cover_image_url,
  createdAt: row.created_at,
  likesCount: Number(row.likes_count) || 0,
  commentsCount: Number(row.comments_count) || 0,
  likedByMe: row.liked_by_me ?? false,
  user: {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
  },
});

const mapCommentRow = (row: any) => ({
  id: row.id,
  trackId: row.track_id,
  text: row.text,
  createdAt: row.created_at,
  user: {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
  },
});
