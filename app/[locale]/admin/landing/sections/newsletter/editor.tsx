"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields,
  SectionCTAFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Mail } from "lucide-react";

export function NewsletterEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "newsletter";
  
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
      titleAr="النشرة البريدية (Newsletter)"
      titleEn="Newsletter Section"
      descriptionAr="تعديل نصوص واشتراك النشرة البريدية"
      descriptionEn="Edit the text content and button label for the mailing list signup"
      locale={locale}
      data={data}
      setData={setData}
      icon={<Mail className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "اشترك في نشرتنا المعرفية الأسبوعية",
            title_en: "Get Weekly Digital Insights",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "أفكار حصرية ومقالات تقنية وتسويقية يكتبها خبراؤنا مباشرة إلى بريدك الإلكتروني. لا رسائل مزعجة.",
            description_en: "No spam. Only high-fidelity technical writeups, growth tactics, and cloud design patterns.",
          }}
        />

        <SectionCTAFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          variant="primary"
          defaults={{
            primary_btn_label_ar: "اشترك الآن",
            primary_btn_label_en: "Subscribe",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
