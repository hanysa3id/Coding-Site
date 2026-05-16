"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { uploadDeliverableAction } from "../../actions";

export function DeliverableUploader({
  orderId,
  locale,
}: {
  orderId: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) {
      toast.error(isAr ? "اختر ملفاً أولاً" : "Pick a file first");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error(isAr ? "الحد الأقصى 50 ميجابايت" : "Max 50MB");
      return;
    }
    const fd = new FormData();
    fd.append("order_id", orderId);
    fd.append("file", file);
    if (description) fd.append("description", description);

    startTransition(async () => {
      const result = await uploadDeliverableAction(fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الرفع" : "Uploaded");
      setDescription("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="file">{isAr ? "الملف" : "File"}</Label>
        <Input id="file" ref={fileInput} type="file" disabled={isPending} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">{isAr ? "وصف (اختياري)" : "Description (optional)"}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={isPending}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Upload className="h-4 w-4" />
          {isPending ? (isAr ? "جارٍ الرفع..." : "Uploading...") : isAr ? "رفع" : "Upload"}
        </Button>
      </div>
    </form>
  );
}
