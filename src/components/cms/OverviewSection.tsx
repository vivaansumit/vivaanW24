"use client";

import React from "react";
import { Eye, MessageSquare, Briefcase, ExternalLink, Plus, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { FadeIn, StaggerGrid, FadeItem } from "../Motion";

interface OverviewProps {
  user: any;
  stats: {
    viewsCount: number;
    postsCount: number;
    reelsCount: number;
    portfolioCount: number;
    inquiriesCount: number;
  };
  onNavigate: (tab: string) => void;
}

export function OverviewSection({ user, stats, onNavigate }: OverviewProps) {
  const kpis = [
    { label: "Profile Views", value: stats.viewsCount.toLocaleString(), icon: Eye, hint: "Total visitors" },
    { label: "Feed Posts", value: stats.postsCount, icon: Sparkles, hint: `${stats.reelsCount} video reels` },
    { label: "Portfolio Projects", value: stats.portfolioCount, icon: Briefcase, hint: "Featured case studies" },
    { label: "Inquiries", value: stats.inquiriesCount, icon: MessageSquare, hint: "Client proposals", action: "inquiries" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome banner */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-[#222222] p-7 sm:p-9">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#C9A227]/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f5f5f5]">
                    Welcome back, {user?.name || "Vivaan"}
                  </h1>
                  <span className="bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#C9A227]/30 flex items-center gap-1 tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                </div>
                <p className="text-xs text-[#a3a3a3] mt-1">{user?.title} · @{user?.handle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/profile/${user?.handle || "vivaan"}`}
                target="_blank"
                rel="noreferrer"
                className="bg-transparent border border-[#222222] hover:border-[#C9A227]/50 text-[#f5f5f5] hover:text-[#C9A227] text-xs font-medium px-4 py-2.5 rounded-full transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Public Site
              </a>
              <button
                onClick={() => onNavigate("posts")}
                className="bg-[#C9A227] hover:bg-[#D4AF37] text-black font-medium text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-2 hover:shadow-[0_4px_20px_-4px_rgba(201,162,39,0.5)]"
              >
                <Plus className="w-4 h-4" /> New Content
              </button>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-[#C9A227]/[0.05] rounded-full blur-3xl pointer-events-none" />
        </div>
      </FadeIn>

      {/* KPI Grid */}
      <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const clickable = !!kpi.action;
          return (
            <FadeItem key={kpi.label}>
              <button
                type="button"
                onClick={() => kpi.action && onNavigate(kpi.action)}
                className={`card-lift bg-[#111111] border border-[#222222] p-5 rounded-2xl text-left w-full ${clickable ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center justify-between text-[#737373] mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {kpi.label}
                  </span>
                  <div className="p-2 rounded-xl bg-[#C9A227]/10 text-[#C9A227]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-light tracking-tight text-[#f5f5f5]">{kpi.value}</p>
                <p className="text-[11px] text-[#737373] mt-1">{kpi.hint}</p>
              </button>
            </FadeItem>
          );
        })}
      </StaggerGrid>

      {/* Quick Actions */}
      <FadeIn delay={0.2}>
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373] mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { id: "profile", label: "Edit Profile", hint: "Bio, photos, contacts" },
              { id: "posts", label: "New Post", hint: "Image & carousel" },
              { id: "reels", label: "New Reel", hint: "Short video" },
              { id: "portfolio", label: "Case Study", hint: "Client project" },
              { id: "homepage", label: "Homepage", hint: "Landing page" },
              { id: "theme", label: "Theme", hint: "Palette & style" },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => onNavigate(a.id)}
                className="card-lift bg-[#111111] border border-[#222222] p-4 rounded-xl text-left"
              >
                <p className="font-medium text-sm text-[#f5f5f5] tracking-tight">{a.label}</p>
                <p className="text-[11px] text-[#737373] mt-1">{a.hint}</p>
              </button>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
