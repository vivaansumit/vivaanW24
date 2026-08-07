"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles } from "lucide-react";

interface StoryItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
}

interface Highlight {
  id: string;
  title: string;
  coverUrl: string;
  items: StoryItem[];
}

interface StoryViewerModalProps {
  highlight: Highlight | null;
  onClose: () => void;
}

export function StoryViewerModal({ highlight, onClose }: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [highlight]);

  if (!highlight || !highlight.items || highlight.items.length === 0) return null;

  const currentItem = highlight.items[currentIndex];

  const handleNext = () => {
    if (currentIndex < highlight.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 p-2 sm:p-4">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-[#111111]/60 hover:bg-[#141414] transition z-[210]"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[85vh] bg-[#111111] rounded-3xl overflow-hidden shadow-2xl border border-[#222222] flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {highlight.items.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentIndex ? "w-full" : idx === currentIndex ? "w-full animate-pulse" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="absolute top-7 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow">
          <div className="flex items-center gap-2">
            <img src={highlight.coverUrl} alt={highlight.title} className="w-8 h-8 rounded-full border border-white/40 object-cover" />
            <div>
              <p className="text-xs font-bold leading-none">{highlight.title}</p>
              <p className="text-[10px] text-white/80">{currentItem?.title || `Slide ${currentIndex + 1}`}</p>
            </div>
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur transition"
          >
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Media Container */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
          {currentItem.mediaType === "video" ? (
            <video
              src={currentItem.mediaUrl}
              autoPlay
              muted={muted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={currentItem.mediaUrl} alt={currentItem.title} className="w-full h-full object-cover" />
          )}

          {/* Navigation Click Zones */}
          <div onClick={handlePrev} className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" />
          <div onClick={handleNext} className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer" />

          {/* Nav Arrow Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 z-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 z-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Caption Overlay */}
        {currentItem.caption && (
          <div className="absolute bottom-6 inset-x-4 z-30 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-xs">
            {currentItem.caption}
          </div>
        )}
      </div>
    </div>
  );
}
