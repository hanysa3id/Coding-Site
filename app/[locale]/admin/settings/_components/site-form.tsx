"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  siteSettingsSchema,
  type SiteSettings,
} from "@/lib/validators/settings";
import { saveSiteSettingsAction, uploadSiteAssetAction } from "../actions";

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
    control,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "اسم الموقع (AR)" : "Site name (AR)"}</Label>
          <Input {...register("name_ar")} dir="rtl" />
          {errors.name_ar && (
            <p className="text-sm text-destructive">{errors.name_ar.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "اسم الموقع (EN)" : "Site name (EN)"}</Label>
          <Input {...register("name_en")} dir="ltr" />
          {errors.name_en && (
            <p className="text-sm text-destructive">{errors.name_en.message}</p>
          )}
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

      <div className="grid gap-6 md:grid-cols-2 pt-2">
        <div className="space-y-2">
          <Label className="font-semibold">
            {isAr ? "شعار الموقع" : "Site logo"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "يظهر في الـ Header والـ Footer. يُفضّل PNG/SVG شفاف 256×256."
              : "Shows in header & footer. Prefer transparent PNG/SVG, ~256×256."}
          </p>
          <Controller
            control={control}
            name="logo_url"
            render={({ field }) => (
              <ImageUpload
                value={field.value || null}
                onChange={(url) => field.onChange(url ?? "")}
                uploadAction={uploadSiteAssetAction}
                locale={locale}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Favicon</Label>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "أيقونة المتصفح (تظهر في التبويب). PNG مربّع 32×32."
              : "Browser tab icon. Square PNG, ideally 32×32."}
          </p>
          <Controller
            control={control}
            name="favicon_url"
            render={({ field }) => (
              <ImageUpload
                value={field.value || null}
                onChange={(url) => field.onChange(url ?? "")}
                uploadAction={uploadSiteAssetAction}
                locale={locale}
              />
            )}
          />
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
