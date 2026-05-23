"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BilingualInputProps {
  labelAr: string;
  labelEn: string;
  valAr: string;
  valEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  placeholderAr?: string;
  placeholderEn?: string;
  type?: "text" | "textarea";
  rows?: number;
}

export function BilingualInput({
  labelAr,
  labelEn,
  valAr,
  valEn,
  onChangeAr,
  onChangeEn,
  placeholderAr,
  placeholderEn,
  type = "text",
  rows = 3,
}: BilingualInputProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="text-xs">{labelAr}</Label>
        {type === "textarea" ? (
          <Textarea
            dir="rtl"
            rows={rows}
            value={valAr || ""}
            placeholder={placeholderAr}
            onChange={(e) => onChangeAr(e.target.value)}
          />
        ) : (
          <Input
            dir="rtl"
            value={valAr || ""}
            placeholder={placeholderAr}
            onChange={(e) => onChangeAr(e.target.value)}
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">{labelEn}</Label>
        {type === "textarea" ? (
          <Textarea
            dir="ltr"
            rows={rows}
            value={valEn || ""}
            placeholder={placeholderEn}
            onChange={(e) => onChangeEn(e.target.value)}
          />
        ) : (
          <Input
            dir="ltr"
            value={valEn || ""}
            placeholder={placeholderEn}
            onChange={(e) => onChangeEn(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
