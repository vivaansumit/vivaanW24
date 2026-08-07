import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, handle, title } = body;

    if (!email || !password || !name || !handle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = email.toLowerCase().trim();

    if (cleanHandle.length < 3) {
      return NextResponse.json({ error: "Handle must be at least 3 characters long" }, { status: 400 });
    }

    // Check if handle or email exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.handle, cleanHandle)))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].email === cleanEmail) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
      return NextResponse.json({ error: "Username handle is already taken" }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        passwordHash,
        handle: cleanHandle,
        name: name.trim(),
        title: title?.trim() || "Content Creator & Professional",
        bio: `Welcome to my profile! I create content and showcase my creative projects.`,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`,
        coverUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80`,
        location: "Global",
        isVerified: true,
        isHireable: true,
        themeConfig: {
          themePreset: "dark",
          primaryColor: "#6366f1",
          fontFamily: "inter",
          cardStyle: "glass",
          bgPattern: "dots",
          activeTabs: ["feed", "reels", "portfolio", "links", "about"],
        },
        publishStatus: "published",
      })
      .returning();

    await setAuthCookie({
      id: newUser.id,
      email: newUser.email,
      handle: newUser.handle,
      name: newUser.name,
    });

    const { passwordHash: _, privacyPassword: __, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
