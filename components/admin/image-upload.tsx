"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  uploadAction: (formData: FormData) => Promise<
    { success: true; url: string } | { success: false; error: string }
  >;
  locale: string;
  className?: string;
};

export function ImageUpload({ value, onChange, uploadAction, locale, className }: Props) {
  const isAr = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(value);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isAr ? "الملف يجب أن يكون صورة" : "File must be an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isAr ? "الحد الأقصى 5 ميجابايت" : "Max 5MB");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const fd = new FormData();
    fd.append("file", file);

    startTransition(async () => {
      const result = await uploadAction(fd);
      if (!result.success) {
        setPreview(value);
        toast.error(result.error);
        return;
      }
      setPreview(result.url);
      onChange(result.url);
      toast.success(isAr ? "تم الرفع" : "Uploaded");
    });
  }

  function clear() {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        disabled={isPending}
        className="hidden"
      />
      {preview ? (
        <div className="relative w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="preview"
            className="aspect-video w-full rounded-md border object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 end-2 h-8 w-8"
            onClick={clear}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <Upload className="h-8 w-8" />
          <span className="text-sm">
            {isPending
              ? (isAr ? "جارٍ الرفع..." : "Uploading...")
              : (isAr ? "اضغط لرفع صورة" : "Click to upload an image")}
          </span>
        </button>
      )}
    </div>
  );
}
