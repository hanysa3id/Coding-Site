"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Circle, Loader2, ThumbsUp } from "lucide-react";
import { approveMilestoneAction } from "@/app/[locale]/orders/actions";

type Milestone = {
  id: string;
  title_ar: string;
  title_en: string | null;
  description: string | null;
  status: "pending" | "in_progress" | "done";
  sort_order: number;
  completed_at: string | null;
  customer_approved_at: string | null;
};

export function ProjectTimeline({
  milestones,
  orderId,
  locale,
  canApprove,
}: {
  milestones: Milestone[];
  orderId: string;
  locale: string;
  canApprove: boolean;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {isAr ? "لم تُحدد مراحل بعد" : "No milestones set yet"}
      </p>
    );
  }

  const doneCount = milestones.filter((m) => m.status === "done").length;
  const progressPct = Math.round((doneCount / milestones.length) * 100);

  function approve(milestoneId: string) {
    startTransition(async () => {
      const result = await approveMilestoneAction(milestoneId, orderId);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(isAr ? "تم اعتماد المرحلة" : "Stage approved");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isAr ? "التقدم الكلي" : "Overall progress"}</span>
          <span className="tabular-nums font-medium">{progressPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isAr
            ? `${doneCount} من ${milestones.length} مرحلة مكتملة`
            : `${doneCount} of ${milestones.length} stages complete`}
        </p>
      </div>

      {/* Timeline */}
      <ol className="relative space-y-0">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          const title = isAr ? m.title_ar : m.title_en ?? m.title_ar;
          const isDone = m.status === "done";
          const isActive = m.status === "in_progress";
          const needsApproval = isDone && canApprove && !m.customer_approved_at;

          return (
            <li key={m.id} className="flex gap-4">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-green-500 bg-green-500 text-white"
                      : isActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[2rem] my-1",
                      isDone ? "bg-green-500/40" : "bg-muted"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-medium",
                        isDone && "text-green-700 dark:text-green-400",
                        isActive && "text-blue-700 dark:text-blue-400"
                      )}
                    >
                      {title}
                    </p>
                    {m.description && (
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    )}
                    {isDone && m.completed_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isAr ? "اكتمل " : "Done "}
                        {formatDate(m.completed_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                    )}
                    {isDone && m.customer_approved_at && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {isAr ? "اعتمدت " : "Approved "}
                        {formatDate(m.customer_approved_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                    )}
                  </div>

                  {/* Sign-off button */}
                  {needsApproval && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                      onClick={() => approve(m.id)}
                      disabled={isPending}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {isAr ? "اعتماد" : "Approve"}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
