"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

function likerText(likes = []) {
  if (!likes.length) return "No likes yet";
  return likes.map((user) => `${user.firstName} ${user.lastName}`).join(", ");
}

function CommentCard({ comment, onLikeComment, onReplyComment, submittingReply }) {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  async function submitReply(event) {
    event.preventDefault();
    if (!replyText.trim()) return;
    await onReplyComment(comment._id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  }

  return (
    <div className="border rounded p-3 mt-3 bg-white">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h6 className="mb-1">
            {comment.author.firstName} {comment.author.lastName}
          </h6>
          <small className="text-muted">{formatDate(comment.createdAt)}</small>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onLikeComment(comment._id)}
        >
          {comment.isLikedByMe ? "Unlike" : "Like"} ({comment.likes.length})
        </button>
      </div>

      <p className="mt-2 mb-2">{comment.text}</p>
      <small className="d-block text-muted">Liked by: {likerText(comment.likes)}</small>

      <button
        type="button"
        className="btn btn-link btn-sm px-0 mt-2"
        onClick={() => setShowReplyBox((current) => !current)}
      >
        {showReplyBox ? "Cancel reply" : "Reply"}
      </button>

      {showReplyBox ? (
        <form onSubmit={submitReply} className="mt-2">
          <textarea
            className="form-control"
            rows={2}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Write a reply"
          />
          <button className="btn btn-dark btn-sm mt-2" disabled={submittingReply}>
            {submittingReply ? "Posting..." : "Post reply"}
          </button>
        </form>
      ) : null}

      {comment.replies?.length ? (
        <div className="mt-3 ps-3 border-start">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="mt-3">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <h6 className="mb-1">
                    {reply.author.firstName} {reply.author.lastName}
                  </h6>
                  <small className="text-muted">{formatDate(reply.createdAt)}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onLikeComment(reply._id)}
                >
                  {reply.isLikedByMe ? "Unlike" : "Like"} ({reply.likes.length})
                </button>
              </div>
              <p className="mt-2 mb-2">{reply.text}</p>
              <small className="d-block text-muted">Liked by: {likerText(reply.likes)}</small>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalPosts: 0,
  totalPages: 0,
  hasMore: false,
};

export default function FeedClient() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [composer, setComposer] = useState({
    text: "",
    visibility: "public",
    image: null,
  });
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState("");
  const [message, setMessage] = useState("");

  async function fetchCurrentUser() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await response.json();

    if (response.status === 401) {
      router.push("/login");
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch current user");
    }

    return data.user;
  }

  async function fetchFeedPage(page = 1, limit = 10) {
    const response = await fetch(`/api/posts?page=${page}&limit=${limit}`, {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch posts");
    }

    return data;
  }

  async function loadFeedPage(pageToLoad = 1, append = false) {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setMessage("");

      const data = await fetchFeedPage(pageToLoad, 10);

      setPosts((current) =>
        append ? [...current, ...(data.posts || [])] : (data.posts || [])
      );

      setPagination(data.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      setMessage(error.message || "Unable to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function refreshLoadedFeed() {
    try {
      setLoading(true);
      setMessage("");

      const pagesToReload = pagination.page || 1;
      let mergedPosts = [];
      let latestPagination = DEFAULT_PAGINATION;

      for (let pageNumber = 1; pageNumber <= pagesToReload; pageNumber += 1) {
        const data = await fetchFeedPage(pageNumber, 10);
        mergedPosts = [...mergedPosts, ...(data.posts || [])];
        latestPagination = data.pagination || latestPagination;
      }

      setPosts(mergedPosts);
      setPagination(latestPagination);
    } catch (error) {
      setMessage(error.message || "Unable to refresh feed");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      setMessage("");

      const [user, feedData] = await Promise.all([
        fetchCurrentUser(),
        fetchFeedPage(1, 10),
      ]);

      setMe(user);
      setPosts(feedData.posts || []);
      setPagination(feedData.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      if (error.message !== "Unauthorized") {
        setMessage(error.message || "Unable to load feed");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function createPost(event) {
    event.preventDefault();
    if (!composer.text.trim() && !composer.image) return;

    setPosting(true);
    setMessage("");

    try {
      const body = new FormData();
      body.append("text", composer.text);
      body.append("visibility", composer.visibility);
      if (composer.image) {
        body.append("image", composer.image);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create post");
      }

      setComposer({ text: "", visibility: "public", image: null });
      const fileInput = document.getElementById("post-image-input");
      if (fileInput) fileInput.value = "";

      await loadFeedPage(1, false);
    } catch (error) {
      setMessage(error.message || "Unable to create post");
    } finally {
      setPosting(false);
    }
  }

  async function togglePostLike(postId) {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to toggle post like");
      }

      await refreshLoadedFeed();
    } catch (error) {
      setMessage(error.message || "Unable to toggle post like");
    }
  }

  async function toggleCommentLike(commentId) {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to toggle comment like");
      }

      await refreshLoadedFeed();
    } catch (error) {
      setMessage(error.message || "Unable to toggle comment like");
    }
  }

  async function createComment(postId) {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const response = await fetch(`/api/comments/post/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add comment");
      }

      setCommentInputs((current) => ({ ...current, [postId]: "" }));
      await refreshLoadedFeed();
    } catch (error) {
      setMessage(error.message || "Unable to add comment");
    }
  }

  async function createReply(commentId, text) {
    setReplyingTo(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add reply");
      }

      await refreshLoadedFeed();
    } catch (error) {
      setMessage(error.message || "Unable to add reply");
    } finally {
      setReplyingTo("");
    }
  }

  async function handleLoadMore() {
    if (!pagination.hasMore || loadingMore) return;
    await loadFeedPage((pagination.page || 1) + 1, true);
  }

  const feedTitle = useMemo(() => {
    if (!me) return "Your feed";
    return `Welcome, ${me.firstName}`;
  }, [me]);

  if (loading) {
    return (
      <div className="_layout_main_wrapper p-5">
        <div className="container">
          <div className="alert alert-info">Loading feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="_layout _layout_main_wrapper">
      <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
        <div className="container _custom_container">
          <div className="_logo_wrap">
            <a className="navbar-brand" href="/feed">
              <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
            </a>
          </div>

          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="fw-semibold">{feedTitle}</span>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {message ? <div className="alert alert-warning">{message}</div> : null}

        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16 bg-white">
              <form onSubmit={createPost}>
                <div className="_feed_inner_text_area_box">
                  <div className="_feed_inner_text_area_box_image">
                    <img src="/assets/images/txt_img.png" alt="Profile" className="_txt_img" />
                  </div>

                  <div className="w-100">
                    <textarea
                      className="form-control _textarea"
                      rows={4}
                      placeholder="Write something ..."
                      value={composer.text}
                      onChange={(event) =>
                        setComposer((current) => ({ ...current, text: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="row mt-3 g-3">
                  <div className="col-md-4">
                    <input
                      id="post-image-input"
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          image: event.target.files?.[0] || null,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={composer.visibility}
                      onChange={(event) =>
                        setComposer((current) => ({ ...current, visibility: event.target.value }))
                      }
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="col-md-4 text-md-end">
                    <button type="submit" className="_feed_inner_text_area_btn_link" disabled={posting}>
                      {posting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {posts.length === 0 ? (
              <div className="alert alert-secondary">No posts yet. Create the first post.</div>
            ) : null}

            {posts.map((post) => (
              <div key={post._id} className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 bg-white">
                <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                  <div className="_feed_inner_timeline_post_top d-flex justify-content-between align-items-start gap-3">
                    <div className="_feed_inner_timeline_post_box d-flex align-items-center gap-3">
                      <div className="_feed_inner_timeline_post_box_image">
                        <img src="/assets/images/post_img.png" alt="User" className="_post_img" />
                      </div>

                      <div className="_feed_inner_timeline_post_box_txt">
                        <h4 className="_feed_inner_timeline_post_box_title">
                          {post.author.firstName} {post.author.lastName}
                        </h4>
                        <p className="_feed_inner_timeline_post_box_para mb-0">
                          {formatDate(post.createdAt)} · <span>{post.visibility}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="mb-3">{post.text}</p>
                    {post.imageData ? (
                      <img
                        src={post.imageData}
                        alt="Post image"
                        className="img-fluid rounded border"
                        style={{ maxHeight: "420px", objectFit: "cover", width: "100%" }}
                      />
                    ) : null}
                  </div>

                  <div className="d-flex flex-wrap justify-content-between gap-3 mt-3 align-items-center">
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark me-2"
                        onClick={() => togglePostLike(post._id)}
                      >
                        {post.isLikedByMe ? "Unlike" : "Like"} ({post.likes.length})
                      </button>
                    </div>
                    <small className="text-muted">Liked by: {likerText(post.likes)}</small>
                  </div>

                  <div className="mt-4">
                    <div className="d-flex gap-2">
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Write a comment"
                        value={commentInputs[post._id] || ""}
                        onChange={(event) =>
                          setCommentInputs((current) => ({
                            ...current,
                            [post._id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => createComment(post._id)}
                      >
                        Comment
                      </button>
                    </div>

                    <div className="mt-3">
                      {post.comments?.map((comment) => (
                        <CommentCard
                          key={comment._id}
                          comment={comment}
                          onLikeComment={toggleCommentLike}
                          onReplyComment={createReply}
                          submittingReply={replyingTo === comment._id}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {posts.length > 0 && pagination.hasMore ? (
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}