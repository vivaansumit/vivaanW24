import { db } from "@/db";
import {
  users,
  posts,
  reels,
  portfolio,
  socialLinks,
  storyHighlights,
} from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

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
 * Public profile loader — resilient.
 * If creator exists, always return profile (even if posts/reels tables fail).
 * Never throw. Never treat DB errors as "not published".
 */
export async function getPublicProfile(
  handle: string
): Promise<PublicProfileData | null> {
  try {
    const cleanHandle = (handle || "").toLowerCase().trim();
    if (!cleanHandle) return null;

    // 1) Load user only (most important)
    let userList: any[] = [];
    try {
      userList = await db
        .select()
        .from(users)
        .where(eq(users.handle, cleanHandle))
        .limit(1);
    } catch (e) {
      console.error("[PublicProfile] users query failed:", e);
      return null;
    }

    if (userList.length === 0 && cleanHandle !== "vivaan") {
      try {
        userList = await db
          .select()
          .from(users)
          .where(eq(users.handle, "vivaan"))
          .limit(1);
      } catch (e) {
        console.error("[PublicProfile] vivaan fallback failed:", e);
      }
    }

    if (userList.length === 0) {
      console.error("[PublicProfile] no user for handle:", cleanHandle);
      return null;
    }

    const creator = userList[0];

    // Soft publish: only block explicit private/draft
    const status = String(
      (creator as any).publishStatus ??
        (creator as any).publish_status ??
        "published"
    ).toLowerCase();

    if (
      status === "draft" ||
      status === "private" ||
      status === "unpublished" ||
      status === "hidden"
    ) {
      console.error("[PublicProfile] blocked status:", status);
      return null;
    }

    // Strip secrets
    const {
      passwordHash: _passwordHash,
      privacyPassword: _privacyPassword,
      ...safeCreator
    } = creator as any;

    if (safeCreator.phoneVisibility === false) {
      safeCreator.phone = null;
    }

    // 2) Content queries — each isolated (fail = empty array)
    let userPosts: any[] = [];
    let userReels: any[] = [];
    let userPortfolio: any[] = [];
    let userLinks: any[] = [];
    let userHighlights: any[] = [];

    try {
      userPosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.userId, creator.id), eq(posts.privacy, "public")))
        .orderBy(desc(posts.isPinned), desc(posts.createdAt));
    } catch (e) {
      console.error("[PublicProfile] posts skipped:", e);
      try {
        userPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.userId, creator.id));
      } catch (e2) {
        console.error("[PublicProfile] posts fallback skipped:", e2);
      }
    }

    try {
      userReels = await db
        .select()
        .from(reels)
        .where(and(eq(reels.userId, creator.id), eq(reels.privacy, "public")))
        .orderBy(desc(reels.isPinned), desc(reels.createdAt));
    } catch (e) {
      console.error("[PublicProfile] reels skipped:", e);
      try {
        userReels = await db
          .select()
          .from(reels)
          .where(eq(reels.userId, creator.id));
      } catch {
        /* empty */
      }
    }

    try {
      userPortfolio = await db
        .select()
        .from(portfolio)
        .where(
          and(eq(portfolio.userId, creator.id), eq(portfolio.privacy, "public"))
        )
        .orderBy(desc(portfolio.isFeatured), desc(portfolio.createdAt));
    } catch (e) {
      console.error("[PublicProfile] portfolio skipped:", e);
      try {
        userPortfolio = await db
          .select()
          .from(portfolio)
          .where(eq(portfolio.userId, creator.id));
      } catch {
        /* empty */
      }
    }

    try {
      userLinks = await db
        .select()
        .from(socialLinks)
        .where(
          and(
            eq(socialLinks.userId, creator.id),
            eq(socialLinks.isEnabled, true)
          )
        )
        .orderBy(asc(socialLinks.displayOrder));
    } catch (e) {
      console.error("[PublicProfile] socialLinks skipped:", e);
      try {
        userLinks = await db
          .select()
          .from(socialLinks)
          .where(eq(socialLinks.userId, creator.id));
      } catch {
        /* empty */
      }
    }

    try {
      userHighlights = await db
        .select()
        .from(storyHighlights)
        .where(eq(storyHighlights.userId, creator.id))
        .orderBy(asc(storyHighlights.displayOrder));
    } catch (e) {
      console.error("[PublicProfile] highlights skipped:", e);
    }

    // Views — optional
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