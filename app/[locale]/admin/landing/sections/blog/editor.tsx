"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields,
  SectionCTAFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Type } from "lucide-react";

export function BlogEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "blog";
  
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
      titleAr="المدونة (Blog)"
      titleEn="Blog Section"
      descriptionAr="تعديل نصوص وأزرار قسم المقالات والأخبار"
      descriptionEn="Edit the text content and buttons for the latest articles section"
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
            title_ar: "دروس وأفكار تقنية لنساعدك على النمو",
            title_en: "Deep Technical Resources & Guides",
            subtitle_ar: "مدونة المعرفة الرقمية",
            subtitle_en: "Engineering Insights",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "اقرأ أحدث المقالات والتقارير التقنية والتسويقية المكتوبة بواسطة مهندسينا وخبراء النمو لدينا.",
            description_en: "Articles and case breakdowns covering web scalability, UX architecture design, and server security.",
          }}
        />

        <SectionCTAFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          variant="primary"
          defaults={{
            primary_btn_label_ar: "تصفح كامل المقالات",
            primary_btn_label_en: "View All Resources",
            primary_btn_href: "/blog",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
