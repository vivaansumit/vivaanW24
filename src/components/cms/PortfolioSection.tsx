"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Star, Briefcase, ExternalLink, Code, Image as ImageIcon, Upload, X, Check } from "lucide-react";
import { DeleteButton } from "../DeleteButton";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";

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
  isFeatured: boolean;
  privacy: string;
  createdAt: string;
}

export function PortfolioSection() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "3D Motion & Commercial",
    summary: "",
    content: "",
    clientName: "",
    completionDate: "",
    liveUrl: "",
    githubUrl: "",
    thumbnailUrl: "",
    galleryUrls: [] as string[],
    tagsStr: "",
    isFeatured: false,
    privacy: "public",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"thumbnail" | "gallery" | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.portfolio || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      title: "",
      category: "3D Motion & Commercial",
      summary: "",
      content: "",
      clientName: "",
      completionDate: "",
      liveUrl: "",
      githubUrl: "",
      thumbnailUrl: "",
      galleryUrls: [],
      tagsStr: "",
      isFeatured: false,
      privacy: "public",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      category: item.category || "3D Motion & Commercial",
      summary: item.summary || "",
      content: item.content || "",
      clientName: item.clientName || "",
      completionDate: item.completionDate || "",
      liveUrl: item.liveUrl || "",
      githubUrl: item.githubUrl || "",
      thumbnailUrl: item.thumbnailUrl || "",
      galleryUrls: item.galleryUrls || [],
      tagsStr: (item.tags || []).join(", "),
      isFeatured: item.isFeatured || false,
      privacy: item.privacy || "public",
    });
    setIsModalOpen(true);
  };

  const handleDirectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, thumbnailUrl: data.url }));
        showToast("Cover image uploaded!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading cover image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTogglePublish = async (item: PortfolioItem) => {
    const newPrivacy = item.privacy === "public" ? "draft" : "public";
    try {
      setPortfolio((prev) => prev.map((p) => (p.id === item.id ? { ...p, privacy: newPrivacy } : p)));

      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: newPrivacy }),
      });

      if (res.ok) {
        showToast(`Project set to ${newPrivacy === "public" ? "Published" : "Draft Mode"}`, "success");
      }
    } catch {
      showToast("Failed to update project status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPortfolio((prev) => prev.filter((p) => p.id !== id));
        showToast("Project deleted", "success");
      }
    } catch {
      showToast("Failed to delete project", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.thumbnailUrl) {
      showToast("Please upload or select a cover thumbnail image", "info");
      return;
    }

    setSaving(true);

    const tags = form.tagsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tags,
    };

    try {
      const url = editingItem ? `/api/portfolio/${editingItem.id}` : "/api/portfolio";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingItem ? "Project updated!" : "Case study created!", "success");
        setIsModalOpen(false);
        fetchPortfolio();
      } else {
        showToast(data.error || "Failed to save project", "error");
      }
    } catch {
      showToast("Error saving project", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Portfolio & Case Studies</h2>
          <p className="text-xs text-[#a3a3a3]">Showcase luxury brand work, motion direction, client details & live demo links</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading portfolio projects...</div>
      ) : portfolio.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No portfolio projects published yet</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Highlight client case studies or design directions on Vivaan's public portfolio platform.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C9A227] text-[#0a0a0a] text-xs font-bold px-4 py-2 rounded-xl transition inline-block"
          >
            Add First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative"
            >
              {/* Cover Image */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />

                {item.isFeatured && (
                  <span className="absolute top-3 left-3 bg-[#C9A227] text-[#0a0a0a] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-[#0a0a0a]" /> Featured
                  </span>
                )}

                <button
                  onClick={() => handleTogglePublish(item)}
                  className={`absolute top-3 right-3 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider transition ${
                    item.privacy === "public"
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50"
                      : "bg-[#0a0a0a]/90 text-[#C9A227] border border-[#C9A227]/40"
                  }`}
                >
                  {item.privacy === "public" ? "Published" : "Draft"}
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] text-[#C9A227] font-semibold uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-base text-[#f5f5f5] line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-[#a3a3a3] line-clamp-2 mt-1">{item.summary}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#a3a3a3] pt-3 border-t border-[#222222]">
                  <span className="text-[11px] text-[#a3a3a3]">{item.clientName || "Vivaan Original"}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 hover:bg-[#141414] rounded-lg text-[#a3a3a3] transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <DeleteButton
                      compact
                      onConfirm={() => handleDelete(item.id)}
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
          <div className="bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#222222]">
              <h3 className="font-bold text-lg text-[#C9A227]">{editingItem ? "Edit Portfolio Item" : "Add Portfolio Project"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Project Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Chronos Lux Watch Commercial"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="3D Motion, Visual Direction, Luxury Branding"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Short Summary</label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Overview of visual concept or client deliverables..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Detailed Case Study</label>
                <textarea
                  rows={3}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Explain process, tools used, shaders, client goals, and results..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl p-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5] resize-none"
                />
              </div>

              {/* Direct Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Cover Thumbnail Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Cover File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDirectCoverUpload}
                      disabled={uploadingImage}
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
                  placeholder="Or paste cover URL..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="e.g. Chronos Luxury"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Completion Date</label>
                  <input
                    type="text"
                    value={form.completionDate}
                    onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                    placeholder="Q4 2024"
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Live Demo URL</label>
                  <input
                    type="url"
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">GitHub / Repo URL</label>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
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
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span>Mark as Featured Project</span>
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
                  {saving ? "Saving..." : editingItem ? "Update Project" : "Save & Publish Project"}
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
        onSelect={(url) => setForm((prev) => ({ ...prev, thumbnailUrl: url }))}
        filterType="image"
      />
    </div>
  );
}
