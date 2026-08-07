"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Pin, Heart, Eye, Sparkles, Image as ImageIcon, Upload, X, Globe } from "lucide-react";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";
import { DeleteButton } from "../DeleteButton";
import { StaggerGrid, FadeItem, FadeIn } from "../Motion";

interface Post {
  id: string;
  type: string;
  title?: string;
  caption: string;
  mediaUrls: string[];
  hashtags: string[];
  isPinned: boolean;
  privacy: string; // 'public' | 'draft' | 'unlisted'
  likesCount: number;
  viewsCount: number;
  commentsEnabled: boolean;
  createdAt: string;
}

export function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form states
  const [form, setForm] = useState({
    title: "",
    caption: "",
    mediaUrls: [] as string[],
    hashtagsStr: "",
    isPinned: false,
    privacy: "public",
    commentsEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setForm({
      title: "",
      caption: "",
      mediaUrls: [],
      hashtagsStr: "",
      isPinned: false,
      privacy: "public",
      commentsEnabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title || "",
      caption: post.caption || "",
      mediaUrls: post.mediaUrls || [],
      hashtagsStr: (post.hashtags || []).join(", "),
      isPinned: post.isPinned || false,
      privacy: post.privacy || "public",
      commentsEnabled: post.commentsEnabled ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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
          mediaUrls: [...prev.mediaUrls, data.url],
        }));

        // Also save asset entry to database
        fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.fileName || file.name,
            fileUrl: data.url,
            fileType: "image",
            fileSize: data.fileSize || "1.2 MB",
          }),
        }).catch(() => {});

        showToast("Image uploaded and added to post!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading image file", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    const newPrivacy = post.privacy === "public" ? "draft" : "public";
    try {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, privacy: newPrivacy } : p)));

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: newPrivacy }),
      });

      if (res.ok) {
        showToast(`Post set to ${newPrivacy === "public" ? "Published" : "Draft Mode"}`, "success");
      }
    } catch {
      showToast("Failed to update post status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showToast("Post deleted permanently", "success");
      }
    } catch {
      showToast("Failed to delete post", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const hashtags = form.hashtagsStr
      .split(",")
      .map((s) => s.trim().replace(/^#/, ""))
      .filter(Boolean);

    const payload = {
      title: form.title,
      caption: form.caption,
      mediaUrls: form.mediaUrls,
      hashtags,
      isPinned: form.isPinned,
      privacy: form.privacy,
      commentsEnabled: form.commentsEnabled,
      type: form.mediaUrls.length > 1 ? "carousel" : "image",
    };

    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingPost ? "Post updated!" : "Post created and saved!", "success");
        setIsModalOpen(false);
        fetchPosts();
      } else {
        showToast(data.error || "Failed to save post", "error");
      }
    } catch {
      showToast("Error saving post", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Feed Posts Manager</h2>
          <p className="text-xs text-[#a3a3a3]">Manage image posts, carousels, hashtags, drafts & public visibility</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create New Post
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No posts in feed yet</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Create your first post or image carousel to showcase on Vivaan's public portfolio.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C9A227] text-[#0a0a0a] text-xs font-bold px-4 py-2 rounded-xl transition inline-block"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-video bg-black overflow-hidden">
                {post.mediaUrls && post.mediaUrls[0] ? (
                  <img src={post.mediaUrls[0]} alt={post.title || "Post"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#737373]">No Image</div>
                )}

                {post.isPinned && (
                  <span className="absolute top-3 left-3 bg-[#C9A227] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}

                <button
                  onClick={() => handleTogglePublish(post)}
                  className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider transition ${
                    post.privacy === "public"
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50"
                      : "bg-[#0a0a0a]/90 text-[#C9A227] border border-[#C9A227]/40"
                  }`}
                >
                  {post.privacy === "public" ? "Published" : "Draft"}
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {post.title && <h4 className="font-bold text-sm text-[#f5f5f5] line-clamp-1 mb-1">{post.title}</h4>}
                  <p className="text-xs text-[#a3a3a3] line-clamp-2">{post.caption}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#a3a3a3] pt-2 border-t border-[#222222]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> {post.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#C9A227]" /> {post.viewsCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-1.5 hover:bg-[#141414] rounded-lg text-[#a3a3a3] hover:text-[#f5f5f5] transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <DeleteButton
                      compact
                      onConfirm={() => handleDelete(post.id)}
                      label="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#222222]">
              <h3 className="font-bold text-lg text-[#C9A227]">{editingPost ? "Edit Feed Post" : "Create New Post"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Post Title (Optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Aura Gold Light Render Study"
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Post Caption</label>
                <textarea
                  rows={4}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Write a caption, story, or project notes..."
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl p-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5] resize-none"
                  required
                />
              </div>

              {/* Direct Image Upload & Asset Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider">Post Images / Carousel</label>

                  <div className="flex items-center gap-2">
                    <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 shadow">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "+ Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDirectImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="text-[#C9A227] hover:underline text-xs flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Select Library
                    </button>
                  </div>
                </div>

                {form.mediaUrls.length === 0 ? (
                  <label className="border-2 border-dashed border-[#222222] rounded-2xl p-6 text-center cursor-pointer hover:border-[#C9A227]/50 transition block bg-[#0a0a0a]/40">
                    <Upload className="w-8 h-8 text-[#C9A227]/80 mx-auto mb-2 animate-bounce" />
                    <span className="text-xs text-[#a3a3a3] font-semibold block">Click to Upload Image File Directly</span>
                    <span className="text-[10px] text-[#737373] block mt-1">Supports PNG, JPG, WEBP formats</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDirectImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {form.mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#222222] group">
                        <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, mediaUrls: form.mediaUrls.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Hashtags (Comma separated)</label>
                <input
                  type="text"
                  value={form.hashtagsStr}
                  onChange={(e) => setForm({ ...form, hashtagsStr: e.target.value })}
                  placeholder="vivaan, 3d, motiongraphics, luxury, art"
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Publishing Status</label>
                  <select
                    value={form.privacy}
                    onChange={(e) => setForm({ ...form, privacy: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                  >
                    <option value="public">Published (Live on Public Profile)</option>
                    <option value="draft">Draft (Saved in CMS Only)</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a3a3a3]">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span>Pin to top of feed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a3a3a3]">
                    <input
                      type="checkbox"
                      checked={form.commentsEnabled}
                      onChange={(e) => setForm({ ...form, commentsEnabled: e.target.checked })}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span>Allow public comments</span>
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
                  {saving ? "Saving..." : editingPost ? "Update Post" : "Save & Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setForm((prev) => ({ ...prev, mediaUrls: [...prev.mediaUrls, url] }))}
        filterType="image"
      />
    </div>
  );
}
