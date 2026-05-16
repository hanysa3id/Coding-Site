"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { deleteDeliverableAction } from "../../actions";

type Deliverable = {
  id: string;
  file_url: string;
  file_name: string;
  description: string | null;
  created_at: string;
};

export function DeliverableRow({
  deliverable: d,
  orderId,
  locale,
}: {
  deliverable: Deliverable;
  orderId: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Delete this file?")) return;
    startTransition(async () => {
      const result = await deleteDeliverableAction(d.id, orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.refresh();
    });
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{d.file_name}</p>
        {d.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">{d.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDateTime(d.created_at, isAr ? "ar-EG" : "en-US")}
        </p>
      </div>
      <a
        href={d.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        <Download className="h-4 w-4" />
        {isAr ? "تحميل" : "Download"}
      </a>
      <Button size="icon" variant="ghost" onClick={onDelete} disabled={isPending}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}
