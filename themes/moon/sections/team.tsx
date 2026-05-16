import Image from "next/image";
import { MoonSection, MoonSectionHeading } from "../ui/section";
import { Target, Eye, Users } from "lucide-react";
import type { TeamMember, AboutSettings } from "@/types/database";
import type { LandingStatItem } from "@/lib/validators/settings";

const FALLBACK_STATS = [
  { value: "100+", label_ar: "مشروع منجز", label_en: "Projects shipped" },
  { value: "7", label_ar: "سنوات خبرة", label_en: "Years experience" },
  { value: "98%", label_ar: "رضا العملاء", label_en: "Satisfaction" },
  { value: "24/7", label_ar: "دعم", label_en: "Support" },
];

const FALLBACK_MISSION_AR = "نبني منتجات رقمية موثوقة، ممتعة الاستخدام، وقابلة للنمو — للشركات التي تقدّر الجودة والسرعة معاً.";
const FALLBACK_MISSION_EN = "We build reliable, delightful, scalable digital products — for businesses that value quality and speed equally.";
const FALLBACK_VISION_AR = "أن نكون الشريك التقني الأول لكل شركة طموحة في المنطقة.";
const FALLBACK_VISION_EN = "To be the trusted technology partner for every ambitious company in the region.";

export function MoonTeam({
  locale,
  team,
  about,
  customStats = [],
}: {
  locale: string;
  team: TeamMember[];
  about: AboutSettings | null;
  customStats?: LandingStatItem[];
}) {
  const isAr = locale === "ar";
  const statSource =
    customStats.length > 0 ? customStats : about?.stats?.length ? about.stats : FALLBACK_STATS;
  const stats = statSource.slice(0, 4);
  const missionAr = about?.mission_ar || FALLBACK_MISSION_AR;
  const missionEn = about?.mission_en || FALLBACK_MISSION_EN;
  const visionAr = about?.vision_ar || FALLBACK_VISION_AR;
  const visionEn = about?.vision_en || FALLBACK_VISION_EN;

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "من نحن" : "Who we are"}
        title={
          <>
            {isAr ? "فريق صغير، " : "A small team, "}
            <span className="moon-grad-text">{isAr ? "بنتائج كبيرة" : "with big results"}</span>
          </>
        }
        description={
          isAr
            ? "نؤمن أن الفرق الصغيرة المركّزة تصنع منتجات أفضل من الفرق الكبيرة المشتتة."
            : "We believe small focused teams ship better products than large distracted ones."
        }
      />

      {/* Stats */}
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="moon-card moon-stat moon-fade-up p-6 text-center relative"
            style={{ "--moon-delay": `${i * 80}ms` } as React.CSSProperties}
          >
            <p className="moon-grad-text moon-display text-4xl md:text-5xl">{s.value}</p>
            <p className="text-xs md:text-sm text-white/55 mt-2 moon-mono uppercase tracking-wider">
              {isAr ? s.label_ar : s.label_en}
            </p>
          </div>
        ))}
      </div>

      {/* Mission + Vision */}
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <div className="moon-card p-7 space-y-3">
          <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
            <Target className="h-5 w-5" />
          </span>
          <h3 className="text-xl font-bold text-white">
            {isAr ? "رسالتنا" : "Our mission"}
          </h3>
          <p className="text-base text-white/65 leading-relaxed">
            {isAr ? missionAr : missionEn}
          </p>
        </div>
        <div className="moon-card p-7 space-y-3">
          <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 text-white">
            <Eye className="h-5 w-5" />
          </span>
          <h3 className="text-xl font-bold text-white">{isAr ? "رؤيتنا" : "Our vision"}</h3>
          <p className="text-base text-white/65 leading-relaxed">
            {isAr ? visionAr : visionEn}
          </p>
        </div>
      </div>

      {/* Team grid */}
      {team.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-sky-400" />
            <h3 className="text-xl font-semibold text-white">
              {isAr ? "تعرّف على الفريق" : "Meet the team"}
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {team.slice(0, 8).map((m, i) => (
              <div
                key={m.id}
                className="moon-card moon-fade-up p-5 text-center group"
                style={{ "--moon-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <div className="relative mx-auto h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-sky-900 to-indigo-900 border-2 border-white/10 shadow-md">
                  {m.avatar_url ? (
                    <Image
                      src={m.avatar_url}
                      alt={isAr ? m.name_ar : m.name_en}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-sky-300">
                      {(isAr ? m.name_ar : m.name_en).slice(0, 1)}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {isAr ? m.name_ar : m.name_en}
                </p>
                <p className="text-xs text-sky-400 moon-mono mt-0.5">
                  {isAr ? m.role_ar : m.role_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </MoonSection>
  );
}
