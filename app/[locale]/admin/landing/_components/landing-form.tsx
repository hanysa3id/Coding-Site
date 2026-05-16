"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import {
  landingSettingsSchema,
  type LandingSettings,
  type LandingFaqItem,
  type LandingNavItem,
  type LandingSectionId,
} from "@/lib/validators/settings";
import { saveLandingSettingsAction } from "../../settings/actions";
import type { ThemeId } from "@/themes";

// ─── Canonical sections + which themes use which ────────────────────────────
// This tells the admin which theme(s) actually render the section. Sections
// the active theme does not have show a "not in this theme" hint so users
// don't toggle and wonder why nothing changes.
const SECTIONS: {
  id: LandingSectionId;
  ar: string;
  en: string;
  description_ar: string;
  description_en: string;
  themes: ThemeId[];
}[] = [
  {
    id: "hero",
    ar: "البطل (Hero)",
    en: "Hero",
    description_ar: "القسم الأول الذي يراه الزائر — العنوان والـ CTAs.",
    description_en: "First-screen — headline + primary CTAs.",
    themes: ["classic", "aurora", "nova", "sky"],
  },
  {
    id: "logo_cloud",
    ar: "شعارات العملاء",
    en: "Logo cloud",
    description_ar: "شريط متحرك بأسماء/شعارات الشركات.",
    description_en: "Marquee strip of client names / logos.",
    themes: ["aurora", "nova", "sky"],
  },
  {
    id: "features",
    ar: "المميزات / Bento",
    en: "Features / Bento",
    description_ar: "بطاقات تشرح ما الذي يميزك.",
    description_en: "Cards explaining what makes you different.",
    themes: ["classic", "aurora", "nova"],
  },
  {
    id: "stats",
    ar: "الإحصائيات",
    en: "Stats",
    description_ar: "أرقام بارزة (مشاريع، عملاء، سنوات).",
    description_en: "Big numbers (projects, clients, years).",
    themes: ["aurora", "sky"],
  },
  {
    id: "services",
    ar: "الخدمات",
    en: "Services",
    description_ar: "قائمة الخدمات المعروضة (تُسحب من DB).",
    description_en: "Service offerings (pulled from DB).",
    themes: ["classic", "aurora", "nova", "sky"],
  },
  {
    id: "process",
    ar: "خطوات العمل",
    en: "Process steps",
    description_ar: "كيف نعمل — 4 مراحل من البداية للتسليم.",
    description_en: "How we work — 4 stages from start to finish.",
    themes: ["aurora", "sky"],
  },
  {
    id: "portfolio",
    ar: "معرض الأعمال",
    en: "Portfolio",
    description_ar: "آخر المشاريع المنجزة (من DB).",
    description_en: "Recent projects (from DB).",
    themes: ["aurora", "sky"],
  },
  {
    id: "testimonials",
    ar: "آراء العملاء",
    en: "Testimonials",
    description_ar: "شهادات العملاء (من الـ reviews أو بديل).",
    description_en: "Customer quotes (from reviews or fallback).",
    themes: ["aurora", "nova", "sky"],
  },
  {
    id: "pricing",
    ar: "الأسعار",
    en: "Pricing",
    description_ar: "ثلاث باقات بأسعار شفافة.",
    description_en: "Three transparent pricing tiers.",
    themes: ["aurora"],
  },
  {
    id: "team",
    ar: "فريق العمل + الرسالة/الرؤية",
    en: "Team + Mission/Vision",
    description_ar: "أعضاء الفريق + رسالة الشركة + إحصائيات.",
    description_en: "Team members + mission + stats.",
    themes: ["sky"],
  },
  {
    id: "blog",
    ar: "آخر المقالات",
    en: "Blog",
    description_ar: "آخر 3 مقالات منشورة من المدونة.",
    description_en: "Latest 3 published blog posts.",
    themes: ["aurora", "sky"],
  },
  {
    id: "faq",
    ar: "الأسئلة الشائعة",
    en: "FAQ",
    description_ar: "قسم الأسئلة الشائعة بـ accordion.",
    description_en: "FAQ accordion section.",
    themes: ["aurora", "sky"],
  },
  {
    id: "newsletter",
    ar: "النشرة البريدية",
    en: "Newsletter",
    description_ar: "نموذج اشتراك في النشرة الأسبوعية.",
    description_en: "Weekly newsletter signup form.",
    themes: ["aurora"],
  },
  {
    id: "cta",
    ar: "دعوة للعمل",
    en: "Final CTA",
    description_ar: "قسم تحفيز أخير لبدء مشروع.",
    description_en: "Final conversion strip before footer.",
    themes: ["aurora", "nova", "sky"],
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

  const initialParsed: LandingSettings = (() => {
    if (!initial) return emptyState();
    const parsed = landingSettingsSchema.safeParse(initial);
    return parsed.success ? parsed.data : emptyState();
  })();

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

  function onReset() {
    setData(initialParsed);
    toast.info(isAr ? "أعيد التعيين للحالة المحفوظة" : "Reset to saved state");
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sections">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="sections">{isAr ? "الأقسام" : "Sections"}</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="nav">{isAr ? "شريط التنقل" : "Nav Bar"}</TabsTrigger>
          <TabsTrigger value="logos">{isAr ? "الشعارات" : "Logos"}</TabsTrigger>
          <TabsTrigger value="faqs">FAQ</TabsTrigger>
        </TabsList>

        {/* ─── SECTIONS ─────────────────────────────────────── */}
        <TabsContent value="sections" className="pt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "أظهر أو أخفِ أي قسم من الصفحة الرئيسية. الأقسام غير الموجودة في Theme الحالي يُشار إليها."
              : "Show or hide any section of the homepage. Sections not present in the active theme are flagged."}
          </p>
          <div className="grid gap-2">
            {SECTIONS.map((s) => {
              const inTheme = s.themes.includes(themeId);
              const visible = data.sections[s.id] !== false;
              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    inTheme ? "" : "opacity-60"
                  }`}
                >
                  <Switch
                    checked={visible}
                    onCheckedChange={(v) =>
                      update("sections", { ...data.sections, [s.id]: v })
                    }
                    disabled={!inTheme}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {visible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <Label className="font-medium">{isAr ? s.ar : s.en}</Label>
                      {!inTheme && (
                        <Badge variant="outline" className="text-[10px]">
                          {isAr ? "غير موجود في هذا الـ theme" : "not in this theme"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {isAr ? s.description_ar : s.description_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── HERO ─────────────────────────────────────────── */}
        <TabsContent value="hero" className="pt-6 space-y-5">
          <InfoBox
            isAr={isAr}
            ar="عدّل عنوان البطل والـ CTAs. الحقول الفارغة ترجع للنص الافتراضي في الـ Theme."
            en="Edit hero headline and CTAs. Empty fields fall back to the theme defaults."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={isAr ? "Badge (AR)" : "Badge (AR)"}
              dir="rtl"
              value={data.hero.badge_ar ?? ""}
              onChange={(v) => update("hero", { ...data.hero, badge_ar: v })}
            />
            <Field
              label={isAr ? "Badge (EN)" : "Badge (EN)"}
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

          {/* Primary CTA */}
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

          {/* Secondary CTA */}
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

        {/* ─── NAV BAR ──────────────────────────────────────── */}
        <TabsContent value="nav" className="pt-6 space-y-5">
          <InfoBox
            isAr={isAr}
            ar="تحكم في عناصر القائمة العلوية. يمكنك إخفاء أي رابط افتراضي وإضافة بنود مخصصة."
            en="Control the top nav items. Hide any default link or add your own."
          />
          <div className="space-y-2">
            <Label className="font-semibold">
              {isAr ? "الروابط الافتراضية" : "Default links"}
            </Label>
            <div className="grid gap-2">
              {(
                [
                  { key: "show_services", ar: "الخدمات", en: "Services" },
                  { key: "show_portfolio", ar: "أعمالنا", en: "Portfolio" },
                  { key: "show_blog", ar: "المدونة", en: "Blog" },
                  { key: "show_about", ar: "من نحن", en: "About" },
                  { key: "show_contact", ar: "اتصل بنا", en: "Contact" },
                ] as const
              ).map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Label className="text-sm">{isAr ? n.ar : n.en}</Label>
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
                {isAr ? "بنود مخصصة" : "Custom items"}
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
              <p className="text-sm text-muted-foreground border rounded-lg p-4">
                {isAr ? "لا توجد بنود مخصصة بعد" : "No custom items yet"}
              </p>
            ) : (
              <div className="space-y-2">
                {data.nav.custom_items.map((item, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{i + 1}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="ms-auto h-7 w-7"
                        onClick={() =>
                          update("nav", {
                            ...data.nav,
                            custom_items: data.nav.custom_items.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── LOGO CLOUD ───────────────────────────────────── */}
        <TabsContent value="logos" className="pt-6 space-y-4">
          <InfoBox
            isAr={isAr}
            ar="أسماء الشركات/العلامات التي تعمل معك. إن تركت القائمة فارغة، يستخدم الـ Theme أسماء العملاء من جدول معرض الأعمال + أسماء افتراضية."
            en="Brand names you have worked with. If empty, the theme falls back to client_name from the portfolio table + stylized fillers."
          />
          <div className="flex items-center justify-between">
            <Label className="font-semibold">
              {isAr ? "الشعارات" : "Logos"} ({data.logos.length})
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => update("logos", [...data.logos, ""])}
            >
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "إضافة" : "Add"}
            </Button>
          </div>
          {data.logos.length === 0 ? (
            <p className="text-sm text-muted-foreground border rounded-lg p-4">
              {isAr
                ? "لا توجد شعارات مضافة — سيستخدم الـ theme أسماء افتراضية."
                : "No logos added — theme will use defaults."}
            </p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {data.logos.map((logo, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={logo}
                    onChange={(e) => {
                      const next = [...data.logos];
                      next[i] = e.target.value;
                      update("logos", next);
                    }}
                    placeholder={isAr ? "اسم الشركة" : "Brand name"}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      update(
                        "logos",
                        data.logos.filter((_, j) => j !== i)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── FAQ ─────────────────────────────────────────── */}
        <TabsContent value="faqs" className="pt-6 space-y-4">
          <InfoBox
            isAr={isAr}
            ar="الأسئلة الشائعة في الصفحة الرئيسية. إن تركت فارغة، يستخدم الـ theme قائمة افتراضية."
            en="FAQs shown on the homepage. If empty, the theme uses its built-in default list."
          />
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
            <p className="text-sm text-muted-foreground border rounded-lg p-4">
              {isAr ? "لا توجد أسئلة بعد — سيستخدم الـ theme القائمة الافتراضية." : "No FAQs yet — theme will use defaults."}
            </p>
          ) : (
            <div className="space-y-3">
              {data.faqs.map((f, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Q #{i + 1}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() =>
                        update("faqs", data.faqs.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
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
                  <div className="grid gap-2 md:grid-cols-2">
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isAr ? "افتح الموقع العام" : "Open public site"}
        </a>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onReset} disabled={isPending}>
            <RotateCcw className="h-3.5 w-3.5" />
            {isAr ? "تراجع" : "Reset"}
          </Button>
          <Button type="button" onClick={onSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ التغييرات" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────

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
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/30 border p-3">
      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {isAr ? ar : en}
      </p>
    </div>
  );
}
