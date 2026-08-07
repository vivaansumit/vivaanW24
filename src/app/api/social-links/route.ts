import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.userId, user.id))
      .orderBy(asc(socialLinks.displayOrder));

    return NextResponse.json({ links: list });
  } catch (error) {
    console.error("Get social links error:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { platform, title, url, icon, color, isEnabled } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    // Get count for order
    const existing = await db.select().from(socialLinks).where(eq(socialLinks.userId, user.id));

    const [newLink] = await db
      .insert(socialLinks)
      .values({
        userId: user.id,
        platform: platform || "custom",
        title,
        url,
        icon: icon || "globe",
        color: color || "#3b82f6",
        displayOrder: existing.length + 1,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
      })
      .returning();

    return NextResponse.json({ success: true, link: newLink });
  } catch (error) {
    console.error("Create social link error:", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
