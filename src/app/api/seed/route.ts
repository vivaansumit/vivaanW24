import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function POST() {
  try {
    const user = await seedDatabase();
    return NextResponse.json({ success: true, message: "Database seeded successfully", user });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await seedDatabase();
    return NextResponse.json({ success: true, message: "Database ready", user });
  } catch (error) {
    console.error("Seed check error:", error);
    return NextResponse.json({ success: false, error: "Failed to check database" }, { status: 500 });
  }
}
