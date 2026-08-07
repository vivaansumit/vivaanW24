"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, Send, Check } from "lucide-react";
import { useToast } from "./Toast";

interface Post {
  id: string;
  type: string;
  title?: string;
  caption: string;
  mediaUrls: string[];
  hashtags: string[];
  likesCount: number;
  viewsCount: number;
  commentsEnabled: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface PostDetailModalProps {
  post: Post | null;
  creatorName: string;
  creatorAvatar?: string;
  creatorHandle: string;
  onClose: () => void;
}

export function PostDetailModal({ post, creatorName, creatorAvatar, creatorHandle, onClose }: PostDetailModalProps) {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [likes, setLikes] = useState(post?.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (post) {
      setLikes(post.likesCount || 0);
      setHasLiked(false);
      setCurrentMediaIdx(0);
      fetchComments();
    }
  }, [post]);

  const fetchComments = async () => {
    if (!post) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data.comments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  if (!post) return null;

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      await fetch("/api/public/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", targetType: "post", targetId: post.id }),
      });
    } catch {
      // fallback
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) {
      showToast("Please provide your name and a comment message.", "info");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          authorName: authorName.trim(),
          content: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setCommentsList((prev) => [data.comment, ...prev]);
        setNewComment("");
        showToast("Comment posted!", "success");
      }
    } catch {
      showToast("Failed to post comment", "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast("Post link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a3a3a3] hover:text-white p-2 rounded-full bg-[#0a0a0a]/80 hover:bg-[#141414] transition z-[160]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Media Display */}
        {hasMedia ? (
          <div className="relative bg-black flex-1 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            <img
              src={post.mediaUrls[currentMediaIdx]}
              alt={post.title || "Post media"}
              className="w-full h-full object-contain max-h-[70vh]"
            />

            {/* Carousel Nav Arrows */}
            {post.mediaUrls.length > 1 && (
              <>
                {currentMediaIdx > 0 && (
                  <button
                    onClick={() => setCurrentMediaIdx((prev) => prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#111111]/80 text-white hover:bg-[#141414] transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentMediaIdx < post.mediaUrls.length - 1 && (
                  <button
                    onClick={() => setCurrentMediaIdx((prev) => prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#111111]/80 text-white hover:bg-[#141414] transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {post.mediaUrls.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentMediaIdx ? "w-5 bg-[#C9A227]" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Right Side: Details & Comments */}
        <div className="flex-1 flex flex-col p-5 overflow-y-auto max-h-[90vh]">
          {/* Creator Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#141414]">
            <img
              src={creatorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={creatorName}
              className="w-10 h-10 rounded-full object-cover border border-[#C9A227]/40"
            />
            <div>
              <h4 className="font-bold text-sm text-[#f5f5f5]">{creatorName}</h4>
              <p className="text-xs text-[#C9A227]">@{creatorHandle}</p>
            </div>
          </div>

          {/* Title & Caption */}
          <div className="py-4 border-b border-[#141414] space-y-2">
            {post.title && <h3 className="font-bold text-base text-[#f5f5f5]">{post.title}</h3>}
            <p className="text-sm text-[#a3a3a3] leading-relaxed whitespace-pre-line">{post.caption}</p>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {post.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-[#C9A227] font-medium hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Stats */}
          <div className="py-3 flex items-center justify-between border-b border-[#141414]">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                  hasLiked ? "text-rose-500" : "text-[#a3a3a3] hover:text-rose-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-rose-500" : ""}`} />
                <span>{likes}</span>
              </button>
              <div className="flex items-center gap-1.5 text-sm text-[#a3a3a3]">
                <MessageCircle className="w-5 h-5" />
                <span>{commentsList.length}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="text-[#a3a3a3] hover:text-[#C9A227] flex items-center gap-1 text-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-[#C9A227]" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>

          {/* Comments Stream */}
          <div className="flex-1 py-4 space-y-3 overflow-y-auto min-h-[140px]">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]/80">Comments</h5>
            {loadingComments ? (
              <p className="text-xs text-[#737373]">Loading comments...</p>
            ) : commentsList.length === 0 ? (
              <p className="text-xs text-[#737373] italic">No comments yet. Leave a note below!</p>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="flex gap-2.5 items-start bg-[#0a0a0a]/60 p-2.5 rounded-xl border border-[#141414]/80">
                  <img
                    src={c.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={c.authorName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#222222]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#f5f5f5] mr-2">{c.authorName}</span>
                    <span className="text-xs text-[#a3a3a3]">{c.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          {post.commentsEnabled ? (
            <form onSubmit={handleAddComment} className="pt-3 border-t border-[#141414] space-y-2">
              <input
                type="text"
                placeholder="Your Name (e.g. Maya)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#141414] rounded-lg px-3 py-1.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a public comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-[#141414] rounded-xl px-3 py-2 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
                />
                <button
                  type="submit"
                  className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] p-2 rounded-xl transition shadow font-bold"
                >
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-[#737373] italic pt-2">Comments are turned off for this post.</p>
          )}
        </div>
      </div>
    </div>
  );
}
