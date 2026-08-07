"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Globe, ExternalLink, MousePointerClick, X } from "lucide-react";
import { useToast } from "../Toast";

interface SocialLink {
  id: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  displayOrder: number;
  isEnabled: boolean;
  clicksCount: number;
}

export function LinksSection() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  const [form, setForm] = useState({
    platform: "custom",
    title: "",
    url: "",
    icon: "globe",
    color: "#f59e0b",
    isEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social-links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingLink(null);
    setForm({
      platform: "custom",
      title: "",
      url: "",
      icon: "globe",
      color: "#f59e0b",
      isEnabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: SocialLink) => {
    setEditingLink(link);
    setForm({
      platform: link.platform || "custom",
      title: link.title || "",
      url: link.url || "",
      icon: link.icon || "globe",
      color: link.color || "#f59e0b",
      isEnabled: link.isEnabled ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleEnable = async (link: SocialLink) => {
    try {
      const updated = !link.isEnabled;
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isEnabled: updated } : l)));

      await fetch(`/api/social-links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: updated }),
      });
      showToast(`Link ${updated ? "enabled" : "hidden"}`, "info");
    } catch {
      showToast("Failed to update link status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bio link?")) return;

    try {
      const res = await fetch(`/api/social-links/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
        showToast("Bio link deleted", "success");
      }
    } catch {
      showToast("Failed to delete link", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingLink ? `/api/social-links/${editingLink.id}` : "/api/social-links";
      const method = editingLink ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingLink ? "Link updated!" : "Bio link created!", "success");
        setIsModalOpen(false);
        fetchLinks();
      } else {
        showToast(data.error || "Failed to save link", "error");
      }
    } catch {
      showToast("Error saving link", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Social & Bio Links</h2>
          <p className="text-xs text-[#a3a3a3]">Custom action buttons, social profiles, website links and real-time click tracking</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Bio Button
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading links...</div>
      ) : links.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No bio buttons added yet</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Add custom action buttons for YouTube, Store, Calendly, Instagram, or custom website links.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C9A227] text-[#0a0a0a] text-xs font-bold px-4 py-2 rounded-xl transition inline-block"
          >
            Add First Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 shadow-lg ${
                link.isEnabled
                  ? "bg-[#111111] border-[#C9A227]/20 hover:border-[#C9A227]/40"
                  : "bg-[#0a0a0a]/60 border-[#111111] opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-[#0a0a0a] shadow"
                  style={{ backgroundColor: link.color || "#f59e0b" }}
                >
                  <Globe className="w-5 h-5 text-[#0a0a0a]" />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#f5f5f5] truncate">{link.title}</h4>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#a3a3a3] hover:text-[#C9A227] flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" /> {link.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1 text-xs text-[#a3a3a3] bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-[#222222]">
                  <MousePointerClick className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>{link.clicksCount || 0} clicks</span>
                </div>

                <button
                  onClick={() => handleToggleEnable(link)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    link.isEnabled ? "bg-[#C9A227]/10/80 text-[#C9A227] border border-[#C9A227]/30" : "bg-[#141414] text-[#a3a3a3]"
                  }`}
                >
                  {link.isEnabled ? "Active" : "Disabled"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 hover:bg-[#141414] rounded-lg text-[#a3a3a3] transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 hover:bg-rose-950 text-[#a3a3a3] hover:text-rose-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#222222]">
              <h3 className="font-bold text-lg text-[#C9A227]">{editingLink ? "Edit Bio Link" : "Add Bio Button"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Button Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. YouTube - 3D Motion Masterclasses"
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Destination URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Button Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-[#0a0a0a] border border-[#222222] p-1"
                    />
                    <span className="text-xs text-[#a3a3a3] font-mono">{form.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Platform Type</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="github">GitHub</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="behance">Behance</option>
                    <option value="custom">Custom Website</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a3a3a3]">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                  />
                  <span>Enable button on profile</span>
                </label>
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
                  {saving ? "Saving..." : editingLink ? "Update Link" : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
