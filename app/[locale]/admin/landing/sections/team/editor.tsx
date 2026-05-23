"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import type { LandingSettings } from "@/lib/validators/settings";

export function TeamEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "team";
  
  const overrides = data.section_overrides[sectionId] || {};

  function updateOverride(key: string, value: string) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: {
          ...overrides,
          [key]: value,
        },
      },
    });
  }

  return (
    <SectionEditorShell
      titleAr="تعديل فريق العمل"
      titleEn="Edit Team Section"
      descriptionAr="تعديل عنوان قسم فريق العمل"
      descriptionEn="Edit team section content"
      locale={locale}
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">{locale === "ar" ? "المحتوى النصي" : "Text Content"}</h3>
        <BilingualInput
          labelAr="العنوان الرئيسي"
          labelEn="Heading"
          valAr={overrides.title_ar ?? ""}
          valEn={overrides.title_en ?? ""}
          onChangeAr={(v) => updateOverride("title_ar", v)}
          onChangeEn={(v) => updateOverride("title_en", v)}
        />
        <BilingualInput
          labelAr="الوصف (اختياري)"
          labelEn="Subtitle (Optional)"
          valAr={overrides.subtitle_ar ?? ""}
          valEn={overrides.subtitle_en ?? ""}
          onChangeAr={(v) => updateOverride("subtitle_ar", v)}
          onChangeEn={(v) => updateOverride("subtitle_en", v)}
          type="textarea"
          rows={2}
        />
      </div>
    </SectionEditorShell>
  );
}
