import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
  xl: "py-28 md:py-36",
};

export function HanySection({
  size = "md",
  className,
  id,
  children,
}: {
  size?: SectionSize;
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("relative", sizeClass[size], className)}>
      <div className="container relative">{children}</div>
    </section>
  );
}

export function HanySectionHeading({
  kicker,
  title,
  description,
  align = "center",
}: {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4 hany-reveal",
        align === "center" && "mx-auto text-center"
      )}
    >
      {kicker && <span className="hany-eyebrow">{kicker}</span>}
      <h2 className="hany-display text-3xl md:text-5xl">{title}</h2>
      {description && (
        <p className="text-base md:text-lg text-[color:var(--hany-fg-muted)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
