"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { AboutSettings } from "@/types/database";
import { updateAboutSettingsAction } from "./actions";

export function AboutSettingsForm({
  initial,
  locale,
}: {
  initial: AboutSettings;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [form, setForm] = useState<AboutSettings>(initial);
  const [isPending, startTransition] = useTransition();

  function addStat() {
    setForm({ ...form, stats: [...form.stats, { label_ar: "", label_en: "", value: "" }] });
  }

  function removeStat(i: number) {
    setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) });
  }

  function updateStat(i: number, key: keyof (typeof form.stats)[0], value: string) {
    const stats = [...form.stats];
    stats[i] = { ...stats[i], [key]: value };
    setForm({ ...form, stats });
  }

  function onSubmit() {
    startTransition(async () => {
      const result = await updateAboutSettingsAction(form);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "الرسالة والرؤية" : "Mission & Vision"}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{isAr ? "الرسالة (AR)" : "Mission (AR)"}</Label>
            <Textarea
              value={form.mission_ar}
              onChange={(e) => setForm({ ...form, mission_ar: e.target.value })}
              dir="rtl"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{isAr ? "الرسالة (EN)" : "Mission (EN)"}</Label>
            <Textarea
              value={form.mission_en}
              onChange={(e) => setForm({ ...form, mission_en: e.target.value })}
              dir="ltr"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{isAr ? "الرؤية (AR)" : "Vision (AR)"}</Label>
            <Textarea
              value={form.vision_ar}
              onChange={(e) => setForm({ ...form, vision_ar: e.target.value })}
              dir="rtl"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{isAr ? "الرؤية (EN)" : "Vision (EN)"}</Label>
            <Textarea
              value={form.vision_en}
              onChange={(e) => setForm({ ...form, vision_en: e.target.value })}
              dir="ltr"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isAr ? "الإحصائيات البارزة" : "Key stats"}</CardTitle>
          <Button size="sm" variant="outline" onClick={addStat} type="button">
            <Plus className="h-4 w-4" />
            {isAr ? "إضافة" : "Add"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.stats.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد إحصائيات" : "No stats yet"}
            </p>
          )}
          {form.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "التسمية (AR)" : "Label (AR)"}</Label>
                <Input
                  value={stat.label_ar}
                  onChange={(e) => updateStat(i, "label_ar", e.target.value)}
                  dir="rtl"
                  placeholder="مشروع مكتمل"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "التسمية (EN)" : "Label (EN)"}</Label>
                <Input
                  value={stat.label_en}
                  onChange={(e) => updateStat(i, "label_en", e.target.value)}
                  dir="ltr"
                  placeholder="Projects done"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "القيمة" : "Value"}</Label>
                <Input
                  value={stat.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                  placeholder="200+"
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeStat(i)} type="button">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={onSubmit} disabled={isPending}>
        {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ الإعدادات" : "Save settings"}
      </Button>
    </div>
  );
}
