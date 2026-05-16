"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Video, Plus, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItemInput } from "@/lib/validators/portfolio";

type UploadResult = { success: true; url: string } | { success: false; error: string };

type Props = {
  value: GalleryItemInput[];
  onChange: (next: GalleryItemInput[]) => void;
  uploadAction: (fd: FormData) => Promise<UploadResult>;
  locale: string;
};

export function MediaGalleryEditor({ value, onChange, uploadAction, locale }: Props) {
  const isAr = locale === "ar";
  const fileInput = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  function add(item: Omit<GalleryItemInput, "sort_order">) {
    onChange([...value, { ...item, sort_order: value.length }]);
  }

  function remove(idx: number) {
    onChange(
      value.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sort_order: i }))
    );
  }

  function update(idx: number, patch: Partial<GalleryItemInput>) {
    onChange(value.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function move(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((it, i) => ({ ...it, sort_order: i })));
  }

  function onImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const items = Array.from(files);

    startTransition(async () => {
      for (const file of items) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: ${isAr ? "أكبر من 10 ميجابايت" : "exceeds 10MB"}`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const r = await uploadAction(fd);
        if (!r.success) {
          toast.error(`${file.name}: ${r.error}`);
          continue;
        }
        add({ url: r.url, alt_text: null, media_type: "image" });
      }
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function onAddVideo() {
    const url = videoUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error(isAr ? "رابط غير صالح" : "Invalid URL");
      return;
    }
    add({ url, alt_text: null, media_type: "video" });
    setVideoUrl("");
  }

  return (
    <div className="space-y-4">
      {/* Add controls */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {isAr ? "رفع صور (متعدد)" : "Upload images (multiple)"}
          </Label>
          <div className="flex gap-2">
            <Input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={onImagePick}
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {isAr ? "JPG / PNG / WebP، حد أقصى 10 ميجا لكل ملف" : "JPG/PNG/WebP, max 10MB each"}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {isAr ? "إضافة رابط فيديو" : "Add video URL"}
          </Label>
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              dir="ltr"
            />
            <Button type="button" onClick={onAddVideo} disabled={!videoUrl.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAr ? "YouTube / Vimeo / رابط فيديو مباشر" : "YouTube, Vimeo, or direct video URL"}
          </p>
        </div>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground text-center inline-flex items-center gap-2">
          <Upload className="h-4 w-4 animate-pulse" />
          {isAr ? "جارٍ الرفع..." : "Uploading..."}
        </p>
      )}

      {/* Items */}
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 border rounded-md border-dashed">
          {isAr ? "لا توجد وسائط بعد" : "No media yet"}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {value.map((item, idx) => {
            const isVideo = item.media_type === "video";
            return (
              <li key={`${item.url}-${idx}`} className="rounded-md border overflow-hidden group">
                <div className="aspect-video bg-muted relative">
                  {isVideo ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Video className="h-10 w-10" />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.url})` }}
                    />
                  )}
                  <span
                    className={cn(
                      "absolute top-1 start-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                      isVideo
                        ? "bg-purple-500/90 text-white"
                        : "bg-blue-500/90 text-white"
                    )}
                  >
                    {isVideo ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {isVideo ? "Video" : "Image"}
                  </span>
                </div>
                <div className="p-2 space-y-2">
                  <Input
                    value={item.alt_text ?? ""}
                    onChange={(e) => update(idx, { alt_text: e.target.value || null })}
                    placeholder={isAr ? "نص بديل (اختياري)" : "Alt text (optional)"}
                    className="h-8 text-xs"
                  />
                  {isVideo && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary truncate hover:underline"
                      dir="ltr"
                    >
                      {item.url}
                    </a>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => move(idx, 1)}
                        disabled={idx === value.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
