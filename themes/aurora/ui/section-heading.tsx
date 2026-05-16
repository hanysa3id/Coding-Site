import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

// Consistent section header used across the Aurora theme.
// `kicker` is the small mono label, `title` is the big heading, `description`
// is the optional muted paragraph beneath it.
export function SectionHeading({
  kicker,
  title,
  description,
  align = "start",
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h2 className="aurora-display text-3xl md:text-4xl text-white">{title}</h2>
      {description && (
        <p className="text-base text-white/60 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
