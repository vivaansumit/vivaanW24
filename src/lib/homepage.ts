import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export interface HomepageConfig {
  logoText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroPhotoUrl: string;
  heroCoverUrl: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
  showFeatureCards: boolean;
  footerText: string;
}

// Empty strings = "use the profile avatar/cover". Never hardcode stock URLs here.
export const DEFAULT_HOMEPAGE: HomepageConfig = {
  logoText: "VIVAAN",
  heroTitle: "Creative Director & Visual Artist",
  heroSubtitle: "Crafting cinematic 3D motion, luxury brand experiences, and generative visual art.",
  heroDescription:
    "Welcome. This is the official homepage of Vivaan — a creative studio producing award-winning visual direction for global brands. Explore my portfolio for full case studies and reels.",
  heroPhotoUrl: "",
  heroCoverUrl: "",
  button1Text: "View Public Profile",
  button1Link: "/profile/vivaan",
  button2Text: "",
  button2Link: "",
  showFeatureCards: false,
  footerText: "© 2025 Vivaan. All rights reserved.",
};

// Any of these URLs (substring match on the Unsplash photo id) are treated as
// "demo placeholder" and will be auto-replaced with the user's real photos.
const KNOWN_PLACEHOLDER_IDS = [
  "photo-1534528741775-53994a69daeb", // old stock girl
  "photo-1618005182384-a83a8bd57fbe", // old abstract gold cover
];

function isPlaceholder(url: string): boolean {
  if (!url) return true;
  return KNOWN_PLACEHOLDER_IDS.some((id) => url.includes(id));
}

/**
 * Loads the homepage config straight from the database, resolving any empty
 * or known-placeholder image URLs to the user's real avatar + cover.
 *
 * Always returns a valid config object (never null).
 */
export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    await seedDatabase();

    const row = await db
      .select({
        homepageConfig: users.homepageConfig,
        avatarUrl: users.avatarUrl,
        coverUrl: users.coverUrl,
      })
      .from(users)
      .where(eq(users.handle, "vivaan"))
      .limit(1);

    const merged: HomepageConfig =
      row.length === 0 || !row[0].homepageConfig
        ? { ...DEFAULT_HOMEPAGE }
        : { ...DEFAULT_HOMEPAGE, ...(row[0].homepageConfig as Partial<HomepageConfig>) };

    const realAvatar = row[0]?.avatarUrl || "";
    const realCover = row[0]?.coverUrl || "";

    // Resolve placeholders to the user's real profile photos.
    return {
      ...merged,
      heroPhotoUrl: isPlaceholder(merged.heroPhotoUrl) ? realAvatar : merged.heroPhotoUrl,
      heroCoverUrl: isPlaceholder(merged.heroCoverUrl) ? realCover : merged.heroCoverUrl,
    };
  } catch (error) {
    console.error("[getHomepageConfig] Error:", error);
    return { ...DEFAULT_HOMEPAGE };
  }
}
