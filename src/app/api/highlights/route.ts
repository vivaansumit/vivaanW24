import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { storyHighlights } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const highlights = await db
      .select()
      .from(storyHighlights)
      .where(eq(storyHighlights.userId, user.id))
      .orderBy(asc(storyHighlights.displayOrder));

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Get story highlights error:", error);
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, coverUrl, items } = body;

    if (!title || !coverUrl) {
      return NextResponse.json({ error: "Title and Cover URL are required" }, { status: 400 });
    }

    const existing = await db.select().from(storyHighlights).where(eq(storyHighlights.userId, user.id));

    const [newHighlight] = await db
      .insert(storyHighlights)
      .values({
        userId: user.id,
        title,
        coverUrl,
        items: items || [],
        displayOrder: existing.length + 1,
      })
      .returning();

    return NextResponse.json({ success: true, highlight: newHighlight });
  } catch (error) {
    console.error("Create story highlight error:", error);
    return NextResponse.json({ error: "Failed to create highlight" }, { status: 500 });
  }
}
