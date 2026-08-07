"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Link2,
  Type,
  AlignLeft,
  FileText,
} from "lucide-react";
import { useToast } from "../Toast";
import { MediaPickerModal } from "../MediaPickerModal";

interface HomepageConfig {
  logoText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroPhotoUrl: string;
  heroCoverUrl: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
  showFeatureCards: boolean;
  footerText: string;
}

const DEFAULT: HomepageConfig = {
  logoText: "VIVAAN",
  heroTitle: "Creative Director & Visual Artist",
  heroSubtitle: "Crafting cinematic 3D motion, luxury brand experiences, and generative visual art.",
  heroDescription:
    "Welcome. This is the official homepage of Vivaan — a creative studio producing award-winning visual direction for global brands. Explore my portfolio for full case studies and reels.",
  heroPhotoUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  heroCoverUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=80",
  button1Text: "View Public Profile",
  button1Link: "/profile/vivaan",
  button2Text: "",
  button2Link: "",
  showFeatureCards: false,
  footerText: "© 2025 Vivaan. All rights reserved.",
};

type MediaTarget =
  | "heroPhoto"
  | "heroCover"
  | null;

export function HomepageSection() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<MediaTarget>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        if (data.homepageConfig) {
          setConfig({ ...DEFAULT, ...(data.homepageConfig as Partial<HomepageConfig>) });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof HomepageConfig>(key: K, value: HomepageConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: MediaTarget) => {
    const file = e.target.files?.[0];
    if (!file || !target) return;

    setUploadingTarget(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.url) {
        if (target === "heroPhoto") update("heroPhotoUrl", data.url);
        if (target === "heroCover") update("heroCoverUrl", data.url);
        showToast(`${target === "heroPhoto" ? "Photo" : "Cover"} uploaded`, "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload error", "error");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepageConfig: config }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Homepage saved — live site updated instantly", "success");
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#C9A227]/70 text-sm">
        Loading homepage content...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Homepage Editor</h2>
          <p className="text-xs text-[#a3a3a3]">
            Everything below updates the live homepage at <code className="text-[#C9A227]">/</code> the moment you save.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center gap-2"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4 text-[#0a0a0a]" /> Save & Publish
            </>
          )}
        </button>
      </div>

      {/* ---------- Logo / site name ---------- */}
      <Card icon={Type} title="Logo / Site Name">
        <LabeledInput
          label="Text displayed in the top-left corner"
          value={config.logoText}
          onChange={(v) => update("logoText", v)}
          placeholder="VIVAAN"
        />
      </Card>

      {/* ---------- Hero content ---------- */}
      <Card icon={AlignLeft} title="Hero Content">
        <div className="space-y-4">
          <LabeledInput
            label="Main title"
            value={config.heroTitle}
            onChange={(v) => update("heroTitle", v)}
            placeholder="Creative Director & Visual Artist"
          />
          <LabeledInput
            label="Subtitle / short tagline"
            value={config.heroSubtitle}
            onChange={(v) => update("heroSubtitle", v)}
            placeholder="Crafting cinematic 3D motion..."
          />
          <div>
            <Label>Description paragraph</Label>
            <textarea
              value={config.heroDescription}
              onChange={(e) => update("heroDescription", e.target.value)}
              rows={4}
              className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#C9A227]/60 rounded-xl p-3 text-sm text-[#f5f5f5] resize-none outline-none transition"
              placeholder="One paragraph introducing the work..."
            />
          </div>
        </div>
      </Card>

      {/* ---------- Images ---------- */}
      <Card icon={ImageIcon} title="Images">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ImageUploader
            label="Profile photo"
            url={config.heroPhotoUrl}
            onUrlChange={(v) => update("heroPhotoUrl", v)}
            uploading={uploadingTarget === "heroPhoto"}
            onFile={(e) => handleDirectUpload(e, "heroPhoto")}
            onPickFromLibrary={() => setMediaTarget("heroPhoto")}
          />
          <ImageUploader
            label="Cover / banner image"
            url={config.heroCoverUrl}
            onUrlChange={(v) => update("heroCoverUrl", v)}
            uploading={uploadingTarget === "heroCover"}
            onFile={(e) => handleDirectUpload(e, "heroCover")}
            onPickFromLibrary={() => setMediaTarget("heroCover")}
          />
        </div>
      </Card>

      {/* ---------- Buttons ---------- */}
      <Card icon={Link2} title="Buttons">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput
              label="Button 1 text"
              value={config.button1Text}
              onChange={(v) => update("button1Text", v)}
              placeholder="View Public Profile"
            />
            <LabeledInput
              label="Button 1 link"
              value={config.button1Link}
              onChange={(v) => update("button1Link", v)}
              placeholder="/profile/vivaan or https://..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput
              label="Button 2 text (optional — leave blank to hide)"
              value={config.button2Text}
              onChange={(v) => update("button2Text", v)}
              placeholder=""
            />
            <LabeledInput
              label="Button 2 link"
              value={config.button2Link}
              onChange={(v) => update("button2Link", v)}
              placeholder="mailto:you@email.com or /about"
            />
          </div>
        </div>
      </Card>

      {/* ---------- Visibility toggles ---------- */}
      <Card icon={config.showFeatureCards ? Eye : EyeOff} title="Section Visibility">
        <Toggle
          label="Show the 'Platform Features' marketing grid"
          description="When ON, displays the six feature cards (Feed, Reels, Portfolio, Links, Theme, Inquiries) below the hero. Default: OFF for a clean Apple/Netflix-style homepage."
          checked={config.showFeatureCards}
          onChange={(v) => update("showFeatureCards", v)}
        />
      </Card>

      {/* ---------- Footer ---------- */}
      <Card icon={FileText} title="Footer">
        <LabeledInput
          label="Footer text"
          value={config.footerText}
          onChange={(v) => update("footerText", v)}
          placeholder="© 2025 Vivaan. All rights reserved."
        />
      </Card>

      {/* ---------- Preview strip ---------- */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#737373] mb-3">Live preview</p>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#C9A227] hover:text-[#C9A227] underline underline-offset-4"
        >
          Open the live homepage in a new tab →
        </a>
      </div>

      {/* ---------- Media picker modal ---------- */}
      <MediaPickerModal
        isOpen={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        filterType="image"
        onSelect={(url) => {
          if (mediaTarget === "heroPhoto") update("heroPhotoUrl", url);
          if (mediaTarget === "heroCover") update("heroCoverUrl", url);
        }}
      />
    </div>
  );
}

/* ---------- small presentational pieces ---------- */

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#C9A227]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#C9A227]/60 rounded-xl px-4 py-2.5 text-sm text-[#f5f5f5] outline-none transition"
      />
    </div>
  );
}

function ImageUploader({
  label,
  url,
  onUrlChange,
  uploading,
  onFile,
  onPickFromLibrary,
}: {
  label: string;
  url: string;
  onUrlChange: (v: string) => void;
  uploading: boolean;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickFromLibrary: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {url && (
        <div className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#222222]">
          <img src={url} alt={label} className="w-full h-40 object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-[#0a0a0a]" />
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
            disabled={uploading}
          />
        </label>
        <button
          type="button"
          onClick={onPickFromLibrary}
          className="bg-[#141414] hover:bg-[#141414] text-xs px-3 py-2 rounded-lg text-[#f5f5f5] border border-[#222222]"
        >
          Select from library
        </button>
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="...or paste an image URL"
        className="w-full bg-[#0a0a0a] border border-[#222222] focus:border-[#C9A227]/60 rounded-lg px-3 py-2 text-xs text-[#f5f5f5] outline-none transition"
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition ${
          checked ? "bg-[#C9A227]" : "bg-[#222222]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
      <div
        onClick={() => onChange(!checked)}
        className="flex-1 min-w-0"
      >
        <p className="text-sm text-[#f5f5f5] font-medium">{label}</p>
        {description && (
          <p className="text-xs text-[#a3a3a3] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
