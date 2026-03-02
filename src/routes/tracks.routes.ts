import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.middleware";
import {
  uploadTrack,
  getFeed,
  getTrackDetail,
  likeTrack,
  unlikeTrack,
  addComment,
  listComments,
} from "../controllers/tracks.controller";

const router = Router();
const uploadsDir = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // limit to ~50MB uploads for now
  },
});

router.post(
  "/upload",
  requireAuth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  uploadTrack
);

router.get("/", requireAuth, getFeed);
router.get("/:trackId", requireAuth, getTrackDetail);
router.get("/:trackId/comments", requireAuth, listComments);
router.post("/:trackId/like", requireAuth, likeTrack);
router.delete("/:trackId/like", requireAuth, unlikeTrack);
router.post("/:trackId/comments", requireAuth, addComment);

export default router;
