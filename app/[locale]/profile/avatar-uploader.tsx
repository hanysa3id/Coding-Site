"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { uploadAvatarAction } from "./actions";

export function AvatarUploader({
  currentUrl,
  fullName,
  locale,
}: {
  currentUrl: string | null;
  fullName: string | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();

  const initials = (fullName ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const result = await uploadAvatarAction(fd);
      if (!result.success) {
        toast.error(result.error);
        setPreview(currentUrl);
        return;
      }
      toast.success(isAr ? "تم تحديث الصورة" : "Avatar updated");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        {preview && <AvatarImage src={preview} alt={fullName ?? ""} />}
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={isPending}
        >
          <Camera className="h-4 w-4" />
          {isPending
            ? (isAr ? "جارٍ الرفع..." : "Uploading...")
            : isAr ? "تغيير الصورة" : "Change avatar"}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          {isAr ? "JPG/PNG، حد أقصى 2 ميجابايت" : "JPG/PNG, max 2MB"}
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelect}
        />
      </div>
    </div>
  );
}
