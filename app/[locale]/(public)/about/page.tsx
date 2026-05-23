import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Users } from "lucide-react";
import type { TeamMember, AboutSettings } from "@/types/database";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "عن الشركة" : "About us",
    description: isAr
      ? "تعرف على فريقنا ورسالتنا ورؤيتنا"
      : "Learn about our team, mission, and vision",
  };
}

const FALLBACK_ABOUT: AboutSettings = {
  mission_ar: "تقديم خدمات برمجة وتصميم احترافية تساعد عملاءنا على تحقيق أهدافهم الرقمية.",
  mission_en: "Provide professional programming and design services that help our clients achieve their digital goals.",
  vision_ar: "أن نكون الخيار الأول للشركات والأفراد الباحثين عن جودة وموثوقية.",
  vision_en: "To be the first choice for businesses and individuals seeking quality and reliability.",
  stats: [],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: members }, { data: aboutSetting }] = await Promise.all([
    supabase
      .from("team_members")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("settings").select("value").eq("key", "about").single(),
  ]);

  const about: AboutSettings =
    (aboutSetting?.value as unknown as AboutSettings) ?? FALLBACK_ABOUT;
  const team = (members as TeamMember[]) ?? [];

  const cards = [
    {
      icon: Target,
      titleAr: "رسالتنا",
      titleEn: "Our mission",
      textAr: about.mission_ar || FALLBACK_ABOUT.mission_ar,
      textEn: about.mission_en || FALLBACK_ABOUT.mission_en,
      accent: "pro-primary-accent",
    },
    {
      icon: Eye,
      titleAr: "رؤيتنا",
      titleEn: "Our vision",
      textAr: about.vision_ar || FALLBACK_ABOUT.vision_ar,
      textEn: about.vision_en || FALLBACK_ABOUT.vision_en,
      accent: "pro-secondary-accent",
    },
  ];

  return (
    <div className="container py-16 space-y-20">
      {/* Hero */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4">
          <Users className="h-4 w-4" />
          {isAr ? "من نحن" : "About us"}
        </div>
        <h1 className="pro-heading-glow pro-text-gradient-animate text-4xl sm:text-5xl font-bold tracking-tight">
          {isAr ? "نحن فريق متخصص" : "We're a specialized team"}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {isAr
            ? "نقدم حلول برمجية وتصميمية احترافية تجمع بين الجودة التقنية والجمال البصري"
            : "We deliver professional programming and design solutions combining technical quality with visual appeal"}
        </p>
      </header>

      {/* Stats strip */}
      {about.stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {about.stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-4xl font-bold tabular-nums pro-stat-value" style={{ color: "var(--pro-primary, #06b6d4)" }}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{isAr ? stat.label_ar : stat.label_en}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mission / Vision */}
      <div className="grid sm:grid-cols-2 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.titleEn} className="pro-card pro-card-highlight border-0 bg-transparent">
              <CardContent className="pt-6 space-y-4">
                <div 
                  className="inline-flex rounded-xl p-3"
                  style={{
                    background: c.accent === "pro-primary-accent" ? "color-mix(in srgb, var(--pro-primary) 15%, transparent)" : "color-mix(in srgb, var(--pro-secondary) 15%, transparent)",
                    color: c.accent === "pro-primary-accent" ? "var(--pro-primary)" : "var(--pro-secondary)"
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>{isAr ? c.titleAr : c.titleEn}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {isAr ? c.textAr : c.textEn}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team */}
      {team.length > 0 && (
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{isAr ? "فريق العمل" : "Meet the team"}</h2>
            <p className="text-muted-foreground">
              {isAr ? "الأشخاص الذين يجعلون الأمور تحدث" : "The people who make things happen"}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.id} className="group text-center space-y-4 pro-card p-6 rounded-2xl bg-transparent border-0 hover:bg-transparent">
                <div 
                  className="relative mx-auto h-28 w-28 rounded-full overflow-hidden pro-avatar-ring transition-all duration-300"
                  style={{ border: "2px solid var(--pro-border-soft)" }}
                >
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={isAr ? member.name_ar : member.name_en}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                      {(isAr ? member.name_ar : member.name_en).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg" style={{ color: "var(--pro-fg, #f8fafc)" }}>{isAr ? member.name_ar : member.name_en}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--pro-primary, #06b6d4)" }}>{isAr ? member.role_ar : member.role_en}</p>
                  {(isAr ? member.bio_ar : member.bio_en) && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      {isAr ? member.bio_ar : member.bio_en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
