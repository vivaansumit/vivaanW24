"use client";

import React, { useState } from "react";
import { Lock, Eye, Copy, Check, RefreshCw, Save, Sparkles, Globe, Shield, Send } from "lucide-react";
import { useToast } from "../Toast";

interface SettingsProps {
  user: any;
  onUserUpdated: (user: any) => void;
}

export function SettingsSection({ user, onUserUpdated }: SettingsProps) {
  const [publishStatus, setPublishStatus] = useState(user?.publishStatus || "published");
  const [privacyPassword, setPrivacyPassword] = useState(user?.privacyPassword || "");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${user?.handle || "vivaan"}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Public profile link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishStatus,
          privacyPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUserUpdated(data.user);
        showToast(`Publishing mode updated to: ${publishStatus.toUpperCase()}`, "success");
      } else {
        showToast(data.error || "Failed to update publishing settings", "error");
      }
    } catch {
      showToast("Error updating publishing settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm("Reset database to initial Vivaan portfolio showcase data? This will re-seed default profiles and posts.")) return;

    setResetting(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        showToast("Vivaan portfolio data re-seeded successfully!", "success");
        window.location.reload();
      } else {
        showToast("Failed to re-seed data", "error");
      }
    } catch {
      showToast("Error resetting portfolio data", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#f5f5f5]">Publishing & Privacy System</h2>
        <p className="text-xs text-[#a3a3a3]">Manage profile visibility, draft vs published state, shareable link & password locks</p>
      </div>

      {/* Shareable Link Card */}
      <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C9A227]" /> Shareable Public Profile Link
        </h3>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-xs text-[#C9A227] font-mono focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-2 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-[#0a0a0a]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied Link" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Publishing Mode Selection */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#C9A227]" /> Profile Visibility & Publishing Mode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              onClick={() => setPublishStatus("published")}
              className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                publishStatus === "published"
                  ? "bg-[#C9A227]/10/60 border-[#C9A227] text-[#f5f5f5] ring-1 ring-[#C9A227]"
                  : "bg-[#0a0a0a] border-[#222222] text-[#a3a3a3] hover:border-[#222222]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#f5f5f5]">Live & Published</span>
                {publishStatus === "published" && <Check className="w-4 h-4 text-[#C9A227]" />}
              </div>
              <span className="text-[11px] text-[#a3a3a3] block">Publicly accessible to everyone immediately</span>
            </label>

            <label
              onClick={() => setPublishStatus("draft")}
              className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                publishStatus === "draft"
                  ? "bg-[#C9A227]/10/60 border-[#C9A227] text-[#f5f5f5] ring-1 ring-[#C9A227]"
                  : "bg-[#0a0a0a] border-[#222222] text-[#a3a3a3] hover:border-[#222222]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#f5f5f5]">Draft Mode</span>
                {publishStatus === "draft" && <Check className="w-4 h-4 text-[#C9A227]" />}
              </div>
              <span className="text-[11px] text-[#a3a3a3] block">Hidden from public visitors while editing</span>
            </label>

            <label
              onClick={() => setPublishStatus("maintenance")}
              className={`p-4 rounded-2xl border cursor-pointer transition space-y-1 ${
                publishStatus === "maintenance"
                  ? "bg-[#C9A227]/10/60 border-[#C9A227] text-[#f5f5f5] ring-1 ring-[#C9A227]"
                  : "bg-[#0a0a0a] border-[#222222] text-[#a3a3a3] hover:border-[#222222]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#f5f5f5]">Maintenance</span>
                {publishStatus === "maintenance" && <Check className="w-4 h-4 text-[#C9A227]" />}
              </div>
              <span className="text-[11px] text-[#a3a3a3] block">Displays custom "Coming Soon" screen</span>
            </label>
          </div>
        </div>

        {/* Password Protection */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C9A227]" /> Optional Profile Password Lock
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-2">
              Set Access Lock Code (Leave empty for open public access)
            </label>
            <input
              type="password"
              value={privacyPassword}
              onChange={(e) => setPrivacyPassword(e.target.value)}
              placeholder="e.g. VIVAAN2025"
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Publishing Settings</>}
          </button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="bg-[#111111] border border-rose-950 rounded-3xl p-6 shadow-2xl space-y-4 pt-6">
        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Restore Default Vivaan Showcase Data
        </h3>
        <p className="text-xs text-[#a3a3a3]">
          Re-seed default posts, reels, and portfolio case studies for Vivaan.
        </p>

        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={resetting}
          className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/50 text-xs font-semibold px-5 py-2.5 rounded-xl transition"
        >
          {resetting ? "Restoring..." : "Restore Default Vivaan Data"}
        </button>
      </div>
    </div>
  );
}
