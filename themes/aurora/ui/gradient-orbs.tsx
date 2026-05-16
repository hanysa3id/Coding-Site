// Three floating gradient orbs used as a decorative backdrop for hero/CTA
// sections. Pure CSS animation, respects prefers-reduced-motion.
export function GradientOrbs({
  variant = "default",
}: {
  variant?: "default" | "soft";
}) {
  if (variant === "soft") {
    return (
      <>
        <span
          className="aurora-orb"
          style={{
            top: "10%",
            insetInlineStart: "10%",
            width: "20rem",
            height: "20rem",
            background: "radial-gradient(closest-side, rgba(139,92,246,0.45), transparent)",
            animationDelay: "0s",
          }}
          aria-hidden
        />
        <span
          className="aurora-orb"
          style={{
            top: "30%",
            insetInlineEnd: "5%",
            width: "16rem",
            height: "16rem",
            background: "radial-gradient(closest-side, rgba(6,182,212,0.40), transparent)",
            animationDelay: "-4s",
          }}
          aria-hidden
        />
      </>
    );
  }
  return (
    <>
      <span
        className="aurora-orb"
        style={{
          top: "-4rem",
          insetInlineStart: "-4rem",
          width: "26rem",
          height: "26rem",
          background: "radial-gradient(closest-side, rgba(139,92,246,0.55), transparent)",
          animationDelay: "0s",
        }}
        aria-hidden
      />
      <span
        className="aurora-orb"
        style={{
          top: "20%",
          insetInlineEnd: "-6rem",
          width: "30rem",
          height: "30rem",
          background: "radial-gradient(closest-side, rgba(236,72,153,0.40), transparent)",
          animationDelay: "-5s",
        }}
        aria-hidden
      />
      <span
        className="aurora-orb"
        style={{
          bottom: "-6rem",
          insetInlineStart: "30%",
          width: "22rem",
          height: "22rem",
          background: "radial-gradient(closest-side, rgba(6,182,212,0.40), transparent)",
          animationDelay: "-9s",
        }}
        aria-hidden
      />
    </>
  );
}
