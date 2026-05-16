"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userGroupSchema, type UserGroupInput } from "@/lib/validators/user-groups";
import type { UserGroup } from "@/types/database";
import {
  createUserGroupAction,
  updateUserGroupAction,
  deleteUserGroupAction,
} from "./actions";

type FormShape = Omit<UserGroupInput, "permissions"> & { permissions_json: string };

export function GroupForm({
  initial,
  locale,
}: {
  initial?: UserGroup;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(
      userGroupSchema
        .omit({ permissions: true })
        .extend({ permissions_json: userGroupSchema.shape.permissions.optional() as never })
    ) as never,
    defaultValues: initial
      ? {
          slug: initial.slug,
          name_ar: initial.name_ar,
          name_en: initial.name_en,
          description_ar: initial.description_ar ?? "",
          description_en: initial.description_en ?? "",
          color: initial.color ?? "",
          permissions_json: JSON.stringify(initial.permissions ?? {}, null, 2),
        }
      : {
          slug: "",
          name_ar: "",
          name_en: "",
          description_ar: "",
          description_en: "",
          color: "#10b981",
          permissions_json: "{}",
        },
  });

  function onSubmit(data: FormShape) {
    let permissions: Record<string, unknown>;
    try {
      permissions = JSON.parse(data.permissions_json || "{}");
      if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
        toast.error(isAr ? "Permissions يجب أن يكون كائن JSON" : "Permissions must be a JSON object");
        return;
      }
    } catch {
      toast.error(isAr ? "Permissions JSON غير صالح" : "Invalid Permissions JSON");
      return;
    }

    const payload: UserGroupInput = {
      ...(initial?.id ? { id: initial.id } : {}),
      slug: data.slug,
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar,
      description_en: data.description_en,
      color: data.color || "",
      permissions,
    };

    startTransition(async () => {
      const result = initial?.id
        ? await updateUserGroupAction(payload)
        : await createUserGroupAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : (isAr ? "تم الإنشاء" : "Created"));
      if (!initial && result.id) {
        router.push(`/${locale}/admin/groups/${result.id}`);
      } else {
        router.push(`/${locale}/admin/groups`);
      }
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (initial.is_system) {
      toast.error(isAr ? "مجموعة نظامية لا يمكن حذفها" : "System group cannot be deleted");
      return;
    }
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deleteUserGroupAction(initial.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.push(`/${locale}/admin/groups`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            {...register("slug")}
            dir="ltr"
            placeholder="vip"
            disabled={initial?.is_system}
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "لون التعريف" : "Tag color"}</Label>
          <Input {...register("color")} dir="ltr" type="text" placeholder="#10b981" />
          {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "الاسم (AR)" : "Name (AR)"}</Label>
          <Input {...register("name_ar")} dir="rtl" />
          {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "الاسم (EN)" : "Name (EN)"}</Label>
          <Input {...register("name_en")} dir="ltr" />
          {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "الوصف (AR)" : "Description (AR)"}</Label>
          <Textarea {...register("description_ar")} dir="rtl" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "الوصف (EN)" : "Description (EN)"}</Label>
          <Textarea {...register("description_en")} dir="ltr" rows={3} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "الصلاحيات (JSON)" : "Permissions (JSON)"}</Label>
        <Textarea
          {...register("permissions_json")}
          dir="ltr"
          rows={6}
          className="font-mono text-xs"
          placeholder='{"discount_percent": 10, "priority": true}'
        />
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "JSON حر يحدد صلاحيات المجموعة. مثال: { \"priority\": true, \"discount_percent\": 10 }"
            : "Free-form JSON describing group privileges. Example: { \"priority\": true, \"discount_percent\": 10 }"}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {initial?.id && !initial.is_system ? (
          <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {isAr ? "حذف" : "Delete"}
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
