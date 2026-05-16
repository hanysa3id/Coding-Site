import { MoonSection } from "../ui/section";
import type { PortfolioProject } from "@/types/database";

export function MoonLogoCloud({
  locale,
  projects = [],
  logos = [],
}: {
  locale: string;
  projects?: PortfolioProject[];
  logos?: string[];
}) {
  const isAr = locale === "ar";

  // Priority: admin → portfolio client_names → fillers
  const seen = new Set<string>();
  const items: { key: string; label: string }[] = [];
  for (const name of logos) {
    const t = name.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    items.push({ key: `admin-${t}`, label: t });
  }
  for (const p of projects) {
    const label = (p.client_name ?? (isAr ? p.title_ar : p.title_en) ?? "").trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    items.push({ key: p.id, label });
  }
  const FILLER = ["Northwind", "Acme", "Helios", "Vertex", "Lumen", "Atlas", "Quanta", "Orbit", "Polaris", "Stratus"];
  for (const n of FILLER) {
    if (items.length >= 10) break;
    if (seen.has(n.toLowerCase())) continue;
    items.push({ key: `filler-${n}`, label: n });
  }

  const doubled = [...items, ...items];

  return (
    <MoonSection size="sm">
      <p className="text-center text-sm md:text-base text-white/55 mb-8 moon-mono uppercase tracking-wider">
        {isAr ? "موثوق من فرق نُفّذت مشاريعها معنا" : "Trusted by teams whose products we ship"}
      </p>
      <div className="moon-marquee-mask moon-marquee-pause overflow-hidden">
        <div className="moon-marquee gap-10 md:gap-14 items-center">
          {doubled.map((it, i) => (
            <div
              key={`${it.key}-${i}`}
              className="moon-logo-chip flex items-center gap-3 whitespace-nowrap min-w-[8rem]"
            >
              <span className="grid place-items-center h-10 w-10 rounded-lg bg-white/[0.04] border border-white/10 text-white/85 font-semibold text-sm">
                {it.label.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-base md:text-lg font-semibold text-white/85">
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MoonSection>
  );
}
