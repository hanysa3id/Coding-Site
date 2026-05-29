"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Rocket,
  Star,
  Globe,
} from "lucide-react";
import type { LandingSettings } from "@/lib/validators/settings";
import type { SectionItem } from "@/lib/validators/section-content";
import { defaultFeatureItems } from "@/lib/landing/defaults";

const ICON_OPTIONS = [
  { value: "Zap", label: "Zap (Speed)", Icon: Zap },
  { value: "ShieldCheck", label: "Shield", Icon: ShieldCheck },
  { value: "Cpu", label: "CPU / Tech", Icon: Cpu },
  { value: "Layers", label: "Layers", Icon: Layers },
  { value: "Sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "Rocket", label: "Rocket", Icon: Rocket },
  { value: "Star", label: "Star", Icon: Star },
  { value: "Globe", label: "Globe", Icon: Globe },
];

function uid() {
  return `feat-${Math.random().toString(36).slice(2, 9)}`;
}

export function FeaturesEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const sectionId = "features";
  const isAr = locale === "ar";

  // Seed editor with currently-visible content if no overrides exist yet.
  const initialOverrides = initialData.section_overrides[sectionId] ?? {};
  const initialItems: SectionItem[] =
    (initialOverrides.items && initialOverrides.items.length > 0
      ? initialOverrides.items
      : defaultFeatureItems) as SectionItem[];

  const [data, setData] = useState<LandingSettings>({
    ...initialData,
    section_overrides: {
      ...initialData.section_overrides,
      [sectionId]: { ...initialOverrides, items: initialItems },
    },
  });

  const overrides = data.section_overrides[sectionId] || {};
  const items: SectionItem[] = (overrides.items as SectionItem[]) ?? [];

  function updateOverride(key: string, value: string | SectionItem[]) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: { ...overrides, [key]: value },
      },
    });
  }

  function setItems(next: SectionItem[]) {
    updateOverride("items", next);
  }

  function updateItem(idx: number, patch: Partial<SectionItem>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    const next: SectionItem = {
      id: uid(),
      title_ar: "ميزة جديدة",
      title_en: "New Feature",
      description_ar: "وصف الميزة",
      description_en: "Feature description",
      badge_ar: "شارة",
      badge_en: "Badge",
      icon_name: "Sparkles",
    };
    setItems([...items, next]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  }

  function loadDefaults() {
    if (items.length === 0 || confirm(isAr ? "هل تريد استبدال المميزات الحالية بالقيم الافتراضية؟" : "Replace current features with defaults?")) {
      setItems(defaultFeatureItems.map((it) => ({ ...it, id: uid() })));
    }
  }

  return (
    <SectionEditorShell
      titleAr="تعديل قسم «لماذا نحن مختلفون؟»"
      titleEn="Edit Why Are We Different Section"
      descriptionAr="تحكم في العنوان والمميزات الأربع التي تظهر بشبكة Bento"
      descriptionEn="Manage section heading and the bento-grid feature cards"
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
            labelEn="Top Label"
            valAr={overrides.title_ar ?? ""}
            valEn={overrides.title_en ?? ""}
            onChangeAr={(v) => updateOverride("title_ar", v)}
            onChangeEn={(v) => updateOverride("title_en", v)}
            placeholderAr="مواصفات ومعايير الجودة"
            placeholderEn="core engineering standards"
          />
          <BilingualInput
            labelAr="العنوان الرئيسي"
            labelEn="Heading"
            valAr={overrides.subtitle_ar ?? ""}
            valEn={overrides.subtitle_en ?? ""}
            onChangeAr={(v) => updateOverride("subtitle_ar", v)}
            onChangeEn={(v) => updateOverride("subtitle_en", v)}
            placeholderAr="لماذا يعتمد القادة والمبتكرون علينا؟"
            placeholderEn="Engineered to Win & Scaled to Perform"
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-base">
                {isAr ? "بطاقات المميزات" : "Feature Cards"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "البطاقتان الأولى والرابعة تأخذان مساحة مضاعفة في الشبكة."
                  : "Cards 1 and 4 span two columns in the bento grid."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadDefaults}>
                {isAr ? "تحميل الافتراضي" : "Load Defaults"}
              </Button>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 me-1" />
                {isAr ? "إضافة ميزة" : "Add Feature"}
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {isAr ? "لا توجد مميزات حالياً." : "No features yet."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <FeatureCard
                  key={item.id || idx}
                  item={item}
                  idx={idx}
                  total={items.length}
                  isAr={isAr}
                  onChange={(patch) => updateItem(idx, patch)}
                  onRemove={() => removeItem(idx)}
                  onMove={(dir) => moveItem(idx, dir)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </SectionEditorShell>
  );
}

function FeatureCard({
  item,
  idx,
  total,
  isAr,
  onChange,
  onRemove,
  onMove,
}: {
  item: SectionItem;
  idx: number;
  total: number;
  isAr: boolean;
  onChange: (patch: Partial<SectionItem>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const ActiveIcon =
    ICON_OPTIONS.find((o) => o.value === item.icon_name)?.Icon ?? Sparkles;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">
              {isAr ? "البطاقة" : "Card"} #{idx + 1}
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
          <Label className="text-xs">{isAr ? "أيقونة الميزة" : "Feature Icon"}</Label>
          <Select
            value={item.icon_name ?? "Zap"}
            onValueChange={(v) => onChange({ icon_name: v })}
          >
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
          labelAr="عنوان البطاقة"
          labelEn="Card Title"
          valAr={item.title_ar ?? ""}
          valEn={item.title_en ?? ""}
          onChangeAr={(v) => onChange({ title_ar: v })}
          onChangeEn={(v) => onChange({ title_en: v })}
        />

        <BilingualInput
          labelAr="وصف الميزة"
          labelEn="Card Description"
          valAr={item.description_ar ?? ""}
          valEn={item.description_en ?? ""}
          onChangeAr={(v) => onChange({ description_ar: v })}
          onChangeEn={(v) => onChange({ description_en: v })}
          type="textarea"
          rows={3}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "الشارة (عربي)" : "Badge (AR)"}</Label>
            <Input
              dir="rtl"
              value={item.badge_ar ?? ""}
              onChange={(e) => onChange({ badge_ar: e.target.value })}
              placeholder="أقل من ثانية"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "الشارة (إنجليزي)" : "Badge (EN)"}</Label>
            <Input
              dir="ltr"
              value={item.badge_en ?? ""}
              onChange={(e) => onChange({ badge_en: e.target.value })}
              placeholder="LCP < 1.2s"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
