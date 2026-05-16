import { cn } from "@/lib/utils";

// Generic glass surface used by feature/service/blog cards inside Aurora.
// Adds a subtle border-glow on hover via theme.css (.aurora-glass:hover::after).
export function GlassCard({
  className,
  children,
  asLink = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { asLink?: boolean }) {
  return (
    <div
      className={cn(
        "aurora-glass rounded-2xl",
        asLink && "transition-transform hover:-translate-y-0.5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
