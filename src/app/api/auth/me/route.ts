import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  await seedDatabase();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
