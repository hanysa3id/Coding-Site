"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveOrderAction, cancelOrderAction } from "../actions";

export function OrderActionsClient({
  orderId,
  action,
  locale,
  destructive,
  children,
}: {
  orderId: string;
  action: "approve" | "cancel";
  locale: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isAr = locale === "ar";

  function onClick() {
    if (action === "cancel" && !confirm(isAr ? "متأكد من إلغاء الطلب؟" : "Cancel this order?")) {
      return;
    }
    startTransition(async () => {
      const result =
        action === "approve" ? await approveOrderAction(orderId) : await cancelOrderAction(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم" : "Done");
      router.refresh();
    });
  }

  return (
    <Button onClick={onClick} disabled={isPending} variant={destructive ? "destructive" : "default"}>
      {children}
    </Button>
  );
}
