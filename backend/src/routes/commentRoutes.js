import { Router } from "express";
import {
  createComment,
  createReply,
  toggleCommentLike,
} from "../controllers/commentController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/post/:postId", asyncHandler(createComment));
router.post("/:commentId/reply", asyncHandler(createReply));
router.post("/:commentId/like", asyncHandler(toggleCommentLike));

export default router;
