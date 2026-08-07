"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Check, Image as ImageIcon, Video, Search, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  filterType?: "image" | "video" | "all";
}

const STOCK_PRESETS = [
  { name: "3D Cyber Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Glass Render", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Modern Setup", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Smart Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Stage Lighting", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Dashboard UI", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80", type: "image" },
  { name: "Sample Reel MP4 1", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", type: "video" },
  { name: "Sample Reel MP4 2", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", type: "video" }
];

export function MediaPickerModal({ isOpen, onClose, onSelect, filterType = "all" }: MediaPickerProps) {
  const [tab, setTab] = useState<"library" | "upload" | "presets" | "url">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        // Save to media library
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.fileName || file.name,
            fileUrl: data.url,
            fileType: data.fileType || "image",
            fileSize: data.fileSize || "1.2 MB",
          }),
        });

        showToast("File uploaded to cloud storage!", "success");
        onSelect(data.url);
        onClose();
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch (err) {
      showToast("Failed to upload file", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    onSelect(customUrl.trim());
    showToast("Media URL selected", "success");
    onClose();
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) => {
    if (filterType !== "all" && a.fileType !== filterType) return false;
    if (search && !a.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredPresets = STOCK_PRESETS.filter((p) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#222222] text-[#f5f5f5] rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222222]">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A227]" /> Choose Media Asset
            </h3>
            <p className="text-xs text-[#a3a3a3]">Select from cloud library, upload custom file, or pick stock stock presets</p>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#222222] text-sm font-medium">
          <button
            onClick={() => setTab("library")}
            className={`pb-3 px-3 border-b-2 transition ${tab === "library" ? "border-[#C9A227] text-[#C9A227] font-semibold" : "border-transparent text-[#a3a3a3] hover:text-[#f5f5f5]"}`}
          >
            Cloud Library ({assets.length})
          </button>
          <button
            onClick={() => setTab("presets")}
            className={`pb-3 px-3 border-b-2 transition ${tab === "presets" ? "border-[#C9A227] text-[#C9A227] font-semibold" : "border-transparent text-[#a3a3a3] hover:text-[#f5f5f5]"}`}
          >
            Stock Presets
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`pb-3 px-3 border-b-2 transition ${tab === "upload" ? "border-[#C9A227] text-[#C9A227] font-semibold" : "border-transparent text-[#a3a3a3] hover:text-[#f5f5f5]"}`}
          >
            Upload File
          </button>
          <button
            onClick={() => setTab("url")}
            className={`pb-3 px-3 border-b-2 transition ${tab === "url" ? "border-[#C9A227] text-[#C9A227] font-semibold" : "border-transparent text-[#a3a3a3] hover:text-[#f5f5f5]"}`}
          >
            Paste URL
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto min-h-[320px]">
          {tab === "library" && (
            <div>
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#C9A227]/60 text-[#f5f5f5]"
                />
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#a3a3a3]">Loading library...</div>
              ) : filteredAssets.length === 0 ? (
                <div className="py-12 text-center text-[#a3a3a3]">
                  <p className="mb-3">No saved assets in library matching filter.</p>
                  <button
                    onClick={() => setTab("presets")}
                    className="text-[#C9A227] hover:underline text-xs"
                  >
                    Try Stock Presets or Upload
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        onSelect(asset.fileUrl);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#222222] hover:border-[#C9A227] cursor-pointer transition shadow"
                    >
                      {asset.fileType === "video" ? (
                        <video src={asset.fileUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={asset.fileUrl} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="bg-[#C9A227] text-white p-2 rounded-full shadow">
                          <Check className="w-5 h-5" />
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-[#f5f5f5] truncate">
                        {asset.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "presets" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredPresets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelect(preset.url);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#222222] hover:border-[#C9A227] cursor-pointer transition shadow"
                >
                  {preset.type === "video" ? (
                    <div className="w-full h-full bg-[#111111] flex flex-col items-center justify-center p-3 text-center">
                      <Video className="w-8 h-8 text-[#C9A227] mb-1" />
                      <span className="text-xs text-[#a3a3a3]">{preset.name}</span>
                    </div>
                  ) : (
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-[#C9A227] text-white p-2 rounded-full shadow">
                      <Check className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-[#f5f5f5] truncate">
                    {preset.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "upload" && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#222222] rounded-2xl p-8 hover:border-[#C9A227]/50 transition bg-[#0a0a0a]/50 my-4">
              <Upload className="w-12 h-12 text-[#C9A227] mb-3 animate-bounce" />
              <h4 className="font-semibold text-[#f5f5f5] mb-1">Drag and drop file or browse</h4>
              <p className="text-xs text-[#a3a3a3] mb-4">Supports PNG, JPG, WEBP, MP4, WebM up to 50MB</p>
              <label className="bg-[#C9A227] hover:bg-[#C9A227] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition shadow-lg shadow-[#C9A227]/30">
                {uploading ? "Uploading..." : "Select File"}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}

          {tab === "url" && (
            <form onSubmit={handleCustomUrlSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">Direct Media URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://domain.com/video.mp4"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227]/60 text-[#f5f5f5]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C9A227] hover:bg-[#C9A227] text-white font-semibold py-3 rounded-xl transition text-sm shadow-lg shadow-[#C9A227]/20"
              >
                Use Custom URL
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
