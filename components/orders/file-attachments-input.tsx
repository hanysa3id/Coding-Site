"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, FileText, FileImage, FileVideo, FileAudio, FileArchive, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: File[];
  onChange: (next: File[]) => void;
  locale: string;
  disabled?: boolean;
  /** Comma-separated MIME types or extensions. Defaults to common files. */
  accept?: string;
  /** Max size per file in bytes. Default 25MB. */
  maxBytes?: number;
  /** Maximum number of files. Default 10. */
  maxFiles?: number;
};

const DEFAULT_MAX = 25 * 1024 * 1024;
const DEFAULT_MAX_FILES = 10;

export function FileAttachmentsInput({
  value,
  onChange,
  locale,
  disabled,
  accept,
  maxBytes = DEFAULT_MAX,
  maxFiles = DEFAULT_MAX_FILES,
}: Props) {
  const isAr = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const next = [...value];
    for (const f of Array.from(files)) {
      if (next.length >= maxFiles) break;
      if (f.size > maxBytes) continue;
      // Skip exact duplicates
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || value.length >= maxFiles}
        >
          <Paperclip className="h-4 w-4" />
          {isAr ? "إرفاق ملفات" : "Attach files"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {value.length} / {maxFiles}
        </span>
      </div>

      <Input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={onPick}
        className="hidden"
        disabled={disabled}
      />

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              {iconForType(f.type, "h-4 w-4 shrink-0 text-muted-foreground")}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={() => remove(i)}
                disabled={disabled}
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        {isAr
          ? `حد أقصى ${maxFiles} ملفات، كل ملف حتى ${formatBytes(maxBytes)}`
          : `Up to ${maxFiles} files, ${formatBytes(maxBytes)} each`}
      </p>
    </div>
  );
}

function iconForType(mime: string, className?: string) {
  const I = (
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
              : FileIcon
  );
  return <I className={cn(className)} />;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
