import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-12 md:py-16",
  md: "py-20 md:py-28",
  lg: "py-28 md:py-36",
};

// Standard outer wrapper for any section on the page. Enforces the rhythm
// defined in DESIGN_SYSTEM.md. Pages should never write `py-*` ad-hoc on
// a <section> element — use this primitive.
export function Section({
  size = "md",
  bordered,
  band,
  className,
  children,
  ...rest
}: {
  size?: SectionSize;
  bordered?: boolean;          // top + bottom hairline
  band?: boolean;              // very slightly elevated background tint
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "relative",
        sizeClass[size],
        bordered && "border-y border-white/[0.06]",
        band && "bg-white/[0.012]",
        className
      )}
      {...rest}
    >
      <div className="container">{children}</div>
    </section>
  );
}

// For full-bleed sections that need a custom inner layout, use this and
// add your own container manually. Still enforces vertical rhythm.
export function BleedSection({
  size = "md",
  className,
  children,
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative", sizeClass[size], className)}>
      {children}
    </section>
  );
}
