import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.userId, user.id))
      .orderBy(desc(portfolio.isFeatured), desc(portfolio.createdAt));

    return NextResponse.json({ portfolio: list });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    if (!title || !category) {
      return NextResponse.json({ error: "Title and Category are required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const [newItem] = await db
      .insert(portfolio)
      .values({
        userId: user.id,
        title,
        slug: slug || "project-" + Date.now(),
        summary: summary || "",
        content: content || "",
        category,
        clientName: clientName || "",
        completionDate: completionDate || "",
        liveUrl: liveUrl || "",
        githubUrl: githubUrl || "",
        thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        galleryUrls: galleryUrls || [],
        tags: tags || [],
        isFeatured: isFeatured || false,
        privacy: privacy || "public",
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Create portfolio item error:", error);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
