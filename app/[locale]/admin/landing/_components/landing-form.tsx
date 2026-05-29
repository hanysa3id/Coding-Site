"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  ExternalLink,
  Info,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  BarChart3,
  HelpCircle,
  Globe,
  Image as ImageIcon,
  Megaphone,
} from "lucide-react";
import {
  landingSettingsSchema,
  type LandingSettings,
  type LandingFaqItem,
  type LandingNavItem,
  type LandingStatItem,
  type LandingLogoItem,
  type LandingHeroSlide,
  type LandingSectionId,
} from "@/lib/validators/settings";
import {
  saveLandingSettingsAction,
  uploadLandingLogoAction,
  uploadHeroSlideImageAction,
} from "../../settings/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import type { ThemeId } from "@/themes";
import { cn } from "@/lib/utils";

// ─── Canonical sections (single source of truth) ────────────────────────────
const SECTIONS: {
  id: LandingSectionId;
  icon: React.ComponentType<{ className?: string }>;
  ar: string;
  en: string;
  description_ar: string;
  description_en: string;
  themes: ThemeId[];
}[] = [
  {
    id: "hero",
    icon: Sparkles,
    ar: "البطل (Hero)",
    en: "Hero",
    description_ar: "أول قسم يراه الزائر — العنوان والـ CTAs.",
    description_en: "First-screen — headline + primary CTAs.",
    themes: ["pro"],
  },
  {
    id: "logo_cloud",
    icon: Layers,
    ar: "شعارات العملاء",
    en: "Logo cloud",
    description_ar: "شريط متحرك بأسماء/شعارات الشركات.",
    description_en: "Marquee strip of client names / logos.",
    themes: ["pro"],
  },
  {
    id: "features",
    icon: Layers,
    ar: "المميزات / Bento",
    en: "Features / Bento",
    description_ar: "بطاقات تشرح ما الذي يميزك.",
    description_en: "Cards explaining what makes you different.",
    themes: ["pro"],
  },
  {
    id: "stats",
    icon: BarChart3,
    ar: "الإحصائيات",
    en: "Stats",
    description_ar: "أرقام بارزة (مشاريع، عملاء، سنوات).",
    description_en: "Big numbers (projects, clients, years).",
    themes: ["pro"],
  },
  {
    id: "services",
    icon: Layers,
    ar: "الخدمات",
    en: "Services",
    description_ar: "قائمة الخدمات المعروضة (تُسحب من DB).",
    description_en: "Service offerings (pulled from DB).",
    themes: ["pro"],
  },
  {
    id: "process",
    icon: Layers,
    ar: "خطوات العمل",
    en: "Process steps",
    description_ar: "كيف نعمل — 4 مراحل من البداية للتسليم.",
    description_en: "How we work — 4 stages from start to finish.",
    themes: ["pro"],
  },
  {
    id: "portfolio",
    icon: ImageIcon,
    ar: "معرض الأعمال",
    en: "Portfolio",
    description_ar: "آخر المشاريع المنجزة (من DB).",
    description_en: "Recent projects (from DB).",
    themes: ["pro"],
  },
  {
    id: "testimonials",
    icon: HelpCircle,
    ar: "آراء العملاء",
    en: "Testimonials",
    description_ar: "شهادات العملاء (من الـ reviews أو بديل).",
    description_en: "Customer quotes (from reviews or fallback).",
    themes: ["pro"],
  },
  {
    id: "pricing",
    icon: BarChart3,
    ar: "الأسعار",
    en: "Pricing",
    description_ar: "ثلاث باقات بأسعار شفافة.",
    description_en: "Three transparent pricing tiers.",
    themes: ["pro"],
  },
  {
    id: "team",
    icon: Layers,
    ar: "فريق العمل + الرسالة/الرؤية",
    en: "Team + Mission/Vision",
    description_ar: "أعضاء الفريق + رسالة الشركة + إحصائيات.",
    description_en: "Team members + mission + stats.",
    themes: ["pro"],
  },
  {
    id: "blog",
    icon: Layers,
    ar: "آخر المقالات",
    en: "Blog",
    description_ar: "آخر 3 مقالات منشورة من المدونة.",
    description_en: "Latest 3 published blog posts.",
    themes: ["pro"],
  },
  {
    id: "faq",
    icon: HelpCircle,
    ar: "الأسئلة الشائعة",
    en: "FAQ",
    description_ar: "قسم الأسئلة الشائعة بـ accordion.",
    description_en: "FAQ accordion section.",
    themes: ["pro"],
  },
  {
    id: "newsletter",
    icon: Megaphone,
    ar: "النشرة البريدية",
    en: "Newsletter",
    description_ar: "نموذج اشتراك في النشرة الأسبوعية.",
    description_en: "Weekly newsletter signup form.",
    themes: ["pro"],
  },
  {
    id: "cta",
    icon: Megaphone,
    ar: "دعوة للعمل",
    en: "Final CTA",
    description_ar: "قسم تحفيز أخير لبدء مشروع.",
    description_en: "Final conversion strip before footer.",
    themes: ["pro"],
  },
];

function emptyState(): LandingSettings {
  return landingSettingsSchema.parse({});
}

export function LandingForm({
  initial,
  locale,
  themeId,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
  themeId: ThemeId;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const initialParsed: LandingSettings = useMemo(() => {
    if (!initial) return emptyState();
    const parsed = landingSettingsSchema.safeParse(initial);
    return parsed.success ? parsed.data : emptyState();
  }, [initial]);

  const [data, setData] = useState<LandingSettings>(initialParsed);

  function update<K extends keyof LandingSettings>(key: K, value: LandingSettings[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    startTransition(async () => {
      const result = await saveLandingSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم حفظ إعدادات الصفحة الرئيسية" : "Landing page settings saved");
    });
  }

  function onResetAll() {
    setData(initialParsed);
    toast.info(isAr ? "أعيد التعيين لآخر حالة محفوظة" : "Reset to last saved state");
  }

  function resetTab(
    tab: "hero" | "slides" | "nav" | "logos" | "faqs" | "stats" | "sections" | "testimonials" | "section_content"
  ) {
    if (tab === "hero") update("hero", emptyState().hero);
    if (tab === "slides") update("hero_slides", []);
    if (tab === "nav") update("nav", emptyState().nav);
    if (tab === "logos") update("logos", []);
    if (tab === "faqs") update("faqs", []);
    if (tab === "stats") update("stats", []);
    if (tab === "sections") update("sections", {});
    if (tab === "testimonials") update("testimonials", []);
    if (tab === "section_content") update("section_overrides", {});
    toast.success(isAr ? "تم إعادة تعيين هذا القسم" : "Section reset to defaults");
  }

  // ─── Hero slides helpers ──────────────────────────────────────────────────
  const blankSlide = (): LandingHeroSlide => ({
    badge_ar: "",
    badge_en: "",
    title_ar: "",
    title_en: "",
    subtitle_ar: "",
    subtitle_en: "",
    primary_cta_label_ar: "",
    primary_cta_label_en: "",
    primary_cta_href: "",
    secondary_cta_label_ar: "",
    secondary_cta_label_en: "",
    secondary_cta_href: "",
    image_url: "",
    video_url: "",
  });
  function patchSlide(idx: number, patch: Partial<LandingHeroSlide>) {
    const next = [...data.hero_slides];
    next[idx] = { ...next[idx], ...patch };
    update("hero_slides", next);
  }
  function moveSlide(idx: number, dir: -1 | 1) {
    const next = [...data.hero_slides];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update("hero_slides", next);
  }
  function removeSlide(idx: number) {
    update("hero_slides", data.hero_slides.filter((_, i) => i !== idx));
  }

  // ─── Logo helpers ─────────────────────────────────────────────────────────
  function patchLogo(idx: number, patch: Partial<LandingLogoItem>) {
    const next = [...data.logos];
    next[idx] = { ...next[idx], ...patch };
    update("logos", next);
  }
  function removeLogo(idx: number) {
    update("logos", data.logos.filter((_, i) => i !== idx));
  }

  const dirty = JSON.stringify(data) !== JSON.stringify(initialParsed);
  const visibleCount = SECTIONS.filter(
    (s) => s.themes.includes(themeId) && data.sections[s.id] !== false
  ).length;
  const themeSectionCount = SECTIONS.filter((s) => s.themes.includes(themeId)).length;

  return (
    <div className="space-y-6">
      {/* Top summary strip */}
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryChip
          icon={Sparkles}
          label={isAr ? "الـ Theme" : "Theme"}
          value={themeId}
          accent="violet"
        />
        <SummaryChip
          icon={Eye}
          label={isAr ? "أقسام مرئية" : "Visible sections"}
          value={`${visibleCount}/${themeSectionCount}`}
          accent="emerald"
        />
        <SummaryChip
          icon={Globe}
          label={isAr ? "روابط مخصصة" : "Custom nav items"}
          value={String(data.nav.custom_items.length)}
          accent="sky"
        />
        <SummaryChip
          icon={HelpCircle}
          label="FAQ + Stats"
          value={`${data.faqs.length} · ${data.stats.length}`}
          accent="amber"
        />
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="sections">{isAr ? "الأقسام" : "Sections"}</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="slides">{isAr ? "الشرائح" : "Slides"}</TabsTrigger>
          <TabsTrigger value="nav">{isAr ? "شريط التنقل" : "Nav Bar"}</TabsTrigger>
          <TabsTrigger value="logos">{isAr ? "الشعارات" : "Logos"}</TabsTrigger>
          <TabsTrigger value="stats">{isAr ? "الإحصائيات" : "Stats"}</TabsTrigger>
          <TabsTrigger value="faqs">FAQ</TabsTrigger>
          <TabsTrigger value="testimonials">{isAr ? "آراء العملاء" : "Testimonials"}</TabsTrigger>
          <TabsTrigger value="section_content">{isAr ? "نصوص الأقسام" : "Section Content"}</TabsTrigger>
        </TabsList>

        {/* ─── SECTIONS ─────────────────────────────────────── */}
        <TabsContent value="sections" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="رتّب وتحكم في إظهار أي قسم من الصفحة الرئيسية. السهمان يغيّران الأولوية البصرية في الـ themes التي تدعم الترتيب."
              en="Toggle visibility and reorder homepage sections. Up/down arrows reorder where the theme supports it."
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => resetTab("sections")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>

          <div className="grid gap-2">
            {SECTIONS.map((s) => {
              const inTheme = s.themes.includes(themeId);
              const visible = data.sections[s.id] !== false;
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
                    inTheme ? "" : "opacity-50",
                    visible && inTheme && "bg-muted/20"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={cn(
                        "grid place-items-center h-9 w-9 shrink-0 rounded-lg border",
                        inTheme
                          ? "bg-gradient-to-br from-violet-100 to-sky-100 border-violet-200 text-violet-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {visible ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <Label className="font-medium">{isAr ? s.ar : s.en}</Label>
                        <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {s.id}
                        </code>
                        {!inTheme && (
                          <Badge variant="outline" className="text-[10px]">
                            {isAr ? "غير موجود" : "not in this theme"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {isAr ? s.description_ar : s.description_en}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={visible}
                    onCheckedChange={(v) =>
                      update("sections", { ...data.sections, [s.id]: v })
                    }
                    disabled={!inTheme}
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── HERO ─────────────────────────────────────────── */}
        <TabsContent value="hero" className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="عدّل عنوان البطل والـ CTAs. الحقول الفارغة ترجع للنص الافتراضي في الـ Theme."
              en="Edit hero copy. Empty fields fall back to the theme defaults."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("hero")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Badge (AR)"
              dir="rtl"
              value={data.hero.badge_ar ?? ""}
              onChange={(v) => update("hero", { ...data.hero, badge_ar: v })}
            />
            <Field
              label="Badge (EN)"
              dir="ltr"
              value={data.hero.badge_en ?? ""}
              onChange={(v) => update("hero", { ...data.hero, badge_en: v })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={isAr ? "العنوان (AR)" : "Title (AR)"}
              dir="rtl"
              value={data.hero.title_ar ?? ""}
              onChange={(v) => update("hero", { ...data.hero, title_ar: v })}
            />
            <Field
              label={isAr ? "العنوان (EN)" : "Title (EN)"}
              dir="ltr"
              value={data.hero.title_en ?? ""}
              onChange={(v) => update("hero", { ...data.hero, title_en: v })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextareaField
              label={isAr ? "الوصف (AR)" : "Subtitle (AR)"}
              dir="rtl"
              value={data.hero.subtitle_ar ?? ""}
              onChange={(v) => update("hero", { ...data.hero, subtitle_ar: v })}
            />
            <TextareaField
              label={isAr ? "الوصف (EN)" : "Subtitle (EN)"}
              dir="ltr"
              value={data.hero.subtitle_en ?? ""}
              onChange={(v) => update("hero", { ...data.hero, subtitle_en: v })}
            />
          </div>

          <fieldset className="rounded-lg border p-4 space-y-3">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isAr ? "الزر الأساسي" : "Primary CTA"}
            </legend>
            <div className="grid gap-3 md:grid-cols-3">
              <Field
                label={isAr ? "النص (AR)" : "Label (AR)"}
                dir="rtl"
                value={data.hero.primary_cta_label_ar ?? ""}
                onChange={(v) => update("hero", { ...data.hero, primary_cta_label_ar: v })}
              />
              <Field
                label={isAr ? "النص (EN)" : "Label (EN)"}
                dir="ltr"
                value={data.hero.primary_cta_label_en ?? ""}
                onChange={(v) => update("hero", { ...data.hero, primary_cta_label_en: v })}
              />
              <Field
                label={isAr ? "الرابط" : "Link"}
                dir="ltr"
                placeholder="/services"
                value={data.hero.primary_cta_href ?? ""}
                onChange={(v) => update("hero", { ...data.hero, primary_cta_href: v })}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-lg border p-4 space-y-3">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isAr ? "الزر الثانوي" : "Secondary CTA"}
            </legend>
            <div className="grid gap-3 md:grid-cols-3">
              <Field
                label={isAr ? "النص (AR)" : "Label (AR)"}
                dir="rtl"
                value={data.hero.secondary_cta_label_ar ?? ""}
                onChange={(v) =>
                  update("hero", { ...data.hero, secondary_cta_label_ar: v })
                }
              />
              <Field
                label={isAr ? "النص (EN)" : "Label (EN)"}
                dir="ltr"
                value={data.hero.secondary_cta_label_en ?? ""}
                onChange={(v) =>
                  update("hero", { ...data.hero, secondary_cta_label_en: v })
                }
              />
              <Field
                label={isAr ? "الرابط" : "Link"}
                dir="ltr"
                placeholder="/contact"
                value={data.hero.secondary_cta_href ?? ""}
                onChange={(v) => update("hero", { ...data.hero, secondary_cta_href: v })}
              />
            </div>
          </fieldset>
        </TabsContent>

        {/* ─── HERO SLIDES (multi) ──────────────────────────── */}
        <TabsContent value="slides" className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="شرائح متعددة للهيرو — تُعرض في الـ themes التي تدعم السلايدر (Moon ، Prism ، Sky). اترك القائمة فارغة لاستخدام تبويب Hero أعلاه فقط."
              en="Multiple hero slides — rendered by themes that support a slider (Moon, Prism, Sky). Leave empty to fall back to the single Hero tab above."
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  update("hero_slides", [...data.hero_slides, blankSlide()])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                {isAr ? "إضافة شريحة" : "Add slide"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => resetTab("slides")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isAr ? "إعادة تعيين" : "Reset"}
              </Button>
            </div>
          </div>

          {data.hero_slides.length === 0 ? (
            <EmptyState
              isAr={isAr}
              ar="لا توجد شرائح — اضغط (إضافة شريحة) لإنشاء أول شريحة."
              en="No slides — click (Add slide) to create the first one."
            />
          ) : (
            <div className="space-y-4">
              {data.hero_slides.map((slide, i) => (
                <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        #{String(i + 1).padStart(2, "0")}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {slide.title_ar || slide.title_en || (isAr ? "شريحة بدون عنوان" : "Untitled slide")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={i === 0}
                        onClick={() => moveSlide(i, -1)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={i === data.hero_slides.length - 1}
                        onClick={() => moveSlide(i, 1)}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSlide(i)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Badge (AR)"
                      dir="rtl"
                      value={slide.badge_ar ?? ""}
                      onChange={(v) => patchSlide(i, { badge_ar: v })}
                    />
                    <Field
                      label="Badge (EN)"
                      dir="ltr"
                      value={slide.badge_en ?? ""}
                      onChange={(v) => patchSlide(i, { badge_en: v })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label={isAr ? "العنوان (AR)" : "Title (AR)"}
                      dir="rtl"
                      value={slide.title_ar ?? ""}
                      onChange={(v) => patchSlide(i, { title_ar: v })}
                    />
                    <Field
                      label={isAr ? "العنوان (EN)" : "Title (EN)"}
                      dir="ltr"
                      value={slide.title_en ?? ""}
                      onChange={(v) => patchSlide(i, { title_en: v })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextareaField
                      label={isAr ? "الوصف (AR)" : "Subtitle (AR)"}
                      dir="rtl"
                      value={slide.subtitle_ar ?? ""}
                      onChange={(v) => patchSlide(i, { subtitle_ar: v })}
                    />
                    <TextareaField
                      label={isAr ? "الوصف (EN)" : "Subtitle (EN)"}
                      dir="ltr"
                      value={slide.subtitle_en ?? ""}
                      onChange={(v) => patchSlide(i, { subtitle_en: v })}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 pt-1">
                    <Field
                      label={isAr ? "نص الزر الأساسي (AR)" : "Primary CTA (AR)"}
                      dir="rtl"
                      value={slide.primary_cta_label_ar ?? ""}
                      onChange={(v) => patchSlide(i, { primary_cta_label_ar: v })}
                    />
                    <Field
                      label={isAr ? "نص الزر الأساسي (EN)" : "Primary CTA (EN)"}
                      dir="ltr"
                      value={slide.primary_cta_label_en ?? ""}
                      onChange={(v) => patchSlide(i, { primary_cta_label_en: v })}
                    />
                    <Field
                      label={isAr ? "رابط الزر الأساسي" : "Primary link"}
                      dir="ltr"
                      placeholder="/contact"
                      value={slide.primary_cta_href ?? ""}
                      onChange={(v) => patchSlide(i, { primary_cta_href: v })}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field
                      label={isAr ? "نص الزر الثانوي (AR)" : "Secondary CTA (AR)"}
                      dir="rtl"
                      value={slide.secondary_cta_label_ar ?? ""}
                      onChange={(v) => patchSlide(i, { secondary_cta_label_ar: v })}
                    />
                    <Field
                      label={isAr ? "نص الزر الثانوي (EN)" : "Secondary CTA (EN)"}
                      dir="ltr"
                      value={slide.secondary_cta_label_en ?? ""}
                      onChange={(v) => patchSlide(i, { secondary_cta_label_en: v })}
                    />
                    <Field
                      label={isAr ? "رابط الزر الثانوي" : "Secondary link"}
                      dir="ltr"
                      placeholder="/services"
                      value={slide.secondary_cta_href ?? ""}
                      onChange={(v) => patchSlide(i, { secondary_cta_href: v })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 pt-1">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        {isAr ? "صورة الخلفية" : "Background image"}
                      </Label>
                      <ImageUpload
                        value={slide.image_url || null}
                        onChange={(url) => patchSlide(i, { image_url: url ?? "" })}
                        uploadAction={uploadHeroSlideImageAction}
                        locale={locale}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        {isAr ? "رابط فيديو (اختياري)" : "Video URL (optional)"}
                      </Label>
                      <Input
                        type="url"
                        dir="ltr"
                        placeholder="https://.../loop.mp4"
                        value={slide.video_url ?? ""}
                        onChange={(e) => patchSlide(i, { video_url: e.target.value })}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "MP4 صغير الحجم (< 5 ميجا). يُشغّل صامتاً ومتكرراً."
                          : "Small MP4 (< 5MB). Plays muted + looped."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── NAV BAR ──────────────────────────────────────── */}
        <TabsContent value="nav" className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="تحكم في عناصر القائمة العلوية. يمكنك إخفاء أي رابط افتراضي وإضافة بنود مخصصة بترتيب اختياري."
              en="Control the top nav. Hide any default link or add reorderable custom items."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("nav")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">
              {isAr ? "الروابط الافتراضية" : "Default links"}
            </Label>
            <div className="grid gap-2">
              {(
                [
                  { key: "show_services", ar: "الخدمات", en: "Services", href: "/services" },
                  { key: "show_portfolio", ar: "أعمالنا", en: "Portfolio", href: "/portfolio" },
                  { key: "show_blog", ar: "المدونة", en: "Blog", href: "/blog" },
                  { key: "show_about", ar: "من نحن", en: "About", href: "/about" },
                  { key: "show_contact", ar: "اتصل بنا", en: "Contact", href: "/contact" },
                ] as const
              ).map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Label className="text-sm cursor-pointer">{isAr ? n.ar : n.en}</Label>
                    <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {n.href}
                    </code>
                  </div>
                  <Switch
                    checked={data.nav[n.key]}
                    onCheckedChange={(v) => update("nav", { ...data.nav, [n.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                {isAr ? "بنود مخصصة" : "Custom items"} ({data.nav.custom_items.length})
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  update("nav", {
                    ...data.nav,
                    custom_items: [
                      ...data.nav.custom_items,
                      { label_ar: "", label_en: "", href: "" } as LandingNavItem,
                    ],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                {isAr ? "إضافة بند" : "Add item"}
              </Button>
            </div>
            {data.nav.custom_items.length === 0 ? (
              <EmptyState
                isAr={isAr}
                ar="لا توجد بنود مخصصة بعد"
                en="No custom items yet"
              />
            ) : (
              <ReorderList
                count={data.nav.custom_items.length}
                onMove={(from, to) => {
                  const next = [...data.nav.custom_items];
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  update("nav", { ...data.nav, custom_items: next });
                }}
                onRemove={(i) =>
                  update("nav", {
                    ...data.nav,
                    custom_items: data.nav.custom_items.filter((_, j) => j !== i),
                  })
                }
                renderItem={(i) => {
                  const item = data.nav.custom_items[i];
                  return (
                    <div className="grid gap-2 md:grid-cols-3">
                      <Input
                        placeholder={isAr ? "النص (AR)" : "Label (AR)"}
                        dir="rtl"
                        value={item.label_ar}
                        onChange={(e) => {
                          const next = [...data.nav.custom_items];
                          next[i] = { ...item, label_ar: e.target.value };
                          update("nav", { ...data.nav, custom_items: next });
                        }}
                      />
                      <Input
                        placeholder={isAr ? "النص (EN)" : "Label (EN)"}
                        dir="ltr"
                        value={item.label_en}
                        onChange={(e) => {
                          const next = [...data.nav.custom_items];
                          next[i] = { ...item, label_en: e.target.value };
                          update("nav", { ...data.nav, custom_items: next });
                        }}
                      />
                      <Input
                        placeholder="/p/about-us"
                        dir="ltr"
                        value={item.href}
                        onChange={(e) => {
                          const next = [...data.nav.custom_items];
                          next[i] = { ...item, href: e.target.value };
                          update("nav", { ...data.nav, custom_items: next });
                        }}
                      />
                    </div>
                  );
                }}
              />
            )}
          </div>
        </TabsContent>

        {/* ─── LOGO CLOUD ───────────────────────────────────── */}
        <TabsContent value="logos" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="أسماء الشركات/العلامات التي تعمل معك. إن تركت القائمة فارغة، يستخدم الـ Theme أسماء العملاء من جدول معرض الأعمال."
              en="Brand names you've worked with. If empty, the theme uses client_name from portfolio + stylized fillers."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("logos")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-semibold">
              {isAr ? "الشعارات" : "Logos"} ({data.logos.length})
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                update("logos", [...data.logos, { name: "" }])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "إضافة شعار" : "Add logo"}
            </Button>
          </div>
          {data.logos.length === 0 ? (
            <EmptyState
              isAr={isAr}
              ar="لا توجد شعارات — سيستخدم الـ theme أسماء العملاء من معرض الأعمال."
              en="No logos — theme will use client_name from portfolio + defaults."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.logos.map((logo, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono">
                      #{String(i + 1).padStart(2, "0")}
                    </Badge>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeLogo(i)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Field
                    label={isAr ? "اسم العلامة" : "Brand name"}
                    dir="ltr"
                    value={logo.name}
                    onChange={(v) => patchLogo(i, { name: v })}
                    placeholder="Northwind"
                  />

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "صورة الشعار" : "Logo image"}
                    </Label>
                    <ImageUpload
                      value={logo.image_url || null}
                      onChange={(url) => patchLogo(i, { image_url: url ?? "" })}
                      uploadAction={uploadLandingLogoAction}
                      locale={locale}
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <Field
                      label={isAr ? "وصف (AR)" : "Description (AR)"}
                      dir="rtl"
                      value={logo.description_ar ?? ""}
                      onChange={(v) => patchLogo(i, { description_ar: v })}
                      placeholder={isAr ? "شريك تقني" : ""}
                    />
                    <Field
                      label={isAr ? "وصف (EN)" : "Description (EN)"}
                      dir="ltr"
                      value={logo.description_en ?? ""}
                      onChange={(v) => patchLogo(i, { description_en: v })}
                      placeholder={!isAr ? "Tech partner" : ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── STATS ────────────────────────────────────────── */}
        <TabsContent value="stats" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="الأرقام الكبيرة التي تظهر في شريط الإحصائيات. أمثلة: 100+ مشروع، 98% رضا، 7 سنوات."
              en="Big numbers shown in the stats strip. Examples: 100+ projects, 98% satisfaction, 7 years."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("stats")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-semibold">
              {isAr ? "الإحصائيات" : "Stats"} ({data.stats.length})
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                update("stats", [
                  ...data.stats,
                  { value: "", label_ar: "", label_en: "" } as LandingStatItem,
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "إضافة" : "Add"}
            </Button>
          </div>
          {data.stats.length === 0 ? (
            <EmptyState
              isAr={isAr}
              ar="لا توجد إحصائيات مضافة — سيستخدم الـ theme الإحصائيات من إعدادات «من نحن» أو القيم الافتراضية."
              en="No stats — theme uses About Settings stats or defaults."
            />
          ) : (
            <ReorderList
              count={data.stats.length}
              onMove={(from, to) => {
                const next = [...data.stats];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                update("stats", next);
              }}
              onRemove={(i) => update("stats", data.stats.filter((_, j) => j !== i))}
              renderItem={(i) => {
                const s = data.stats[i];
                return (
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input
                      placeholder="100+"
                      value={s.value}
                      onChange={(e) => {
                        const next = [...data.stats];
                        next[i] = { ...s, value: e.target.value };
                        update("stats", next);
                      }}
                    />
                    <Input
                      placeholder={isAr ? "التسمية (AR)" : "Label (AR)"}
                      dir="rtl"
                      value={s.label_ar}
                      onChange={(e) => {
                        const next = [...data.stats];
                        next[i] = { ...s, label_ar: e.target.value };
                        update("stats", next);
                      }}
                    />
                    <Input
                      placeholder={isAr ? "التسمية (EN)" : "Label (EN)"}
                      dir="ltr"
                      value={s.label_en}
                      onChange={(e) => {
                        const next = [...data.stats];
                        next[i] = { ...s, label_en: e.target.value };
                        update("stats", next);
                      }}
                    />
                  </div>
                );
              }}
            />
          )}
        </TabsContent>

        {/* ─── FAQ ─────────────────────────────────────────── */}
        <TabsContent value="faqs" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="الأسئلة الشائعة في الصفحة الرئيسية. ترتيبها قابل للتعديل، إن تركت فارغة يستخدم الـ theme القائمة الافتراضية."
              en="FAQs on the homepage. Reorderable. If empty, theme uses defaults."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("faqs")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-semibold">FAQ ({data.faqs.length})</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                update("faqs", [
                  ...data.faqs,
                  { q_ar: "", q_en: "", a_ar: "", a_en: "" } as LandingFaqItem,
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "سؤال جديد" : "New FAQ"}
            </Button>
          </div>
          {data.faqs.length === 0 ? (
            <EmptyState
              isAr={isAr}
              ar="لا توجد أسئلة بعد — سيستخدم الـ theme القائمة الافتراضية."
              en="No FAQs — theme uses its built-in list."
            />
          ) : (
            <ReorderList
              count={data.faqs.length}
              onMove={(from, to) => {
                const next = [...data.faqs];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                update("faqs", next);
              }}
              onRemove={(i) => update("faqs", data.faqs.filter((_, j) => j !== i))}
              renderItem={(i) => {
                const f = data.faqs[i];
                return (
                  <>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder={isAr ? "السؤال (AR)" : "Question (AR)"}
                        dir="rtl"
                        value={f.q_ar}
                        onChange={(e) => {
                          const next = [...data.faqs];
                          next[i] = { ...f, q_ar: e.target.value };
                          update("faqs", next);
                        }}
                      />
                      <Input
                        placeholder={isAr ? "السؤال (EN)" : "Question (EN)"}
                        dir="ltr"
                        value={f.q_en}
                        onChange={(e) => {
                          const next = [...data.faqs];
                          next[i] = { ...f, q_en: e.target.value };
                          update("faqs", next);
                        }}
                      />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 mt-2">
                      <Textarea
                        placeholder={isAr ? "الإجابة (AR)" : "Answer (AR)"}
                        dir="rtl"
                        rows={3}
                        value={f.a_ar}
                        onChange={(e) => {
                          const next = [...data.faqs];
                          next[i] = { ...f, a_ar: e.target.value };
                          update("faqs", next);
                        }}
                      />
                      <Textarea
                        placeholder={isAr ? "الإجابة (EN)" : "Answer (EN)"}
                        dir="ltr"
                        rows={3}
                        value={f.a_en}
                        onChange={(e) => {
                          const next = [...data.faqs];
                          next[i] = { ...f, a_en: e.target.value };
                          update("faqs", next);
                        }}
                      />
                    </div>
                  </>
                );
              }}
            />
          )}
        </TabsContent>

        {/* ─── TESTIMONIALS ──────────────────────────────────────── */}
        <TabsContent value="testimonials" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="آراء العملاء التسويقية (تظهر بدلاً من التقييمات التلقائية)."
              en="Marketing testimonials (override automated reviews)."
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  update("testimonials", [
                    {
                      id: "test-" + Date.now(),
                      rating: 5,
                      comment_ar: "",
                      comment_en: "",
                      customer_name_ar: "",
                      customer_name_en: "",
                      customer_role_ar: "",
                      customer_role_en: "",
                      avatar_url: "",
                    },
                    ...data.testimonials,
                  ]);
                }}
              >
                <Plus className="h-3.5 w-3.5 me-1.5" />
                {isAr ? "إضافة رأي" : "Add Testimonial"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("testimonials")}>
                <RotateCcw className="h-3.5 w-3.5" />
                {isAr ? "إعادة تعيين" : "Reset"}
              </Button>
            </div>
          </div>
          {data.testimonials.length === 0 ? (
            <EmptyState isAr={isAr} ar="لم تتم إضافة أي آراء." en="No testimonials added yet." />
          ) : (
            <ReorderList
              count={data.testimonials.length}
              onMove={(from, to) => {
                const next = [...data.testimonials];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                update("testimonials", next);
              }}
              onRemove={(i) => {
                const next = [...data.testimonials];
                next.splice(i, 1);
                update("testimonials", next);
              }}
              renderItem={(i) => {
                const test = data.testimonials[i];
                return (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Name (AR)"
                        dir="rtl"
                        value={test.customer_name_ar}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, customer_name_ar: v };
                          update("testimonials", next);
                        }}
                      />
                      <Field
                        label="Name (EN)"
                        dir="ltr"
                        value={test.customer_name_en}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, customer_name_en: v };
                          update("testimonials", next);
                        }}
                      />
                      <Field
                        label="Role / Company (AR)"
                        dir="rtl"
                        value={test.customer_role_ar || ""}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, customer_role_ar: v };
                          update("testimonials", next);
                        }}
                      />
                      <Field
                        label="Role / Company (EN)"
                        dir="ltr"
                        value={test.customer_role_en || ""}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, customer_role_en: v };
                          update("testimonials", next);
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextareaField
                        label="Comment (AR)"
                        dir="rtl"
                        value={test.comment_ar}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, comment_ar: v };
                          update("testimonials", next);
                        }}
                      />
                      <TextareaField
                        label="Comment (EN)"
                        dir="ltr"
                        value={test.comment_en}
                        onChange={(v) => {
                          const next = [...data.testimonials];
                          next[i] = { ...test, comment_en: v };
                          update("testimonials", next);
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Rating (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={test.rating}
                          onChange={(e) => {
                            const next = [...data.testimonials];
                            next[i] = { ...test, rating: Number(e.target.value) };
                            update("testimonials", next);
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Avatar URL</Label>
                        <ImageUpload
                          value={test.avatar_url || null}
                          onChange={(url) => {
                            const next = [...data.testimonials];
                            next[i] = { ...test, avatar_url: url ?? "" };
                            update("testimonials", next);
                          }}
                          uploadAction={uploadHeroSlideImageAction}
                          locale={locale}
                        />
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </TabsContent>

        {/* ─── SECTION CONTENT ────────────────────────────────────── */}
        <TabsContent value="section_content" className="pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <InfoBox
              isAr={isAr}
              ar="تخصيص نصوص الأقسام. اترك الحقل فارغاً للرجوع للنص الافتراضي للـ Theme."
              en="Customize section copy. Leave empty to fallback to theme defaults."
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => resetTab("section_content")}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "إعادة تعيين" : "Reset"}
            </Button>
          </div>
          <div className="grid gap-6">
            {SECTIONS.filter((s) => s.id !== "hero").map((s) => {
              const inTheme = s.themes.includes(themeId);
              if (!inTheme) return null;
              const ov = data.section_overrides[s.id] || {};
              return (
                <div key={s.id} className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{isAr ? s.ar : s.en}</span>
                    <code className="text-[10px] bg-muted px-1.5 rounded ms-auto">{s.id}</code>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Title (AR)"
                      dir="rtl"
                      value={ov.title_ar || ""}
                      onChange={(v) => {
                        update("section_overrides", {
                          ...data.section_overrides,
                          [s.id]: { ...ov, title_ar: v },
                        });
                      }}
                    />
                    <Field
                      label="Title (EN)"
                      dir="ltr"
                      value={ov.title_en || ""}
                      onChange={(v) => {
                        update("section_overrides", {
                          ...data.section_overrides,
                          [s.id]: { ...ov, title_en: v },
                        });
                      }}
                    />
                    <TextareaField
                      label="Subtitle (AR)"
                      dir="rtl"
                      value={ov.subtitle_ar || ""}
                      onChange={(v) => {
                        update("section_overrides", {
                          ...data.section_overrides,
                          [s.id]: { ...ov, subtitle_ar: v },
                        });
                      }}
                    />
                    <TextareaField
                      label="Subtitle (EN)"
                      dir="ltr"
                      value={ov.subtitle_en || ""}
                      onChange={(v) => {
                        update("section_overrides", {
                          ...data.section_overrides,
                          [s.id]: { ...ov, subtitle_en: v },
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 px-6 py-3 border-t bg-card/95 backdrop-blur z-10 flex flex-wrap items-center justify-between gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isAr ? "عاين الموقع العام" : "Preview public site"}
        </a>
        <div className="flex items-center gap-2">
          {dirty && (
            <Badge variant="secondary" className="text-[10px]">
              {isAr ? "تغييرات غير محفوظة" : "unsaved changes"}
            </Badge>
          )}
          <Button type="button" variant="ghost" onClick={onResetAll} disabled={isPending || !dirty}>
            <RotateCcw className="h-3.5 w-3.5" />
            {isAr ? "تراجع عن الكل" : "Reset all"}
          </Button>
          <Button type="button" onClick={onSave} disabled={isPending || !dirty}>
            <Save className="h-4 w-4" />
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ التغييرات" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SummaryChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "violet" | "emerald" | "sky" | "amber";
}) {
  const accentClasses: Record<typeof accent, string> = {
    violet: "from-violet-100 to-violet-200 text-violet-700 border-violet-200",
    emerald: "from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-200",
    sky: "from-sky-100 to-sky-200 text-sky-700 border-sky-200",
    amber: "from-amber-100 to-amber-200 text-amber-700 border-amber-200",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <span
        className={cn(
          "grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br border",
          accentClasses[accent]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-base font-semibold capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

function ReorderList({
  count,
  onMove,
  onRemove,
  renderItem,
}: {
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  renderItem: (i: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
            <div className="ms-auto flex items-center gap-0.5">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={i === 0}
                onClick={() => onMove(i, i - 1)}
                aria-label="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={i === count - 1}
                onClick={() => onMove(i, i + 1)}
                aria-label="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onRemove(i)}
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
          {renderItem(i)}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  dir,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  dir: "rtl" | "ltr";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({
  label,
  dir,
  value,
  onChange,
}: {
  label: string;
  dir: "rtl" | "ltr";
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Textarea dir={dir} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function InfoBox({ isAr, ar, en }: { isAr: boolean; ar: string; en: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/30 border p-3 flex-1 min-w-0">
      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">{isAr ? ar : en}</p>
    </div>
  );
}

function EmptyState({ isAr, ar, en }: { isAr: boolean; ar: string; en: string }) {
  return (
    <p className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
      {isAr ? ar : en}
    </p>
  );
}
