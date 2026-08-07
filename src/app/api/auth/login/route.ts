import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

export async function POST(req: Request) {
  try {
    // Ensure seed database exists
    await seedDatabase();

    const body = await req.json();
    const emailInput = body.email || body.emailOrHandle || "";
    const passwordInput = body.password || "";
    const { isDemo, demoHandle } = body;

    let targetUser;

    if (isDemo) {
      const handleToFetch = demoHandle || "vivaan";
      const found = await db.select().from(users).where(eq(users.handle, handleToFetch)).limit(1);
      if (found.length > 0) {
        targetUser = found[0];
      } else {
        const allUsers = await db.select().from(users).limit(1);
        targetUser = allUsers[0];
      }
    } else {
      if (!emailInput || !passwordInput) {
        return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
      }

      const inputClean = emailInput.toLowerCase().trim();

      const found = await db
        .select()
        .from(users)
        .where(or(eq(users.email, inputClean), eq(users.handle, inputClean)))
        .limit(1);

      if (found.length === 0) {
        console.warn(`[Login Failed] User not found for email/handle: ${inputClean}`);
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const user = found[0];

      // Verify password strictly against bcrypt hash
      const isPasswordValid = verifyPassword(passwordInput, user.passwordHash);

      if (!isPasswordValid) {
        console.warn(`[Login Failed] Incorrect password for user: ${user.email}`);
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      targetUser = user;
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    await setAuthCookie({
      id: targetUser.id,
      email: targetUser.email,
      handle: targetUser.handle,
      name: targetUser.name,
    });

    console.log(`[Login Success] Authenticated admin user: ${targetUser.email}`);

    const { passwordHash, privacyPassword, ...safeUser } = targetUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
