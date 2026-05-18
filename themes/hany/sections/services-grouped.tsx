import { Link } from "@/i18n/routing";
import {
  Rocket,
  TrendingUp,
  Wrench,
  Code2,
  Palette,
  Megaphone,
  Share2,
  Server,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Service, Category } from "@/types/database";
import { HanySection, HanySectionHeading } from "../ui/section";
import { HanyButton } from "../ui/hany-button";

type Bucket = "build" | "grow" | "maintain";

const KEYWORDS: Record<Bucket, RegExp> = {
  build: /(program|development|code|web|app|mobile|design|ui|ux|graphic|برمج|تصميم|تطوير|موقع|تطبيق|واجهة)/i,
  grow: /(market|seo|social|ads|content|campaign|تسويق|سوشيال|إعلان|محتوى|حمل)/i,
  maintain: /(host|server|infra|support|train|qa|test|maintenance|استضاف|دعم|تدريب|اختبار|صيانة|خادم|بنية)/i,
};

function classify(s: { name_ar: string; name_en: string }, c?: Category): Bucket {
  const haystack = [s.name_ar, s.name_en, c?.name_ar ?? "", c?.name_en ?? ""].join(" ");
  if (KEYWORDS.grow.test(haystack)) return "grow";
  if (KEYWORDS.maintain.test(haystack)) return "maintain";
  return "build";
}

const GROUP_META: Record<
  Bucket,
  {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ComponentType<{ className?: string }>;
    emoji: string;
    sublist: { icon: React.ComponentType<{ className?: string }>; ar: string; en: string }[];
  }
> = {
  build: {
    titleAr: "ابنِ",
    titleEn: "Build",
    descAr: "برمجة وتصميم منتجاتك الرقمية من البداية حتى الإطلاق.",
    descEn: "Design and build your digital products end-to-end.",
    icon: Rocket,
    emoji: "🚀",
    sublist: [
      { icon: Code2, ar: "تطوير ويب وتطبيقات", en: "Web & mobile development" },
      { icon: Palette, ar: "تصميم واجهات وهوية", en: "UI/UX & brand design" },
    ],
  },
  grow: {
    titleAr: "انمُ",
    titleEn: "Grow",
    descAr: "تسويق رقمي وإدارة سوشيال ميديا تجلب لك عملاء فعليين.",
    descEn: "Digital marketing & social media that brings real customers.",
    icon: TrendingUp,
    emoji: "📈",
    sublist: [
      { icon: Megaphone, ar: "التسويق الرقمي والإعلانات", en: "Digital marketing & ads" },
      { icon: Share2, ar: "إدارة السوشيال ميديا", en: "Social media management" },
    ],
  },
  maintain: {
    titleAr: "حافظ",
    titleEn: "Maintain",
    descAr: "استضافة، دعم فني، اختبار جودة، وتدريب فريقك على المنتج.",
    descEn: "Hosting, support, QA, and team training to keep you running.",
    icon: Wrench,
    emoji: "🛠",
    sublist: [
      { icon: Server, ar: "الاستضافة والبنية التحتية", en: "Hosting & infrastructure" },
      { icon: Headphones, ar: "الدعم، التدريب، واختبار الجودة", en: "Support, training & QA" },
    ],
  },
};

const ORDER: Bucket[] = ["build", "grow", "maintain"];

export function HanyServicesGrouped({
  locale,
  services,
  categories,
}: {
  locale: string;
  services: Service[];
  categories: Category[];
}) {
  const isAr = locale === "ar";
  const catById = new Map(categories.map((c) => [c.id, c]));

  const grouped: Record<Bucket, Service[]> = { build: [], grow: [], maintain: [] };
  for (const s of services) {
    const c = s.category_id ? catById.get(s.category_id) : undefined;
    grouped[classify(s, c)].push(s);
  }

  return (
    <HanySection id="services">
      <HanySectionHeading
        kicker={isAr ? "خدماتنا" : "Our services"}
        title={
          isAr ? (
            <>كل ما يحتاجه عملك — <span className="hany-gradient-text">في ثلاث محاور</span></>
          ) : (
            <>Everything you need — <span className="hany-gradient-text">in three pillars</span></>
          )
        }
        description={
          isAr
            ? "اخترنا تجميع خدماتنا بطريقة بسيطة تساعدك تختار ما يناسب مرحلة مشروعك."
            : "We group our services into clear pillars to match the stage of your project."
        }
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ORDER.map((b, i) => {
          const meta = GROUP_META[b];
          const items = grouped[b].slice(0, 4);
          const Icon = meta.icon;
          return (
            <div
              key={b}
              className="hany-card-grad p-7 hany-reveal flex flex-col"
              style={{ ["--delay" as string]: `${i * 80}ms` }}
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="hany-icon-tile">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                </div>

                <h3 className="text-xl font-bold mb-1">{isAr ? meta.titleAr : meta.titleEn}</h3>
                <p className="text-sm text-[color:var(--hany-fg-muted)] leading-relaxed mb-5">
                  {isAr ? meta.descAr : meta.descEn}
                </p>

                <ul className="space-y-2 mb-6">
                  {meta.sublist.map(({ icon: Ic, ar, en }) => (
                    <li key={en} className="flex items-center gap-2 text-sm text-[color:var(--hany-fg)]">
                      <Ic className="h-4 w-4 text-[color:var(--hany-brand)]" />
                      {isAr ? ar : en}
                    </li>
                  ))}
                </ul>

                {items.length > 0 && (
                  <div className="border-t border-[color:var(--hany-border-soft)] pt-4 mb-5 space-y-1.5">
                    {items.map((s) => (
                      <Link
                        key={s.id}
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-2 text-xs text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)] transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="line-clamp-1">{isAr ? s.name_ar : s.name_en}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <HanyButton asChild size="sm" variant="ghost" className="self-start mt-auto">
                  <Link href="/services">
                    {isAr ? "اعرف المزيد" : "Learn more"}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </HanyButton>
              </div>
            </div>
          );
        })}
      </div>
    </HanySection>
  );
}
