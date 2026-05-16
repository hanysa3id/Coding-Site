import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Parses a Supabase storage URL (public or already-signed) to extract bucket
 * and path. Returns null for URLs we don't recognize (external links, etc.)
 *
 * Matches both:
 *   https://x.supabase.co/storage/v1/object/public/<bucket>/<path>
 *   https://x.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
 */
const STORAGE_URL_RE =
  /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/;

export function parseStorageUrl(
  url: string
): { bucket: string; path: string } | null {
  if (!url) return null;
  const match = url.match(STORAGE_URL_RE);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

/**
 * Returns a signed URL for the given storage URL. If the URL isn't a Supabase
 * storage URL, it's returned unchanged. Signed URLs work whether the bucket
 * is public or private — strictly more flexible than `getPublicUrl`.
 */
export async function signStorageUrl(
  url: string,
  expiresIn = 24 * 3600
): Promise<string> {
  const parsed = parseStorageUrl(url);
  if (!parsed) return url;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresIn);
  if (error || !data?.signedUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[signStorageUrl] failed for", url, error);
    }
    return url;
  }
  return data.signedUrl;
}

/**
 * Batch-signs many URLs, grouping by bucket so there's one round-trip per
 * bucket instead of one per URL. Preserves input order; non-storage URLs
 * pass through unchanged.
 */
export async function signStorageUrls(
  urls: string[],
  expiresIn = 24 * 3600
): Promise<string[]> {
  if (urls.length === 0) return urls;
  const supabase = createAdminClient();

  // Group by bucket, remember which original index each path maps to.
  const buckets = new Map<string, { idx: number; path: string }[]>();
  const parsed = urls.map((url) => parseStorageUrl(url));
  parsed.forEach((p, idx) => {
    if (!p) return;
    const arr = buckets.get(p.bucket) ?? [];
    arr.push({ idx, path: p.path });
    buckets.set(p.bucket, arr);
  });

  const signedByIdx = new Map<number, string>();
  await Promise.all(
    Array.from(buckets.entries()).map(async ([bucket, items]) => {
      const paths = items.map((i) => i.path);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(paths, expiresIn);
      if (error || !data) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[signStorageUrls] bucket failed:", bucket, error);
        }
        return;
      }
      data.forEach((d, i) => {
        if (d?.signedUrl) signedByIdx.set(items[i].idx, d.signedUrl);
      });
    })
  );

  return urls.map((url, idx) => signedByIdx.get(idx) ?? url);
}
