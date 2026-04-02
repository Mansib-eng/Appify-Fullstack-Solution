import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    imageData: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
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

// Better aligned with feed queries:
// public posts sorted by newest
postSchema.index({ visibility: 1, createdAt: -1 });

// current user's own posts sorted by newest
postSchema.index({ author: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);