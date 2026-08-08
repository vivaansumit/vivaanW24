import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getPublicProfile } from "@/lib/profile";
import { ToastProvider } from "@/components/Toast";
import { PublicProfileView } from "@/components/PublicProfileView";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  try {
    const { handle } = await params;
    const data = await getPublicProfile(handle);

    if (!data) {
      return { title: "Vivaan | Creative Portfolio" };
    }

    const { creator } = data;
    return {
      title: creator.pageTitle || `${creator.name} | Creative Portfolio`,
      description:
        creator.bio || `Explore the official portfolio of ${creator.name}.`,
      openGraph: {
        title: creator.pageTitle || `${creator.name} | Creative Portfolio`,
        description: creator.bio || "",
        images: creator.coverUrl ? [creator.coverUrl] : [],
      },
    };
  } catch {
    return { title: "Vivaan | Creative Portfolio" };
  }
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;

  let data = null;
  let loadError = "";

  try {
    data = await getPublicProfile(handle);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Unknown error";
    console.error("[PublicProfile] load error:", e);
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-[#111111] border border-[#C9A227]/30 p-8 rounded-3xl space-y-4 shadow-2xl">
          <Sparkles className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h2 className="text-2xl font-extrabold text-[#f5f5f5]">
            Profile Unavailable
          </h2>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            {loadError
              ? `Could not load profile (${handle}).`
              : `No public profile found for @${handle}.`}
          </p>
          <Link
            href="/"
            className="inline-block bg-[#C9A227] hover:bg-[#C9A227] text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#C9A227]/20 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <PublicProfileView
        creator={data.creator}
        posts={data.posts}
        reels={data.reels}
        portfolio={data.portfolio}
        socialLinks={data.socialLinks}
        highlights={data.highlights}
        stats={data.stats}
      />
    </ToastProvider>
  );
}