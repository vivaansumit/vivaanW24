import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Public read — the homepage config is safe to expose (no secrets).
  try {
    const userList = await db
      .select({ homepageConfig: users.homepageConfig })
      .from(users)
      .where(eq(users.handle, "vivaan"))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ homepageConfig: null });
    }
    return NextResponse.json({ homepageConfig: userList[0].homepageConfig });
  } catch (error) {
    console.error("[Homepage GET] Error:", error);
    return NextResponse.json({ homepageConfig: null });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const incoming = body.homepageConfig || body;

    // Load the existing config so missing keys fall back to what's already saved.
    const current = await db
      .select({ homepageConfig: users.homepageConfig })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const existing = (current[0]?.homepageConfig || {}) as any;

    const merged = {
      logoText: typeof incoming.logoText === "string" ? incoming.logoText : existing.logoText || "VIVAAN",
      heroTitle: typeof incoming.heroTitle === "string" ? incoming.heroTitle : existing.heroTitle || "",
      heroSubtitle: typeof incoming.heroSubtitle === "string" ? incoming.heroSubtitle : existing.heroSubtitle || "",
      heroDescription: typeof incoming.heroDescription === "string" ? incoming.heroDescription : existing.heroDescription || "",
      heroPhotoUrl: typeof incoming.heroPhotoUrl === "string" ? incoming.heroPhotoUrl : existing.heroPhotoUrl || "",
      heroCoverUrl: typeof incoming.heroCoverUrl === "string" ? incoming.heroCoverUrl : existing.heroCoverUrl || "",
      button1Text: typeof incoming.button1Text === "string" ? incoming.button1Text : existing.button1Text || "",
      button1Link: typeof incoming.button1Link === "string" ? incoming.button1Link : existing.button1Link || "",
      button2Text: typeof incoming.button2Text === "string" ? incoming.button2Text : existing.button2Text || "",
      button2Link: typeof incoming.button2Link === "string" ? incoming.button2Link : existing.button2Link || "",
      showFeatureCards: typeof incoming.showFeatureCards === "boolean" ? incoming.showFeatureCards : existing.showFeatureCards ?? false,
      footerText: typeof incoming.footerText === "string" ? incoming.footerText : existing.footerText || "",
    };

    await db
      .update(users)
      .set({ homepageConfig: merged, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, homepageConfig: merged });
  } catch (error) {
    console.error("[Homepage PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save homepage" }, { status: 500 });
  }
}
