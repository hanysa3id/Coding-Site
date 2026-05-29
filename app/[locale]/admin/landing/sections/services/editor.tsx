"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Code2,
  Palette,
  TrendingUp,
  Share2,
  CloudLightning,
  ShieldAlert,
  GraduationCap,
  Wrench,
  Rocket,
} from "lucide-react";
import type { LandingSettings, LandingServicePillar } from "@/lib/validators/settings";

const ICON_OPTIONS = [
  { value: "Code2", label: "Code", Icon: Code2 },
  { value: "Palette", label: "Palette", Icon: Palette },
  { value: "TrendingUp", label: "Trending", Icon: TrendingUp },
  { value: "Share2", label: "Share", Icon: Share2 },
  { value: "CloudLightning", label: "Cloud", Icon: CloudLightning },
  { value: "ShieldAlert", label: "Shield", Icon: ShieldAlert },
  { value: "GraduationCap", label: "Education", Icon: GraduationCap },
  { value: "Wrench", label: "Wrench", Icon: Wrench },
  { value: "Rocket", label: "Rocket", Icon: Rocket },
];

const BUCKET_OPTIONS: Array<{
  value: "build" | "grow" | "maintain";
  labelAr: string;
  labelEn: string;
}> = [
  { value: "build", labelAr: "بناء", labelEn: "Build" },
  { value: "grow", labelAr: "نمو", labelEn: "Grow" },
  { value: "maintain", labelAr: "صيانة", labelEn: "Maintain" },
];

function uid() {
  return `pillar-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultPillars: LandingServicePillar[] = [
  {
    id: uid(),
    bucket: "build",
    title_ar: "🚀 هندسة وبناء المنتجات (Build)",
    title_en: "🚀 Build & Engineer",
    description_ar: "برمجة وبناء وتصميم الأنظمة والمنصات الرقمية بأقوى البنى الهندسية المعاصرة.",
    description_en: "Building robust backend systems, frontend client apps, and high-converting UI blueprints.",
    icon_name: "Code2",
    glow_color: "rgba(6, 182, 212, 0.25)",
  },
  {
    id: uid(),
    bucket: "grow",
    title_ar: "📈 تسويق ومضاعفة النمو (Grow)",
    title_en: "📈 Scale & Grow",
    description_ar: "إدارة وتخطيط الحملات الإعلانية ومحركات البحث لزيادة عدد عملائك ومبيعاتك.",
    description_en: "Performance marketing, conversion funnel architecture, ads management, and brand scaling.",
    icon_name: "TrendingUp",
    glow_color: "rgba(16, 185, 129, 0.25)",
  },
  {
    id: uid(),
    bucket: "maintain",
    title_ar: "🛠 تشغيل وصيانة مستمرة (Maintain)",
    title_en: "🛠 Support & Maintain",
    description_ar: "استضافات سحابية آمنة، اختبارات حقيقية للجودة ودعم فني متواصل 24/7.",
    description_en: "DevOps cloud scaling, QA automation, secure staging audits, and permanent code support.",
    icon_name: "CloudLightning",
    glow_color: "rgba(251, 191, 36, 0.25)",
  },
];

export function ServicesEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "services";
  const isAr = locale === "ar";

  const overrides = data.section_overrides[sectionId] || {};
  const pillars = data.services_pillars ?? [];

  function updateOverride(key: string, value: string) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: { ...overrides, [key]: value },
      },
    });
  }

  function setPillars(next: LandingServicePillar[]) {
    setData({ ...data, services_pillars: next });
  }

  function updatePillar(idx: number, patch: Partial<LandingServicePillar>) {
    setPillars(pillars.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function addPillar() {
    const next: LandingServicePillar = {
      id: uid(),
      bucket: "build",
      title_ar: "باقة جديدة",
      title_en: "New Pillar",
      description_ar: "وصف الباقة",
      description_en: "Pillar description",
      icon_name: "Code2",
      glow_color: "rgba(6, 182, 212, 0.25)",
    };
    setPillars([...pillars, next]);
  }

  function removePillar(idx: number) {
    setPillars(pillars.filter((_, i) => i !== idx));
  }

  function movePillar(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= pillars.length) return;
    const next = [...pillars];
    [next[idx], next[target]] = [next[target], next[idx]];
    setPillars(next);
  }

  function loadDefaults() {
    if (pillars.length === 0 || confirm(isAr ? "هل تريد استبدال الباقات الحالية بالقيم الافتراضية؟" : "Replace current pillars with defaults?")) {
      setPillars(defaultPillars.map((p) => ({ ...p, id: uid() })));
    }
  }

  return (
    <SectionEditorShell
      titleAr="تعديل باقات الخدمات"
      titleEn="Edit Service Pillars"
      descriptionAr="تحكم في عناوين القسم وفي باقات الخدمات الثلاث (بناء / نمو / صيانة)"
      descriptionEn="Manage section headings and the three service pillars (Build / Grow / Maintain)"
      locale={locale}
      data={data}
      setData={setData}
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="font-semibold text-base">
            {isAr ? "النصوص الرئيسية للقسم" : "Section Headings"}
          </h3>
          <BilingualInput
            labelAr="العنوان الفرعي / التصنيف العلوي"
            labelEn="Subtitle / Top Badge"
            valAr={overrides.title_ar ?? ""}
            valEn={overrides.title_en ?? ""}
            onChangeAr={(v) => updateOverride("title_ar", v)}
            onChangeEn={(v) => updateOverride("title_en", v)}
          />
          <BilingualInput
            labelAr="العنوان الرئيسي"
            labelEn="Heading"
            valAr={overrides.subtitle_ar ?? ""}
            valEn={overrides.subtitle_en ?? ""}
            onChangeAr={(v) => updateOverride("subtitle_ar", v)}
            onChangeEn={(v) => updateOverride("subtitle_en", v)}
            type="textarea"
            rows={2}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-base">
                {isAr ? "باقات الخدمات (Build / Grow / Maintain)" : "Service Pillars (Build / Grow / Maintain)"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "كل باقة تجمع تحتها الخدمات حسب التصنيف. ترتبط الخدمات تلقائياً عبر الكلمات المفتاحية."
                  : "Each pillar groups services by category. Services map automatically by keyword."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadDefaults}>
                {isAr ? "تحميل الافتراضي" : "Load Defaults"}
              </Button>
              <Button type="button" size="sm" onClick={addPillar}>
                <Plus className="h-4 w-4 me-1" />
                {isAr ? "إضافة باقة" : "Add Pillar"}
              </Button>
            </div>
          </div>

          {pillars.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {isAr
                  ? "لا توجد باقات مخصصة — يستخدم القالب الباقات الثلاث الافتراضية."
                  : "No custom pillars yet — theme uses the 3 built-in defaults."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pillars.map((pillar, idx) => (
                <PillarCard
                  key={pillar.id || idx}
                  pillar={pillar}
                  idx={idx}
                  total={pillars.length}
                  isAr={isAr}
                  onChange={(patch) => updatePillar(idx, patch)}
                  onRemove={() => removePillar(idx)}
                  onMove={(dir) => movePillar(idx, dir)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </SectionEditorShell>
  );
}

function PillarCard({
  pillar,
  idx,
  total,
  isAr,
  onChange,
  onRemove,
  onMove,
}: {
  pillar: LandingServicePillar;
  idx: number;
  total: number;
  isAr: boolean;
  onChange: (patch: Partial<LandingServicePillar>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const ActiveIcon = ICON_OPTIONS.find((o) => o.value === pillar.icon_name)?.Icon ?? Code2;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center border border-border"
              style={{ background: pillar.glow_color }}
            >
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {isAr ? "الباقة" : "Pillar"} #{idx + 1}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                {pillar.bucket}
              </span>
            </div>
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "التصنيف" : "Bucket"}</Label>
            <Select
              value={pillar.bucket}
              onValueChange={(v) => onChange({ bucket: v as "build" | "grow" | "maintain" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUCKET_OPTIONS.map(({ value, labelAr, labelEn }) => (
                  <SelectItem key={value} value={value}>
                    {isAr ? labelAr : labelEn} ({value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "الأيقونة" : "Icon"}</Label>
            <Select value={pillar.icon_name} onValueChange={(v) => onChange({ icon_name: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(({ value, label, Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "لون التوهج" : "Glow Color"}</Label>
            <Input
              value={pillar.glow_color}
              onChange={(e) => onChange({ glow_color: e.target.value })}
              placeholder="rgba(6, 182, 212, 0.25)"
            />
          </div>
        </div>

        <BilingualInput
          labelAr="عنوان الباقة"
          labelEn="Pillar Title"
          valAr={pillar.title_ar}
          valEn={pillar.title_en}
          onChangeAr={(v) => onChange({ title_ar: v })}
          onChangeEn={(v) => onChange({ title_en: v })}
        />

        <BilingualInput
          labelAr="وصف الباقة"
          labelEn="Pillar Description"
          valAr={pillar.description_ar}
          valEn={pillar.description_en}
          onChangeAr={(v) => onChange({ description_ar: v })}
          onChangeEn={(v) => onChange({ description_en: v })}
          type="textarea"
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
