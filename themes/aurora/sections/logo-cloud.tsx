import { Section } from "../ui/section";
import { Mono } from "../ui/typography";

// "Trusted by" band — single-line marquee of monochrome client names. Names
// can be wired to real data later via a settings entry; for now uses static
// stand-ins so the section looks complete out of the box.
const DEFAULT_NAMES = [
  "Northwind",
  "Acme Labs",
  "Helios",
  "Vertex",
  "Lumen",
  "Atlas",
  "Quanta",
  "Orbit",
  "Stratus",
  "Polaris",
];

export function AuroraLogoCloud({
  locale,
  names,
}: {
  locale: string;
  /** Admin-curated names override the defaults when non-empty. */
  names?: string[];
}) {
  const isAr = locale === "ar";
  const resolved = names && names.length > 0 ? names : DEFAULT_NAMES;
  // Duplicate the list so the marquee loops seamlessly.
  const doubled = [...resolved, ...resolved];

  return (
    <Section size="sm" bordered band>
      <div className="text-center">
        <Mono>{isAr ? "موثوق من فرق محترفة" : "Trusted by ambitious teams"}</Mono>
      </div>
      <div className="aurora-marquee-mask mt-6 overflow-hidden">
        <div className="aurora-marquee gap-12 items-center">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="aurora-mono text-base md:text-lg text-white/45 hover:text-white/80 transition-colors whitespace-nowrap select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
