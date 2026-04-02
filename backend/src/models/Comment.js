import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Top-level comments by post
commentSchema.index({ post: 1, createdAt: 1 });

// Replies by parent comment
commentSchema.index({ parentComment: 1, createdAt: 1 });

// Useful for looking up user's activity if needed later
commentSchema.index({ author: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);