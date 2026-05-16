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
  ordersPolicySchema,
  type OrdersPolicyInput,
} from "@/lib/validators/settings";
import { saveOrdersPolicyAction } from "../actions";

const PENDING_STATUSES = [
  { value: "pending_review",             ar: "قيد المراجعة",         en: "Pending review" },
  { value: "under_negotiation",          ar: "قيد التفاوض",          en: "Under negotiation" },
  { value: "awaiting_customer_approval", ar: "بانتظار موافقة العميل", en: "Awaiting approval" },
  { value: "awaiting_payment",           ar: "بانتظار الدفع",         en: "Awaiting payment" },
] as const;

export function OrdersPolicyForm({
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
  } = useForm<OrdersPolicyInput>({
    resolver: zodResolver(ordersPolicySchema),
    defaultValues: (initial as OrdersPolicyInput | null) ?? {
      max_pending_per_customer: 3,
      pending_statuses: ["pending_review", "under_negotiation"],
      require_phone_on_signup: false,
      auto_assign_sales: false,
    },
  });

  function onSubmit(data: OrdersPolicyInput) {
    startTransition(async () => {
      const result = await saveOrdersPolicyAction(data);
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
          <Label>
            {isAr ? "الحد الأقصى للطلبات المعلّقة لكل عميل" : "Max pending orders per customer"}
          </Label>
          <Input
            {...register("max_pending_per_customer", { valueAsNumber: true })}
            type="number"
            min={0}
            max={1000}
            dir="ltr"
          />
          {errors.max_pending_per_customer && (
            <p className="text-sm text-destructive">
              {errors.max_pending_per_customer.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "ضع 0 لإلغاء الحد. سيمنع النظام العميل من تقديم طلبات جديدة بعد بلوغ الحد."
              : "Set 0 to disable. Customers can't submit new orders once they hit this limit."}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <Label>{isAr ? "حالات تُحسب كـ ‘معلّقة’" : "Statuses counted as ‘pending’"}</Label>
        <Controller
          control={control}
          name="pending_statuses"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {PENDING_STATUSES.map((s) => {
                const checked = field.value?.includes(s.value);
                return (
                  <label
                    key={s.value}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const next = new Set(field.value ?? []);
                        if (c) next.add(s.value);
                        else next.delete(s.value);
                        field.onChange(Array.from(next));
                      }}
                    />
                    <span>{isAr ? s.ar : s.en}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="require_phone_on_signup"
            render={({ field }) => (
              <Checkbox
                id="require_phone_on_signup"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="require_phone_on_signup" className="cursor-pointer">
            {isAr ? "اشتراط رقم الهاتف عند التسجيل" : "Require phone number on signup"}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="auto_assign_sales"
            render={({ field }) => (
              <Checkbox
                id="auto_assign_sales"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="auto_assign_sales" className="cursor-pointer">
            {isAr
              ? "تعيين مسؤول مبيعات تلقائياً عند إنشاء طلب جديد"
              : "Auto-assign a salesperson when a new order is created"}
          </Label>
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
