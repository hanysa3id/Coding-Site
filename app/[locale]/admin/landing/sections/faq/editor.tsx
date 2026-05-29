"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { HelpCircle } from "lucide-react";

export function FAQEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "faq";
  
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
      titleAr="الأسئلة الشائعة (FAQ)"
      titleEn="FAQ Section"
      descriptionAr="تعديل نصوص مقدمة قسم الأسئلة والأجوبة المتكررة"
      descriptionEn="Edit the text content for the frequently asked questions section"
      locale={locale}
      data={data}
      setData={setData}
      icon={<HelpCircle className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "لديك أسئلة؟ نحن نوفر لك الإجابات",
            title_en: "Everything You Need to Get Started",
            subtitle_ar: "الأسئلة الشائعة",
            subtitle_en: "Common Queries",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "جمعنا لك أهم الأسئلة التي يطرحها عملاؤنا لتوفير وقتك ومساعدتك في اتخاذ القرار.",
            description_en: "We compiled the most frequently asked questions to help you make an informed decision quickly.",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
