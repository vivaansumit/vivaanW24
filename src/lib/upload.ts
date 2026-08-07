import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { randomUUID } from "crypto";

export { isSupabaseConfigured };

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
  fileName: string;
  fileSize: string;
  fileType: "image" | "video" | "document";
}

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param fileBuffer - The file contents as Buffer
 * @param originalName - Original filename (used for extension + detection)
 * @param mimeType - MIME type of the file
 * @param folder - Subfolder inside the bucket (e.g. "avatars", "posts", "reels")
 * @returns Upload result with public URL
 */
export async function uploadToSupabase(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = "general"
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  // Derive file type
  const fileType = mimeType.startsWith("video")
    ? "video"
    : mimeType.startsWith("image")
    ? "image"
    : "document";

  // Build unique path: folder/uuid.ext
  const ext = getExtension(originalName, mimeType);
  const uniqueName = `${randomUUID()}${ext}`;
  const path = `${folder}/${uniqueName}`;

  // Upload
  const adminClient = supabaseAdmin();
  const { error, data } = await adminClient.storage
    .from(BUCKET)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[Supabase Upload] Error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  // Format file size
  const fileSize = formatFileSize(fileBuffer.length);

  return {
    url: publicUrl,
    path,
    bucket: BUCKET,
    fileName: originalName,
    fileSize,
    fileType,
  };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromSupabase(path: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("[Supabase Delete] Error:", error);
    return false;
  }
  return true;
}

/**
 * Ensure the storage bucket exists (idempotent).
 * Call once during deployment setup.
 */
export async function ensureBucketExists(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Check if bucket exists
  const adminClient = supabaseAdmin();
  const { data: buckets } = await adminClient.storage.listBuckets();
  const exists = buckets?.some((b: { name: string }) => b.name === BUCKET);

  if (!exists) {
    console.log(`[Supabase] Creating storage bucket: ${BUCKET}`);
    const { error } = await adminClient.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ],
    });

    if (error) {
      console.error("[Supabase] Bucket creation error:", error);
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
}

function getExtension(filename: string, mimeType: string): string {
  // Try from filename
  const parts = filename.split(".");
  if (parts.length > 1) {
    return `.${parts.pop()?.toLowerCase()}`;
  }
  // Fallback to MIME
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  return map[mimeType] || ".bin";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
