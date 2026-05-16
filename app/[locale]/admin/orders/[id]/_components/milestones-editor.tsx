"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Check, Circle, Loader2 } from "lucide-react";
import {
  milestoneSchema,
  type MilestoneInput,
} from "@/lib/validators/orders";
import {
  upsertMilestoneAction,
  deleteMilestoneAction,
} from "../../actions";
import type { MilestoneStatus } from "@/types/database";

type Milestone = {
  id: string;
  title_ar: string;
  title_en: string | null;
  description: string | null;
  status: MilestoneStatus;
  sort_order: number;
  completed_at: string | null;
};

export function MilestonesEditor({
  orderId,
  milestones,
  locale,
}: {
  orderId: string;
  milestones: Milestone[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Delete this milestone?")) return;
    startTransition(async () => {
      const result = await deleteMilestoneAction(id, orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)} disabled={isPending}>
          <Plus className="h-4 w-4" />
          {isAr ? "مرحلة جديدة" : "New milestone"}
        </Button>
      </div>

      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {isAr ? "لم تُحدد مراحل بعد" : "No milestones yet"}
        </p>
      ) : (
        <ul className="space-y-2">
          {milestones.map((m) => {
            const Icon =
              m.status === "done" ? Check : m.status === "in_progress" ? Loader2 : Circle;
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-md border p-3">
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    m.status === "done"
                      ? "text-green-600"
                      : m.status === "in_progress"
                        ? "text-blue-600 animate-spin"
                        : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{isAr ? m.title_ar : m.title_en ?? m.title_ar}</p>
                  {m.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{m.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(m)}
                    disabled={isPending}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(m.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(creating || editing) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing
                ? isAr ? "تعديل مرحلة" : "Edit milestone"
                : isAr ? "مرحلة جديدة" : "New milestone"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MilestoneForm
              orderId={orderId}
              initial={editing}
              locale={locale}
              onDone={() => {
                setEditing(null);
                setCreating(false);
              }}
              defaultSortOrder={milestones.length}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MilestoneForm({
  orderId,
  initial,
  locale,
  onDone,
  defaultSortOrder,
}: {
  orderId: string;
  initial: Milestone | null;
  locale: string;
  onDone: () => void;
  defaultSortOrder: number;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MilestoneInput>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: initial
      ? {
          id: initial.id,
          order_id: orderId,
          title_ar: initial.title_ar,
          title_en: initial.title_en,
          description: initial.description,
          status: initial.status,
          sort_order: initial.sort_order,
        }
      : {
          order_id: orderId,
          title_ar: "",
          status: "pending",
          sort_order: defaultSortOrder,
        },
  });

  const status = watch("status");

  function onSubmit(data: MilestoneInput) {
    startTransition(async () => {
      const result = await upsertMilestoneAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      onDone();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{isAr ? "العنوان (AR)" : "Title (AR)"}</Label>
          <Input {...register("title_ar")} dir="rtl" disabled={isPending} />
          {errors.title_ar && <p className="text-sm text-destructive">{errors.title_ar.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
          <Input {...register("title_en")} dir="ltr" disabled={isPending} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{isAr ? "الوصف" : "Description"}</Label>
        <Textarea {...register("description")} rows={2} disabled={isPending} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{isAr ? "الحالة" : "Status"}</Label>
          <Select
            value={status}
            onValueChange={(v) => setValue("status", v as MilestoneStatus)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{isAr ? "قيد الانتظار" : "Pending"}</SelectItem>
              <SelectItem value="in_progress">{isAr ? "قيد التنفيذ" : "In progress"}</SelectItem>
              <SelectItem value="done">{isAr ? "مكتمل" : "Done"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? "ترتيب" : "Order"}</Label>
          <Input
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
