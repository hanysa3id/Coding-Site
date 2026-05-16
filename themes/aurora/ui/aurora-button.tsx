import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_8px_24px_-6px_rgba(255,255,255,0.25)]",
  secondary:
    "bg-white/[0.06] text-white border border-white/15 hover:bg-white/[0.10]",
  ghost: "text-white/70 hover:text-white hover:bg-white/[0.04]",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

// Aurora button with optional `asChild` slot pattern so we can wrap `<Link>`.
export function AuroraButton({
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
        "transition-colors duration-150 whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
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
