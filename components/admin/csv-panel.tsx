"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, FileText } from "lucide-react";
import type { ImportResult, ExportResult } from "@/lib/csv/types";

type Props = {
  /** Resource label (e.g. "categories", used in toast messages) */
  resourceAr: string;
  resourceEn: string;
  locale: string;
  /** Server action that returns CSV content of all rows */
  exportAction: () => Promise<ExportResult>;
  /** Server action that returns CSV content of a single sample/template row */
  templateAction: () => Promise<ExportResult>;
  /** Server action that accepts CSV text and imports rows */
  importAction: (csv: string) => Promise<ImportResult>;
};

export function CsvPanel({
  resourceAr,
  resourceEn,
  locale,
  exportAction,
  templateAction,
  importAction,
}: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<ImportResult | null>(null);

  function triggerDownload(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onExport() {
    startTransition(async () => {
      const result = await exportAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      triggerDownload(result.csv, result.filename);
      toast.success(isAr ? "تم التصدير" : "Exported");
    });
  }

  function onDownloadTemplate() {
    startTransition(async () => {
      const result = await templateAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      triggerDownload(result.csv, result.filename);
      toast.success(isAr ? "تم تحميل النموذج" : "Template downloaded");
    });
  }

  function onImportPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isAr ? "الحد الأقصى 5 ميجا" : "Max 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const csv = String(reader.result ?? "");
      startTransition(async () => {
        const result = await importAction(csv);
        setReport(result);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (result.success) {
          const msg = isAr
            ? `تم: ${result.inserted} جديد، ${result.updated} محدث، ${result.skipped} متخطى`
            : `Done: ${result.inserted} new, ${result.updated} updated, ${result.skipped} skipped`;
          toast.success(msg);
          router.refresh();
        } else {
          toast.error(
            isAr ? `فشل الاستيراد (${result.errors.length} خطأ)` : `Import failed (${result.errors.length} errors)`
          );
        }
      });
    };
    reader.onerror = () => toast.error(isAr ? "فشل قراءة الملف" : "Failed to read file");
    reader.readAsText(file, "utf-8");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground me-auto">
          {isAr ? `استيراد / تصدير ${resourceAr} (CSV)` : `Import / Export ${resourceEn} (CSV)`}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onDownloadTemplate}
          disabled={isPending}
        >
          <FileText className="h-4 w-4" />
          {isAr ? "نموذج" : "Template"}
        </Button>
        <Button size="sm" variant="outline" onClick={onExport} disabled={isPending}>
          <Download className="h-4 w-4" />
          {isAr ? "تصدير" : "Export"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Upload className="h-4 w-4" />
          {isAr ? "استيراد" : "Import"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onImportPick}
        />
      </div>

      {/* Import report dialog */}
      <Dialog open={!!report} onOpenChange={(open) => !open && setReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAr ? "نتيجة الاستيراد" : "Import report"}
            </DialogTitle>
            <DialogDescription>
              {report && (
                <span className="block mt-1">
                  {isAr
                    ? `${report.inserted} مضاف · ${report.updated} محدث · ${report.skipped} متخطى · ${report.errors.length} خطأ`
                    : `${report.inserted} inserted · ${report.updated} updated · ${report.skipped} skipped · ${report.errors.length} errors`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {report && report.errors.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-start p-2 w-16">
                      {isAr ? "صف" : "Row"}
                    </th>
                    <th className="text-start p-2">
                      {isAr ? "الخطأ" : "Error"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.errors.map((e, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono text-xs">{e.row}</td>
                      <td className="p-2 text-destructive">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setReport(null)}>
              {isAr ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
