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
  businessHoursSchema,
  type BusinessHoursInput,
} from "@/lib/validators/settings";
import { saveBusinessHoursAction } from "../actions";

const DAYS: { key: keyof Omit<BusinessHoursInput, "timezone">; ar: string; en: string }[] = [
  { key: "sunday",    ar: "الأحد",     en: "Sunday" },
  { key: "monday",    ar: "الإثنين",   en: "Monday" },
  { key: "tuesday",   ar: "الثلاثاء",   en: "Tuesday" },
  { key: "wednesday", ar: "الأربعاء",  en: "Wednesday" },
  { key: "thursday",  ar: "الخميس",    en: "Thursday" },
  { key: "friday",    ar: "الجمعة",    en: "Friday" },
  { key: "saturday",  ar: "السبت",     en: "Saturday" },
];

const DEFAULT_HOURS: BusinessHoursInput = {
  timezone: "Africa/Cairo",
  sunday:    { open: "09:00", close: "18:00", closed: false },
  monday:    { open: "09:00", close: "18:00", closed: false },
  tuesday:   { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday:  { open: "09:00", close: "18:00", closed: false },
  friday:    { open: "00:00", close: "00:00", closed: true  },
  saturday:  { open: "09:00", close: "14:00", closed: false },
};

export function BusinessHoursForm({
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
    watch,
    formState: { errors },
  } = useForm<BusinessHoursInput>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: (initial as BusinessHoursInput | null) ?? DEFAULT_HOURS,
  });

  function onSubmit(data: BusinessHoursInput) {
    startTransition(async () => {
      const result = await saveBusinessHoursAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2 max-w-sm">
        <Label>{isAr ? "المنطقة الزمنية" : "Timezone"}</Label>
        <Input {...register("timezone")} dir="ltr" placeholder="Africa/Cairo" />
        {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
      </div>

      <div className="border rounded-md divide-y">
        {DAYS.map((d) => {
          const closed = watch(`${d.key}.closed` as const);
          return (
            <div key={d.key} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_120px] items-center gap-3 px-4 py-3">
              <span className="text-sm font-medium">{isAr ? d.ar : d.en}</span>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  {isAr ? "فتح" : "Open"}
                </Label>
                <Input
                  {...register(`${d.key}.open` as const)}
                  type="time"
                  dir="ltr"
                  disabled={closed}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  {isAr ? "إغلاق" : "Close"}
                </Label>
                <Input
                  {...register(`${d.key}.close` as const)}
                  type="time"
                  dir="ltr"
                  disabled={closed}
                  className="font-mono"
                />
              </div>
              <Controller
                control={control}
                name={`${d.key}.closed` as const}
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <span>{isAr ? "مغلق" : "Closed"}</span>
                  </label>
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
