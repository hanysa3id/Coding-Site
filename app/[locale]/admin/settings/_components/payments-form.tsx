"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  paymentsSettingsSchema,
  type PaymentsSettings,
} from "@/lib/validators/settings";
import { savePaymentsSettingsAction } from "../actions";

export function PaymentsSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control } = useForm<PaymentsSettings>({
    resolver: zodResolver(paymentsSettingsSchema),
    defaultValues: (initial as PaymentsSettings | null) ?? {
      paymob_enabled: false,
      offline_enabled: true,
      currency: "EGP",
    },
  });

  function onSubmit(data: PaymentsSettings) {
    startTransition(async () => {
      const result = await savePaymentsSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="paymob_enabled"
            render={({ field }) => (
              <Checkbox
                id="paymob_enabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="paymob_enabled" className="cursor-pointer">
            {isAr ? "تفعيل الدفع عبر PayMob" : "Enable PayMob payments"}
          </Label>
        </div>
        <p className="text-xs text-muted-foreground ms-6">
          {isAr
            ? "يتطلب ضبط متغيرات PayMob في .env.local: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID_CARD, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET"
            : "Requires PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID_CARD, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET in .env.local"}
        </p>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="offline_enabled"
            render={({ field }) => (
              <Checkbox
                id="offline_enabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="offline_enabled" className="cursor-pointer">
            {isAr
              ? "تفعيل الدفع اليدوي (تحويل بنكي، InstaPay، فودافون كاش، كاش)"
              : "Enable offline payments (bank transfer, InstaPay, Vodafone Cash, cash)"}
          </Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 pt-3 border-t">
        <div className="space-y-2">
          <Label>{isAr ? "كود العملة (ISO)" : "Currency code (ISO)"}</Label>
          <Input {...register("currency")} dir="ltr" placeholder="EGP" />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رمز العملة (AR)" : "Currency symbol (AR)"}</Label>
          <Input {...register("currency_symbol_ar")} dir="rtl" placeholder="ج.م" />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رمز العملة (EN)" : "Currency symbol (EN)"}</Label>
          <Input {...register("currency_symbol_en")} dir="ltr" placeholder="EGP" />
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
