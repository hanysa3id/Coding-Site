import { cn } from "@/lib/utils";

type Tone = "light" | "dark" | "grad";

/**
 * Marquee text strip — used as a between-section design device.
 * Example: <PrismMarqueeStrip items={["DESIGN", "CODE", "MARKETING"]} tone="grad" />
 */
export function PrismMarqueeStrip({
  items,
  tone = "light",
  tilt = true,
  separator,
  className,
}: {
  items: string[];
  tone?: Tone;
  tilt?: boolean;
  separator?: React.ReactNode;
  className?: string;
}) {
  const sep = separator ?? <span aria-hidden>✦</span>;
  // Duplicate content so the loop is seamless
  const content = [...items, ...items];
  return (
    <div
      className={cn(
        "prism-marquee-strip py-4 md:py-5",
        tone === "dark" && "is-dark",
        tone === "grad" && "is-grad",
        tilt && "prism-marquee-tilt",
        className
      )}
      aria-hidden
    >
      <div className="prism-marquee-row">
        {content.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-5 md:gap-8 px-5 md:px-8 prism-display tracking-tight text-2xl md:text-4xl whitespace-nowrap"
          >
            {t}
            <span className="opacity-50">{sep}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
