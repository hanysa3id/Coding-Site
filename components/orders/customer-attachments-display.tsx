import { Download, FileText, FileImage, FileVideo, FileAudio, FileArchive, File as FileIcon, Volume2 } from "lucide-react";
import { AudioPlayer } from "@/components/orders/audio-player";
import type { OrderAttachment } from "@/types/database";

type Props = {
  attachments: OrderAttachment[];
  locale: string;
};

/**
 * Read-only display of files + voice notes that the customer attached
 * when submitting the order. Audio attachments play inline via <audio>.
 */
export function CustomerAttachmentsDisplay({ attachments, locale }: Props) {
  if (!attachments || attachments.length === 0) return null;
  const isAr = locale === "ar";

  const audios = attachments.filter((a) => a.kind === "audio");
  const files = attachments.filter((a) => a.kind !== "audio");

  return (
    <div className="space-y-4">
      {/* Voice notes — inline players */}
      {audios.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium inline-flex items-center gap-1.5">
            <Volume2 className="h-4 w-4" />
            {isAr ? "الملاحظات الصوتية" : "Voice notes"}
            <span className="text-xs text-muted-foreground">({audios.length})</span>
          </p>
          <ul className="space-y-2.5">
            {audios.map((a, i) => (
              <li key={i} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground px-1">
                  <span className="font-medium inline-flex items-center gap-1.5 min-w-0">
                    <FileAudio className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <span className="shrink-0">{formatBytes(a.size)}</span>
                </div>
                <AudioPlayer
                  src={a.url}
                  tone="customer"
                  sizeBytes={a.size}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regular files — download links */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isAr ? "ملفات مرفقة" : "Attached files"}
            <span className="ms-2 text-xs text-muted-foreground">({files.length})</span>
          </p>
          <ul className="divide-y border rounded-md">
            {files.map((a, i) => (
              <li key={i} className="flex items-center gap-3 p-3">
                {iconForMime(a.mime, "h-7 w-7 shrink-0 text-muted-foreground")}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(a.size)}</p>
                </div>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={a.name}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isAr ? "تحميل" : "Download"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function iconForMime(mime: string, className?: string) {
  const I =
    mime.startsWith("image/")
      ? FileImage
      : mime.startsWith("video/")
        ? FileVideo
        : mime.startsWith("audio/")
          ? FileAudio
          : /pdf|word|document|text/.test(mime)
            ? FileText
            : /zip|rar|tar|gz|7z/.test(mime)
              ? FileArchive
              : FileIcon;
  return <I className={className} />;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
