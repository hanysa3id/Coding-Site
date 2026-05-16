import "server-only";
import { createClient } from "@/lib/supabase/server";

export type UploadResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string };

export async function uploadToBucket(
  bucket: string,
  file: File,
  pathPrefix: string = ""
): Promise<UploadResult> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${pathPrefix}${pathPrefix.endsWith("/") || !pathPrefix ? "" : "/"}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return { success: false, error: error.message };

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { success: true, url: pub.publicUrl, path: data.path };
}

export async function deleteFromBucket(bucket: string, path: string) {
  const supabase = await createClient();
  return supabase.storage.from(bucket).remove([path]);
}
