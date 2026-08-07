/**
 * Vivaan Design Tokens
 *
 * A sober, premium palette: pure black + off-white + subtle light gold.
 * Use these helpers instead of ad-hoc Tailwind classes so the whole site
 * stays visually consistent.
 */

// Hex palette
export const palette = {
  black: "#000000",
  surface: "#0a0a0a",
  card: "#111111",
  cardHover: "#141414",
  border: "#222222",
  borderHover: "#2a2a2a",
  text: "#f5f5f5",
  textMuted: "#a3a3a3",
  textDim: "#737373",
  gold: "#C9A227",
  goldSoft: "#D4AF37",
  goldGlow: "rgba(201, 162, 39, 0.08)",
} as const;

/**
 * CSS class helpers — returns Tailwind v4 arbitrary values using the tokens.
 * Keeps the call sites short and readable.
 */
export const styles = {
  page: "bg-[#000000] text-[#f5f5f5] antialiased",
  surface: "bg-[#0a0a0a]",
  card: "bg-[#111111] border border-[#222222] rounded-2xl",
  cardHover:
    "transition-all duration-300 ease-out hover:-translate-y-[3px] hover:border-[#C9A227]/40 hover:shadow-[0_8px_32px_-12px_rgba(201,162,39,0.25)]",
  border: "border-[#222222]",
  borderHover: "border-[#2a2a2a]",
  text: "text-[#f5f5f5]",
  textMuted: "text-[#a3a3a3]",
  textDim: "text-[#737373]",
  gold: "text-[#C9A227]",
  goldSoft: "text-[#D4AF37]",
  goldBg: "bg-[#C9A227]",
  goldBgHover: "hover:bg-[#D4AF37]",
  goldBorder: "border-[#C9A227]",
  goldBorderHover: "hover:border-[#C9A227]/60",
  buttonPrimary:
    "bg-[#C9A227] text-black font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-[#D4AF37] hover:shadow-[0_4px_20px_-4px_rgba(201,162,39,0.5)]",
  buttonSecondary:
    "bg-transparent text-[#f5f5f5] border border-[#222222] font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:border-[#C9A227]/50 hover:text-[#C9A227]",
  buttonGhost:
    "bg-transparent text-[#a3a3a3] font-medium transition-colors duration-200 hover:text-[#C9A227]",
} as const;
