"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  Globe,
  Share2,
  Mail,
  Heart,
  Eye,
  ExternalLink,
  Sparkles,
  Grid,
  Play,
  Briefcase,
  Link as LinkIcon,
  User,
  Music,
  Check,
  Phone,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

import { StoryViewerModal } from "@/components/StoryViewerModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { ReelViewerModal } from "@/components/ReelViewerModal";
import { ProjectDetailModal } from "@/components/ProjectDetailModal";
import { ContactModal } from "@/components/ContactModal";
import { FadeIn, StaggerGrid, FadeItem, HeroEntrance, SectionEntrance } from "@/components/Motion";

interface PublicProfileViewProps {
  creator: any;
  posts: any[];
  reels: any[];
  portfolio: any[];
  socialLinks: any[];
  highlights: any[];
  stats: {
    postsCount: number;
    reelsCount: number;
    portfolioCount: number;
    totalLikes: number;
    viewsCount: number;
  };
}

function EmptyState({ icon: Icon, title, message }: { icon: any; title: string; message: string }) {
  return (
    <div className="py-20 px-6 text-center space-y-3 bg-[#0a0a0a] border border-[#222222] rounded-2xl">
      <Icon className="w-9 h-9 text-[#C9A227]/60 mx-auto" />
      <h3 className="font-medium text-[15px] text-[#f5f5f5]">{title}</h3>
      <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto leading-relaxed">{message}</p>
    </div>
  );
}

export function PublicProfileView({
  creator,
  posts,
  reels,
  portfolio,
  socialLinks,
  highlights,
  stats,
}: PublicProfileViewProps) {
  const [activeTab, setActiveTab] = useState("feed");
  const [portfolioCategory, setPortfolioCategory] = useState("All");

  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedReel, setSelectedReel] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { showToast } = useToast();

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeReels = Array.isArray(reels) ? reels : [];
  const safePortfolio = Array.isArray(portfolio) ? portfolio : [];
  const safeLinks = Array.isArray(socialLinks) ? socialLinks : [];
  const safeHighlights = Array.isArray(highlights) ? highlights : [];

  const displayName = creator?.name || "Creator";
  const displayHandle = creator?.handle || "vivaan";
  const avatarUrl =
    creator?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
  const coverUrl =
    creator?.coverUrl ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80";

  const categories = ["All", ...Array.from(new Set(safePortfolio.map((p) => p.category).filter(Boolean)))];
  const filteredPortfolio =
    portfolioCategory === "All" ? safePortfolio : safePortfolio.filter((p) => p.category === portfolioCategory);

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await fetch("/api/public/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", targetType: "socialLink", targetId: linkId }),
      });
    } catch {}
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareProfile = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast("Profile link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast("Copy the address bar link to share this profile.", "info");
    }
  };

  const tabs = [
    { id: "feed", label: `Feed`, count: safePosts.length, icon: Grid },
    { id: "reels", label: `Reels`, count: safeReels.length, icon: Play },
    { id: "portfolio", label: `Portfolio`, count: safePortfolio.length, icon: Briefcase },
    { id: "links", label: `Links`, count: safeLinks.length, icon: LinkIcon },
    { id: "about", label: `About`, count: null, icon: User },
  ];

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] antialiased relative overflow-x-hidden">
      {/* Cover Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-[#0a0a0a]">
        <img src={coverUrl} alt={`${displayName} cover`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

        {/* Top bar */}
        <div className="nav-blur absolute top-0 inset-x-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 sm:px-10 py-5">
            <Link
              href="/"
              className="text-[11px] font-semibold tracking-[0.32em] text-[#f5f5f5]/80 hover:text-[#C9A227] transition-colors duration-200"
            >
              VIVAAN
            </Link>
            <button
              onClick={handleShareProfile}
              className="text-[11px] font-medium tracking-wider text-[#a3a3a3] hover:text-[#C9A227] transition-colors duration-200 flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 relative -mt-24 sm:-mt-28 z-20">
        <HeroEntrance>
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#C9A227]/30 via-transparent to-transparent blur-lg opacity-80" />
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-black shadow-2xl"
                />
              </div>

              {creator?.isHireable && (
                <button
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#C9A227] text-black font-medium text-xs px-5 py-3 rounded-full transition-all duration-200 hover:bg-[#D4AF37] hover:shadow-[0_4px_24px_-6px_rgba(201,162,39,0.45)]"
                >
                  <Mail className="w-4 h-4" /> Hire / Contact
                </button>
              )}
            </div>

            {/* Name + title */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#f5f5f5]">
                  {displayName}
                </h1>
                {creator?.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-[#C9A227] fill-[#C9A227]/20" />
                )}
              </div>
              <p className="text-xs tracking-wider text-[#C9A227]/80 font-medium">@{displayHandle}</p>
              {creator?.title && (
                <p className="text-base text-[#f5f5f5]/80 font-light">{creator.title}</p>
              )}
              {creator?.bio ? (
                <p className="text-sm text-[#a3a3a3] leading-relaxed pt-2 max-w-2xl">
                  {creator.bio}
                </p>
              ) : (
                <p className="text-xs text-[#737373] italic pt-2">This creator has not added a bio yet.</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-5 pt-3 text-xs text-[#a3a3a3]">
                {creator?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A227]/70" /> {creator.location}
                  </span>
                )}
                {creator?.phone && creator?.phoneVisibility && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C9A227]/70" /> {creator.phone}
                  </span>
                )}
                {creator?.websiteUrl && (
                  <a
                    href={creator.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#C9A227]/80 hover:text-[#C9A227] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> {String(creator.websiteUrl).replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mt-8 pt-6 border-t border-[#222222]/80">
              {[
                { value: stats?.postsCount ?? 0, label: "Posts" },
                { value: stats?.reelsCount ?? 0, label: "Reels" },
                { value: stats?.portfolioCount ?? 0, label: "Projects" },
                { value: (stats?.totalLikes ?? 0).toLocaleString(), label: "Likes" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl sm:text-2xl font-light text-[#f5f5f5] tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-medium mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </HeroEntrance>

        {/* Story Highlights */}
        {safeHighlights.length > 0 && (
          <SectionEntrance className="mt-8">
            <div className="flex items-center gap-5 overflow-x-auto pb-2">
              {safeHighlights.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHighlight(h)}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-[#C9A227]/70 via-[#D4AF37]/40 to-[#C9A227]/70 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={h.coverUrl}
                      alt={h.title}
                      className="w-16 h-16 rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#a3a3a3] group-hover:text-[#C9A227] transition-colors">
                    {h.title}
                  </span>
                </button>
              ))}
            </div>
          </SectionEntrance>
        )}

        {/* Tabs */}
        <div className="mt-10 border-b border-[#222222] flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3.5 text-xs font-medium tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 whitespace-nowrap ${
                  active ? "text-[#C9A227]" : "text-[#737373] hover:text-[#a3a3a3]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
                {tab.count !== null && (
                  <span className={`text-[10px] ${active ? "text-[#C9A227]/70" : "text-[#737373]"}`}>
                    {tab.count}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="profile-tab-underline"
                    className="absolute bottom-0 inset-x-3 h-px bg-[#C9A227]"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* FEED */}
        {activeTab === "feed" && (
          <SectionEntrance className="py-10">
            {safePosts.length === 0 ? (
              <EmptyState
                icon={ImageOff}
                title="No published posts yet"
                message="This creator has not published any posts to their public feed. Check back soon for new work."
              />
            ) : (
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {safePosts.map((post) => (
                  <FadeItem key={post.id}>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="card-lift group bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden text-left w-full"
                    >
                      <div className="relative aspect-square bg-black overflow-hidden">
                        {post.mediaUrls && post.mediaUrls[0] ? (
                          <img
                            src={post.mediaUrls[0]}
                            alt={post.title || "Post"}
                            className="w-full h-full object-cover img-zoom"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#737373] text-xs">
                            No image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-[#f5f5f5] font-light">
                          <span className="flex items-center gap-2 text-sm">
                            <Heart className="w-5 h-5" /> {post.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-2 text-sm">
                            <Eye className="w-5 h-5" /> {post.viewsCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-1.5">
                        {post.title && (
                          <h4 className="font-medium text-[15px] text-[#f5f5f5] leading-snug tracking-tight line-clamp-1">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-xs text-[#a3a3a3] leading-relaxed line-clamp-2">
                          {post.caption}
                        </p>
                      </div>
                    </button>
                  </FadeItem>
                ))}
              </StaggerGrid>
            )}
          </SectionEntrance>
        )}

        {/* REELS */}
        {activeTab === "reels" && (
          <SectionEntrance className="py-10">
            {safeReels.length === 0 ? (
              <EmptyState
                icon={Play}
                title="No published reels yet"
                message="Short videos and motion reels will appear here once they are published."
              />
            ) : (
              <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {safeReels.map((reel) => (
                  <FadeItem key={reel.id}>
                    <button
                      onClick={() => setSelectedReel(reel)}
                      className="card-lift group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black text-left w-full border border-[#222222]"
                    >
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.title}
                        className="w-full h-full object-cover img-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-[#C9A227]/30">
                        <Play className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1.5">
                        <h4 className="font-medium text-xs leading-snug line-clamp-1">{reel.title}</h4>
                        <p className="text-[10px] text-[#C9A227]/80 flex items-center gap-1 truncate">
                          <Music className="w-3 h-3 shrink-0" /> {reel.soundTrack}
                        </p>
                      </div>
                    </button>
                  </FadeItem>
                ))}
              </StaggerGrid>
            )}
          </SectionEntrance>
        )}

        {/* PORTFOLIO */}
        {activeTab === "portfolio" && (
          <SectionEntrance className="py-10">
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap ${
                      portfolioCategory === cat
                        ? "bg-[#C9A227] text-black"
                        : "bg-[#111111] text-[#a3a3a3] border border-[#222222] hover:border-[#C9A227]/50 hover:text-[#C9A227]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filteredPortfolio.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No published projects yet"
                message="Case studies and client projects will be shown here once published."
              />
            ) : (
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPortfolio.map((item) => (
                  <FadeItem key={item.id}>
                    <button
                      onClick={() => setSelectedProject(item)}
                      className="card-lift group bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden text-left w-full flex flex-col"
                    >
                      <div className="relative aspect-video bg-black overflow-hidden">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover img-zoom"
                        />
                        {item.category && (
                          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-[#C9A227]/90 text-[10px] font-medium tracking-wider px-2.5 py-1 rounded-full border border-[#C9A227]/30 uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="p-5 space-y-2 flex-1 flex flex-col">
                        <h3 className="font-medium text-[15px] text-[#f5f5f5] leading-snug tracking-tight line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed line-clamp-2">{item.summary}</p>
                        <div className="flex items-center justify-between text-xs pt-3 mt-auto border-t border-[#222222]/80">
                          <span className="text-[#C9A227] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Case Study <span aria-hidden>→</span>
                          </span>
                          {item.clientName && (
                            <span className="text-[11px] text-[#737373] font-normal">{item.clientName}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </FadeItem>
                ))}
              </StaggerGrid>
            )}
          </SectionEntrance>
        )}

        {/* BIO LINKS */}
        {activeTab === "links" && (
          <SectionEntrance className="py-10 max-w-xl mx-auto">
            {safeLinks.length === 0 ? (
              <EmptyState
                icon={LinkIcon}
                title="No links added yet"
                message="Social profiles and website links will appear here once they are added."
              />
            ) : (
              <StaggerGrid className="space-y-3">
                {safeLinks.map((link) => (
                  <FadeItem key={link.id}>
                    <button
                      onClick={() => handleLinkClick(link.id, link.url)}
                      className="card-lift w-full p-4 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#C9A227]/40 text-[#f5f5f5] font-medium text-sm flex items-center justify-between group"
                      style={{ borderLeftColor: link.color || "#C9A227", borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[#C9A227]/70" />
                        <span>{link.title}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#737373] group-hover:text-[#C9A227] transition-colors" />
                    </button>
                  </FadeItem>
                ))}
              </StaggerGrid>
            )}
          </SectionEntrance>
        )}

        {/* ABOUT */}
        {activeTab === "about" && (
          <SectionEntrance className="py-10 max-w-2xl mx-auto">
            <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-8 space-y-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.3em] text-[#C9A227] uppercase mb-3">
                  About
                </p>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f5f5f5]">
                  {displayName}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[#a3a3a3] whitespace-pre-line">
                {creator?.bio || "This creator has not added an about section yet."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-[#222222]/80">
                {creator?.location && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373] mb-2">
                      Location
                    </h4>
                    <p className="text-sm text-[#f5f5f5]">{creator.location}</p>
                  </div>
                )}
                {creator?.phone && creator?.phoneVisibility && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373] mb-2">
                      Phone
                    </h4>
                    <p className="text-sm text-[#f5f5f5]">{creator.phone}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#222222]/80">
                <button
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#C9A227] text-black font-medium text-xs px-6 py-3 rounded-full transition-all duration-200 hover:bg-[#D4AF37] hover:shadow-[0_4px_24px_-6px_rgba(201,162,39,0.45)]"
                >
                  <Mail className="w-4 h-4" /> Send a Message
                </button>
              </div>
            </div>
          </SectionEntrance>
        )}
      </div>

      <div className="h-16" />

      {/* Modals */}
      <StoryViewerModal highlight={selectedHighlight} onClose={() => setSelectedHighlight(null)} />
      <PostDetailModal
        post={selectedPost}
        creatorName={displayName}
        creatorAvatar={avatarUrl}
        creatorHandle={displayHandle}
        onClose={() => setSelectedPost(null)}
      />
      <ReelViewerModal
        reel={selectedReel}
        creatorName={displayName}
        creatorAvatar={avatarUrl}
        creatorHandle={displayHandle}
        onClose={() => setSelectedReel(null)}
      />
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <ContactModal
        creatorHandle={displayHandle}
        creatorName={displayName}
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
