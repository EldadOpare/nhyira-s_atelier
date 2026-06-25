import { supabase } from "./supabase";

const BUCKET = "portfolio";

// Sent one image to the portfolio storage bucket and handed back its public
// URL. The admin had to be signed in because the bucket only allowed uploads
// from a logged-in user.
export async function uploadPortfolioImage(file: File): Promise<string> {
  // Gave each file a random name so two uploads never clashed.
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
