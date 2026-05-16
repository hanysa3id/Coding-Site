import Image from "next/image";
import { Target, Eye } from "lucide-react";
import { PrismSection, PrismHeading } from "../ui/section";
import type { TeamMember, AboutSettings } from "@/types/database";
import type { LandingSettings } from "@/lib/validators/settings";

export function PrismTeam({
  locale,
  team,
  about,
  customStats,
}: {
  locale: string;
  team: TeamMember[];
  about: AboutSettings | null;
  customStats: NonNullable<LandingSettings["stats"]>;
}) {
  const isAr = locale === "ar";
  const mission = isAr ? about?.mission_ar : about?.mission_en;
  const vision = isAr ? about?.vision_ar : about?.vision_en;

  return (
    <PrismSection size="lg" id="team">
      <PrismHeading
        sticker={<span className="prism-sticker is-cyan">{isAr ? "نحن" : "Our team"}</span>}
        eyebrow={isAr ? "البشر خلف الكود" : "Humans behind the pixels"}
        title={
          <>
            {isAr ? "فريق متعدد التخصصات " : "A multi-disciplinary crew "}
            <span className="prism-grad-text-2">
              {isAr ? "بشغف مشترك." : "with one passion."}
            </span>
          </>
        }
      />

      {(mission || vision) && (
        <div className="grid gap-5 md:grid-cols-2 mt-12">
          {mission && (
            <div className="prism-card p-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="prism-display text-xl text-white">
                  {isAr ? "رسالتنا" : "Mission"}
                </h3>
              </div>
              <p className="text-white/75 leading-relaxed">{mission}</p>
            </div>
          )}
          {vision && (
            <div className="prism-card p-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-500 text-white">
                  <Eye className="h-5 w-5" />
                </span>
                <h3 className="prism-display text-xl text-white">
                  {isAr ? "رؤيتنا" : "Vision"}
                </h3>
              </div>
              <p className="text-white/75 leading-relaxed">{vision}</p>
            </div>
          )}
        </div>
      )}

      {customStats.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-10">
          {customStats.slice(0, 4).map((s, i) => (
            <div key={i} className="prism-card p-5 text-center">
              <p className="prism-display text-4xl prism-grad-text">{s.value}</p>
              <p className="prism-mono text-[11px] text-white/60 uppercase tracking-wider mt-2">
                {isAr ? s.label_ar : s.label_en}
              </p>
            </div>
          ))}
        </div>
      )}

      {team.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-14">
          {team.slice(0, 8).map((m, i) => {
            const name = isAr ? m.name_ar : m.name_en;
            const role = isAr ? m.role_ar : m.role_en;
            return (
              <div
                key={m.id}
                className="prism-card prism-fade-up overflow-hidden"
                style={{ ["--prism-delay" as string]: `${i * 70}ms` }}
              >
                <div className="relative aspect-square">
                  {m.avatar_url ? (
                    <Image
                      src={m.avatar_url}
                      alt={name}
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
                      className="object-cover prism-img-zoom"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 grid place-items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,43,181,0.6), rgba(0,229,255,0.6))",
                      }}
                    >
                      <span className="prism-display text-6xl text-white">
                        {name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0b0b14] to-transparent">
                    <p className="text-white font-bold">{name}</p>
                    <p className="prism-mono text-[11px] text-cyan-300">{role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PrismSection>
  );
}
