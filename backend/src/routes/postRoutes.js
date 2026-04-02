import { Router } from "express";
import multer from "multer";
import { createPost, getFeed, togglePostLike } from "../controllers/postController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(requireAuth);
router.get("/", asyncHandler(getFeed));
router.post("/", upload.single("image"), asyncHandler(createPost));
router.post("/:postId/like", asyncHandler(togglePostLike));

export default router;
