"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, X, ChevronUp, ChevronDown, Star } from "lucide-react";
import type { LandingSettings, LandingPricingPlan } from "@/lib/validators/settings";

function uid() {
  return `plan-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultPlans: LandingPricingPlan[] = [
  {
    id: uid(),
    name_ar: "باقة التشغيل والبدء",
    name_en: "Startup Launch",
    description_ar: "مثالية لإطلاق أول مشروع ويب أو صفحة هبوط لشركتك الناشئة.",
    description_en: "Perfect for launching a custom high-performance landing page or MVP.",
    price_monthly: 499,
    price_yearly: 399,
    features_ar: [
      "تصميم وتطوير صفحة هبوط مخصصة",
      "لوحة تحكم إدارة محتوى مصغرة",
      "تهيئة مجانية لأمان SSL وسرعة CDN",
    ],
    features_en: [
      "Single-page responsive design & code",
      "Sleek CMS control dashboard",
      "Free SSL validation & CDN routing",
    ],
    is_popular: false,
    cta_label_ar: "اختر باقة البدء",
    cta_label_en: "Get Startup Track",
  },
];

export function PricingEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "pricing";
  const isAr = locale === "ar";

  const overrides = data.section_overrides[sectionId] || {};
  const plans = data.pricing_plans ?? [];

  function updateOverride(key: string, value: string) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: { ...overrides, [key]: value },
      },
    });
  }

  function setPlans(next: LandingPricingPlan[]) {
    setData({ ...data, pricing_plans: next });
  }

  function updatePlan(idx: number, patch: Partial<LandingPricingPlan>) {
    setPlans(plans.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function addPlan() {
    const next: LandingPricingPlan = {
      id: uid(),
      name_ar: "باقة جديدة",
      name_en: "New Plan",
      description_ar: "وصف الباقة",
      description_en: "Plan description",
      price_monthly: 0,
      price_yearly: 0,
      features_ar: [],
      features_en: [],
      is_popular: false,
      cta_label_ar: "اطلب الآن",
      cta_label_en: "Get Started",
    };
    setPlans([...plans, next]);
  }

  function removePlan(idx: number) {
    setPlans(plans.filter((_, i) => i !== idx));
  }

  function movePlan(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= plans.length) return;
    const next = [...plans];
    [next[idx], next[target]] = [next[target], next[idx]];
    setPlans(next);
  }

  function loadDefaults() {
    if (plans.length === 0 || confirm(isAr ? "هل تريد استبدال الباقات الحالية بالقيم الافتراضية؟" : "Replace current plans with defaults?")) {
      setPlans(defaultPlans.map((p) => ({ ...p, id: uid() })));
    }
  }

  return (
    <SectionEditorShell
      titleAr="تعديل باقات الأسعار"
      titleEn="Edit Pricing Plans"
      descriptionAr="تحكم كامل في عناوين القسم وكل باقات الأسعار"
      descriptionEn="Full control over section headings and pricing plans"
      locale={locale}
      data={data}
      setData={setData}
    >
      <div className="space-y-8">
        {/* Headings */}
        <section className="space-y-4">
          <h3 className="font-semibold text-base">
            {isAr ? "النصوص الرئيسية للقسم" : "Section Headings"}
          </h3>
          <BilingualInput
            labelAr="العنوان الفرعي / التصنيف العلوي"
            labelEn="Subtitle / Top Badge"
            valAr={overrides.subtitle_ar ?? ""}
            valEn={overrides.subtitle_en ?? ""}
            onChangeAr={(v) => updateOverride("subtitle_ar", v)}
            onChangeEn={(v) => updateOverride("subtitle_en", v)}
          />
          <BilingualInput
            labelAr="العنوان الرئيسي"
            labelEn="Heading"
            valAr={overrides.title_ar ?? ""}
            valEn={overrides.title_en ?? ""}
            onChangeAr={(v) => updateOverride("title_ar", v)}
            onChangeEn={(v) => updateOverride("title_en", v)}
          />
          <BilingualInput
            labelAr="الوصف"
            labelEn="Description"
            valAr={overrides.description_ar ?? ""}
            valEn={overrides.description_en ?? ""}
            onChangeAr={(v) => updateOverride("description_ar", v)}
            onChangeEn={(v) => updateOverride("description_en", v)}
            type="textarea"
            rows={3}
          />
        </section>

        {/* Plans list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-base">
                {isAr ? "باقات الأسعار" : "Pricing Plans"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "أضف، عدل، أو احذف باقات الأسعار التي تظهر في الصفحة الرئيسية."
                  : "Add, edit, or remove pricing plans shown on the homepage."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadDefaults}>
                {isAr ? "تحميل الافتراضي" : "Load Defaults"}
              </Button>
              <Button type="button" size="sm" onClick={addPlan}>
                <Plus className="h-4 w-4 me-1" />
                {isAr ? "إضافة باقة" : "Add Plan"}
              </Button>
            </div>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {isAr
                  ? "لا توجد باقات مخصصة — يستخدم القالب الباقات الافتراضية."
                  : "No custom plans yet — theme uses built-in defaults."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <PlanCard
                  key={plan.id || idx}
                  plan={plan}
                  idx={idx}
                  total={plans.length}
                  isAr={isAr}
                  onChange={(patch) => updatePlan(idx, patch)}
                  onRemove={() => removePlan(idx)}
                  onMove={(dir) => movePlan(idx, dir)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </SectionEditorShell>
  );
}

function PlanCard({
  plan,
  idx,
  total,
  isAr,
  onChange,
  onRemove,
  onMove,
}: {
  plan: LandingPricingPlan;
  idx: number;
  total: number;
  isAr: boolean;
  onChange: (patch: Partial<LandingPricingPlan>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  function setFeatures(field: "features_ar" | "features_en", value: string) {
    const items = value.split("\n").map((s) => s.trim()).filter(Boolean);
    onChange({ [field]: items } as Partial<LandingPricingPlan>);
  }

  return (
    <Card className={plan.is_popular ? "border-primary/50 shadow-sm" : ""}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {isAr ? "باقة" : "Plan"} #{idx + 1}
            </span>
            {plan.is_popular && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Star className="h-3 w-3" />
                {isAr ? "الأكثر اختياراً" : "Popular"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={idx === 0}
              onClick={() => onMove(-1)}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={idx === total - 1}
              onClick={() => onMove(1)}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <BilingualInput
          labelAr="اسم الباقة"
          labelEn="Plan Name"
          valAr={plan.name_ar}
          valEn={plan.name_en}
          onChangeAr={(v) => onChange({ name_ar: v })}
          onChangeEn={(v) => onChange({ name_en: v })}
        />

        <BilingualInput
          labelAr="وصف الباقة"
          labelEn="Plan Description"
          valAr={plan.description_ar}
          valEn={plan.description_en}
          onChangeAr={(v) => onChange({ description_ar: v })}
          onChangeEn={(v) => onChange({ description_en: v })}
          type="textarea"
          rows={2}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {isAr ? "السعر الشهري (اتركه فارغاً لإظهار «طلب عرض سعر»)" : "Monthly Price (leave empty for «Custom Quote»)"}
            </Label>
            <Input
              type="number"
              value={plan.price_monthly ?? ""}
              onChange={(e) =>
                onChange({
                  price_monthly: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              {isAr ? "السعر السنوي (شهرياً)" : "Yearly Price (per month)"}
            </Label>
            <Input
              type="number"
              value={plan.price_yearly ?? ""}
              onChange={(e) =>
                onChange({
                  price_yearly: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "المميزات (سطر لكل ميزة)" : "Features (one per line)"}</Label>
            <Textarea
              dir="rtl"
              rows={5}
              value={plan.features_ar.join("\n")}
              onChange={(e) => setFeatures("features_ar", e.target.value)}
              placeholder={isAr ? "ميزة 1\nميزة 2\nميزة 3" : ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Features (one per line)</Label>
            <Textarea
              dir="ltr"
              rows={5}
              value={plan.features_en.join("\n")}
              onChange={(e) => setFeatures("features_en", e.target.value)}
              placeholder={"Feature 1\nFeature 2\nFeature 3"}
            />
          </div>
        </div>

        <BilingualInput
          labelAr="نص زر الإجراء (CTA)"
          labelEn="CTA Button Label"
          valAr={plan.cta_label_ar}
          valEn={plan.cta_label_en}
          onChangeAr={(v) => onChange({ cta_label_ar: v })}
          onChangeEn={(v) => onChange({ cta_label_en: v })}
        />

        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold">
              {isAr ? "إبراز كباقة مميزة" : "Mark as Popular"}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? "ستظهر هذه الباقة بإطار مميز وشارة «الأكثر اختياراً»."
                : "Highlighted with a featured ring and a «Most Selected» badge."}
            </p>
          </div>
          <Switch
            checked={plan.is_popular}
            onCheckedChange={(v) => onChange({ is_popular: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
