import { Router } from "express";
import multer from "multer";
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
const upload = multer({
  storage: multer.memoryStorage(),
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
