import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PortfolioOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("portfolio_projects")
    .select("title_ar, title_en, description_ar, description_en, cover_image, technologies, delivery_date")
    .eq("slug", slug)
    .single();

  const title = project ? (isAr ? project.title_ar : project.title_en) : slug;
  const desc = project
    ? (isAr ? project.description_ar : project.description_en) ?? ""
    : "";
  const techs: string[] = project?.technologies ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {project?.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
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
              background: "#7c3aed",
              color: "white",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "18px",
              width: "fit-content",
            }}
          >
            {isAr ? "مشروع" : "Portfolio"}
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
            {title}
          </div>
          {desc && (
            <div style={{ fontSize: "26px", color: "#94a3b8", maxWidth: "850px", lineHeight: 1.4 }}>
              {desc.slice(0, 120)}{desc.length > 120 ? "…" : ""}
            </div>
          )}
          {techs.length > 0 && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "auto" }}>
              {techs.slice(0, 5).map((t: string) => (
                <div
                  key={t}
                  style={{
                    background: "rgba(124,58,237,0.4)",
                    color: "#c4b5fd",
                    padding: "6px 16px",
                    borderRadius: "999px",
                    fontSize: "20px",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
