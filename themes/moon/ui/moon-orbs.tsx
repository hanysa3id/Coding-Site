// Decorative gradient orbs used as accent backdrop in hero/CTA.
// Pure CSS animation, respects prefers-reduced-motion via theme.css.
export function MoonOrbs({ variant = "default" }: { variant?: "default" | "soft" }) {
  if (variant === "soft") {
    return (
      <>
        <span
          className="moon-orb"
          style={{
            top: "10%",
            insetInlineStart: "8%",
            width: "18rem",
            height: "18rem",
            background:
              "radial-gradient(closest-side, rgba(96, 165, 250, 0.55), transparent)",
            animationDelay: "0s",
          }}
          aria-hidden
        />
        <span
          className="moon-orb"
          style={{
            top: "30%",
            insetInlineEnd: "5%",
            width: "14rem",
            height: "14rem",
            background:
              "radial-gradient(closest-side, rgba(45, 212, 191, 0.50), transparent)",
            animationDelay: "-5s",
          }}
          aria-hidden
        />
      </>
    );
  }
  return (
    <>
      <span
        className="moon-orb"
        style={{
          top: "-5rem",
          insetInlineStart: "-3rem",
          width: "28rem",
          height: "28rem",
          background:
            "radial-gradient(closest-side, rgba(96, 165, 250, 0.45), transparent)",
          animationDelay: "0s",
        }}
        aria-hidden
      />
      <span
        className="moon-orb"
        style={{
          top: "30%",
          insetInlineEnd: "-6rem",
          width: "32rem",
          height: "32rem",
          background:
            "radial-gradient(closest-side, rgba(129, 140, 248, 0.40), transparent)",
          animationDelay: "-6s",
        }}
        aria-hidden
      />
      <span
        className="moon-orb"
        style={{
          bottom: "-6rem",
          insetInlineStart: "30%",
          width: "22rem",
          height: "22rem",
          background:
            "radial-gradient(closest-side, rgba(45, 212, 191, 0.35), transparent)",
          animationDelay: "-12s",
        }}
        aria-hidden
      />
    </>
  );
}

// Big shining moon disc with crater shadows — purely decorative SVG.
export function MoonDisc({
  className,
  size = 320,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="moon-glow-rg" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <radialGradient id="moon-shadow-rg" cx="80%" cy="80%" r="80%">
          <stop offset="0%" stopColor="rgba(15,23,42,0)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0.55)" />
        </radialGradient>
        <filter id="moon-blur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      {/* Outer glow */}
      <circle cx="160" cy="160" r="155" fill="url(#moon-glow-rg)" filter="url(#moon-blur)" opacity="0.25" />
      {/* Disc */}
      <circle cx="160" cy="160" r="130" fill="url(#moon-glow-rg)" />
      {/* Shadow side */}
      <circle cx="160" cy="160" r="130" fill="url(#moon-shadow-rg)" />
      {/* Craters */}
      <circle cx="100" cy="120" r="14" fill="rgba(71, 85, 105, 0.30)" />
      <circle cx="155" cy="92" r="8" fill="rgba(71, 85, 105, 0.28)" />
      <circle cx="200" cy="155" r="22" fill="rgba(71, 85, 105, 0.30)" />
      <circle cx="130" cy="195" r="11" fill="rgba(71, 85, 105, 0.28)" />
      <circle cx="220" cy="220" r="6" fill="rgba(71, 85, 105, 0.25)" />
      <circle cx="80" cy="180" r="5" fill="rgba(71, 85, 105, 0.25)" />
    </svg>
  );
}
