import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(reels)
      .where(eq(reels.userId, user.id))
      .orderBy(desc(reels.isPinned), desc(reels.createdAt));

    return NextResponse.json({ reels: list });
  } catch (error) {
    console.error("Get reels error:", error);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { videoUrl, thumbnailUrl, title, caption, soundTrack, duration, isPinned, privacy } = body;

    if (!videoUrl || !title) {
      return NextResponse.json({ error: "Video URL and title are required" }, { status: 400 });
    }

    const [newReel] = await db
      .insert(reels)
      .values({
        userId: user.id,
        videoUrl,
        thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        title,
        caption: caption || "",
        soundTrack: soundTrack || "Original Sound",
        duration: Number(duration) || 15,
        isPinned: isPinned || false,
        privacy: privacy || "public",
      })
      .returning();

    return NextResponse.json({ success: true, reel: newReel });
  } catch (error) {
    console.error("Create reel error:", error);
    return NextResponse.json({ error: "Failed to create reel" }, { status: 500 });
  }
}
