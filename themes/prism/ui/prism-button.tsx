import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "prism-btn-primary",
  secondary: "prism-btn-secondary",
  ghost: "prism-btn-ghost",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base py-3",
};

export function PrismButton({
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b14]",
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
