"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  whatsappSettingsSchema,
  type WhatsappSettings,
} from "@/lib/validators/settings";
import { saveWhatsappSettingsAction } from "../actions";

export function WhatsappSettingsForm({
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
  } = useForm<WhatsappSettings>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: (initial as WhatsappSettings | null) ?? {
      business_number: "",
      show_floating_button: true,
    },
  });

  function onSubmit(data: WhatsappSettings) {
    startTransition(async () => {
      const result = await saveWhatsappSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{isAr ? "رقم الواتس آب (مع كود الدولة بدون +)" : "WhatsApp number (with country code, no +)"}</Label>
        <Input {...register("business_number")} dir="ltr" placeholder="201000000000" />
        {errors.business_number && (
          <p className="text-sm text-destructive">{errors.business_number.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="show_floating_button"
          render={({ field }) => (
            <Checkbox
              id="show_floating_button"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        <Label htmlFor="show_floating_button" className="cursor-pointer">
          {isAr ? "إظهار الزر العائم في كل الصفحات" : "Show floating button on all pages"}
        </Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "رسالة افتراضية (AR)" : "Default message (AR)"}</Label>
          <Textarea {...register("default_message_ar")} dir="rtl" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رسالة افتراضية (EN)" : "Default message (EN)"}</Label>
          <Textarea {...register("default_message_en")} dir="ltr" rows={3} />
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
