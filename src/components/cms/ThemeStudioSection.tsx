"use client";

import React, { useState } from "react";
import { Palette, Sparkles, Layout, Save, Check, Type } from "lucide-react";
import { useToast } from "../Toast";

interface ThemeStudioProps {
  user: any;
  onUserUpdated: (user: any) => void;
}

const PRESETS = [
  { id: "gold", name: "Vivaan Black & Gold", bg: "#09090b", primary: "#f59e0b", previewBg: "bg-[#0a0a0a] text-[#C9A227] border-[#C9A227]/40" },
  { id: "dark", name: "Obsidian Dark", bg: "#020617", primary: "#6366f1", previewBg: "bg-neutral-950 text-[#f5f5f5]" },
  { id: "cyberpunk", name: "Cyberpunk Neon", bg: "#030712", primary: "#ec4899", previewBg: "bg-[#0a0a0a] text-cyan-200 border-cyan-500/40" },
  { id: "light", name: "Clean Editorial", bg: "#f8fafc", primary: "#d97706", previewBg: "bg-stone-50 text-[#111111]" },
  { id: "minimal", name: "Minimalist Mono", bg: "#171717", primary: "#f5f5f5", previewBg: "bg-neutral-900 text-neutral-100" },
];

export function ThemeStudioSection({ user, onUserUpdated }: ThemeStudioProps) {
  const currentTheme = user?.themeConfig || {
    themePreset: "gold",
    primaryColor: "#f59e0b",
    fontFamily: "inter",
    cardStyle: "glass",
    bgPattern: "dots",
    activeTabs: ["feed", "reels", "portfolio", "links", "about"],
  };

  const [themeConfig, setThemeConfig] = useState(currentTheme);
  const [pageTitle, setPageTitle] = useState(user?.pageTitle || "Vivaan | Official Creative Director & Portfolio Platform");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeConfig,
          pageTitle,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUserUpdated(data.user);
        showToast("Theme and page title settings saved!", "success");
      } else {
        showToast(data.error || "Failed to save theme settings", "error");
      }
    } catch {
      showToast("Error saving theme settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Theme Customization Studio</h2>
          <p className="text-xs text-[#a3a3a3]">Design Vivaan's visual theme, black and gold palette, typography & page title without coding</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-[#C9A227] via-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-1.5"
        >
          {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Theme Settings</>}
        </button>
      </div>

      {/* Page Title Setting */}
      <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-3">
        <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4 text-[#C9A227]" /> Public Website Title Tag
        </h3>
        <input
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder="Vivaan | Official Creative Director & Portfolio Platform"
          className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]"
        />
      </div>

      {/* Preset Cards */}
      <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#C9A227]" /> Choose Theme Preset
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setThemeConfig({ ...themeConfig, themePreset: p.id })}
              className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-28 shadow-lg ${
                themeConfig.themePreset === p.id
                  ? "border-[#C9A227] ring-2 ring-[#C9A227]/50 scale-105"
                  : "border-[#222222] hover:border-[#222222]"
              } ${p.previewBg}`}
            >
              <div>
                <span className="font-bold text-xs block">{p.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: p.primary }} />
                {themeConfig.themePreset === p.id && <Check className="w-4 h-4 text-[#C9A227]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Styling Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Accent Color & Cards */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A227]" /> Primary Gold Color & Card Style
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-2">Accent Color Hex</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeConfig.primaryColor || "#f59e0b"}
                onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-xl cursor-pointer bg-[#0a0a0a] border border-[#222222] p-1"
              />
              <span className="text-xs text-[#f5f5f5] font-mono bg-[#0a0a0a] px-3 py-2 rounded-xl border border-[#222222]">
                {themeConfig.primaryColor}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-2">Card Glassmorphism</label>
            <select
              value={themeConfig.cardStyle || "glass"}
              onChange={(e) => setThemeConfig({ ...themeConfig, cardStyle: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]"
            >
              <option value="glass">Gold Glassmorphism Blur</option>
              <option value="solid">Solid High Contrast</option>
              <option value="clean">Clean Minimalist</option>
            </select>
          </div>
        </div>

        {/* Font Family & Pattern */}
        <div className="bg-[#111111] border border-[#C9A227]/30 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#C9A227]" /> Typography & Background
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-2">Font Style</label>
            <select
              value={themeConfig.fontFamily || "inter"}
              onChange={(e) => setThemeConfig({ ...themeConfig, fontFamily: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]"
            >
              <option value="inter">Modern Sans-Serif (Inter)</option>
              <option value="serif">Editorial Serif (Playfair)</option>
              <option value="mono">Cyber Monospace (Fira Code)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-2">Background Grid</label>
            <select
              value={themeConfig.bgPattern || "dots"}
              onChange={(e) => setThemeConfig({ ...themeConfig, bgPattern: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]"
            >
              <option value="dots">Subtle Dot Matrix</option>
              <option value="grid">Tech Grid Lines</option>
              <option value="none">Solid Obsidian</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
