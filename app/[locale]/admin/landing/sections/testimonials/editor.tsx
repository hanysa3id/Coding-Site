"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { MessageSquare } from "lucide-react";

export function TestimonialsEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "testimonials";
  
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
      titleAr="آراء العملاء (Testimonials)"
      titleEn="Testimonials Section"
      descriptionAr="تعديل نصوص قسم التقييمات والآراء"
      descriptionEn="Edit the text content for the customer reviews section"
      locale={locale}
      data={data}
      setData={setData}
      icon={<MessageSquare className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "ماذا يقول عملاؤنا عن تجربتهم معنا؟",
            title_en: "What Teams Say About Our Delivery",
            subtitle_ar: "آراء شركاء النجاح",
            subtitle_en: "Client Success Stories",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "نعتز بثقة عملائنا ونسعى جاهدين لتقديم أفضل الحلول البرمجية والتسويقية لتوسيع نشاطهم الرقمي.",
            description_en: "We establish long-term engineering and marketing partnerships centered around reliable business growth.",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
