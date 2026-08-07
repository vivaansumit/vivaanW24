"use client";

import React, { useState, useEffect } from "react";
import { Save, Image as ImageIcon, MapPin, Globe, Phone, Mail, Upload } from "lucide-react";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";

interface ProfileSectionProps {
  user: any;
  onUserUpdated: (user: any) => void;
}

export function ProfileSection({ user, onUserUpdated }: ProfileSectionProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "Vivaan",
    title: user?.title || "Creative Director & Visual Artist",
    pageTitle: user?.pageTitle || "Vivaan | Official Creative Portfolio",
    bio: user?.bio || "",
    email: user?.email || "admin@vivaan.com",
    phone: user?.phone || "+1 (555) 848-2260",
    phoneVisibility: user?.phoneVisibility ?? true,
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
    location: user?.location || "",
    websiteUrl: user?.websiteUrl || "",
    isHireable: user?.isHireable ?? true,
    isVerified: user?.isVerified ?? true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "Vivaan",
        title: user.title || "Creative Director & Visual Artist",
        pageTitle: user.pageTitle || "Vivaan | Official Creative Portfolio",
        bio: user.bio || "",
        email: user.email || "admin@vivaan.com",
        phone: user.phone || "+1 (555) 848-2260",
        phoneVisibility: user.phoneVisibility ?? true,
        avatarUrl: user.avatarUrl || "",
        coverUrl: user.coverUrl || "",
        location: user.location || "",
        websiteUrl: user.websiteUrl || "",
        isHireable: user.isHireable ?? true,
        isVerified: user.isVerified ?? true,
      });
    }
  }, [user]);

  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<"avatar" | "cover" | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"avatar" | "cover" | null>(null);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          [target === "avatar" ? "avatarUrl" : "coverUrl"]: data.url,
        }));
        showToast(`${target === "avatar" ? "Profile Photo" : "Cover Photo"} uploaded!`, "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading photo", "error");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUserUpdated(data.user);
        showToast("Profile details updated successfully!", "success");
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch {
      showToast("Network error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Profile Management</h2>
          <p className="text-xs text-[#a3a3a3]">Edit your name, cover photo, avatar, bio, email, phone visibility, page title & website</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover & Avatar Header Preview */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl overflow-hidden shadow-2xl">
          {/* Cover Photo */}
          <div className="relative h-48 bg-[#0a0a0a]">
            <img src={formData.coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] text-xs font-bold px-3 py-2 rounded-xl backdrop-blur transition cursor-pointer flex items-center gap-1.5 shadow-md">
                <Upload className="w-3.5 h-3.5 text-[#0a0a0a]" />
                <span>{uploadingTarget === "cover" ? "Uploading..." : "Upload Cover"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleDirectUpload(e, "cover")}
                  disabled={!!uploadingTarget}
                />
              </label>

              <button
                type="button"
                onClick={() => setMediaPickerTarget("cover")}
                className="bg-[#111111]/80 hover:bg-[#141414] text-[#f5f5f5] text-xs font-medium px-3 py-2 rounded-xl border border-[#C9A227]/40 backdrop-blur transition flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Library
              </button>
            </div>
          </div>

          {/* Avatar & Controls Row */}
          <div className="p-6 relative pt-0 -mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <div className="relative group">
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-[#111111] shadow-2xl bg-[#0a0a0a]"
                />
              </div>

              <label className="bg-[#141414] hover:bg-[#141414] text-[#C9A227] border border-[#C9A227]/30 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingTarget === "avatar" ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleDirectUpload(e, "avatar")}
                  disabled={!!uploadingTarget}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-[#0a0a0a] px-4 py-2 rounded-xl border border-[#222222] text-xs text-[#a3a3a3]">
                <input
                  type="checkbox"
                  name="isHireable"
                  checked={formData.isHireable}
                  onChange={handleChange}
                  className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                />
                <span>Show "Hire Me" Button</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#0a0a0a] px-4 py-2 rounded-xl border border-[#222222] text-xs text-[#a3a3a3]">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                />
                <span>Show Verified Badge</span>
              </label>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Professional Title / Tagline</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Creative Director & Visual Artist"
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">
              Public Page Title (Browser Title Tag)
            </label>
            <input
              type="text"
              name="pageTitle"
              value={formData.pageTitle}
              onChange={handleChange}
              placeholder="Vivaan | Official Creative Director & Portfolio Platform"
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2">Bio / Narrative</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell your story, creative vision, achievements, or agency focus..."
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl p-4 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C9A227]" /> Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@vivaan.com"
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C9A227]" /> Contact Phone
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#a3a3a3]">
                  <input
                    type="checkbox"
                    name="phoneVisibility"
                    checked={formData.phoneVisibility}
                    onChange={handleChange}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                  />
                  <span>{formData.phoneVisibility ? "Visible on Public Profile" : "Hidden"}</span>
                </label>
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 848-2260"
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A227]" /> Location / Offices
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="New York • Los Angeles • Global"
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C9A227]" /> Main Website Link
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://vivaan.art"
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#C9A227] via-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-xl shadow-[#C9A227]/20 flex items-center gap-2"
          >
            {saving ? "Saving Changes..." : <><Save className="w-4 h-4 text-[#0a0a0a]" /> Save Profile Details</>}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={!!mediaPickerTarget}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(url) => {
          if (mediaPickerTarget === "avatar") {
            setFormData((prev) => ({ ...prev, avatarUrl: url }));
          } else if (mediaPickerTarget === "cover") {
            setFormData((prev) => ({ ...prev, coverUrl: url }));
          }
        }}
        filterType="image"
      />
    </div>
  );
}
