import { NextResponse } from "next/server";
import { uploadToSupabase, isSupabaseConfigured } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // If Supabase is configured, use it
    if (isSupabaseConfigured()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToSupabase(
        buffer,
        file.name,
        file.type || "application/octet-stream",
        folder
      );

      return NextResponse.json({
        success: true,
        url: result.url,
        path: result.path,
        bucket: result.bucket,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
      });
    }

    // Fallback: return base64 data URL (for local dev without Supabase)
    console.warn(
      "[Upload] Supabase not configured. Returning base64 data URL. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production."
    );

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileType: mimeType.startsWith("video") ? "video" : "image",
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
