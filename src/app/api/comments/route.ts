import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const reelId = searchParams.get("reelId");

  try {
    let list;
    if (postId) {
      list = await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
    } else if (reelId) {
      list = await db.select().from(comments).where(eq(comments.reelId, reelId)).orderBy(desc(comments.createdAt));
    } else {
      list = await db.select().from(comments).orderBy(desc(comments.createdAt)).limit(50);
    }

    return NextResponse.json({ comments: list });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, reelId, authorName, authorAvatar, content } = body;

    if ((!postId && !reelId) || !authorName || !content) {
      return NextResponse.json({ error: "Post/Reel ID, name, and comment text are required" }, { status: 400 });
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        postId: postId || null,
        reelId: reelId || null,
        authorName: authorName.trim(),
        authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        content: content.trim(),
        isApproved: true,
      })
      .returning();

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
