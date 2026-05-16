"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, EyeOff, MessageSquare, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  replyToReviewAction,
  toggleReviewVisibilityAction,
  deleteReviewAction,
} from "./actions";
import type { Review, Service, Profile } from "@/types/database";

type FullReview = Review & {
  services: Pick<Service, "name_ar" | "name_en"> | null;
  customer: Pick<Profile, "full_name" | "email"> | null;
};

export function ReviewRow({ review: r, locale }: { review: FullReview; locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(r.admin_reply ?? "");
  const [isPending, startTransition] = useTransition();

  function onReply() {
    startTransition(async () => {
      const result = await replyToReviewAction(r.id, reply);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      setReplying(false);
      router.refresh();
    });
  }

  function onToggleVisibility() {
    startTransition(async () => {
      const result = await toggleReviewVisibilityAction(r.id, !r.is_visible);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم التحديث" : "Updated");
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Delete this review?")) return;
    startTransition(async () => {
      const result = await deleteReviewAction(r.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex gap-0.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm">
              <span className="font-medium">{r.customer?.full_name ?? r.customer?.email ?? "—"}</span>
              <span className="text-muted-foreground">
                {" · "}
                {r.services ? (isAr ? r.services.name_ar : r.services.name_en) : "—"}
                {" · "}
                {formatDateTime(r.created_at, isAr ? "ar-EG" : "en-US")}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!r.is_visible && <Badge variant="secondary">{isAr ? "مخفي" : "Hidden"}</Badge>}
            <Button size="icon" variant="ghost" onClick={onToggleVisibility} disabled={isPending}>
              {r.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} disabled={isPending}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {r.comment && <p className="text-sm whitespace-pre-line">{r.comment}</p>}

        {!replying && r.admin_reply && (
          <div className="rounded-md border-s-2 border-primary bg-muted/30 p-3 text-sm">
            <p className="font-medium mb-1">{isAr ? "رد الإدارة:" : "Reply:"}</p>
            <p>{r.admin_reply}</p>
          </div>
        )}

        {replying ? (
          <div className="space-y-2 border-t pt-3">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              disabled={isPending}
              placeholder={isAr ? "اكتب ردك..." : "Write your reply..."}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setReplying(false)} disabled={isPending}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button size="sm" onClick={onReply} disabled={isPending}>
                {isAr ? "حفظ الرد" : "Save reply"}
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setReplying(true)} disabled={isPending}>
            <MessageSquare className="h-4 w-4" />
            {r.admin_reply
              ? isAr ? "تعديل الرد" : "Edit reply"
              : isAr ? "إضافة رد" : "Add reply"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
