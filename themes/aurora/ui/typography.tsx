import { cn } from "@/lib/utils";

// Typography primitives — the ONLY way to render headings & body inside the
// Aurora theme. See DESIGN_SYSTEM.md for the full scale.

type CommonProps = {
  className?: string;
  children: React.ReactNode;
};

// Display headings ---------------------------------------------------------

export function H1({ className, children, ...rest }: CommonProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "aurora-display text-5xl md:text-6xl lg:text-7xl text-white",
        className
      )}
      {...rest}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...rest }: CommonProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("aurora-display text-3xl md:text-4xl text-white", className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...rest }: CommonProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl md:text-2xl font-semibold text-white", className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children, ...rest }: CommonProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn("text-base md:text-lg font-semibold text-white", className)}
      {...rest}
    >
      {children}
    </h4>
  );
}

// Body --------------------------------------------------------------------

export function Lead({ className, children }: CommonProps) {
  return (
    <p className={cn("text-base md:text-lg text-white/65 leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function Body({ className, children }: CommonProps) {
  return (
    <p className={cn("text-sm md:text-base text-white/65 leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function Muted({ className, children }: CommonProps) {
  return <p className={cn("text-sm text-white/45", className)}>{children}</p>;
}

export function Mono({ className, children }: CommonProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("aurora-mono text-xs text-white/55 tracking-wider", className)}>
      {children}
    </span>
  );
}
