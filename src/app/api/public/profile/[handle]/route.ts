import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, posts, reels, portfolio, socialLinks, storyHighlights } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET(req: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    await seedDatabase();
    const { handle } = await params;
    const cleanHandle = handle.toLowerCase();

    let userList = await db.select().from(users).where(eq(users.handle, cleanHandle)).limit(1);

    if (userList.length === 0) {
      // Fallback to Vivaan if handle not found
      userList = await db.select().from(users).where(eq(users.handle, "vivaan")).limit(1);
    }

    if (userList.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const creator = userList[0];
    const { passwordHash, privacyPassword, ...safeCreator } = creator;

    // Filter sensitive info based on privacy options
    if (!safeCreator.phoneVisibility) {
      safeCreator.phone = null;
    }

    // Increment profile view count asynchronously
    await db
      .update(users)
      .set({ viewsCount: sql`${users.viewsCount} + 1` })
      .where(eq(users.id, creator.id));

    // Fetch ONLY Public Published Posts
    const userPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, creator.id), eq(posts.privacy, "public")))
      .orderBy(desc(posts.isPinned), desc(posts.createdAt));

    // Fetch ONLY Public Published Reels
    const userReels = await db
      .select()
      .from(reels)
      .where(and(eq(reels.userId, creator.id), eq(reels.privacy, "public")))
      .orderBy(desc(reels.isPinned), desc(reels.createdAt));

    // Fetch ONLY Public Published Portfolio Items
    const userPortfolio = await db
      .select()
      .from(portfolio)
      .where(and(eq(portfolio.userId, creator.id), eq(portfolio.privacy, "public")))
      .orderBy(desc(portfolio.isFeatured), desc(portfolio.createdAt));

    // Fetch Active Social Bio Links
    const userLinks = await db
      .select()
      .from(socialLinks)
      .where(and(eq(socialLinks.userId, creator.id), eq(socialLinks.isEnabled, true)))
      .orderBy(asc(socialLinks.displayOrder));

    // Fetch Story Highlights
    const userHighlights = await db
      .select()
      .from(storyHighlights)
      .where(eq(storyHighlights.userId, creator.id))
      .orderBy(asc(storyHighlights.displayOrder));

    // Calculate total stats
    const totalLikes =
      userPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0) +
      userReels.reduce((acc, r) => acc + (r.likesCount || 0), 0);

    return NextResponse.json({
      creator: safeCreator,
      posts: userPosts,
      reels: userReels,
      portfolio: userPortfolio,
      socialLinks: userLinks,
      highlights: userHighlights,
      stats: {
        postsCount: userPosts.length,
        reelsCount: userReels.length,
        portfolioCount: userPortfolio.length,
        totalLikes,
        viewsCount: safeCreator.viewsCount + 1,
      },
    });
  } catch (error) {
    console.error("Public Profile GET Error:", error);
    return NextResponse.json({ error: "Failed to load creator profile" }, { status: 500 });
  }
}
