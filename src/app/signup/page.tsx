"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, User, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, email, password, title }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Account created successfully!", "success");
        router.push("/dashboard");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Network error creating account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-2xl border border-[#141414] rounded-3xl p-8 shadow-2xl space-y-6 z-10 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-[#C9A227] font-extrabold text-2xl">
            <Sparkles className="w-7 h-7 text-[#C9A227]" />
            <span>CreatorLoom</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Create Creator Profile</h1>
          <p className="text-xs text-[#a3a3a3]">Launch your personal brand website and social CMS</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Handle Username (@handle)</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="jordanlee"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Title / Profession</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UI/UX Designer & Content Creator"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@example.com"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A227] text-[#f5f5f5]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-[#C9A227] text-white font-semibold text-xs py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : <>Create Creator Profile <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center text-xs text-[#a3a3a3]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C9A227] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
