"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "../../actions";

export function ReviewForm({ orderId, locale }: { orderId: string; locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitReviewAction({
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "شكراً لتقييمك!" : "Thanks for your review!");
      router.push(`/${locale}/orders/${orderId}`);
      router.refresh();
    });
  }

  const display = hover ?? rating;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>{isAr ? "تقييمك" : "Your rating"}</Label>
        <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-1"
              aria-label={`${n} stars`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition",
                  n <= display ? "fill-amber-400 text-amber-400" : "text-muted"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">{isAr ? "تعليقك (اختياري)" : "Your comment (optional)"}</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          disabled={isPending}
          placeholder={isAr ? "شاركنا تجربتك..." : "Share your experience..."}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الإرسال..." : "Submitting...") : isAr ? "إرسال التقييم" : "Submit review"}
        </Button>
      </div>
    </form>
  );
}
