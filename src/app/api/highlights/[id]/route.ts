import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { storyHighlights } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function toIntId(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await params;
  const id = toIntId(resolved.id);
  const userId = toIntId((user as { id?: unknown }).id);

  if (id === null || userId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, coverUrl, items, displayOrder } = body;

    const [updated] = await db
      .update(storyHighlights)
      .set({
        ...(title !== undefined && { title }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(items !== undefined && { items }),
        ...(displayOrder !== undefined && {
          displayOrder: toIntId(displayOrder) ?? 0,
        }),
      })
      .where(
        and(eq(storyHighlights.id, id), eq(storyHighlights.userId, userId))
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, highlight: updated });
  } catch (error) {
    console.error("Update highlight error:", error);
    return NextResponse.json(
      { error: "Failed to update highlight" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await params;
  const id = toIntId(resolved.id);
  const userId = toIntId((user as { id?: unknown }).id);

  if (id === null || userId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(storyHighlights)
      .where(
        and(eq(storyHighlights.id, id), eq(storyHighlights.userId, userId))
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Highlight deleted",
    });
  } catch (error) {
    console.error("Delete highlight error:", error);
    return NextResponse.json(
      { error: "Failed to delete highlight" },
      { status: 500 }
    );
  }
}