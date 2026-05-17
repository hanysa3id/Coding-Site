import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-20 md:py-28",
  xl: "py-24 md:py-32",
};

export function ComboSection({
  size = "md",
  className,
  children,
  id,
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative", sizeClass[size], className)}>
      <div className="container relative">{children}</div>
    </section>
  );
}

export function ComboBleed({
  size = "md",
  className,
  children,
  id,
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative", sizeClass[size], className)}>
      {children}
    </section>
  );
}

/** Section heading — eyebrow + display + sub. */
export function ComboHeading({
  eyebrow,
  title,
  description,
  align = "start",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
}) {
  const center = align === "center";
  return (
    <div className={cn("max-w-3xl space-y-4", center && "mx-auto text-center")}>
      {eyebrow && <p className="combo-eyebrow">{eyebrow}</p>}
      <h2 className="combo-display text-4xl md:text-6xl">{title}</h2>
      {description && (
        <p
          className={cn(
            "text-base md:text-lg text-white/65 leading-relaxed max-w-2xl",
            center && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
