import Image from "next/image";
import { Target, Eye } from "lucide-react";
import type { TeamMember, AboutSettings } from "@/types/database";
import { HanySection, HanySectionHeading } from "../ui/section";

export function HanyTeam({
  locale,
  team,
  about,
}: {
  locale: string;
  team: TeamMember[];
  about: AboutSettings | null;
}) {
  const isAr = locale === "ar";
  const visibleTeam = team.slice(0, 8);

  if (visibleTeam.length === 0 && !about) return null;

  return (
    <HanySection id="team">
      <HanySectionHeading
        kicker={isAr ? "فريقنا" : "Our team"}
        title={isAr ? "وجوه وراء كل مشروع" : "The faces behind every project"}
      />

      {about && (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="hany-card p-7 hany-reveal">
            <div className="hany-icon-tile mb-4"><Target className="h-5 w-5" /></div>
            <h3 className="font-bold text-lg mb-2">{isAr ? "رسالتنا" : "Our mission"}</h3>
            <p className="text-sm text-[color:var(--hany-fg-muted)] leading-relaxed">
              {isAr ? about.mission_ar : about.mission_en}
            </p>
          </div>
          <div className="hany-card p-7 hany-reveal" style={{ ["--delay" as string]: "80ms" }}>
            <div className="hany-icon-tile mb-4"><Eye className="h-5 w-5" /></div>
            <h3 className="font-bold text-lg mb-2">{isAr ? "رؤيتنا" : "Our vision"}</h3>
            <p className="text-sm text-[color:var(--hany-fg-muted)] leading-relaxed">
              {isAr ? about.vision_ar : about.vision_en}
            </p>
          </div>
        </div>
      )}

      {visibleTeam.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleTeam.map((m, i) => (
            <div
              key={m.id}
              className="hany-card p-5 text-center hany-reveal"
              style={{ ["--delay" as string]: `${i * 60}ms` }}
            >
              <div className="relative mx-auto mb-4 h-20 w-20 rounded-full overflow-hidden bg-[var(--hany-grad-soft)] grid place-items-center">
                {m.avatar_url ? (
                  <Image
                    src={m.avatar_url}
                    alt={isAr ? m.name_ar : m.name_en}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-[color:var(--hany-brand)]">
                    {(isAr ? m.name_ar : m.name_en).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="font-bold">{isAr ? m.name_ar : m.name_en}</div>
              <div className="text-xs text-[color:var(--hany-fg-muted)] mt-0.5">
                {isAr ? m.role_ar : m.role_en}
              </div>
            </div>
          ))}
        </div>
      )}
    </HanySection>
  );
}
