import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.userId, user.id))
      .orderBy(desc(inquiries.createdAt));

    return NextResponse.json({ inquiries: list });
  } catch (error) {
    console.error("Get inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { handle, senderName, senderEmail, subject, message, budget } = body;

    if (!handle || !senderName || !senderEmail || !subject || !message) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const targetUsers = await db.select().from(users).where(eq(users.handle, handle.toLowerCase())).limit(1);
    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    const creator = targetUsers[0];

    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        userId: creator.id,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        budget: budget || "Not specified",
        status: "new",
      })
      .returning();

    return NextResponse.json({ success: true, inquiry: newInquiry, message: "Inquiry sent successfully!" });
  } catch (error) {
    console.error("Post inquiry error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
