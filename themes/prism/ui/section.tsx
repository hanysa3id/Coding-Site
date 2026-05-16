import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-20 md:py-28",
  xl: "py-24 md:py-32",
};

export function PrismSection({
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

export function PrismBleed({
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

/** Section heading — eyebrow + display + sub. Center or start aligned. */
export function PrismHeading({
  eyebrow,
  title,
  description,
  align = "start",
  sticker,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
  sticker?: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <div className={cn("max-w-3xl space-y-4", center && "mx-auto text-center")}>
      {sticker && <div className={cn("flex", center && "justify-center")}>{sticker}</div>}
      {eyebrow && <p className="prism-eyebrow">{eyebrow}</p>}
      <h2 className="prism-display text-4xl md:text-6xl">{title}</h2>
      {description && (
        <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
