"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Circle, Image as ImageIcon, Upload, X } from "lucide-react";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";

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
  displayOrder: number;
}

export function HighlightsSection() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  const [form, setForm] = useState({
    title: "",
    coverUrl: "",
    items: [] as StoryItem[],
  });

  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"cover" | "frame" | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "frame" | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/highlights");
      if (res.ok) {
        const data = await res.json();
        setHighlights(data.highlights || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingHighlight(null);
    setForm({
      title: "",
      coverUrl: "",
      items: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Highlight) => {
    setEditingHighlight(h);
    setForm({
      title: h.title || "",
      coverUrl: h.coverUrl || "",
      items: h.items || [],
    });
    setIsModalOpen(true);
  };

  const handleDirectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget("cover");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, coverUrl: data.url }));
        showToast("Circle cover uploaded!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading cover photo", "error");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleDirectFrameUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget("frame");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        const newFrame: StoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          title: `Slide ${form.items.length + 1}`,
          mediaUrl: data.url,
          mediaType: file.type.startsWith("video") ? "video" : "image",
          caption: "",
        };
        setForm((prev) => ({ ...prev, items: [...prev.items, newFrame] }));
        showToast("Story frame uploaded!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading story frame", "error");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story highlight?")) return;

    try {
      const res = await fetch(`/api/highlights/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHighlights((prev) => prev.filter((h) => h.id !== id));
        showToast("Story highlight removed", "success");
      }
    } catch {
      showToast("Failed to delete highlight", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coverUrl) {
      showToast("Cover image is required", "info");
      return;
    }

    setSaving(true);

    try {
      const url = editingHighlight ? `/api/highlights/${editingHighlight.id}` : "/api/highlights";
      const method = editingHighlight ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingHighlight ? "Highlight updated!" : "Highlight created!", "success");
        setIsModalOpen(false);
        fetchHighlights();
      } else {
        showToast(data.error || "Failed to save highlight", "error");
      }
    } catch {
      showToast("Error saving highlight", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Story Highlights</h2>
          <p className="text-xs text-[#a3a3a3]">Instagram-style story circles for "About Vivaan", "3D Art", or "Testimonials"</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Highlight
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading story highlights...</div>
      ) : highlights.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Circle className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No story highlights created</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Story highlights show up on Vivaan's profile hero section as interactive story bubbles.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C9A227] text-[#0a0a0a] text-xs font-bold px-4 py-2 rounded-xl transition inline-block"
          >
            Create Highlight
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {highlights.map((h) => (
            <div
              key={h.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 group relative shadow-lg"
            >
              <div className="p-1 rounded-full bg-gradient-to-tr from-[#C9A227] via-yellow-400 to-[#C9A227] shadow-lg">
                <img
                  src={h.coverUrl}
                  alt={h.title}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#111111] bg-[#0a0a0a]"
                />
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#f5f5f5]">{h.title}</h4>
                <p className="text-[10px] text-[#a3a3a3]">{(h.items || []).length} frames</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#222222]/80 w-full justify-center">
                <button
                  onClick={() => handleOpenEdit(h)}
                  className="p-1.5 hover:bg-[#141414] rounded-lg text-[#a3a3a3] transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="p-1.5 hover:bg-rose-950 text-[#a3a3a3] hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
              <h3 className="font-bold text-lg text-[#C9A227]">{editingHighlight ? "Edit Highlight" : "New Story Highlight"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Highlight Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. About Vivaan, Gold Series, FAQ"
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              {/* Direct Circle Cover Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Circle Cover Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingTarget === "cover" ? "Uploading..." : "Upload Cover"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDirectCoverUpload}
                      disabled={!!uploadingTarget}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("cover")}
                    className="bg-[#141414] hover:bg-[#141414] text-xs px-3 py-2 rounded-xl border border-[#222222] text-[#f5f5f5]"
                  >
                    Select Library
                  </button>
                </div>
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  placeholder="Or paste cover URL..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              {/* Story Frames */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider">Story Slides / Frames ({form.items.length})</label>
                  <div className="flex items-center gap-2">
                    <label className="bg-[#141414] hover:bg-[#141414] text-[#C9A227] font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 border border-[#C9A227]/30">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingTarget === "frame" ? "Uploading..." : "+ Upload Frame"}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleDirectFrameUpload}
                        disabled={!!uploadingTarget}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("frame")}
                      className="text-[#C9A227] hover:underline text-xs flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Select Library
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {form.items.map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 bg-[#0a0a0a] rounded-xl border border-[#222222] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={item.mediaUrl} alt={item.title} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#222222]" />
                        <div className="truncate">
                          <p className="font-semibold text-[#f5f5f5] truncate">{item.title || `Slide ${idx + 1}`}</p>
                          <p className="text-[10px] text-[#a3a3a3] truncate">{item.caption || item.mediaType}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}
                        className="text-[#737373] hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                  className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20"
                >
                  {saving ? "Saving..." : editingHighlight ? "Update Highlight" : "Save Highlight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(url) => {
          if (mediaPickerTarget === "cover") {
            setForm((prev) => ({ ...prev, coverUrl: url }));
          } else if (mediaPickerTarget === "frame") {
            const newFrame: StoryItem = {
              id: Math.random().toString(36).substring(2, 9),
              title: `Slide ${form.items.length + 1}`,
              mediaUrl: url,
              mediaType: "image",
              caption: "",
            };
            setForm((prev) => ({ ...prev, items: [...prev.items, newFrame] }));
          }
        }}
        filterType="image"
      />
    </div>
  );
}
