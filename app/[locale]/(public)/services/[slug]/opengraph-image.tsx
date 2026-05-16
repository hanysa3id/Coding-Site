import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ServiceOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("name_ar, name_en, short_description_ar, short_description_en, cover_image, estimated_price_min, estimated_price_max, currency")
    .eq("slug", slug)
    .single();

  const name = service ? (isAr ? service.name_ar : service.name_en) : slug;
  const desc = service
    ? (isAr ? service.short_description_ar : service.short_description_en) ?? ""
    : "";

  const priceRange =
    service?.estimated_price_min && service?.estimated_price_max
      ? `${service.estimated_price_min.toLocaleString()} – ${service.estimated_price_max.toLocaleString()} ${service.currency}`
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {service?.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.cover_image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.15,
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "18px",
              width: "fit-content",
            }}
          >
            {isAr ? "خدمة" : "Service"}
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {name}
          </div>
          {desc && (
            <div style={{ fontSize: "26px", color: "#94a3b8", maxWidth: "850px", lineHeight: 1.4 }}>
              {desc.slice(0, 120)}{desc.length > 120 ? "…" : ""}
            </div>
          )}
          {priceRange && (
            <div style={{ fontSize: "28px", color: "#4ade80", marginTop: "auto" }}>
              {isAr ? "السعر: " : "Price: "}{priceRange}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
