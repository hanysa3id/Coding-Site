import Image from "next/image";
import { ComboSection } from "../ui/section";
import type { PortfolioProject } from "@/types/database";
import type { LandingLogoItem } from "@/lib/validators/settings";

export function ComboLogoCloud({
  locale,
  projects = [],
  logos = [],
}: {
  locale: string;
  projects?: PortfolioProject[];
  logos?: LandingLogoItem[];
}) {
  const isAr = locale === "ar";

  const seen = new Set<string>();
  const items: { key: string; label: string; image?: string | null }[] = [];
  for (const entry of logos) {
    const t = entry.name.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    items.push({ key: `admin-${t}`, label: t, image: entry.image_url });
  }
  for (const p of projects) {
    const label = (p.client_name ?? (isAr ? p.title_ar : p.title_en) ?? "").trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    items.push({ key: p.id, label });
  }
  const FILLER = ["Northwind", "Helios", "Vertex", "Lumen", "Atlas", "Quanta", "Orbit", "Polaris", "Stratus", "Forge"];
  for (const n of FILLER) {
    if (items.length >= 10) break;
    if (seen.has(n.toLowerCase())) continue;
    items.push({ key: `filler-${n}`, label: n });
  }
  const doubled = [...items, ...items];

  return (
    <ComboSection size="sm" id="logo_cloud">
      <p className="combo-eyebrow text-center mb-8">
        {isAr ? "موثوقون من فرق هندسية حول العالم" : "Trusted by engineering teams worldwide"}
      </p>
      <div className="combo-marquee-mask combo-marquee-pause overflow-hidden">
        <div className="combo-marquee gap-10 md:gap-14 items-center">
          {doubled.map((it, i) => (
            <div
              key={`${it.key}-${i}`}
              className="combo-logo-chip flex items-center gap-3 whitespace-nowrap min-w-[8rem]"
              title={it.label}
            >
              {it.image ? (
                <span className="relative grid place-items-center h-10 w-10 rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden">
                  <Image src={it.image} alt={it.label} fill sizes="40px" className="object-contain p-1" />
                </span>
              ) : (
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-white/[0.04] border border-white/10 text-white/85 font-semibold text-sm">
                  {it.label.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="text-base md:text-lg font-semibold text-white/85">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ComboSection>
  );
}
