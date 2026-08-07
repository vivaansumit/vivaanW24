import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface HandlePageProps {
  params: Promise<{ handle: string }>;
}

export const metadata: Metadata = {
  title: "Vivaan | Creative Portfolio",
};

/**
 * Catch-all vanity handle (e.g. /vivaan) → canonical /profile/<handle>.
 * Keeping a single canonical page avoids duplicate rendering paths.
 */
export default async function HandleRedirectPage({ params }: HandlePageProps) {
  const { handle } = await params;
  redirect(`/profile/${encodeURIComponent(handle)}`);
}
