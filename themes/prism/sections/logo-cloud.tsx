import Image from "next/image";
import { PrismSection } from "../ui/section";
import type { PortfolioProject } from "@/types/database";
import type { LandingSettings } from "@/lib/validators/settings";

type LogoEntry = { name: string; url?: string };

export function PrismLogoCloud({
  locale,
  projects,
  logos,
}: {
  locale: string;
  projects: PortfolioProject[];
  logos: NonNullable<LandingSettings["logos"]>;
}) {
  const isAr = locale === "ar";
  // Build entries: admin logos → project client names → generic fallbacks
  const adminLogos: LogoEntry[] = (logos ?? []).map((name) => ({ name }));
  const clientNames: LogoEntry[] = projects
    .filter((p) => p.client_name)
    .slice(0, 8)
    .map((p) => ({ name: p.client_name! }));
  const fillers: LogoEntry[] = [
    { name: "Northwind" },
    { name: "Aerolux" },
    { name: "Verdant" },
    { name: "Helix" },
    { name: "Lumina" },
    { name: "Quanta" },
    { name: "Orbit" },
    { name: "Forge" },
  ];
  const all = [...adminLogos, ...clientNames, ...fillers].slice(0, 12);
  const doubled = [...all, ...all];

  return (
    <PrismSection size="md">
      <p className="prism-eyebrow text-center mb-6">
        {isAr ? "موثوقون من" : "Trusted by"}
      </p>
      <div className="relative overflow-hidden mask-fade">
        <div className="prism-marquee-row gap-12 md:gap-16 items-center">
          {doubled.map((l, i) => (
            <div key={i} className="shrink-0 flex items-center gap-3 group">
              {l.url ? (
                <div className="relative h-8 w-28 grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition">
                  <Image src={l.url} alt={l.name} fill className="object-contain" />
                </div>
              ) : (
                <span className="prism-display text-2xl md:text-3xl text-white/40 group-hover:text-white whitespace-nowrap transition">
                  {l.name}
                </span>
              )}
            </div>
          ))}
        </div>
        <style>{`.mask-fade{-webkit-mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent);}`}</style>
      </div>
    </PrismSection>
  );
}
