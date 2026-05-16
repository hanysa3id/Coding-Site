import { cn } from "@/lib/utils";

// Mono-uppercase section label, with a tiny gradient dot at the start.
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "aurora-eyebrow inline-flex items-center gap-2 select-none",
        className
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400" />
      {children}
    </span>
  );
}
