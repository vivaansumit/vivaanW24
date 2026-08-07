"use client";

export interface ThemeConfig {
  themePreset: string; // 'gold' | 'dark' | 'cyberpunk' | 'light' | 'minimal'
  primaryColor: string;
  fontFamily: string;
  cardStyle: string; // 'glass' | 'solid' | 'clean' | 'neon'
  bgPattern: string; // 'dots' | 'grid' | 'none'
  pageTitle?: string;
  activeTabs?: string[];
}

export function getThemeClasses(config?: ThemeConfig | null) {
  const preset = config?.themePreset || "gold";
  const cardStyle = config?.cardStyle || "glass";

  switch (preset) {
    case "light":
      return {
        bg: "bg-stone-50 text-[#111111]",
        card: cardStyle === "clean" ? "bg-white border border-[#f5f5f5] shadow-sm" : "bg-white/80 backdrop-blur-md border border-[#f5f5f5]/80 shadow-md",
        textPrimary: "text-[#111111]",
        textMuted: "text-[#737373]",
        border: "border-[#f5f5f5]",
        accentBg: "bg-[#C9A227] hover:bg-[#C9A227] text-white shadow-lg shadow-[#C9A227]/30",
        accentText: "text-[#C9A227]",
        badgeBg: "bg-[#f5f5f5] text-[#141414] border border-[#f5f5f5]",
      };

    case "cyberpunk":
      return {
        bg: "bg-[#0a0a0a] text-cyan-100",
        card: "bg-[#111111]/80 backdrop-blur-lg border border-[#C9A227]/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]",
        textPrimary: "text-[#f5f5f5]",
        textMuted: "text-[#C9A227]/70",
        border: "border-[#C9A227]/30",
        accentBg: "bg-[#C9A227] text-[#0a0a0a] font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]",
        accentText: "text-[#C9A227]",
        badgeBg: "bg-[#0a0a0a]/80 text-[#C9A227] border border-[#C9A227]/30",
      };

    case "minimal":
      return {
        bg: "bg-neutral-950 text-neutral-100",
        card: "bg-neutral-900/80 border border-neutral-800/80 rounded-xl",
        textPrimary: "text-neutral-100",
        textMuted: "text-neutral-400",
        border: "border-neutral-800",
        accentBg: "bg-[#C9A227] text-neutral-950 font-bold",
        accentText: "text-[#C9A227]",
        badgeBg: "bg-neutral-800 text-neutral-300 border border-neutral-700",
      };

    case "dark":
      return {
        bg: "bg-neutral-950 text-[#f5f5f5]",
        card: "bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 shadow-xl",
        textPrimary: "text-white",
        textMuted: "text-[#a3a3a3]",
        border: "border-[#141414]",
        accentBg: "bg-[#C9A227] hover:bg-[#C9A227] text-[#0a0a0a] font-bold shadow-lg shadow-[#C9A227]/20",
        accentText: "text-[#C9A227]",
        badgeBg: "bg-[#141414]/80 text-[#C9A227] border border-[#222222]/60",
      };

    case "gold":
    default:
      return {
        bg: "bg-[#0a0a0a] text-[#f5f5f5]",
        card: cardStyle === "glass"
          ? "bg-[#111111]/80 backdrop-blur-xl border border-[#C9A227]/30 shadow-[0_0_30px_rgba(245,158,11,0.08)]"
          : "bg-[#111111] border border-[#C9A227]/30 shadow-lg",
        textPrimary: "text-[#f5f5f5]",
        textMuted: "text-[#a3a3a3]",
        border: "border-[#C9A227]/20",
        accentBg: "bg-gradient-to-r from-[#C9A227] via-[#C9A227] to-yellow-500 hover:from-[#C9A227] hover:to-yellow-400 text-[#0a0a0a] font-bold shadow-lg shadow-[#C9A227]/20",
        accentText: "text-[#C9A227]",
        badgeBg: "bg-[#C9A227]/10/80 text-[#C9A227] border border-[#C9A227]/30",
      };
  }
}
