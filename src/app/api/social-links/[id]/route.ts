import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { platform, title, url, icon, color, displayOrder, isEnabled } = body;

    const [updated] = await db
      .update(socialLinks)
      .set({
        ...(platform !== undefined && { platform }),
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isEnabled !== undefined && { isEnabled }),
      })
      .where(and(eq(socialLinks.id, id), eq(socialLinks.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Link not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, link: updated });
  } catch (error) {
    console.error("Update social link error:", error);
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
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
      .delete(socialLinks)
      .where(and(eq(socialLinks.id, id), eq(socialLinks.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Link not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Link deleted" });
  } catch (error) {
    console.error("Delete social link error:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
