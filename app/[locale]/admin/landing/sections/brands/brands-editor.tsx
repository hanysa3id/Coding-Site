"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { 
  SectionHeaderFields, 
  SectionDescriptionFields
} from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { ShieldCheck } from "lucide-react";

export function BrandsEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "logo_cloud";
  
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
      titleAr="شركاء النجاح (Logo Cloud)"
      titleEn="Logo Cloud Section"
      descriptionAr="تعديل نصوص قسم شعارات العملاء والعلامات التجارية"
      descriptionEn="Edit the text content for the trusted brands section"
      locale={locale}
      data={data}
      setData={setData}
      icon={<ShieldCheck className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
          defaults={{
            title_ar: "علامات تجارية رائدة تثق بـنا",
            title_en: "brands we help launch & scale",
          }}
        />

        <SectionDescriptionFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
        />
      </div>
    </SectionEditorShell>
  );
}
