"use client";

import { useState } from "react";
import { SectionEditorShell } from "../sections/_components/section-editor-shell";
import type { LandingSettings } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function DictionaryEditor({
  initialData,
  locale,
}: {
  initialData: LandingSettings;
  locale: string;
}) {
  const [data, setData] = useState<LandingSettings>({
    ...initialData,
    dictionary_overrides_ar: initialData.dictionary_overrides_ar || {},
    dictionary_overrides_en: initialData.dictionary_overrides_en || {},
  });
  
  const [newKey, setNewKey] = useState("");
  const isAr = locale === "ar";

  const allKeys = Array.from(
    new Set([
      ...Object.keys(data.dictionary_overrides_ar || {}),
      ...Object.keys(data.dictionary_overrides_en || {}),
    ])
  );

  function updateEntry(key: string, lang: "ar" | "en", value: string) {
    const field = `dictionary_overrides_${lang}` as const;
    setData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, string>),
        [key]: value,
      },
    }));
  }

  function addKey() {
    const key = newKey.trim();
    if (!key) return;
    
    setData((prev) => ({
      ...prev,
      dictionary_overrides_ar: { ...prev.dictionary_overrides_ar, [key]: "" },
      dictionary_overrides_en: { ...prev.dictionary_overrides_en, [key]: "" },
    }));
    setNewKey("");
  }

  function removeKey(key: string) {
    setData((prev) => {
      const ar = { ...prev.dictionary_overrides_ar } as Record<string, string>;
      const en = { ...prev.dictionary_overrides_en } as Record<string, string>;
      delete ar[key];
      delete en[key];
      return {
        ...prev,
        dictionary_overrides_ar: ar,
        dictionary_overrides_en: en,
      };
    });
  }

  return (
    <SectionEditorShell
      titleAr="القاموس العام (النصوص)"
      titleEn="Global Dictionary"
      descriptionAr="تعديل أي نص عام في الموقع مثل القوائم والأزرار. استخدم مفتاح النص لتغييره."
      descriptionEn="Edit any global text across the site. Use the translation key to override."
      locale={locale}
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        
        <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex-1 space-y-2">
            <Label>{isAr ? "مفتاح النص الجديد (مثال: Shared.contact_us)" : "New Translation Key"}</Label>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Navigation.services"
              dir="ltr"
            />
          </div>
          <Button onClick={addKey} type="button" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            {isAr ? "إضافة نص" : "Add Text"}
          </Button>
        </div>

        <div className="space-y-4">
          {allKeys.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
              {isAr ? "لا توجد أي تعديلات على النصوص حالياً." : "No dictionary overrides added yet."}
            </div>
          ) : (
            allKeys.map((key) => {
              const valAr = (data.dictionary_overrides_ar as Record<string, string>)?.[key] ?? "";
              const valEn = (data.dictionary_overrides_en as Record<string, string>)?.[key] ?? "";

              return (
                <div key={key} className="p-4 border rounded-lg space-y-4 relative group">
                  <div className="flex justify-between items-center mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded select-all" dir="ltr">{key}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => removeKey(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>العربية</span>
                        <span className="text-muted-foreground text-xs font-normal">AR</span>
                      </Label>
                      <Input
                        value={valAr}
                        onChange={(e) => updateEntry(key, "ar", e.target.value)}
                        dir="rtl"
                        placeholder="النص باللغة العربية"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>English</span>
                        <span className="text-muted-foreground text-xs font-normal">EN</span>
                      </Label>
                      <Input
                        value={valEn}
                        onChange={(e) => updateEntry(key, "en", e.target.value)}
                        dir="ltr"
                        placeholder="English text"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </SectionEditorShell>
  );
}
