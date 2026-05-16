"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/image-upload";
import { portfolioSchema, type PortfolioInput } from "@/lib/validators/admin";
import type { PortfolioProject } from "@/types/database";
import {
  createPortfolioAction,
  updatePortfolioAction,
  deletePortfolioAction,
  uploadPortfolioImage,
} from "./actions";
import { Trash2 } from "lucide-react";

type Props = { initial?: PortfolioProject; locale: string };

export function PortfolioForm({ initial, locale }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioInput>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: initial
      ? (initial as PortfolioInput)
      : {
          slug: "",
          title_ar: "",
          title_en: "",
          sort_order: 0,
          is_visible: true,
          is_featured: false,
        },
  });

  const visible = watch("is_visible");
  const featured = watch("is_featured");

  function onSubmit(data: PortfolioInput) {
    startTransition(async () => {
      const action = initial?.id
        ? updatePortfolioAction({ ...data, id: initial.id })
        : createPortfolioAction(data);
      const result = await action;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : isAr ? "تم الإنشاء" : "Created");
      router.push(`/${locale}/admin/portfolio`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deletePortfolioAction(initial.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.push(`/${locale}/admin/portfolio`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title_ar">{isAr ? "العنوان بالعربية" : "Title (AR)"}</Label>
          <Input id="title_ar" {...register("title_ar")} dir="rtl" />
          {errors.title_ar && <p className="text-sm text-destructive">{errors.title_ar.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">{isAr ? "العنوان بالإنجليزية" : "Title (EN)"}</Label>
          <Input id="title_en" {...register("title_en")} dir="ltr" />
          {errors.title_en && <p className="text-sm text-destructive">{errors.title_en.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} dir="ltr" placeholder="ecommerce-redesign" />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "وصف (AR)" : "Description (AR)"}</Label>
          <Textarea {...register("description_ar")} dir="rtl" rows={5} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "وصف (EN)" : "Description (EN)"}</Label>
          <Textarea {...register("description_en")} dir="ltr" rows={5} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "صورة الغلاف" : "Cover image"}</Label>
        <Controller
          control={control}
          name="cover_image"
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? null}
              onChange={(url) => field.onChange(url)}
              uploadAction={uploadPortfolioImage}
              locale={locale}
            />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>{isAr ? "اسم العميل (اختياري)" : "Client name (optional)"}</Label>
          <Input {...register("client_name")} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "تاريخ التسليم" : "Delivery date"}</Label>
          <Input type="date" {...register("delivery_date")} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رابط المشروع" : "Project URL"}</Label>
          <Input {...register("project_url")} dir="ltr" placeholder="https://..." />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>{isAr ? "ترتيب" : "Sort order"}</Label>
          <Input type="number" {...register("sort_order", { valueAsNumber: true })} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={visible} onCheckedChange={(v) => setValue("is_visible", v)} />
          <Label>{isAr ? "ظاهر" : "Visible"}</Label>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={featured} onCheckedChange={(v) => setValue("is_featured", v)} />
          <Label>{isAr ? "مميز" : "Featured"}</Label>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        {initial?.id && (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {isAr ? "حذف" : "Delete"}
          </Button>
        )}
        <div className="flex gap-2 ms-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/${locale}/admin/portfolio`)}
            disabled={isPending}
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
