"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Type } from "lucide-react";

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

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  function updateOverride(key: string, value: string) {
    setData((prev) => ({
      ...prev,
      section_overrides: {
        ...prev.section_overrides,
        [sectionId]: {
          ...prev.section_overrides[sectionId],
          [key]: value,
        },
      },
    }));
  }

  function handleReset() {
    setData(initialData);
  }

  return (
    <SectionEditorShell
      titleAr="فريق العمل (Team)"
      titleEn="Team Section"
      descriptionAr="تعديل نصوص ومقدمة قسم فريق العمل"
      descriptionEn="Edit the text content for the team overview section"
      locale={locale}
      data={data}
      setData={setData}
      icon={<Type className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "وجوه وعقول تقف خلف نجاح كل مشروع",
            title_en: "The Brains Behind Modern Delivery",
            subtitle_ar: "فريق الخبراء",
            subtitle_en: "Senior Engineering Squad",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "نجمع الكفاءات والخبرات البرمجية والتسويقية لنحقق أعلى درجات الجودة والسرعة والأمان لمشروعك.",
            description_en: "A distributed senior team of developers, UX specialists, systems architects, and growth leaders.",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
