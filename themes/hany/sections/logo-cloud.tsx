import Image from "next/image";
import type { LandingLogoItem } from "@/lib/validators/settings";

export function HanyLogoCloud({
  locale,
  logos,
}: {
  locale: string;
  logos: LandingLogoItem[];
}) {
  const isAr = locale === "ar";
  const items =
    logos.length > 0
      ? logos
      : (isAr
          ? ["شركة المستقبل", "تقنية بلس", "نوفا ديجيتال", "ميدل ايست تك", "بلانيت ستور", "اتش ار جلوبال"]
          : ["FutureCo", "Tech Plus", "Nova Digital", "Mideast Tech", "Planet Store", "HR Global"]
        ).map((name) => ({ name, image_url: null }));

  // duplicate for seamless marquee
  const doubled = [...items, ...items];

  return (
    <section className="py-10 md:py-12 border-y border-[color:var(--hany-border-soft)] bg-white/60">
      <div className="container">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-[color:var(--hany-fg-subtle)] font-semibold mb-6">
          {isAr ? "موثوق به من قِبَل فرق رائدة" : "Trusted by ambitious teams"}
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="hany-marquee">
            {doubled.map((it, i) => (
              <div
                key={`${it.name}-${i}`}
                className="flex items-center gap-2 text-[color:var(--hany-fg-muted)] font-semibold text-base whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
              >
                {it.image_url ? (
                  <Image
                    src={it.image_url}
                    alt={it.name}
                    width={88}
                    height={28}
                    className="h-7 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <span>{it.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
