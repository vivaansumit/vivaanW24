import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.userId, user.id))
      .orderBy(desc(mediaAssets.createdAt));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Get media assets error:", error);
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fileName, fileUrl, fileType, fileSize, tags } = body;

    if (!fileName || !fileUrl) {
      return NextResponse.json({ error: "File name and URL are required" }, { status: 400 });
    }

    const [newAsset] = await db
      .insert(mediaAssets)
      .values({
        userId: user.id,
        fileName,
        fileUrl,
        fileType: fileType || "image",
        fileSize: fileSize || "1.5 MB",
        tags: tags || [],
      })
      .returning();

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    console.error("Create media asset error:", error);
    return NextResponse.json({ error: "Failed to create media asset" }, { status: 500 });
  }
}
