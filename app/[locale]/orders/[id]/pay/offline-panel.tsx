"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitOfflinePaymentAction } from "./actions";

export function OfflinePayPanel({ orderId, locale }: { orderId: string; locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState("bank_transfer");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("order_id", orderId);
    fd.append("method", method);
    if (note) fd.append("note", note);
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("receipt", file);

    startTransition(async () => {
      const result = await submitOfflinePaymentAction(fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        isAr
          ? "تم إرسال إثبات الدفع. سيتم مراجعته خلال 24 ساعة."
          : "Payment proof sent. It will be reviewed within 24 hours."
      );
      router.push(`/${locale}/orders/${orderId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{isAr ? "طريقة الدفع" : "Payment method"}</Label>
        <Select value={method} onValueChange={setMethod} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">
              {isAr ? "تحويل بنكي" : "Bank transfer"}
            </SelectItem>
            <SelectItem value="instapay">InstaPay</SelectItem>
            <SelectItem value="vodafone_cash">
              {isAr ? "فودافون كاش" : "Vodafone Cash"}
            </SelectItem>
            <SelectItem value="cash">{isAr ? "نقدًا عند التسليم" : "Cash on delivery"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="receipt">
          {isAr ? "إيصال التحويل (اختياري)" : "Transfer receipt (optional)"}
        </Label>
        <Input
          id="receipt"
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {isAr ? "PDF أو صورة، حد أقصى 5 ميجابايت" : "PDF or image, max 5MB"}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">{isAr ? "ملاحظة (اختياري)" : "Note (optional)"}</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          disabled={isPending}
          placeholder={isAr ? "رقم العملية، تاريخ التحويل، إلخ" : "Transaction reference, date, etc."}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (isAr ? "جارٍ الإرسال..." : "Submitting...") : isAr ? "إرسال إثبات الدفع" : "Submit payment proof"}
      </Button>
    </form>
  );
}
