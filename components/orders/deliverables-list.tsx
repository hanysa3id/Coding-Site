import { FileText, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Deliverable = {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  description: string | null;
  created_at: string;
};

export function DeliverablesList({
  deliverables,
  locale,
}: {
  deliverables: Deliverable[];
  locale: string;
}) {
  const isAr = locale === "ar";
  if (deliverables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {isAr ? "لا توجد ملفات تسليم بعد" : "No deliverables yet"}
      </p>
    );
  }

  return (
    <ul className="divide-y border rounded-md">
      {deliverables.map((d) => (
        <li key={d.id} className="flex items-center gap-3 p-3">
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
        </li>
      ))}
    </ul>
  );
}
