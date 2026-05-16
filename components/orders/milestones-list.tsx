import { Check, Circle, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { MilestoneStatus } from "@/types/database";

type Milestone = {
  id: string;
  title_ar: string;
  title_en: string | null;
  description: string | null;
  status: MilestoneStatus;
  completed_at: string | null;
};

export function MilestonesList({
  milestones,
  locale,
}: {
  milestones: Milestone[];
  locale: string;
}) {
  const isAr = locale === "ar";
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {isAr ? "لم تُحدد مراحل بعد" : "No milestones set yet"}
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {milestones.map((m) => {
        const title = isAr ? m.title_ar : m.title_en ?? m.title_ar;
        return (
          <li
            key={m.id}
            className={cn(
              "flex gap-3 rounded-md border p-3",
              m.status === "done" && "bg-green-50 dark:bg-green-950/20",
              m.status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {m.status === "done" ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : m.status === "in_progress" ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{title}</p>
              {m.description && (
                <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
              )}
              {m.completed_at && m.status === "done" && (
                <p className="text-xs text-muted-foreground mt-2">
                  {isAr ? "اكتمل في " : "Completed "}
                  {formatDate(m.completed_at, isAr ? "ar-EG" : "en-US")}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
