"use client";

import React, { useState, useEffect } from "react";
import { Upload, Trash2, Copy, Check, Search, Image as ImageIcon, Video, Sparkles } from "lucide-react";
import { useToast } from "../Toast";

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  tags: string[];
  createdAt: string;
}

export function MediaSection() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
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
        const savedRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.fileName || file.name,
            fileUrl: data.url,
            fileType: data.fileType || "image",
            fileSize: data.fileSize || "1.2 MB",
            tags: ["upload"],
          }),
        });

        const savedData = await savedRes.json();
        if (savedData.success) {
          showToast("Media uploaded to Vivaan Cloud Storage!", "success");
          fetchMedia();
        }
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Error uploading file", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        showToast("Asset deleted", "success");
      }
    } catch {
      showToast("Failed to delete asset", "error");
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("Media URL copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter((a) => {
    if (filterType !== "all" && a.fileType !== filterType) return false;
    if (search && !a.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Cloud Media Storage</h2>
          <p className="text-xs text-[#a3a3a3]">Manage high-resolution images, video loops, render frames & attachments</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> {uploading ? "Uploading Image..." : "Upload Image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>

          <label className="bg-[#141414] hover:bg-[#141414] text-[#C9A227] border border-[#C9A227]/30 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5">
            <Video className="w-4 h-4" /> {uploading ? "Uploading Video..." : "Upload Video"}
            <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] border border-[#C9A227]/20 p-4 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "all" ? "bg-[#C9A227] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#a3a3a3] border border-[#222222]"
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "image" ? "bg-[#C9A227] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#a3a3a3] border border-[#222222]"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "video" ? "bg-[#C9A227] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#a3a3a3] border border-[#222222]"
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading cloud library...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">No media assets found</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">Upload media files to store them securely in Vivaan's central cloud storage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative"
            >
              <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
                {asset.fileType === "video" ? (
                  <video src={asset.fileUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={asset.fileUrl} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                )}

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopyLink(asset.fileUrl, asset.id)}
                    className="p-2 bg-[#C9A227] text-[#0a0a0a] rounded-xl hover:bg-[#D4AF37] transition shadow"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check className="w-4 h-4 text-[#0a0a0a]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition shadow"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#111111] space-y-1">
                <p className="font-bold text-xs text-[#f5f5f5] truncate">{asset.fileName}</p>
                <div className="flex items-center justify-between text-[10px] text-[#a3a3a3]">
                  <span className="uppercase">{asset.fileType}</span>
                  <span>{asset.fileSize}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
