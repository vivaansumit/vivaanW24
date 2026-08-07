"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { FadeIn, HeroEntrance } from "@/components/Motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Welcome back, Vivaan Admin.", "success");
        window.location.href = "/admin";
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login client error:", err);
      setError("Network error logging in to admin portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#f5f5f5] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle ambient gold glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A227]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <HeroEntrance className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-3xl p-10 shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
            >
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
              <span className="text-sm font-semibold tracking-[0.32em] text-[#f5f5f5]">
                VIVAAN
              </span>
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.28em] text-[#C9A227] uppercase">
              Admin Access
            </div>
            <p className="text-xs text-[#737373]">Sign in to manage your portfolio</p>
          </div>

          {/* Error */}
          {error && (
            <FadeIn>
              <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </FadeIn>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] text-[#737373] uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-black border border-[#222222] focus:border-[#C9A227]/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-[#f5f5f5] placeholder-[#737373] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] text-[#737373] uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-[#222222] focus:border-[#C9A227]/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-[#f5f5f5] placeholder-[#737373] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A227] hover:bg-[#D4AF37] text-black font-medium text-xs py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_4px_24px_-6px_rgba(201,162,39,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center">
            <Link href="/profile/vivaan" className="text-xs text-[#737373] hover:text-[#C9A227] transition-colors">
              ← View Public Profile
            </Link>
          </div>
        </div>
      </HeroEntrance>
    </main>
  );
}
