import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      title,
      pageTitle,
      bio,
      email,
      phone,
      phoneVisibility,
      avatarUrl,
      coverUrl,
      location,
      isHireable,
      isVerified,
      websiteUrl,
      themeConfig,
      publishStatus,
      privacyPassword,
    } = body;

    // Load the current record so we can detect whether the photos actually changed.
    // Syncing only when the photo URL actually changes preserves any custom hero
    // image the admin may have set via /admin/homepage.
    const currentRows = await db
      .select({ avatarUrl: users.avatarUrl, coverUrl: users.coverUrl, homepageConfig: users.homepageConfig })
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);
    const current = currentRows[0];

    const avatarChanged = avatarUrl !== undefined && current && avatarUrl !== current.avatarUrl;
    const coverChanged = coverUrl !== undefined && current && coverUrl !== current.coverUrl;

    let homepageConfig: any = current?.homepageConfig || {};
    if (avatarChanged) homepageConfig = { ...homepageConfig, heroPhotoUrl: avatarUrl };
    if (coverChanged) homepageConfig = { ...homepageConfig, heroCoverUrl: coverUrl };

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(pageTitle !== undefined && { pageTitle }),
        ...(bio !== undefined && { bio }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(phoneVisibility !== undefined && { phoneVisibility }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(location !== undefined && { location }),
        ...(isHireable !== undefined && { isHireable }),
        ...(isVerified !== undefined && { isVerified }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(themeConfig !== undefined && { themeConfig }),
        ...(publishStatus !== undefined && { publishStatus }),
        ...(privacyPassword !== undefined && { privacyPassword }),
        ...((avatarChanged || coverChanged) && { homepageConfig }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning();

    const { passwordHash: _, privacyPassword: __, ...safeUser } = updatedUser;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
