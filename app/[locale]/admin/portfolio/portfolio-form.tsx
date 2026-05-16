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
import { ImageUpload } from "@/components/admin/image-upload";
import { TagInput } from "@/components/admin/tag-input";
import { TimelineEditor } from "@/components/admin/timeline-editor";
import { ServiceMultiSelect } from "@/components/admin/service-multi-select";
import { MediaGalleryEditor } from "@/components/admin/media-gallery-editor";
import {
  portfolioExtendedSchema,
  type PortfolioExtendedInput,
} from "@/lib/validators/portfolio";
import {
  createPortfolioAction,
  updatePortfolioAction,
  deletePortfolioAction,
  uploadPortfolioImage,
} from "./actions";
import { Trash2 } from "lucide-react";

type ServiceOption = { id: string; name_ar: string; name_en: string };

type Props = {
  initial?: Partial<PortfolioExtendedInput> & { id?: string };
  /** Services available to link */
  services: ServiceOption[];
  locale: string;
};

const TECH_SUGGESTIONS = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "NestJS",
  "Supabase", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma",
  "Stripe", "PayMob", "Vercel", "AWS", "Docker", "Cloudflare",
  "Figma", "Photoshop", "Illustrator",
  "WhatsApp Cloud API", "Twilio", "Resend",
];

export function PortfolioForm({ initial, services, locale }: Props) {
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
  } = useForm<PortfolioExtendedInput>({
    resolver: zodResolver(portfolioExtendedSchema),
    defaultValues: {
      slug: "",
      title_ar: "",
      title_en: "",
      features_ar: [],
      features_en: [],
      problems_solved_ar: [],
      problems_solved_en: [],
      technologies: [],
      timeline_ar: [],
      timeline_en: [],
      service_ids: [],
      gallery: [],
      sort_order: 0,
      is_visible: true,
      is_featured: false,
      ...initial,
    },
  });

  const visible = watch("is_visible");
  const featured = watch("is_featured");

  function onSubmit(data: PortfolioExtendedInput) {
    startTransition(async () => {
      const result = initial?.id
        ? await updatePortfolioAction({ ...data, id: initial.id })
        : await createPortfolioAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        initial ? (isAr ? "تم التحديث" : "Updated") : isAr ? "تم الإنشاء" : "Created"
      );
      router.push(`/${locale}/admin/portfolio`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deletePortfolioAction(initial.id!);
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
      <Tabs defaultValue="basic">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="basic">{isAr ? "أساسي" : "Basic"}</TabsTrigger>
          <TabsTrigger value="content">{isAr ? "تفاصيل المشروع" : "Project details"}</TabsTrigger>
          <TabsTrigger value="timeline">{isAr ? "الجدول الزمني" : "Timeline"}</TabsTrigger>
          <TabsTrigger value="services">{isAr ? "الخدمات" : "Services"}</TabsTrigger>
          <TabsTrigger value="media">{isAr ? "الوسائط" : "Media"}</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ───────────────────────── BASIC ───────────────────────── */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "اسم المشروع (AR)" : "Project name (AR)"}</Label>
              <Input {...register("title_ar")} dir="rtl" />
              {errors.title_ar && (
                <p className="text-sm text-destructive">{errors.title_ar.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "اسم المشروع (EN)" : "Project name (EN)"}</Label>
              <Input {...register("title_en")} dir="ltr" />
              {errors.title_en && (
                <p className="text-sm text-destructive">{errors.title_en.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...register("slug")} dir="ltr" placeholder="ecommerce-redesign" />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف المشروع (AR)" : "Description (AR)"}</Label>
              <Textarea {...register("description_ar")} dir="rtl" rows={5} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف المشروع (EN)" : "Description (EN)"}</Label>
              <Textarea {...register("description_en")} dir="ltr" rows={5} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{isAr ? "صاحب المشروع / العميل" : "Client / project owner"}</Label>
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

          <div className="grid gap-4 md:grid-cols-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>{isAr ? "ترتيب العرض" : "Sort order"}</Label>
              <Input
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={visible}
                onCheckedChange={(v) => setValue("is_visible", v)}
              />
              <Label>{isAr ? "ظاهر للزوار" : "Visible"}</Label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={featured}
                onCheckedChange={(v) => setValue("is_featured", v)}
              />
              <Label>{isAr ? "مميز (يظهر في الرئيسية)" : "Featured"}</Label>
            </div>
          </div>
        </TabsContent>

        {/* ─────────────────── CONTENT (features/problems/tech) ─────────────────── */}
        <TabsContent value="content" className="space-y-6 pt-4">
          <section className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "مميزات المشروع" : "Project features"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اكتب كل ميزة ثم اضغط Enter أو فاصلة لإضافتها"
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
              {isAr ? "المشاكل التي يحلها المشروع" : "Problems the project solves"}
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="problems_solved_ar"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالعربية" : "Arabic"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="rtl"
                      placeholder={isAr ? "مشكلة..." : "Problem..."}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="problems_solved_en"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm">{isAr ? "بالإنجليزية" : "English"}</Label>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      dir="ltr"
                      placeholder="Problem..."
                    />
                  </div>
                )}
              />
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              {isAr ? "التقنيات المستخدمة" : "Technologies used"}
            </Label>
            <Controller
              control={control}
              name="technologies"
              render={({ field }) => (
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  dir="ltr"
                  placeholder={isAr ? "ابدأ بالكتابة لرؤية اقتراحات..." : "Start typing for suggestions..."}
                  suggestions={TECH_SUGGESTIONS}
                />
              )}
            />
          </section>
        </TabsContent>

        {/* ───────────────────────── TIMELINE ───────────────────────── */}
        <TabsContent value="timeline" className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "خطوات التنفيذ (بالعربية)" : "Execution steps (Arabic)"}
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
              {isAr ? "خطوات التنفيذ (بالإنجليزية)" : "Execution steps (English)"}
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

        {/* ───────────────────────── SERVICES ───────────────────────── */}
        <TabsContent value="services" className="space-y-4 pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "الخدمات التي يشملها المشروع" : "Services included in the project"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اختر الخدمات المرتبطة بهذا المشروع. ستظهر في صفحة كل خدمة كمشروع مرجعي."
                : "Select services linked to this project. They'll show on each service page as a reference."}
            </p>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                {isAr
                  ? "لا توجد خدمات بعد. أنشئ الخدمات أولاً من قسم الخدمات."
                  : "No services yet. Create services first from the Services section."}
              </p>
            ) : (
              <Controller
                control={control}
                name="service_ids"
                render={({ field }) => (
                  <ServiceMultiSelect
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={services}
                    locale={locale}
                  />
                )}
              />
            )}
          </div>
        </TabsContent>

        {/* ───────────────────────── MEDIA ───────────────────────── */}
        <TabsContent value="media" className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "صورة الغلاف" : "Cover image"}
            </Label>
            <Controller
              control={control}
              name="cover_image"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? null}
                  onChange={(url) => field.onChange(url ?? "")}
                  uploadAction={uploadPortfolioImage}
                  locale={locale}
                />
              )}
            />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              {isAr ? "معرض الصور والفيديوهات" : "Gallery (images & videos)"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "ارفع صور متعددة دفعة واحدة أو ألصق روابط YouTube / Vimeo / فيديو مباشر."
                : "Upload multiple images at once or paste YouTube/Vimeo/direct video URLs."}
            </p>
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <MediaGalleryEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  uploadAction={uploadPortfolioImage}
                  locale={locale}
                />
              )}
            />
          </div>
        </TabsContent>

        {/* ───────────────────────── SEO ───────────────────────── */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "حقول SEO اختيارية. لو تركتها فارغة، سيُستخدم عنوان ووصف المشروع تلقائياً."
              : "Optional SEO fields. If left empty, the project title and description will be used."}
          </p>
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
            <Label>{isAr ? "الكلمات المفتاحية (مفصولة بفواصل)" : "Keywords (comma-separated)"}</Label>
            <Input
              {...register("seo_keywords")}
              dir="ltr"
              placeholder="e-commerce, react, payment gateway"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        {initial?.id && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
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
            {isPending
              ? (isAr ? "جارٍ الحفظ..." : "Saving...")
              : isAr ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
