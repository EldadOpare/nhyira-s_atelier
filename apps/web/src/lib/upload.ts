import { supabase } from "./supabase";

const BUCKET = "portfolio";

/**
 * Uploads an image file to the Supabase Storage `portfolio` bucket and
 * returns its public URL. The admin must be signed in (an authenticated
 * Supabase session is required by the bucket's insert policy).
 */
export async function uploadPortfolioImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
