"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { initPaymobAction } from "./actions";

export function PayMobPayPanel({ orderId, locale }: { orderId: string; locale: string }) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  function onClick() {
    startTransition(async () => {
      const result = await initPaymobAction(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setIframeUrl(result.iframeUrl);
    });
  }

  if (iframeUrl) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {isAr
            ? "أكمل عملية الدفع في النافذة أدناه."
            : "Complete the payment in the window below."}
        </p>
        <iframe
          src={iframeUrl}
          className="w-full border rounded-md"
          style={{ height: 600 }}
          title="PayMob payment"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center py-8">
      <CreditCard className="h-12 w-12 mx-auto text-primary" />
      <p className="text-sm text-muted-foreground">
        {isAr
          ? "ادفع بأمان عبر بوابة PayMob (تدعم Visa/MasterCard وفوري وفودافون كاش)"
          : "Pay securely via PayMob (Visa/MasterCard, Fawry, Vodafone Cash)"}
      </p>
      <Button onClick={onClick} disabled={isPending} size="lg">
        {isPending ? (isAr ? "جارٍ التحميل..." : "Loading...") : isAr ? "ابدأ الدفع" : "Start payment"}
      </Button>
    </div>
  );
}
