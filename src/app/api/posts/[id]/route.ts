import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, caption, type, mediaUrls, hashtags, isPinned, privacy, commentsEnabled } = body;

    const [updated] = await db
      .update(posts)
      .set({
        ...(title !== undefined && { title }),
        ...(caption !== undefined && { caption }),
        ...(type !== undefined && { type }),
        ...(mediaUrls !== undefined && { mediaUrls }),
        ...(hashtags !== undefined && { hashtags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(privacy !== undefined && { privacy }),
        ...(commentsEnabled !== undefined && { commentsEnabled }),
        updatedAt: new Date(),
      })
      .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
