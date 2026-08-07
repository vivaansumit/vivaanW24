"use client";

import React, { useState } from "react";
import { X, Heart, Music, Eye, Volume2, VolumeX, Share2 } from "lucide-react";
import { useToast } from "./Toast";

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  caption?: string;
  soundTrack: string;
  duration: number;
  likesCount: number;
  viewsCount: number;
}

interface ReelViewerModalProps {
  reel: Reel | null;
  creatorName: string;
  creatorAvatar?: string;
  creatorHandle: string;
  onClose: () => void;
}

export function ReelViewerModal({ reel, creatorName, creatorAvatar, creatorHandle, onClose }: ReelViewerModalProps) {
  const [likes, setLikes] = useState(reel?.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const { showToast } = useToast();

  if (!reel) return null;

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      await fetch("/api/public/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", targetType: "reel", targetId: reel.id }),
      });
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Reel link copied to clipboard!", "success");
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2.5 rounded-full bg-[#111111]/80 hover:bg-[#141414] border border-[#C9A227]/30 transition z-[190]"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[88vh] bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl border border-[#C9A227]/30 flex flex-col">
        {/* Top Floating Info */}
        <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow">
          <div className="flex items-center gap-2">
            <img
              src={creatorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={creatorName}
              className="w-8 h-8 rounded-full border border-[#C9A227] object-cover"
            />
            <div>
              <p className="text-xs font-bold leading-none text-white">{creatorName}</p>
              <p className="text-[10px] text-[#C9A227]">@{creatorHandle}</p>
            </div>
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur transition text-white"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative flex-1 w-full h-full bg-black">
          <video
            src={reel.videoUrl}
            poster={reel.thumbnailUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Floating Sidebar */}
        <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4 text-white">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full backdrop-blur transition ${hasLiked ? "bg-rose-600 text-white" : "bg-black/50 hover:bg-rose-600/80"}`}>
              <Heart className={`w-5 h-5 ${hasLiked ? "fill-white" : ""}`} />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{likes}</span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-black/50 hover:bg-[#C9A227] hover:text-[#0a0a0a] backdrop-blur transition">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">Share</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <div className="p-3 rounded-full bg-black/50 backdrop-blur">
              <Eye className="w-5 h-5 text-[#C9A227]" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{reel.viewsCount || 10}</span>
          </div>
        </div>

        {/* Bottom Overlay */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white space-y-1.5 pr-16">
          <h3 className="font-bold text-sm leading-tight text-[#f5f5f5]">{reel.title}</h3>
          {reel.caption && <p className="text-xs text-white/80 line-clamp-2">{reel.caption}</p>}
          <div className="flex items-center gap-2 text-[11px] text-[#C9A227] font-medium pt-1">
            <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "4s" }} />
            <span className="truncate">{reel.soundTrack}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
