"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { useToast } from "../Toast";

interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast("Comment deleted", "success");
    } catch {
      showToast("Failed to delete comment", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#f5f5f5]">Comments & Moderation</h2>
        <p className="text-xs text-[#a3a3a3]">Review and moderate viewer feedback across Vivaan's feed posts and video reels</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <MessageCircle className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No comments yet</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Comments posted by viewers on Vivaan's posts and reels will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={c.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={c.authorName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#222222]"
                />

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#f5f5f5]">{c.authorName}</h4>
                  <p className="text-xs text-[#a3a3a3] truncate">{c.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                  Approved
                </span>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 hover:bg-rose-950 text-[#a3a3a3] hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
