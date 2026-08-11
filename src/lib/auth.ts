import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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

export async function getSession() {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}