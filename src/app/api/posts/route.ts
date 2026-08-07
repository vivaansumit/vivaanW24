import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(desc(posts.isPinned), desc(posts.createdAt));

    return NextResponse.json({ posts: list });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, caption, type, mediaUrls, hashtags, isPinned, privacy, commentsEnabled } = body;

    if (!caption && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json({ error: "Post content or media is required" }, { status: 400 });
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        userId: user.id,
        type: type || (mediaUrls?.length > 1 ? "carousel" : "image"),
        title: title || "",
        caption: caption || "",
        mediaUrls: mediaUrls || [],
        hashtags: hashtags || [],
        isPinned: isPinned || false,
        privacy: privacy || "public",
        commentsEnabled: commentsEnabled !== undefined ? commentsEnabled : true,
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
