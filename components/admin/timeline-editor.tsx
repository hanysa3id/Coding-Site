"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import type { TimelineStepInput } from "@/lib/validators/portfolio";

type Props = {
  value: TimelineStepInput[];
  onChange: (next: TimelineStepInput[]) => void;
  locale: string;
  dir: "rtl" | "ltr";
};

export function TimelineEditor({ value, onChange, locale, dir }: Props) {
  const isAr = locale === "ar";

  function add() {
    onChange([...value, { title: "", description: "", date: "" }]);
  }

  function update(idx: number, patch: Partial<TimelineStepInput>) {
    onChange(value.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function move(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
          {isAr
            ? "لا توجد خطوات في الجدول الزمني. أضف الخطوة الأولى."
            : "No timeline steps yet. Add the first one."}
        </p>
      )}

      <ol className="space-y-3">
        {value.map((step, idx) => (
          <li
            key={idx}
            className="rounded-md border p-3 space-y-3 bg-muted/20 relative"
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-1 pt-2 shrink-0">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {isAr ? `الخطوة ${idx + 1}` : `Step ${idx + 1}`}
                    </Label>
                    <Input
                      value={step.title}
                      onChange={(e) => update(idx, { title: e.target.value })}
                      placeholder={isAr ? "عنوان الخطوة" : "Step title"}
                      dir={dir}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {isAr ? "التاريخ (اختياري)" : "Date (optional)"}
                    </Label>
                    <Input
                      type="date"
                      value={step.date ?? ""}
                      onChange={(e) => update(idx, { date: e.target.value || null })}
                      className="w-40"
                    />
                  </div>
                </div>
                <Textarea
                  value={step.description ?? ""}
                  onChange={(e) => update(idx, { description: e.target.value || null })}
                  placeholder={isAr ? "وصف ما تم في هذه الخطوة" : "What happened in this step"}
                  rows={2}
                  dir={dir}
                />
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                aria-label="Remove step"
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        {isAr ? "إضافة خطوة" : "Add step"}
      </Button>
    </div>
  );
}
