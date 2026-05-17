import Image from "next/image";
import { SkySection } from "../ui/section";
import type { PortfolioProject } from "@/types/database";
import type { LandingLogoItem } from "@/lib/validators/settings";

// Marquee strip of client logos. Pulled from real portfolio projects when
// available. Logos rendered grayscale; on hover, they restore to full color
// AND the entire marquee animation pauses. Falls back to stylised name chips
// when no projects (or no client_name) exist.
export function LogoMarquee({
  locale,
  projects,
  logos = [],
}: {
  locale: string;
  projects: PortfolioProject[];
  logos?: LandingLogoItem[];
}) {
  const isAr = locale === "ar";

  // Priority 1: admin-curated logos from /admin/landing (with optional image).
  const seen = new Set<string>();
  const items: { key: string; label: string; image: string | null }[] = [];
  for (const entry of logos) {
    // Defensive: pre-migration data may still be plain strings instead of
    // { name, image_url? } objects.
    const name = typeof entry === "string" ? entry : entry?.name;
    const image = typeof entry === "string" ? null : entry?.image_url || null;
    const label = (name ?? "").trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    items.push({ key: `admin-${label}`, label, image });
  }

  // Priority 2: real client names from the portfolio table.
  for (const p of projects) {
    const label = (p.client_name ?? (isAr ? p.title_ar : p.title_en) ?? "").trim();
    if (!label) continue;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    items.push({ key: p.id, label, image: p.cover_image });
  }

  // Priority 3: stylized fallbacks to keep the strip dense (>= 8 items).
  const FILLER = ["Northwind", "Acme", "Helios", "Vertex", "Lumen", "Atlas", "Quanta", "Orbit", "Polaris", "Stratus"];
  for (const n of FILLER) {
    if (items.length >= 8) break;
    if (seen.has(n.toLowerCase())) continue;
    items.push({ key: `filler-${n}`, label: n, image: null });
  }

  const doubled = [...items, ...items];

  return (
    <SkySection size="sm">
      <p className="text-center text-sm md:text-base text-slate-600 mb-8">
        {isAr ? "موثوق من فرق نُفّذت مشاريعها معنا" : "Trusted by teams whose products we shipped"}
      </p>
      <div className="sky-marquee-mask sky-marquee-pause overflow-hidden">
        <div className="sky-marquee gap-10 md:gap-14 items-center">
          {doubled.map((it, i) => (
            <div
              key={`${it.key}-${i}`}
              className="sky-logo-chip flex items-center gap-3 whitespace-nowrap min-w-[8rem]"
              title={it.label}
            >
              {it.image ? (
                <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-white">
                  <Image
                    src={it.image}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold text-sm border border-slate-200">
                  {it.label.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="text-base md:text-lg font-semibold text-slate-700">
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SkySection>
  );
}
