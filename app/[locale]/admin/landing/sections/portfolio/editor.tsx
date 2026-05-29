"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields,
  SectionCTAFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { Image as ImageIcon } from "lucide-react";

export function PortfolioEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "portfolio";
  
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
      titleAr="معرض الأعمال (Portfolio)"
      titleEn="Portfolio Section"
      descriptionAr="تعديل نصوص واجهة عرض المشاريع السابقة"
      descriptionEn="Edit the text content for the portfolio showcase section"
      locale={locale}
      data={data}
      setData={setData}
      icon={<ImageIcon className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "معرض أعمالنا الإبداعية",
            title_en: "Featured Case Studies",
            subtitle_ar: "منتجات رقمية صنعت فارقاً حقيقياً",
            subtitle_en: "Digital Products Engineered to Perform",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
        />

        <SectionCTAFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          variant="primary"
          defaults={{
            primary_btn_label_ar: "مشاهدة جميع المشاريع",
            primary_btn_label_en: "View All Projects",
            primary_btn_href: "/portfolio",
          }}
        />
      </div>
    </SectionEditorShell>
  );
}
