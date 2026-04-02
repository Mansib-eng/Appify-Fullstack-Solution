import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";

async function ensureVisiblePost(postId, currentUserId) {
  const post = await Post.findById(postId);
  if (!post) {
    return null;
  }

  if (post.visibility === "private" && post.author.toString() !== currentUserId.toString()) {
    return null;
  }

  return post;
}

export async function createComment(req, res) {
  const { text } = req.body;
  const { postId } = req.params;

  if (!text?.trim()) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  const post = await ensureVisiblePost(postId, req.user._id);
  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    text: text.trim(),
  });

  await comment.populate("author", "firstName lastName email");
  await comment.populate("likes", "firstName lastName email");

  return res.status(201).json({
    message: "Comment added",
    comment: {
      ...comment.toObject(),
      isLikedByMe: false,
      replies: [],
    },
  });
}

export async function createReply(req, res) {
  const { text } = req.body;
  const { commentId } = req.params;

  if (!text?.trim()) {
    return res.status(400).json({ message: "Reply text is required." });
  }

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    return res.status(404).json({ message: "Parent comment not found." });
  }

  const post = await ensureVisiblePost(parentComment.post, req.user._id);
  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const reply = await Comment.create({
    post: parentComment.post,
    author: req.user._id,
    parentComment: parentComment._id,
    text: text.trim(),
  });

  await reply.populate("author", "firstName lastName email");
  await reply.populate("likes", "firstName lastName email");

  return res.status(201).json({
    message: "Reply added",
    comment: {
      ...reply.toObject(),
      isLikedByMe: false,
    },
  });
}

export async function toggleCommentLike(req, res) {
  const comment = await Comment.findById(req.params.commentId)
    .populate("author", "firstName lastName email");

  if (!comment) {
    return res.status(404).json({ message: "Comment not found." });
  }

  const post = await ensureVisiblePost(comment.post, req.user._id);
  if (!post) {
    return res.status(404).json({ message: "Comment not found." });
  }

  const alreadyLiked = comment.likes.some(
    (likeUserId) => likeUserId.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    comment.likes = comment.likes.filter(
      (likeUserId) => likeUserId.toString() !== req.user._id.toString()
    );
  } else {
    comment.likes.push(req.user._id);
  }

  await comment.save();
  await comment.populate("likes", "firstName lastName email");

  return res.json({
    message: alreadyLiked ? "Comment unliked" : "Comment liked",
    likes: comment.likes,
    isLikedByMe: !alreadyLiked,
  });
}
