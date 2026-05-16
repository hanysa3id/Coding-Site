"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { blogCategorySchema, type BlogCategoryInput } from "@/lib/validators/blog";
import type { BlogCategory } from "@/types/database";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
  uploadBlogCategoryImage,
} from "../actions";

type Props = {
  initial?: BlogCategory;
  categories: BlogCategory[];
  locale: string;
  onDone: () => void;
};

export function BlogCategoryForm({ initial, categories, locale, onDone }: Props) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogCategoryInput>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: initial ?? {
      slug: "",
      name_ar: "",
      name_en: "",
      sort_order: 0,
      is_visible: true,
      parent_id: null,
    },
  });

  const visible = watch("is_visible");
  const parentId = watch("parent_id");
  const imageUrl = watch("image_url");

  function onSubmit(data: BlogCategoryInput) {
    startTransition(async () => {
      const action = initial?.id
        ? updateBlogCategoryAction({ ...data, id: initial.id })
        : createBlogCategoryAction(data);
      const result = await action;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : isAr ? "تم الإنشاء" : "Created");
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "الاسم بالعربية" : "Name (Arabic)"}</Label>
          <Input {...register("name_ar")} dir="rtl" disabled={isPending} />
          {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "الاسم بالإنجليزية" : "Name (English)"}</Label>
          <Input {...register("name_en")} dir="ltr" disabled={isPending} />
          {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input {...register("slug")} dir="ltr" placeholder="web-development" disabled={isPending} />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "القسم الأب (اختياري)" : "Parent category (optional)"}</Label>
        <Select
          value={parentId ?? "none"}
          onValueChange={(v) => setValue("parent_id", v === "none" ? null : v)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{isAr ? "بدون أب (قسم رئيسي)" : "No parent (root)"}</SelectItem>
            {categories
              .filter((c) => c.id !== initial?.id)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {isAr ? c.name_ar : c.name_en}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "الصورة المصغرة" : "Thumbnail image"}</Label>
        <ImageUpload
          value={imageUrl ?? null}
          onChange={(url) => setValue("image_url", url)}
          uploadAction={uploadBlogCategoryImage}
          locale={locale}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "وصف بالعربية" : "Description (AR)"}</Label>
          <Textarea {...register("description_ar")} dir="rtl" rows={3} disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "وصف بالإنجليزية" : "Description (EN)"}</Label>
          <Textarea {...register("description_en")} dir="ltr" rows={3} disabled={isPending} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "ترتيب" : "Sort order"}</Label>
          <Input type="number" {...register("sort_order", { valueAsNumber: true })} disabled={isPending} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={visible}
            onCheckedChange={(v) => setValue("is_visible", v)}
            disabled={isPending}
          />
          <Label>{isAr ? "ظاهر للزوار" : "Visible to visitors"}</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
