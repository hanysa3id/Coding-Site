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
import { TagInput } from "@/components/admin/tag-input";
import { TimelineEditor } from "@/components/admin/timeline-editor";
import { MediaGalleryEditor } from "@/components/admin/media-gallery-editor";
import {
  serviceExtendedSchema,
  type ServiceExtendedInput,
} from "@/lib/validators/service";
import type { Service, Category } from "@/types/database";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  uploadServiceImage,
} from "./actions";
import { Trash2 } from "lucide-react";
import { ServiceFaqEditor } from "./faq-editor";

type Props = {
  initial?: Partial<ServiceExtendedInput> & { id?: string };
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
  } = useForm<ServiceExtendedInput>({
    resolver: zodResolver(serviceExtendedSchema),
    defaultValues: {
      slug: "",
      name_ar: "",
      name_en: "",
      category_id: categories[0]?.id ?? "",
      currency: "EGP",
      sort_order: 0,
      is_visible: true,
      is_featured: false,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      gallery: [],
      ...initial,
    },
  });

  const visible = watch("is_visible");
  const featured = watch("is_featured");
  const categoryId = watch("category_id");

  function onSubmit(data: ServiceExtendedInput) {
    startTransition(async () => {
      const result = initial?.id
        ? await updateServiceAction({ ...data, id: initial.id })
        : await createServiceAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : isAr ? "تم الإنشاء" : "Created");
      router.push(`/${locale}/admin/services`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deleteServiceAction(initial.id!);
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
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="basic">{isAr ? "أساسي" : "Basic"}</TabsTrigger>
          <TabsTrigger value="content">{isAr ? "تفاصيل الخدمة" : "Service details"}</TabsTrigger>
          <TabsTrigger value="timeline">{isAr ? "الجدول الزمني" : "Timeline"}</TabsTrigger>
          <TabsTrigger value="pricing">{isAr ? "السعر والمدة" : "Pricing"}</TabsTrigger>
          <TabsTrigger value="media">{isAr ? "الوسائط" : "Media"}</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          {initial?.id && (
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          )}
        </TabsList>

        {/* ───────────────────────── BASIC ───────────────────────── */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "اسم الخدمة (AR)" : "Service name (AR)"}</Label>
              <Input {...register("name_ar")} dir="rtl" disabled={isPending} />
              {errors.name_ar && (
                <p className="text-sm text-destructive">{errors.name_ar.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "اسم الخدمة (EN)" : "Service name (EN)"}</Label>
              <Input {...register("name_en")} dir="ltr" disabled={isPending} />
              {errors.name_en && (
                <p className="text-sm text-destructive">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...register("slug")} dir="ltr" placeholder="website-development" disabled={isPending} />
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف مختصر (AR)" : "Short description (AR)"}</Label>
              <Textarea
                {...register("short_description_ar")}
                dir="rtl"
                rows={3}
                disabled={isPending}
                placeholder={isAr ? "يظهر في بطاقات الخدمة والملخصات" : "Shows on service cards and summaries"}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف مختصر (EN)" : "Short description (EN)"}</Label>
              <Textarea {...register("short_description_en")} dir="ltr" rows={3} disabled={isPending} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف تفصيلي (AR)" : "Full description (AR)"}</Label>
              <Textarea {...register("full_description_ar")} dir="rtl" rows={8} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف تفصيلي (EN)" : "Full description (EN)"}</Label>
              <Textarea {...register("full_description_en")} dir="ltr" rows={8} disabled={isPending} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>{isAr ? "ترتيب العرض" : "Sort order"}</Label>
              <Input
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
              <Label>{isAr ? "مميزة" : "Featured"}</Label>
            </div>
          </div>
        </TabsContent>

        {/* ─────────────────── DETAILS (features + deliverables) ─────────────────── */}
        <TabsContent value="content" className="space-y-6 pt-4">
          <section className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "مميزات الخدمة" : "Service features"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اكتب كل ميزة ثم اضغط Enter أو فاصلة"
                : "Type each feature and press Enter or comma"}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="features_ar"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالعربية" : "Arabic"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="rtl"
                      placeholder={isAr ? "ميزة..." : "Feature..."}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="features_en"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالإنجليزية" : "English"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="ltr"
                      placeholder="Feature..."
                    />
                  </div>
                )}
              />
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              {isAr ? "ما الذي سيحصل عليه العميل" : "What the customer will receive"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اذكر بنود التسليم الواضحة (مثل: كود المشروع، 3 جلسات تدريب، دومين، استضافة سنة)"
                : "List concrete deliverables (e.g. source code, 3 training sessions, domain, 1 year hosting)"}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="deliverables_ar"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالعربية" : "Arabic"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="rtl"
                      placeholder={isAr ? "بند..." : "Item..."}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="deliverables_en"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالإنجليزية" : "English"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="ltr"
                      placeholder="Item..."
                    />
                  </div>
                )}
              />
            </div>
          </section>
        </TabsContent>

        {/* ───────────────────────── TIMELINE ───────────────────────── */}
        <TabsContent value="timeline" className="space-y-6 pt-4">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "مراحل تنفيذ الخدمة كمرجع للعميل قبل الطلب — مثل: تحليل، تصميم، تطوير، اختبار، تسليم"
              : "Execution stages shown to customers before they order — e.g. Analysis, Design, Development, Testing, Delivery"}
          </p>
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "الجدول الزمني (AR)" : "Timeline (AR)"}
            </Label>
            <Controller
              control={control}
              name="timeline_ar"
              render={({ field }) => (
                <TimelineEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  locale="ar"
                  dir="rtl"
                />
              )}
            />
          </div>
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              {isAr ? "الجدول الزمني (EN)" : "Timeline (EN)"}
            </Label>
            <Controller
              control={control}
              name="timeline_en"
              render={({ field }) => (
                <TimelineEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  locale="en"
                  dir="ltr"
                />
              )}
            />
          </div>
        </TabsContent>

        {/* ───────────────────────── PRICING ───────────────────────── */}
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

        {/* ───────────────────────── MEDIA ───────────────────────── */}
        <TabsContent value="media" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {isAr ? "أيقونة الخدمة (مصغّرة)" : "Service thumbnail (icon-size)"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "صورة صغيرة 64x64 تقريباً، تُعرض بجانب اسم الخدمة في القوائم"
                  : "Small ~64x64 image shown beside the service name in lists"}
              </p>
              <Controller
                control={control}
                name="thumbnail_url"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ?? null}
                    onChange={(url) => field.onChange(url ?? "")}
                    uploadAction={uploadServiceImage}
                    locale={locale}
                  />
                )}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {isAr ? "صورة الغلاف" : "Cover image"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "صورة كبيرة (16:9) لأعلى صفحة الخدمة"
                  : "Large 16:9 hero image for the service page"}
              </p>
              <Controller
                control={control}
                name="cover_image"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ?? null}
                    onChange={(url) => field.onChange(url ?? "")}
                    uploadAction={uploadServiceImage}
                    locale={locale}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              {isAr ? "معرض الصور والفيديوهات" : "Image & video gallery"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "ارفع صور متعددة أو ألصق روابط YouTube / Vimeo"
                : "Upload images or paste YouTube/Vimeo URLs"}
            </p>
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <MediaGalleryEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  uploadAction={uploadServiceImage}
                  locale={locale}
                />
              )}
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label>{isAr ? "رابط فيديو ميزة (اختياري)" : "Featured video URL (optional)"}</Label>
            <Input {...register("video_url")} dir="ltr" placeholder="https://youtube.com/..." />
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "فيديو رئيسي يُعرض بارزاً في صفحة الخدمة"
                : "A primary video featured prominently on the service page"}
            </p>
          </div>
        </TabsContent>

        {/* ───────────────────────── SEO ───────────────────────── */}
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
            <Input {...register("seo_keywords")} dir="ltr" placeholder="keyword1, keyword2" />
          </div>
        </TabsContent>

        {/* ───────────────────────── FAQ ───────────────────────── */}
        {initial?.id && (
          <TabsContent value="faq">
            <ServiceFaqEditor serviceId={initial.id} locale={locale} />
          </TabsContent>
        )}
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
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
