"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS, ALLOWED_TRANSITIONS } from "@/lib/orders/status";
import { updateOrderStatusAction } from "../../actions";
import type { OrderStatus } from "@/types/database";

export function StatusChanger({
  orderId,
  currentStatus,
  locale,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  const [next, setNext] = useState<OrderStatus | "">("");

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {isAr ? "لا توجد انتقالات متاحة من هذه الحالة" : "No transitions available from this status"}
      </p>
    );
  }

  function onClick() {
    if (!next) return;
    startTransition(async () => {
      const result = await updateOrderStatusAction({ order_id: orderId, status: next as OrderStatus });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم تحديث الحالة" : "Status updated");
      setNext("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Select value={next} onValueChange={(v) => setNext(v as OrderStatus)} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder={isAr ? "اختر الحالة الجديدة..." : "Select new status..."} />
          </SelectTrigger>
          <SelectContent>
            {allowed.map((s) => (
              <SelectItem key={s} value={s}>
                {isAr ? ORDER_STATUS_LABELS[s].ar : ORDER_STATUS_LABELS[s].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onClick} disabled={!next || isPending}>
        {isAr ? "تطبيق" : "Apply"}
      </Button>
    </div>
  );
}
