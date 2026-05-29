"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import { Button } from "@/components/ui/button";
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
  ClipboardList,
  LayoutTemplate,
  Braces,
  ShieldAlert,
  Cloud,
  LineChart,
  Sparkles,
  Rocket,
  Settings,
  Wrench,
} from "lucide-react";
import type { LandingSettings, LandingProcessStep } from "@/lib/validators/settings";

const ICON_OPTIONS = [
  { value: "ClipboardList", label: "Clipboard", Icon: ClipboardList },
  { value: "LayoutTemplate", label: "Layout", Icon: LayoutTemplate },
  { value: "Braces", label: "Code", Icon: Braces },
  { value: "ShieldAlert", label: "Shield", Icon: ShieldAlert },
  { value: "Cloud", label: "Cloud", Icon: Cloud },
  { value: "LineChart", label: "Chart", Icon: LineChart },
  { value: "Sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "Rocket", label: "Rocket", Icon: Rocket },
  { value: "Settings", label: "Settings", Icon: Settings },
  { value: "Wrench", label: "Wrench", Icon: Wrench },
];

function uid() {
  return `step-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultSteps: LandingProcessStep[] = [
  {
    id: uid(),
    icon_name: "ClipboardList",
    title_ar: "التخطيط ودرء المخاطر",
    title_en: "Strategy & Risk Assessment",
    description_ar: "نجتمع لمناقشة أهدافك وتحليل المتطلبات لتحديد نطاق عمل وهيكل واضح.",
    description_en: "Initial brainstorming sessions, target definition, and architectural planning.",
  },
  {
    id: uid(),
    icon_name: "LayoutTemplate",
    title_ar: "التصميم وتجربة المستخدم",
    title_en: "UX/UI Wireframing & Prototypes",
    description_ar: "تصميم واجهات المستخدم البصرية وإعداد هياكل تفاعلية توضح رحلة المستخدم.",
    description_en: "Interactive digital blueprint mockups designed to maximize visual user conversion.",
  },
  {
    id: uid(),
    icon_name: "Braces",
    title_ar: "البرمجة والتطوير الفعلي",
    title_en: "Development & Engineering",
    description_ar: "كتابة كود برمجي نظيف ومتوافق مع محركات البحث وقابل للتوسع.",
    description_en: "Modern client framework styling, server logic coding, and clean engineering standards.",
  },
  {
    id: uid(),
    icon_name: "ShieldAlert",
    title_ar: "فحص الجودة والأمان",
    title_en: "Quality Audits & Security Checks",
    description_ar: "اختبارات جودة وأمان صارمة وتصحيح الثغرات لضمان سلامة موقعك.",
    description_en: "Automated end-to-end tests, safety audits, and cross-browser sanity reviews.",
  },
  {
    id: uid(),
    icon_name: "Cloud",
    title_ar: "الإطلاق والتهيئة السحابية",
    title_en: "Cloud Deploy & Server Setup",
    description_ar: "تهيئة السيرفرات السحابية وشبكات توزيع المحتوى لإطلاق آمن وسريع.",
    description_en: "DevOps production pipelines, SSL binding, and high-availability setups.",
  },
  {
    id: uid(),
    icon_name: "LineChart",
    title_ar: "التحليل والتطوير المستمر",
    title_en: "Continuous Scaling & SEO Optimize",
    description_ar: "تتبع سلوك الزوار وتحسين سرعة الصفحة لرفع الترتيب ومضاعفة المبيعات.",
    description_en: "Weekly analytics audits, SEO tweaks, and organic traffic upgrades.",
  },
];

export function ProcessstepsEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "process";
  const isAr = locale === "ar";

  const overrides = data.section_overrides[sectionId] || {};
  const steps = data.process_steps ?? [];

  function updateOverride(key: string, value: string) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: { ...overrides, [key]: value },
      },
    });
  }

  function setSteps(next: LandingProcessStep[]) {
    setData({ ...data, process_steps: next });
  }

  function updateStep(idx: number, patch: Partial<LandingProcessStep>) {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addStep() {
    const next: LandingProcessStep = {
      id: uid(),
      icon_name: "Sparkles",
      title_ar: "خطوة جديدة",
      title_en: "New Step",
      description_ar: "وصف الخطوة",
      description_en: "Step description",
    };
    setSteps([...steps, next]);
  }

  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function moveStep(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSteps(next);
  }

  function loadDefaults() {
    if (steps.length === 0 || confirm(isAr ? "هل تريد استبدال الخطوات الحالية بالقيم الافتراضية؟" : "Replace current steps with defaults?")) {
      setSteps(defaultSteps.map((s) => ({ ...s, id: uid() })));
    }
  }

  return (
    <SectionEditorShell
      titleAr="تعديل منهجية العمل"
      titleEn="Edit Process / How We Work"
      descriptionAr="تحكم في عناوين القسم وكل خطوة من خطوات منهجية العمل"
      descriptionEn="Manage section headings and the steps of your methodology"
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
            labelAr="العنوان الرئيسي"
            labelEn="Heading"
            valAr={overrides.title_ar ?? ""}
            valEn={overrides.title_en ?? ""}
            onChangeAr={(v) => updateOverride("title_ar", v)}
            onChangeEn={(v) => updateOverride("title_en", v)}
          />
          <BilingualInput
            labelAr="العنوان الفرعي"
            labelEn="Subtitle"
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
                {isAr ? "خطوات العمل (المنهجية)" : "Process Steps"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "أضف، عدل، أو احذف خطوات المنهجية التي تظهر على الجدول الزمني."
                  : "Add, edit, or remove the steps shown on the timeline."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadDefaults}>
                {isAr ? "تحميل الافتراضي" : "Load Defaults"}
              </Button>
              <Button type="button" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 me-1" />
                {isAr ? "إضافة خطوة" : "Add Step"}
              </Button>
            </div>
          </div>

          {steps.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {isAr
                  ? "لا توجد خطوات مخصصة — يستخدم القالب الخطوات الافتراضية."
                  : "No custom steps yet — theme uses built-in defaults."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <StepCard
                  key={step.id || idx}
                  step={step}
                  idx={idx}
                  total={steps.length}
                  isAr={isAr}
                  onChange={(patch) => updateStep(idx, patch)}
                  onRemove={() => removeStep(idx)}
                  onMove={(dir) => moveStep(idx, dir)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </SectionEditorShell>
  );
}

function StepCard({
  step,
  idx,
  total,
  isAr,
  onChange,
  onRemove,
  onMove,
}: {
  step: LandingProcessStep;
  idx: number;
  total: number;
  isAr: boolean;
  onChange: (patch: Partial<LandingProcessStep>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const ActiveIcon = ICON_OPTIONS.find((o) => o.value === step.icon_name)?.Icon ?? Sparkles;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">
              {isAr ? "الخطوة" : "Step"} #{idx + 1}
            </span>
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

        <div className="space-y-1.5">
          <Label className="text-xs">{isAr ? "أيقونة الخطوة" : "Step Icon"}</Label>
          <Select value={step.icon_name} onValueChange={(v) => onChange({ icon_name: v })}>
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

        <BilingualInput
          labelAr="عنوان الخطوة"
          labelEn="Step Title"
          valAr={step.title_ar}
          valEn={step.title_en}
          onChangeAr={(v) => onChange({ title_ar: v })}
          onChangeEn={(v) => onChange({ title_en: v })}
        />

        <BilingualInput
          labelAr="وصف الخطوة"
          labelEn="Step Description"
          valAr={step.description_ar}
          valEn={step.description_en}
          onChangeAr={(v) => onChange({ description_ar: v })}
          onChangeEn={(v) => onChange({ description_en: v })}
          type="textarea"
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
