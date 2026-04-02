import mongoose from "mongoose";
import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { fileToBase64 } from "../utils/image.js";

function mapCommentsWithReplies(comments, currentUserId) {
  const topLevel = [];
  const repliesByParent = new Map();

  for (const comment of comments) {
    const normalized = {
      _id: comment._id,
      post: comment.post,
      author: comment.author,
      parentComment: comment.parentComment,
      text: comment.text,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isLikedByMe: comment.likes.some(
        (user) => user._id.toString() === currentUserId
      ),
      replies: [],
    };

    if (normalized.parentComment) {
      const key = normalized.parentComment.toString();
      const bucket = repliesByParent.get(key) || [];
      bucket.push(normalized);
      repliesByParent.set(key, bucket);
    } else {
      topLevel.push(normalized);
    }
  }

  for (const comment of topLevel) {
    comment.replies = repliesByParent.get(comment._id.toString()) || [];
  }

  return topLevel;
}

export async function createPost(req, res) {
  const { text = "", visibility = "public" } = req.body;

  if (!text.trim() && !req.file) {
    return res.status(400).json({ message: "Post must contain text or an image." });
  }

  const imageData = fileToBase64(req.file);

  const post = await Post.create({
    author: req.user._id,
    text: text.trim(),
    imageData,
    visibility,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("author", "firstName lastName email")
    .populate("likes", "firstName lastName email");

  return res.status(201).json({
    message: "Post created",
    post: {
      ...populatedPost.toObject(),
      isLikedByMe: false,
      comments: [],
    },
  });
}

export async function getFeed(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
  const skip = (page - 1) * limit;

  const userObjectId = new mongoose.Types.ObjectId(req.user._id);
  const currentUserId = req.user._id.toString();

  const feedQuery = {
    $or: [{ visibility: "public" }, { author: userObjectId }],
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(feedQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName email")
      .populate("likes", "firstName lastName email")
      .lean(),
    Post.countDocuments(feedQuery),
  ]);

  if (!posts.length) {
    return res.json({
      posts: [],
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: false,
      },
    });
  }

  const postIds = posts.map((post) => post._id);

  const comments = await Comment.find({ post: { $in: postIds } })
    .sort({ createdAt: 1 })
    .populate("author", "firstName lastName email")
    .populate("likes", "firstName lastName email")
    .lean();

  const commentsByPost = new Map();

  for (const comment of comments) {
    const key = comment.post.toString();
    const bucket = commentsByPost.get(key) || [];
    bucket.push(comment);
    commentsByPost.set(key, bucket);
  }

  const normalizedPosts = posts.map((post) => ({
    ...post,
    isLikedByMe: post.likes.some(
      (user) => user._id.toString() === currentUserId
    ),
    comments: mapCommentsWithReplies(
      commentsByPost.get(post._id.toString()) || [],
      currentUserId
    ),
  }));

  return res.json({
    posts: normalizedPosts,
    pagination: {
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: page * limit < totalPosts,
    },
  });
}

export async function togglePostLike(req, res) {
  const post = await Post.findById(req.params.postId).populate(
    "author",
    "firstName lastName email"
  );

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const isPrivatePostOwnedByOtherUser =
    post.visibility === "private" &&
    post.author._id.toString() !== req.user._id.toString();

  if (isPrivatePostOwnedByOtherUser) {
    return res.status(404).json({ message: "Post not found." });
  }

  const alreadyLiked = post.likes.some(
    (likeUserId) => likeUserId.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (likeUserId) => likeUserId.toString() !== req.user._id.toString()
    );
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  await post.populate("likes", "firstName lastName email");

  return res.json({
    message: alreadyLiked ? "Post unliked" : "Post liked",
    likes: post.likes,
    isLikedByMe: !alreadyLiked,
  });
}