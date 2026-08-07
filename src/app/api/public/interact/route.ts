import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, reels, portfolio, socialLinks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetType, targetId } = body;

    if (!action || !targetType || !targetId) {
      return NextResponse.json({ error: "Missing required interaction params" }, { status: 400 });
    }

    if (action === "like") {
      if (targetType === "post") {
        await db
          .update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, targetId));
      } else if (targetType === "reel") {
        await db
          .update(reels)
          .set({ likesCount: sql`${reels.likesCount} + 1` })
          .where(eq(reels.id, targetId));
      }
    } else if (action === "view") {
      if (targetType === "post") {
        await db
          .update(posts)
          .set({ viewsCount: sql`${posts.viewsCount} + 1` })
          .where(eq(posts.id, targetId));
      } else if (targetType === "reel") {
        await db
          .update(reels)
          .set({ viewsCount: sql`${reels.viewsCount} + 1` })
          .where(eq(reels.id, targetId));
      } else if (targetType === "portfolio") {
        await db
          .update(portfolio)
          .set({ viewsCount: sql`${portfolio.viewsCount} + 1` })
          .where(eq(portfolio.id, targetId));
      }
    } else if (action === "click" && targetType === "socialLink") {
      await db
        .update(socialLinks)
        .set({ clicksCount: sql`${socialLinks.clicksCount} + 1` })
        .where(eq(socialLinks.id, targetId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Public interaction error:", error);
    return NextResponse.json({ error: "Failed to log interaction" }, { status: 500 });
  }
}
