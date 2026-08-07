import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { videoUrl, thumbnailUrl, title, caption, soundTrack, duration, isPinned, privacy } = body;

    const [updated] = await db
      .update(reels)
      .set({
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(title !== undefined && { title }),
        ...(caption !== undefined && { caption }),
        ...(soundTrack !== undefined && { soundTrack }),
        ...(duration !== undefined && { duration }),
        ...(isPinned !== undefined && { isPinned }),
        ...(privacy !== undefined && { privacy }),
        updatedAt: new Date(),
      })
      .where(and(eq(reels.id, id), eq(reels.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Reel not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, reel: updated });
  } catch (error) {
    console.error("Update reel error:", error);
    return NextResponse.json({ error: "Failed to update reel" }, { status: 500 });
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
      .delete(reels)
      .where(and(eq(reels.id, id), eq(reels.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Reel not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Reel deleted" });
  } catch (error) {
    console.error("Delete reel error:", error);
    return NextResponse.json({ error: "Failed to delete reel" }, { status: 500 });
  }
}
