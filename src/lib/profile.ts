import { db } from "@/db";
import { users, posts, reels, portfolio, socialLinks, storyHighlights } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export interface PublicProfileData {
  creator: any;
  posts: any[];
  reels: any[];
  portfolio: any[];
  socialLinks: any[];
  highlights: any[];
  stats: {
    postsCount: number;
    reelsCount: number;
    portfolioCount: number;
    totalLikes: number;
    viewsCount: number;
  };
}

/**
 * Loads a creator's PUBLIC profile straight from the database.
 *
 * This runs on the server so the page can render real HTML immediately.
 * It never throws: on any failure it returns `null` and the page shows a
 * friendly empty state instead of crashing.
 *
 * Only PUBLISHED content is returned. Private fields are stripped.
 */
export async function getPublicProfile(handle: string): Promise<PublicProfileData | null> {
  try {
    // Make sure the default Vivaan profile exists on a cold database.
    await seedDatabase();

    const cleanHandle = (handle || "").toLowerCase().trim();

    let userList = await db.select().from(users).where(eq(users.handle, cleanHandle)).limit(1);

    // Fall back to the primary Vivaan profile so visitors never hit a dead end.
    if (userList.length === 0) {
      userList = await db.select().from(users).where(eq(users.handle, "vivaan")).limit(1);
    }

    if (userList.length === 0) return null;

    const creator = userList[0];

    // Strip everything private before it can ever reach the browser.
    const {
      passwordHash: _passwordHash,
      privacyPassword: _privacyPassword,
      ...safeCreator
    } = creator;

    // Respect the "hide my phone number" switch from the CMS.
    if (!safeCreator.phoneVisibility) {
      safeCreator.phone = null;
    }

    const [userPosts, userReels, userPortfolio, userLinks, userHighlights] = await Promise.all([
      db
        .select()
        .from(posts)
        .where(and(eq(posts.userId, creator.id), eq(posts.privacy, "public")))
        .orderBy(desc(posts.isPinned), desc(posts.createdAt)),
      db
        .select()
        .from(reels)
        .where(and(eq(reels.userId, creator.id), eq(reels.privacy, "public")))
        .orderBy(desc(reels.isPinned), desc(reels.createdAt)),
      db
        .select()
        .from(portfolio)
        .where(and(eq(portfolio.userId, creator.id), eq(portfolio.privacy, "public")))
        .orderBy(desc(portfolio.isFeatured), desc(portfolio.createdAt)),
      db
        .select()
        .from(socialLinks)
        .where(and(eq(socialLinks.userId, creator.id), eq(socialLinks.isEnabled, true)))
        .orderBy(asc(socialLinks.displayOrder)),
      db
        .select()
        .from(storyHighlights)
        .where(eq(storyHighlights.userId, creator.id))
        .orderBy(asc(storyHighlights.displayOrder)),
    ]);

    // Count the visit (never let an analytics write break the page).
    try {
      await db
        .update(users)
        .set({ viewsCount: sql`${users.viewsCount} + 1` })
        .where(eq(users.id, creator.id));
    } catch (viewError) {
      console.error("[PublicProfile] view counter skipped:", viewError);
    }

    const totalLikes =
      userPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0) +
      userReels.reduce((acc, r) => acc + (r.likesCount || 0), 0);

    return {
      creator: safeCreator,
      posts: userPosts ?? [],
      reels: userReels ?? [],
      portfolio: userPortfolio ?? [],
      socialLinks: userLinks ?? [],
      highlights: userHighlights ?? [],
      stats: {
        postsCount: userPosts.length,
        reelsCount: userReels.length,
        portfolioCount: userPortfolio.length,
        totalLikes,
        viewsCount: (safeCreator.viewsCount || 0) + 1,
      },
    };
  } catch (error) {
    console.error("[PublicProfile] Failed to load profile:", error);
    return null;
  }
}
