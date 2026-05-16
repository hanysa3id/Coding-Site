"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  negotiateOrderSchema,
  type NegotiateOrderInput,
} from "@/lib/validators/orders";
import { negotiateOrderAction } from "../../actions";
import type { OrderFull } from "@/lib/queries/orders";

export function NegotiationPanel({
  order,
  locale,
}: {
  order: OrderFull;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NegotiateOrderInput>({
    resolver: zodResolver(negotiateOrderSchema),
    defaultValues: {
      order_id: order.id,
      final_price: order.final_price ?? order.estimated_price ?? null,
      final_duration_days: order.final_duration_days ?? order.estimated_duration_days ?? null,
      admin_notes: order.admin_notes ?? "",
    },
  });

  function onSubmit(data: NegotiateOrderInput) {
    startTransition(async () => {
      const result = await negotiateOrderAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الإرسال للعميل للموافقة" : "Sent to customer for approval");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("order_id")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "السعر النهائي" : "Final price"}</Label>
          <Input
            type="number"
            step="0.01"
            {...register("final_price", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            disabled={isPending}
          />
          {errors.final_price && (
            <p className="text-sm text-destructive">{errors.final_price.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "المدة النهائية (أيام)" : "Final duration (days)"}</Label>
          <Input
            type="number"
            {...register("final_duration_days", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isAr ? "ملاحظات داخلية (لا يراها العميل)" : "Internal notes (hidden from customer)"}</Label>
        <Textarea {...register("admin_notes")} rows={3} disabled={isPending} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? (isAr ? "جارٍ الحفظ..." : "Saving...")
            : isAr
              ? "حفظ وإرسال للعميل للموافقة"
              : "Save & send for customer approval"}
        </Button>
      </div>
    </form>
  );
}
