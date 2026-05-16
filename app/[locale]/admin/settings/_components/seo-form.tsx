"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  seoSettingsSchema,
  type SeoSettings,
} from "@/lib/validators/settings";
import { saveSeoSettingsAction } from "../actions";

export function SeoSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<SeoSettings>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: (initial as SeoSettings | null) ?? {},
  });

  function onSubmit(data: SeoSettings) {
    startTransition(async () => {
      const result = await saveSeoSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "العنوان الافتراضي (AR)" : "Default title (AR)"}</Label>
          <Input {...register("default_title_ar")} dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "العنوان الافتراضي (EN)" : "Default title (EN)"}</Label>
          <Input {...register("default_title_en")} dir="ltr" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Meta Description (AR)</Label>
          <Textarea {...register("default_description_ar")} dir="rtl" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Meta Description (EN)</Label>
          <Textarea {...register("default_description_en")} dir="ltr" rows={3} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Open Graph Image URL</Label>
          <Input {...register("og_image")} dir="ltr" placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Twitter handle (@...)</Label>
          <Input {...register("twitter_handle")} dir="ltr" placeholder="@yourbrand" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
