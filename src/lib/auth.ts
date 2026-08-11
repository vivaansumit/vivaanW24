import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "portfolio_session";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(String(password), String(hash).trim());
  } catch (e) {
    console.error("[verifyPassword]", e);
    return false;
  }
}

export async function setAuthCookie(user: {
  id: number | string;
  email?: string | null;
  handle?: string | null;
  name?: string | null;
}) {
  const jar = await cookies();
  const value = JSON.stringify({
    id: user.id,
    email: user.email || "",
    handle: user.handle || "",
    name: user.name || "",
  });

  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{
  id: number | string;
  email?: string;
  handle?: string;
  name?: string;
} | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;

  try {
    const idNum =
      typeof session.id === "string" ? parseInt(session.id, 10) : Number(session.id);
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, idNum as number))
      .limit(1);
    if (!rows.length) return null;
    const user = rows[0] as any;
    const {
      passwordHash,
      password_hash,
      privacyPassword,
      privacy_password,
      ...safe
    } = user;
    return safe;
  } catch (e) {
    console.error("[getCurrentUser]", e);
    return session as any;
  }
}

export async function getUser() {
  return getCurrentUser();
}

export async function requireAuth() {
  return getCurrentUser();
}

export async function isLoggedIn() {
  const s = await getSession();
  return !!s?.id;
}