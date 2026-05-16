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
  siteSettingsSchema,
  type SiteSettings,
} from "@/lib/validators/settings";
import { saveSiteSettingsAction } from "../actions";

export function SiteSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettings>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: (initial as SiteSettings | null) ?? {
      name_ar: "",
      name_en: "",
    },
  });

  function onSubmit(data: SiteSettings) {
    startTransition(async () => {
      const result = await saveSiteSettingsAction(data);
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
          <Label>{isAr ? "اسم الموقع (AR)" : "Site name (AR)"}</Label>
          <Input {...register("name_ar")} dir="rtl" />
          {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "اسم الموقع (EN)" : "Site name (EN)"}</Label>
          <Input {...register("name_en")} dir="ltr" />
          {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "وصف الموقع (AR)" : "Site description (AR)"}</Label>
          <Textarea {...register("description_ar")} dir="rtl" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "وصف الموقع (EN)" : "Site description (EN)"}</Label>
          <Textarea {...register("description_en")} dir="ltr" rows={3} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "رابط الشعار" : "Logo URL"}</Label>
          <Input {...register("logo_url")} dir="ltr" placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Favicon URL</Label>
          <Input {...register("favicon_url")} dir="ltr" placeholder="https://..." />
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
