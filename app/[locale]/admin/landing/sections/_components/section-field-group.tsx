"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ── Bilingual field pair ─────────────────────────────────────────────── */

interface BiFieldProps {
  labelAr: string;
  labelEn: string;
  valAr: string;
  valEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  placeholderAr?: string;
  placeholderEn?: string;
  type?: "text" | "textarea";
  rows?: number;
}

function BiField({
  labelAr,
  labelEn,
  valAr,
  valEn,
  onChangeAr,
  onChangeEn,
  placeholderAr,
  placeholderEn,
  type = "text",
  rows = 3,
}: BiFieldProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">
          {labelAr}
        </Label>
        {type === "textarea" ? (
          <Textarea
            dir="rtl"
            rows={rows}
            value={valAr || ""}
            placeholder={placeholderAr}
            onChange={(e) => onChangeAr(e.target.value)}
            className="text-sm"
          />
        ) : (
          <Input
            dir="rtl"
            value={valAr || ""}
            placeholder={placeholderAr}
            onChange={(e) => onChangeAr(e.target.value)}
            className="text-sm"
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">
          {labelEn}
        </Label>
        {type === "textarea" ? (
          <Textarea
            dir="ltr"
            rows={rows}
            value={valEn || ""}
            placeholder={placeholderEn}
            onChange={(e) => onChangeEn(e.target.value)}
            className="text-sm"
          />
        ) : (
          <Input
            dir="ltr"
            value={valEn || ""}
            placeholder={placeholderEn}
            onChange={(e) => onChangeEn(e.target.value)}
            className="text-sm"
          />
        )}
      </div>
    </div>
  );
}

/* ── Single link field ────────────────────────────────────────────────── */

function LinkField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <Input
        dir="ltr"
        value={value || ""}
        placeholder={placeholder || "/contact"}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-mono"
      />
    </div>
  );
}

/* ── Field group container ────────────────────────────────────────────── */

interface SectionFieldGroupProps {
  icon: React.ReactNode;
  titleAr: string;
  titleEn: string;
  locale: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionFieldGroup({
  icon,
  titleAr,
  titleEn,
  locale,
  hint,
  children,
  className,
}: SectionFieldGroupProps) {
  const isAr = locale === "ar";
  return (
    <fieldset
      className={cn(
        "rounded-xl border border-border/60 bg-muted/20 p-5 space-y-4",
        className
      )}
    >
      <legend className="px-2 -ms-1 flex items-center gap-2 text-sm font-bold tracking-tight">
        <span className="text-primary">{icon}</span>
        <span>{isAr ? titleAr : titleEn}</span>
      </legend>
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-relaxed -mt-1">
          {hint}
        </p>
      )}
      {children}
    </fieldset>
  );
}

/* ── Pre-built field groups for common patterns ───────────────────────── */

interface OverrideMap {
  [key: string]: any;
}

interface SectionHeaderFieldsProps {
  locale: string;
  overrides: OverrideMap;
  onUpdate: (key: string, value: string) => void;
  defaults?: { title_ar?: string; title_en?: string; subtitle_ar?: string; subtitle_en?: string };
}

export function SectionHeaderFields({
  locale,
  overrides,
  onUpdate,
  defaults,
}: SectionHeaderFieldsProps) {
  return (
    <SectionFieldGroup
      icon={<span className="text-base">📝</span>}
      titleAr="عنوان القسم"
      titleEn="Section Header"
      locale={locale}
      hint={
        locale === "ar"
          ? "اترك الحقل فارغاً لاستخدام النص الافتراضي للثيم."
          : "Leave empty to use the theme default text."
      }
    >
      <BiField
        labelAr="العنوان الرئيسي (عربي)"
        labelEn="Title (English)"
        valAr={overrides.title_ar ?? ""}
        valEn={overrides.title_en ?? ""}
        onChangeAr={(v) => onUpdate("title_ar", v)}
        onChangeEn={(v) => onUpdate("title_en", v)}
        placeholderAr={defaults?.title_ar}
        placeholderEn={defaults?.title_en}
      />
      <BiField
        labelAr="العنوان الفرعي (عربي)"
        labelEn="Subtitle (English)"
        valAr={overrides.subtitle_ar ?? ""}
        valEn={overrides.subtitle_en ?? ""}
        onChangeAr={(v) => onUpdate("subtitle_ar", v)}
        onChangeEn={(v) => onUpdate("subtitle_en", v)}
        placeholderAr={defaults?.subtitle_ar}
        placeholderEn={defaults?.subtitle_en}
      />
    </SectionFieldGroup>
  );
}

interface SectionDescriptionFieldsProps {
  locale: string;
  overrides: OverrideMap;
  onUpdate: (key: string, value: string) => void;
  defaults?: { description_ar?: string; description_en?: string };
}

export function SectionDescriptionFields({
  locale,
  overrides,
  onUpdate,
  defaults,
}: SectionDescriptionFieldsProps) {
  return (
    <SectionFieldGroup
      icon={<span className="text-base">📋</span>}
      titleAr="وصف القسم"
      titleEn="Section Description"
      locale={locale}
    >
      <BiField
        labelAr="الوصف (عربي)"
        labelEn="Description (English)"
        valAr={overrides.description_ar ?? ""}
        valEn={overrides.description_en ?? ""}
        onChangeAr={(v) => onUpdate("description_ar", v)}
        onChangeEn={(v) => onUpdate("description_en", v)}
        placeholderAr={defaults?.description_ar}
        placeholderEn={defaults?.description_en}
        type="textarea"
        rows={3}
      />
    </SectionFieldGroup>
  );
}

interface SectionBadgeFieldsProps {
  locale: string;
  overrides: OverrideMap;
  onUpdate: (key: string, value: string) => void;
  defaults?: { badge_ar?: string; badge_en?: string };
}

export function SectionBadgeFields({
  locale,
  overrides,
  onUpdate,
  defaults,
}: SectionBadgeFieldsProps) {
  return (
    <SectionFieldGroup
      icon={<span className="text-base">🏷️</span>}
      titleAr="شارة القسم (Badge)"
      titleEn="Section Badge"
      locale={locale}
      hint={
        locale === "ar"
          ? "نص صغير يظهر أعلى العنوان."
          : "A small text label shown above the title."
      }
    >
      <BiField
        labelAr="البادج (عربي)"
        labelEn="Badge (English)"
        valAr={overrides.badge_ar ?? ""}
        valEn={overrides.badge_en ?? ""}
        onChangeAr={(v) => onUpdate("badge_ar", v)}
        onChangeEn={(v) => onUpdate("badge_en", v)}
        placeholderAr={defaults?.badge_ar}
        placeholderEn={defaults?.badge_en}
      />
    </SectionFieldGroup>
  );
}

interface SectionCTAFieldsProps {
  locale: string;
  overrides: OverrideMap;
  onUpdate: (key: string, value: string) => void;
  variant?: "primary" | "secondary" | "both";
  defaults?: {
    primary_btn_label_ar?: string;
    primary_btn_label_en?: string;
    primary_btn_href?: string;
    secondary_btn_label_ar?: string;
    secondary_btn_label_en?: string;
    secondary_btn_href?: string;
  };
}

export function SectionCTAFields({
  locale,
  overrides,
  onUpdate,
  variant = "both",
  defaults,
}: SectionCTAFieldsProps) {
  const isAr = locale === "ar";
  const showPrimary = variant === "primary" || variant === "both";
  const showSecondary = variant === "secondary" || variant === "both";

  return (
    <SectionFieldGroup
      icon={<span className="text-base">🔗</span>}
      titleAr="أزرار الدعوة للعمل (CTA)"
      titleEn="Call-to-Action Buttons"
      locale={locale}
    >
      {showPrimary && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {isAr ? "الزر الأساسي" : "Primary Button"}
          </p>
          <BiField
            labelAr="نص الزر (عربي)"
            labelEn="Button Label (English)"
            valAr={overrides.primary_btn_label_ar ?? ""}
            valEn={overrides.primary_btn_label_en ?? ""}
            onChangeAr={(v) => onUpdate("primary_btn_label_ar", v)}
            onChangeEn={(v) => onUpdate("primary_btn_label_en", v)}
            placeholderAr={defaults?.primary_btn_label_ar}
            placeholderEn={defaults?.primary_btn_label_en}
          />
          <LinkField
            label={isAr ? "رابط الزر الأساسي" : "Primary Button Link"}
            value={overrides.primary_btn_href ?? ""}
            onChange={(v) => onUpdate("primary_btn_href", v)}
            placeholder={defaults?.primary_btn_href || "/contact"}
          />
        </div>
      )}
      {showPrimary && showSecondary && (
        <div className="border-t border-border/40 my-1" />
      )}
      {showSecondary && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {isAr ? "الزر الثانوي" : "Secondary Button"}
          </p>
          <BiField
            labelAr="نص الزر (عربي)"
            labelEn="Button Label (English)"
            valAr={overrides.secondary_btn_label_ar ?? ""}
            valEn={overrides.secondary_btn_label_en ?? ""}
            onChangeAr={(v) => onUpdate("secondary_btn_label_ar", v)}
            onChangeEn={(v) => onUpdate("secondary_btn_label_en", v)}
            placeholderAr={defaults?.secondary_btn_label_ar}
            placeholderEn={defaults?.secondary_btn_label_en}
          />
          <LinkField
            label={isAr ? "رابط الزر الثانوي" : "Secondary Button Link"}
            value={overrides.secondary_btn_href ?? ""}
            onChange={(v) => onUpdate("secondary_btn_href", v)}
            placeholder={defaults?.secondary_btn_href || "/portfolio"}
          />
        </div>
      )}
    </SectionFieldGroup>
  );
}
