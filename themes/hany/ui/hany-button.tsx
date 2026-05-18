import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "hany-btn-primary",
  secondary: "hany-btn-secondary",
  ghost: "hany-btn-ghost",
  accent: "hany-btn-accent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function HanyButton({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium",
        "whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hany-brand)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
