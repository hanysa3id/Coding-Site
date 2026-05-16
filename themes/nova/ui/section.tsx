import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<SectionSize, string> = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
  xl: "py-32 md:py-40",
};

export function NovaSection({
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
      <div className="container">{children}</div>
    </section>
  );
}

export function NovaBleedSection({
  size = "md",
  className,
  children,
}: {
  size?: SectionSize;
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("relative", sizeClass[size], className)}>{children}</section>;
}

// Centered heading block with optional eyebrow and lead.
export function NovaSectionHeading({
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
      {kicker && <span className="nova-eyebrow">{kicker}</span>}
      <h2 className="nova-display text-3xl md:text-5xl">
        <span className="nova-grad-text">{title}</span>
      </h2>
      {description && (
        <p className="text-base md:text-lg text-white/55 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
