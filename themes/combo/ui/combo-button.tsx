import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "combo-btn-primary",
  secondary: "combo-btn-secondary",
  ghost: "combo-btn-ghost",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function ComboButton({
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0418]",
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
