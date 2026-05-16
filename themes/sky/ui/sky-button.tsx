import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "sky-btn-primary",
  secondary: "sky-btn-secondary",
  ghost: "sky-btn-ghost",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function SkyButton({
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
        "whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
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
