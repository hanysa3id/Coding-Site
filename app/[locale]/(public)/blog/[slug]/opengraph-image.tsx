import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title_ar, title_en, excerpt_ar, excerpt_en, cover_image, published_at")
    .eq("slug", slug)
    .single();

  const title = post ? (isAr ? post.title_ar : post.title_en) : slug;
  const excerpt = post ? (isAr ? post.excerpt_ar : post.excerpt_en) ?? "" : "";
  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a2e1a 0%, #0f172a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {post?.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.18,
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
          {date && (
            <div style={{ fontSize: "20px", color: "#86efac" }}>{date}</div>
          )}
          <div
            style={{
              fontSize: "62px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              maxWidth: "950px",
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div style={{ fontSize: "26px", color: "#94a3b8", maxWidth: "850px", lineHeight: 1.4 }}>
              {excerpt.slice(0, 130)}{excerpt.length > 130 ? "…" : ""}
            </div>
          )}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "#16a34a",
                color: "white",
                padding: "6px 18px",
                borderRadius: "999px",
                fontSize: "18px",
              }}
            >
              {isAr ? "مقالة" : "Blog"}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
