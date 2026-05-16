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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { serviceSchema, type ServiceInput } from "@/lib/validators/admin";
import type { Service, Category } from "@/types/database";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  uploadServiceImage,
} from "./actions";
import { Trash2 } from "lucide-react";

type Props = {
  initial?: Service;
  categories: Category[];
  locale: string;
};

export function ServiceForm({ initial, categories, locale }: Props) {
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
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initial
      ? (initial as ServiceInput)
      : {
          slug: "",
          name_ar: "",
          name_en: "",
          category_id: categories[0]?.id ?? "",
          currency: "EGP",
          sort_order: 0,
          is_visible: true,
          is_featured: false,
        },
  });

  const visible = watch("is_visible");
  const featured = watch("is_featured");
  const categoryId = watch("category_id");
  const coverImage = watch("cover_image");

  function onSubmit(data: ServiceInput) {
    startTransition(async () => {
      const action = initial?.id
        ? updateServiceAction({ ...data, id: initial.id })
        : createServiceAction(data);
      const result = await action;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : (isAr ? "تم الإنشاء" : "Created"));
      router.push(`/${locale}/admin/services`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deleteServiceAction(initial.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.push(`/${locale}/admin/services`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">{isAr ? "أساسي" : "Basic"}</TabsTrigger>
          <TabsTrigger value="content">{isAr ? "المحتوى" : "Content"}</TabsTrigger>
          <TabsTrigger value="pricing">{isAr ? "السعر والمدة" : "Pricing"}</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name_ar">{isAr ? "الاسم بالعربية" : "Name (AR)"}</Label>
              <Input id="name_ar" {...register("name_ar")} dir="rtl" disabled={isPending} />
              {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">{isAr ? "الاسم بالإنجليزية" : "Name (EN)"}</Label>
              <Input id="name_en" {...register("name_en")} dir="ltr" disabled={isPending} />
              {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} dir="ltr" placeholder="website-development" disabled={isPending} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "القسم" : "Category"}</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setValue("category_id", v)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر قسمًا" : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {isAr ? c.name_ar : c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
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
                  uploadAction={uploadServiceImage}
                  locale={locale}
                />
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sort_order">{isAr ? "ترتيب" : "Sort order"}</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
                disabled={isPending}
              />
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
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف قصير (AR)" : "Short description (AR)"}</Label>
              <Textarea {...register("short_description_ar")} dir="rtl" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف قصير (EN)" : "Short description (EN)"}</Label>
              <Textarea {...register("short_description_en")} dir="ltr" rows={3} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف كامل (AR)" : "Full description (AR)"}</Label>
              <Textarea {...register("full_description_ar")} dir="rtl" rows={8} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف كامل (EN)" : "Full description (EN)"}</Label>
              <Textarea {...register("full_description_en")} dir="ltr" rows={8} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">{isAr ? "رابط فيديو (اختياري)" : "Video URL (optional)"}</Label>
            <Input id="video_url" {...register("video_url")} dir="ltr" placeholder="https://youtube.com/..." />
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{isAr ? "أدنى سعر" : "Min price"}</Label>
              <Input
                type="number"
                step="0.01"
                {...register("estimated_price_min", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "أعلى سعر" : "Max price"}</Label>
              <Input
                type="number"
                step="0.01"
                {...register("estimated_price_max", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العملة" : "Currency"}</Label>
              <Input {...register("currency")} dir="ltr" disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "المدة المتوقعة (أيام)" : "Estimated duration (days)"}</Label>
            <Input
              type="number"
              {...register("estimated_duration_days", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              disabled={isPending}
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SEO Title (AR)</Label>
              <Input {...register("seo_title_ar")} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>SEO Title (EN)</Label>
              <Input {...register("seo_title_en")} dir="ltr" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Meta Description (AR)</Label>
              <Textarea {...register("seo_description_ar")} dir="rtl" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Meta Description (EN)</Label>
              <Textarea {...register("seo_description_en")} dir="ltr" rows={3} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta Keywords</Label>
            <Input {...register("seo_keywords")} placeholder="keyword1, keyword2, ..." />
          </div>
        </TabsContent>
      </Tabs>

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
            onClick={() => router.push(`/${locale}/admin/services`)}
            disabled={isPending}
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
