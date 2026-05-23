"use client";

import Image from "next/image";
import type { LandingLogoItem, LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProLogoCloud({
  locale,
  logos,
  landing,
}: {
  locale: string;
  logos: LandingLogoItem[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  
  const content = resolveSectionContent(landing, "logo_cloud", locale, {
    title_ar: "علامات تجارية رائدة تثق بـنا",
    title_en: "brands we help launch & scale",
  });
  
  const items = logos.length > 0 ? logos : [
    { name: "TechPlus", image_url: null },
    { name: "Nova Studio", image_url: null },
    { name: "Core System", image_url: null },
    { name: "Atlantis Cloud", image_url: null },
    { name: "Orbit Agency", image_url: null },
    { name: "Phoenix Labs", image_url: null },
    { name: "Nexus Digital", image_url: null },
    { name: "Stellar SaaS", image_url: null },
  ];

  // Triple for seamless looping
  const track1 = [...items, ...items, ...items];

  return (
    <section id="logo_cloud" className="py-10 border-y border-[color:var(--pro-border-soft)] bg-[#02040a]/40 overflow-hidden">
      {/* Centered heading */}
      <div className="flex justify-center w-full mb-8">
        <div className="pro-section-label">
          {content.title}
        </div>
      </div>

      {/* Track — seamless infinite marquee */}
      <div className="relative w-full overflow-hidden pro-marquee-mask mb-3 pro-logo-track-wrap">
        <div className="flex items-center gap-20 whitespace-nowrap pro-logo-track-1">
          {track1.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-center shrink-0 w-44 h-14 pro-brand-logo"
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={140}
                  height={45}
                  className="max-h-12 w-auto object-contain"
                />
              ) : (
                <span className="text-base font-black tracking-wide text-white/60">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
