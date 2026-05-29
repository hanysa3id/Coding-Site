"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields, 
  SectionBadgeFields, 
  SectionCTAFields 
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Sparkles } from "lucide-react";

export function HeroEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "hero";
  
  const overrides = data.section_overrides[sectionId] || {};

  // Check if there are any unsaved changes
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
      titleAr="الواجهة الأمامية (Hero)"
      titleEn="Hero Section"
      descriptionAr="تعديل نصوص وأزرار واجهة الموقع الرئيسية"
      descriptionEn="Edit the main landing page hero content and calls to action"
      locale={locale}
      data={data}
      setData={setData}
      icon={<Sparkles className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionBadgeFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            badge_ar: "شريكك التقني الرقمي للمستقبل",
            badge_en: "Your futuristic tech partner",
          }}
        />

        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "نبني ونطور منصات رقمية فائقة الأداء والتوسع",
            title_en: "We Engineer High-Performance Digital Platforms",
            subtitle_ar: "تطوير برمجيات متكاملة، تصميم واجهات مذهلة، استضافة فائقة السرعة، وتسويق رقمي ذكي يضمن ريادتك ومضاعفة عملائك.",
            subtitle_en: "A high-end engineering studio designing, coding, launching, and scaling digital services with modern UI/UX and clean systems.",
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
            secondary_btn_label_ar: "استكشف أعمالنا",
            secondary_btn_label_en: "View Portfolio",
            secondary_btn_href: "/portfolio",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
