"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  User,
  Image as ImageIcon,
  Video,
  Zap,
  Briefcase,
  Folder,
  Palette,
  Inbox,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Link as LinkIcon,
  Circle,
} from "lucide-react";
import { useToast } from "@/components/Toast";

// CMS Sections
import { OverviewSection } from "@/components/cms/OverviewSection";
import { HomepageSection } from "@/components/cms/HomepageSection";
import { ProfileSection } from "@/components/cms/ProfileSection";
import { PostsSection } from "@/components/cms/PostsSection";
import { ReelsSection } from "@/components/cms/ReelsSection";
import { PortfolioSection } from "@/components/cms/PortfolioSection";
import { LinksSection } from "@/components/cms/LinksSection";
import { HighlightsSection } from "@/components/cms/HighlightsSection";
import { MediaSection } from "@/components/cms/MediaSection";
import { ThemeStudioSection } from "@/components/cms/ThemeStudioSection";
import { InquiriesSection } from "@/components/cms/InquiriesSection";
import { CommentsSection } from "@/components/cms/CommentsSection";
import { SettingsSection } from "@/components/cms/SettingsSection";

interface AdminDashboardProps {
  initialTab?: string;
}

export function AdminDashboard({ initialTab = "overview" }: AdminDashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    viewsCount: 0,
    postsCount: 0,
    reelsCount: 0,
    portfolioCount: 0,
    inquiriesCount: 0,
  });

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAuth();
  }, []);

  const fetchAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          fetchStats(data.user);
        } else {
          router.push("/admin/login");
        }
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (currentUser: any) => {
    try {
      const [postsRes, reelsRes, portRes, inqRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/reels"),
        fetch("/api/portfolio"),
        fetch("/api/inquiries"),
      ]);

      const [postsData, reelsData, portData, inqData] = await Promise.all([
        postsRes.json(),
        reelsRes.json(),
        portRes.json(),
        inqRes.json(),
      ]);

      setStats({
        viewsCount: currentUser?.viewsCount || 18950,
        postsCount: (postsData.posts || []).length,
        reelsCount: (reelsData.reels || []).length,
        portfolioCount: (portData.portfolio || []).length,
        inquiriesCount: (inqData.inquiries || []).length,
      });
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged out of Admin Portal", "info");
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#C9A227] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#C9A227] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#f5f5f5]">Authenticating Vivaan Admin Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "homepage", label: "Homepage", href: "/admin/homepage", icon: Home },
    { id: "profile", label: "Profile", href: "/admin/profile", icon: User },
    { id: "posts", label: "Posts", href: "/admin/posts", icon: ImageIcon, badge: stats.postsCount },
    { id: "videos", label: "Videos", href: "/admin/videos", icon: Video, badge: stats.reelsCount },
    { id: "shorts", label: "Shorts", href: "/admin/shorts", icon: Zap },
    { id: "portfolio", label: "Portfolio", href: "/admin/portfolio", icon: Briefcase, badge: stats.portfolioCount },
    { id: "gallery", label: "Gallery", href: "/admin/gallery", icon: Folder },
    { id: "theme", label: "Theme", href: "/admin/theme", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] flex flex-col md:flex-row selection:bg-[#C9A227] selection:text-black">
      {/* Mobile Top Header */}
      <div className="md:hidden nav-blur p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold tracking-[0.3em] text-[#f5f5f5]">VIVAAN</span>
          <span className="text-[10px] text-[#737373] tracking-wider ml-1">ADMIN</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[#111111] text-[#f5f5f5] border border-[#222222]"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-[#222222] flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Brand */}
          <Link href="/admin" className="hidden md:flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#f5f5f5]">VIVAAN</p>
              <p className="text-[10px] text-[#737373] tracking-wider">Admin Console</p>
            </div>
          </Link>

          {/* User Card */}
          <div className="bg-[#111111] p-3 rounded-2xl border border-[#222222] flex items-center gap-3">
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#222222]"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-xs text-[#f5f5f5] truncate">{user?.name || "Vivaan"}</h4>
              <p className="text-[10px] text-[#C9A227]/80 font-medium flex items-center gap-1 tracking-wider">
                <ShieldCheck className="w-3 h-3" /> ADMIN
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id || (activeTab === "reels" && (item.id === "videos" || item.id === "shorts")) || (activeTab === "media" && item.id === "gallery");
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                    router.push(item.href);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-[#C9A227]/10 text-[#C9A227] border-l-2 border-[#C9A227] pl-2.5"
                      : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-[#C9A227]" : "text-[#737373]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      active ? "bg-[#C9A227]/20 text-[#C9A227]" : "bg-[#111111] text-[#737373]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Extra controls */}
          <div className="pt-4 border-t border-[#222222] space-y-0.5">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#737373] uppercase px-3 block mb-1.5">
              More
            </span>
            {[
              { id: "links", icon: LinkIcon, label: "Bio Links" },
              { id: "highlights", icon: Circle, label: "Highlights" },
              { id: "inquiries", icon: Inbox, label: "Inquiries", count: stats.inquiriesCount },
              { id: "settings", icon: Settings, label: "Publishing" },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-[#C9A227]/10 text-[#C9A227]"
                      : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-[#C9A227]" : "text-[#737373]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count && item.count > 0 && (
                    <span className="bg-[#C9A227]/20 text-[#C9A227] text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] space-y-2">
          <a
            href="/profile/vivaan"
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#111111] hover:bg-[#141414] border border-[#222222] hover:border-[#C9A227]/40 text-[#f5f5f5] text-xs font-medium py-2.5 px-3 rounded-xl transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" /> Public Site
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full bg-transparent hover:bg-rose-950/30 border border-[#222222] hover:border-rose-900/50 text-[#a3a3a3] hover:text-rose-300 text-xs font-medium py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {(activeTab === "overview" || activeTab === "dashboard") && (
          <OverviewSection user={user} stats={stats} onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === "homepage" && <HomepageSection />}
        {activeTab === "profile" && <ProfileSection user={user} onUserUpdated={(u) => setUser(u)} />}
        {activeTab === "posts" && <PostsSection />}
        {(activeTab === "videos" || activeTab === "shorts" || activeTab === "reels") && <ReelsSection />}
        {activeTab === "portfolio" && <PortfolioSection />}
        {(activeTab === "gallery" || activeTab === "media") && <MediaSection />}
        {activeTab === "theme" && <ThemeStudioSection user={user} onUserUpdated={(u) => setUser(u)} />}
        {activeTab === "links" && <LinksSection />}
        {activeTab === "highlights" && <HighlightsSection />}
        {activeTab === "inquiries" && <InquiriesSection />}
        {activeTab === "comments" && <CommentsSection />}
        {activeTab === "settings" && <SettingsSection user={user} onUserUpdated={(u) => setUser(u)} />}
      </main>
    </div>
  );
}
