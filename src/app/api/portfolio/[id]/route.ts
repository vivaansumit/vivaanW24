import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      title,
      summary,
      content,
      category,
      clientName,
      completionDate,
      liveUrl,
      githubUrl,
      thumbnailUrl,
      galleryUrls,
      tags,
      isFeatured,
      privacy,
    } = body;

    const slug = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      : undefined;

    const [updated] = await db
      .update(portfolio)
      .set({
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(clientName !== undefined && { clientName }),
        ...(completionDate !== undefined && { completionDate }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(galleryUrls !== undefined && { galleryUrls }),
        ...(tags !== undefined && { tags }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(privacy !== undefined && { privacy }),
        updatedAt: new Date(),
      })
      .where(and(eq(portfolio.id, id), eq(portfolio.userId, user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update portfolio error:", error);
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
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
      .delete(portfolio)
      .where(and(eq(portfolio.id, id), eq(portfolio.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Portfolio item deleted" });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
  }
}
