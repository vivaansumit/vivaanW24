import Link from "next/link";
import type { Metadata } from "next";
import { getHomepageConfig } from "@/lib/homepage";
import { HomePageFeatureCards } from "@/components/HomePageFeatureCards";
import { HeroEntrance, FadeIn, SectionEntrance } from "@/components/Motion";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getHomepageConfig();
  return {
    title: `${config.logoText} — ${config.heroTitle}`,
    description: config.heroSubtitle,
  };
}

export default async function HomePage() {
  const config = await getHomepageConfig();

  const hasButton1 = config.button1Text.trim().length > 0;
  const hasButton2 = config.button2Text.trim().length > 0 && config.button2Link.trim().length > 0;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f5] antialiased relative overflow-x-hidden">
      {/* Subtle cover backdrop — very muted, never overwhelming */}
      {config.heroCoverUrl && (
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
          <img
            src={config.heroCoverUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
      )}

      {/* Top bar with subtle scroll blur */}
      <header className="nav-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 sm:px-10 py-5">
          <Link
            href="/"
            className="text-[11px] font-semibold tracking-[0.32em] text-[#f5f5f5]/70 hover:text-[#C9A227] transition-colors duration-200"
          >
            {config.logoText || "VIVAAN"}
          </Link>
          <Link
            href="/admin/login"
            className="text-[11px] font-medium tracking-wider text-[#737373] hover:text-[#a3a3a3] transition-colors duration-200"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28 lg:py-36">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-12 lg:gap-20">
          {/* Photo */}
          {config.heroPhotoUrl && (
            <HeroEntrance className="shrink-0">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#C9A227]/20 via-transparent to-transparent blur-xl opacity-60" />
                <img
                  src={config.heroPhotoUrl}
                  alt={config.logoText || "Portrait"}
                  className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full object-cover border border-[#222222] shadow-2xl"
                />
              </div>
            </HeroEntrance>
          )}

          {/* Text */}
          <div className="text-center lg:text-left max-w-xl">
            {config.heroTitle && (
              <HeroEntrance delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] text-[#f5f5f5]">
                  {config.heroTitle}
                </h1>
              </HeroEntrance>
            )}
            {config.heroSubtitle && (
              <FadeIn delay={0.25}>
                <p className="mt-5 text-base sm:text-lg text-[#a3a3a3] font-light leading-relaxed">
                  {config.heroSubtitle}
                </p>
              </FadeIn>
            )}
            {config.heroDescription && (
              <FadeIn delay={0.4}>
                <p className="mt-4 text-sm text-[#737373] font-light leading-relaxed max-w-lg">
                  {config.heroDescription}
                </p>
              </FadeIn>
            )}

            {/* Buttons */}
            <FadeIn delay={0.55}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {hasButton1 && (
                  <Link
                    href={config.button1Link || "/"}
                    className="inline-flex items-center gap-2 bg-[#C9A227] text-black px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:bg-[#D4AF37] hover:shadow-[0_4px_24px_-6px_rgba(201,162,39,0.45)]"
                  >
                    {config.button1Text}
                    <span aria-hidden>→</span>
                  </Link>
                )}
                {hasButton2 && (
                  <Link
                    href={config.button2Link}
                    className="inline-flex items-center gap-2 bg-transparent border border-[#222222] text-[#f5f5f5] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:border-[#C9A227]/50 hover:text-[#C9A227]"
                  >
                    {config.button2Text}
                  </Link>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Optional feature cards */}
      {config.showFeatureCards && (
        <SectionEntrance className="px-6 sm:px-10 py-20 max-w-5xl mx-auto border-t border-[#222222]/60">
          <HomePageFeatureCards />
        </SectionEntrance>
      )}

      {/* Footer */}
      <footer className="px-6 sm:px-10 py-10 border-t border-[#222222]/60 text-center">
        <p className="text-[11px] text-[#737373] tracking-wider">
          {config.footerText || "© 2025 Vivaan. All rights reserved."}
        </p>
      </footer>
    </main>
  );
}
