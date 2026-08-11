import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function toIntId(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = toIntId(searchParams.get("postId"));
  const reelId = toIntId(searchParams.get("reelId"));

  try {
    let list;

    if (postId !== null) {
      list = await db
        .select()
        .from(comments)
        .where(eq(comments.postId, postId))
        .orderBy(desc(comments.createdAt));
    } else if (reelId !== null) {
      list = await db
        .select()
        .from(comments)
        .where(eq(comments.reelId, reelId))
        .orderBy(desc(comments.createdAt));
    } else {
      list = await db
        .select()
        .from(comments)
        .orderBy(desc(comments.createdAt))
        .limit(50);
    }

    return NextResponse.json({ comments: list });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // optional: keep import used / future auth
    await getCurrentUser().catch(() => null);

    const body = await req.json();
    const postId = toIntId(body.postId);
    const reelId = toIntId(body.reelId);
    const { authorName, authorAvatar, content } = body;

    if ((postId === null && reelId === null) || !authorName || !content) {
      return NextResponse.json(
        {
          error: "Post/Reel ID, name, and comment text are required",
        },
        { status: 400 }
      );
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        postId: postId,
        reelId: reelId,
        authorName: String(authorName).trim(),
        authorAvatar:
          authorAvatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        content: String(content).trim(),
        isApproved: true,
      })
      .returning();

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}