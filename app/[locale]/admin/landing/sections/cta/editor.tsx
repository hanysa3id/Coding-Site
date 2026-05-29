"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields,
  SectionCTAFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Megaphone } from "lucide-react";

export function FinalCTAEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "cta";
  
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
      titleAr="دعوة للعمل الأخيرة (Final CTA)"
      titleEn="Final CTA Section"
      descriptionAr="تعديل قسم الدعوة للعمل الأخير أسفل الصفحة"
      descriptionEn="Edit the final call-to-action section at the bottom of the page"
      locale={locale}
      data={data}
      setData={setData}
      icon={<Megaphone className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "هل أنت مستعد لنقل عملك الرقمي للمستوى القادم؟",
            title_en: "Ready to Engineer Your Digital Future?",
            subtitle_ar: "احصل على استشارة مجانية",
            subtitle_en: "Free Scoping Call",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            description_ar: "تحدث مباشرة مع مستشارينا التقنيين لتحديد هيكل ومخطط مشروعك القادم وتفادي الأخطاء البرمجية.",
            description_en: "Schedule a discovery session today. We'll map your requirements, audit security setups, and provide a clear timeline estimate.",
          }}
        />

        <SectionCTAFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          variant="both"
          defaults={{
            primary_btn_label_ar: "ابدأ مشروعك الآن",
            primary_btn_label_en: "Launch Your Project",
            primary_btn_href: "/contact",
            secondary_btn_label_ar: "شاهد أعمالنا السابقة",
            secondary_btn_label_en: "Explore Case Studies",
            secondary_btn_href: "/portfolio",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
