"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { verifyPaymentAction, rejectPaymentAction } from "./actions";

export function PaymentActions({
  paymentId,
  locale,
}: {
  paymentId: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  function onVerify() {
    if (!confirm(isAr ? "تأكيد استلام الدفع؟" : "Confirm payment received?")) return;
    startTransition(async () => {
      const result = await verifyPaymentAction(paymentId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم اعتماد الدفع" : "Payment verified");
      router.refresh();
    });
  }

  function onReject() {
    startTransition(async () => {
      const result = await rejectPaymentAction(paymentId, note);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم رفض الدفع" : "Payment rejected");
      setRejecting(false);
      setNote("");
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 shrink-0">
        <Button size="sm" onClick={onVerify} disabled={isPending}>
          <Check className="h-4 w-4" />
          {isAr ? "اعتماد" : "Verify"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRejecting(true)} disabled={isPending}>
          <X className="h-4 w-4" />
          {isAr ? "رفض" : "Reject"}
        </Button>
      </div>

      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "رفض الدفع" : "Reject payment"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={isAr ? "سبب الرفض..." : "Reason for rejection..."}
            disabled={isPending}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(false)} disabled={isPending}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={isPending || !note.trim()}>
              {isAr ? "رفض الدفع" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
