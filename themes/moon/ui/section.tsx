import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
  xl: "py-28 md:py-36",
};

export function MoonSection({
  size = "md",
  className,
  children,
  ...rest
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("relative", sizeClass[size], className)} {...rest}>
      <div className="container relative">{children}</div>
    </section>
  );
}

export function MoonBleedSection({
  size = "md",
  className,
  children,
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative", sizeClass[size], className)}>{children}</section>
  );
}

export function MoonSectionHeading({
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
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center"
      )}
    >
      {kicker && <span className="moon-eyebrow inline-block">{kicker}</span>}
      <h2 className="moon-display text-3xl md:text-5xl">
        <span className="moon-grad-silver">{title}</span>
      </h2>
      {description && (
        <p className="text-base md:text-lg text-white/65 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
