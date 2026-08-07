import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "creatorloom_session";

export interface UserSession {
  userId: string;
  email: string;
  handle: string;
  name: string;
}

// Encode simple token: userId:email:timestamp signed or encoded
export function createSessionData(user: { id: string; email: string; handle: string; name: string }): string {
  const data = JSON.stringify({
    userId: user.id,
    email: user.email,
    handle: user.handle,
    name: user.name,
    createdAt: Date.now()
  });
  return Buffer.from(data).toString("base64");
}

export function parseSessionData(token: string): UserSession | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.userId) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        handle: parsed.handle,
        name: parsed.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = parseSessionData(token);
  if (!session) return null;

  try {
    const userList = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (userList.length === 0) return null;
    const user = userList[0];
    const { passwordHash, privacyPassword, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export async function setAuthCookie(user: { id: string; email: string; handle: string; name: string }) {
  const cookieStore = await cookies();
  const token = createSessionData(user);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
