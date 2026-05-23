const fs = require('fs');
const path = require('path');

const SECTIONS = [
  { id: "hero", path: "hero", ar: "البطل (Hero)", en: "Hero", descAr: "تعديل محتوى قسم البطل", descEn: "Edit hero section content" },
  { id: "features", path: "features", ar: "المميزات", en: "Features", descAr: "تعديل عناوين ومميزات القسم", descEn: "Edit features section content" },
  { id: "stats", path: "stats", ar: "الإحصائيات", en: "Stats", descAr: "تعديل عناوين قسم الإحصائيات", descEn: "Edit stats section content" },
  { id: "services", path: "services", ar: "الخدمات", en: "Services", descAr: "تعديل عنوان قسم الخدمات", descEn: "Edit services section content" },
  { id: "process", path: "process", ar: "خطوات العمل", en: "Process steps", descAr: "تعديل عنوان قسم خطوات العمل", descEn: "Edit process section content" },
  { id: "portfolio", path: "portfolio", ar: "معرض الأعمال", en: "Portfolio", descAr: "تعديل عنوان معرض الأعمال", descEn: "Edit portfolio section content" },
  { id: "testimonials", path: "testimonials", ar: "آراء العملاء", en: "Testimonials", descAr: "تعديل عنوان قسم التقييمات", descEn: "Edit testimonials section content" },
  { id: "pricing", path: "pricing", ar: "الأسعار", en: "Pricing", descAr: "تعديل عنوان قسم الأسعار", descEn: "Edit pricing section content" },
  { id: "team", path: "team", ar: "فريق العمل", en: "Team", descAr: "تعديل عنوان قسم فريق العمل", descEn: "Edit team section content" },
  { id: "blog", path: "blog", ar: "المدونة", en: "Blog", descAr: "تعديل عنوان قسم المقالات", descEn: "Edit blog section content" },
  { id: "faq", path: "faq", ar: "الأسئلة الشائعة", en: "FAQ", descAr: "تعديل عنوان قسم الأسئلة الشائعة", descEn: "Edit FAQ section content" },
  { id: "newsletter", path: "newsletter", ar: "النشرة البريدية", en: "Newsletter", descAr: "تعديل نصوص الاشتراك بالنشرة", descEn: "Edit newsletter section content" },
  { id: "cta", path: "cta", ar: "دعوة للعمل", en: "Final CTA", descAr: "تعديل قسم الدعوة للعمل الأخير", descEn: "Edit CTA section content" },
];

const basePath = path.join(__dirname, '..', 'app', '[locale]', 'admin', 'landing', 'sections');

SECTIONS.forEach(sec => {
  const dir = path.join(basePath, sec.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const pageContent = `import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { ${sec.en.replace(/\s+/g, '')}Editor } from "./editor";

export default async function ${sec.en.replace(/\s+/g, '')}SectionAdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const landingData = await getLandingSettings();

  return <${sec.en.replace(/\s+/g, '')}Editor initialData={landingData} locale={locale} />;
}
`;

  const editorContent = `"use client";

import { useState } from "react";
import { SectionEditorShell } from "../_components/section-editor-shell";
import { BilingualInput } from "../_components/bilingual-input";
import type { LandingSettings } from "@/lib/validators/settings";

export function ${sec.en.replace(/\s+/g, '')}Editor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>(initialData);
  const sectionId = "${sec.id}";
  
  const overrides = data.section_overrides[sectionId] || {};

  function updateOverride(key: string, value: string) {
    setData({
      ...data,
      section_overrides: {
        ...data.section_overrides,
        [sectionId]: {
          ...overrides,
          [key]: value,
        },
      },
    });
  }

  return (
    <SectionEditorShell
      titleAr="تعديل ${sec.ar}"
      titleEn="Edit ${sec.en} Section"
      descriptionAr="${sec.descAr}"
      descriptionEn="${sec.descEn}"
      locale={locale}
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">{locale === "ar" ? "المحتوى النصي" : "Text Content"}</h3>
        <BilingualInput
          labelAr="العنوان الرئيسي"
          labelEn="Heading"
          valAr={overrides.title_ar ?? ""}
          valEn={overrides.title_en ?? ""}
          onChangeAr={(v) => updateOverride("title_ar", v)}
          onChangeEn={(v) => updateOverride("title_en", v)}
        />
        <BilingualInput
          labelAr="الوصف (اختياري)"
          labelEn="Subtitle (Optional)"
          valAr={overrides.subtitle_ar ?? ""}
          valEn={overrides.subtitle_en ?? ""}
          onChangeAr={(v) => updateOverride("subtitle_ar", v)}
          onChangeEn={(v) => updateOverride("subtitle_en", v)}
          type="textarea"
          rows={2}
        />
      </div>
    </SectionEditorShell>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), pageContent);
  fs.writeFileSync(path.join(dir, 'editor.tsx'), editorContent);
});

console.log('Admin section pages generated successfully!');
