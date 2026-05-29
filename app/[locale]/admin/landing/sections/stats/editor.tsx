"use client";

import { useState, useMemo } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { SectionHeaderFields, SectionDescriptionFields } from "../_components/section-field-group";
import type { LandingSettings } from "@/lib/validators/settings";
import { BarChart3 } from "lucide-react";

export function StatsEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "stats";
  
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
      titleAr="الإحصائيات (Stats)"
      titleEn="Stats Section"
      descriptionAr="تعديل نصوص الإحصائيات (الأرقام تُعدل من قائمة الإعدادات الجانبية)"
      descriptionEn="Edit stats section text (Numbers are edited in the sidebar)"
      locale={locale}
      data={data}
      setData={setData}
      icon={<BarChart3 className="h-5 w-5" />}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="space-y-6">
        <SectionHeaderFields
          locale={locale}
          overrides={overrides}
          onUpdate={updateOverride}
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
