"use client";

import React, { useState } from "react";
import { X, ExternalLink, Calendar, User, Tag, Sparkles, Code } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  clientName?: string;
  completionDate?: string;
  liveUrl?: string;
  githubUrl?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  tags: string[];
}

interface ProjectDetailModalProps {
  project: PortfolioItem | null;
  onClose: () => void;
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!project) return null;

  const allGallery = [project.thumbnailUrl, ...(project.galleryUrls || [])].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#141414] bg-[#0a0a0a]/60">
          <div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 mb-2 inline-block">
              {project.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5]">{project.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#a3a3a3] hover:text-white p-2 rounded-full hover:bg-[#141414] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Hero Image */}
          <div className="rounded-2xl overflow-hidden border border-[#141414] bg-black aspect-video max-h-[400px]">
            <img
              src={selectedImage || project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gallery Thumbnails */}
          {allGallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allGallery.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    (selectedImage || project.thumbnailUrl) === imgUrl ? "border-[#C9A227] scale-105" : "border-[#141414] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#141414] text-xs">
            {project.clientName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9A227]" />
                <div>
                  <p className="text-[#737373]">Client</p>
                  <p className="font-semibold text-[#f5f5f5]">{project.clientName}</p>
                </div>
              </div>
            )}
            {project.completionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                <div>
                  <p className="text-[#737373]">Completed</p>
                  <p className="font-semibold text-[#f5f5f5]">{project.completionDate}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C9A227]" />
              <div>
                <p className="text-[#737373]">Category</p>
                <p className="font-semibold text-[#f5f5f5]">{project.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              <div>
                <p className="text-[#737373]">Type</p>
                <p className="font-semibold text-[#f5f5f5]">Vivaan Case Study</p>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#f5f5f5]">Creative & Visual Breakdown</h3>
            <p className="text-[#a3a3a3] text-sm leading-relaxed">{project.summary}</p>
            {project.content && (
              <p className="text-[#a3a3a3] text-sm leading-relaxed whitespace-pre-line pt-2">{project.content}</p>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Tech & Tools</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t, idx) => (
                  <span key={idx} className="bg-[#141414] text-[#f5f5f5] text-xs px-3 py-1 rounded-lg border border-[#222222]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#141414]">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#C9A227]/20"
              >
                <ExternalLink className="w-4 h-4 text-[#0a0a0a]" /> Visit Live Project
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#141414] hover:bg-[#222222] text-[#f5f5f5] text-xs font-semibold px-5 py-2.5 rounded-xl border border-[#222222] transition flex items-center gap-2"
              >
                <Code className="w-4 h-4" /> View Source Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
