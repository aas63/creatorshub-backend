import path from "path";
import fs from "fs/promises";
import { Response } from "express";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middleware/auth.middleware";
import { pool } from "../db";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

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
  const { title, description } = req.body;

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

    const trackId = randomUUID();
    const payload = {
      trackId,
      userId,
      title,
      description: description || null,
      fileUrl: publicUrl,
      coverImageUrl,
    };

    try {
      await pool.query(
        `INSERT INTO tracks (id, user_id, title, description, file_url, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          payload.trackId,
          payload.userId,
          payload.title,
          payload.description,
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
