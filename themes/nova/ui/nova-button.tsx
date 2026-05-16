import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "nova-btn-primary",
  secondary: "nova-btn-secondary",
  ghost: "nova-btn-ghost",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function NovaButton({
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-150 whitespace-nowrap",
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
