"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Pin, Heart, Eye, Video, Music, Upload, X, Check } from "lucide-react";
import { DeleteButton } from "../DeleteButton";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";

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
  isPinned: boolean;
  privacy: string;
  createdAt: string;
}

export function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);

  const [form, setForm] = useState({
    title: "",
    caption: "",
    videoUrl: "",
    thumbnailUrl: "",
    soundTrack: "Original Sound - Vivaan",
    duration: 15,
    isPinned: false,
    privacy: "public",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"video" | "thumbnail" | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"video" | "thumbnail" | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reels");
      if (res.ok) {
        const data = await res.json();
        setReels(data.reels || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingReel(null);
    setForm({
      title: "",
      caption: "",
      videoUrl: "",
      thumbnailUrl: "",
      soundTrack: "Original Sound - Vivaan",
      duration: 15,
      isPinned: false,
      privacy: "public",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reel: Reel) => {
    setEditingReel(reel);
    setForm({
      title: reel.title || "",
      caption: reel.caption || "",
      videoUrl: reel.videoUrl || "",
      thumbnailUrl: reel.thumbnailUrl || "",
      soundTrack: reel.soundTrack || "Original Sound - Vivaan",
      duration: reel.duration || 15,
      isPinned: reel.isPinned || false,
      privacy: reel.privacy || "public",
    });
    setIsModalOpen(true);
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "video" | "thumbnail") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({
          ...prev,
          [target === "video" ? "videoUrl" : "thumbnailUrl"]: data.url,
        }));

        fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.fileName || file.name,
            fileUrl: data.url,
            fileType: target === "video" ? "video" : "image",
            fileSize: data.fileSize || "2.5 MB",
          }),
        }).catch(() => {});

        showToast(`${target === "video" ? "Video file" : "Thumbnail image"} uploaded!`, "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading file", "error");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleTogglePublish = async (reel: Reel) => {
    const newPrivacy = reel.privacy === "public" ? "draft" : "public";
    try {
      setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, privacy: newPrivacy } : r)));

      const res = await fetch(`/api/reels/${reel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: newPrivacy }),
      });

      if (res.ok) {
        showToast(`Reel set to ${newPrivacy === "public" ? "Published" : "Draft Mode"}`, "success");
      }
    } catch {
      showToast("Failed to update reel status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReels((prev) => prev.filter((r) => r.id !== id));
        showToast("Reel deleted", "success");
      }
    } catch {
      showToast("Failed to delete reel", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoUrl) {
      showToast("Please upload or provide a video file", "info");
      return;
    }

    setSaving(true);

    try {
      const url = editingReel ? `/api/reels/${editingReel.id}` : "/api/reels";
      const method = editingReel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingReel ? "Reel updated!" : "Reel video saved!", "success");
        setIsModalOpen(false);
        fetchReels();
      } else {
        showToast(data.error || "Failed to save reel", "error");
      }
    } catch {
      showToast("Error saving reel", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Reels & Short Videos</h2>
          <p className="text-xs text-[#a3a3a3]">Vertical short video loops, direct video upload, soundtrack titles, and view counters</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Reel
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading reels...</div>
      ) : reels.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Video className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No video reels uploaded yet</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Upload short vertical motion videos or tutorials directly to Vivaan's portfolio.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C9A227] text-[#0a0a0a] text-xs font-bold px-4 py-2 rounded-xl transition inline-block"
          >
            Add First Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative"
            >
              {/* Vertical Aspect Thumbnail */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden">
                <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />

                {reel.isPinned && (
                  <span className="absolute top-2 left-2 bg-[#C9A227] text-[#0a0a0a] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}

                <button
                  onClick={() => handleTogglePublish(reel)}
                  className={`absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider transition ${
                    reel.privacy === "public"
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50"
                      : "bg-[#0a0a0a]/90 text-[#C9A227] border border-[#C9A227]/40"
                  }`}
                >
                  {reel.privacy === "public" ? "Published" : "Draft"}
                </button>

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white space-y-1">
                  <h4 className="font-bold text-xs line-clamp-1">{reel.title}</h4>
                  <p className="text-[10px] text-[#C9A227] flex items-center gap-1">
                    <Music className="w-3 h-3" /> {reel.soundTrack}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#a3a3a3] pt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> {reel.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#C9A227]" /> {reel.viewsCount || 0}
                    </span>
                  </div>
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(reel)}
                    className="p-2 bg-[#141414] text-white rounded-full hover:bg-[#141414] transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <DeleteButton
                      compact
                      onConfirm={() => handleDelete(reel.id)}
                      label="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#222222]">
              <h3 className="font-bold text-lg text-[#C9A227]">{editingReel ? "Edit Video Reel" : "Add New Video Reel"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Reel Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Gold Silk Shader Animation Breakdown"
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              {/* Direct Video File Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Video File (.mp4, .webm)</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingTarget === "video" ? "Uploading Video..." : "Upload Video File"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleDirectFileUpload(e, "video")}
                      disabled={!!uploadingTarget}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("video")}
                    className="bg-[#141414] hover:bg-[#141414] text-xs px-3 py-2.5 rounded-xl border border-[#222222] text-[#f5f5f5]"
                  >
                    Select Library
                  </button>
                </div>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="Or paste direct video URL..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                />
              </div>

              {/* Direct Thumbnail Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Cover Thumbnail Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="bg-[#141414] hover:bg-[#141414] text-[#C9A227] font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 border border-[#C9A227]/30">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingTarget === "thumbnail" ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleDirectFileUpload(e, "thumbnail")}
                      disabled={!!uploadingTarget}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("thumbnail")}
                    className="bg-[#141414] hover:bg-[#141414] text-xs px-3 py-2 rounded-xl border border-[#222222] text-[#f5f5f5]"
                  >
                    Select Library
                  </button>
                </div>
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  placeholder="Or paste cover image URL..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Soundtrack Title</label>
                  <input
                    type="text"
                    value={form.soundTrack}
                    onChange={(e) => setForm({ ...form, soundTrack: e.target.value })}
                    placeholder="Original Sound - Vivaan"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Duration (Sec)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Publish Status</label>
                  <select
                    value={form.privacy}
                    onChange={(e) => setForm({ ...form, privacy: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  >
                    <option value="public">Published (Live)</option>
                    <option value="draft">Draft Mode</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a3a3a3]">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span>Pin to top slot</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a3a3a3] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20"
                >
                  {saving ? "Saving..." : editingReel ? "Update Reel" : "Save & Publish Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(url) => {
          if (mediaPickerTarget === "video") {
            setForm((prev) => ({ ...prev, videoUrl: url }));
          } else if (mediaPickerTarget === "thumbnail") {
            setForm((prev) => ({ ...prev, thumbnailUrl: url }));
          }
        }}
        filterType={mediaPickerTarget === "video" ? "video" : "image"}
      />
    </div>
  );
}
