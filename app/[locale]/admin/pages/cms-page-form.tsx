"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cmsPageSchema, type CmsPageInput } from "@/lib/validators/cms";
import type { CmsPage } from "@/types/database";
import {
  createCmsPageAction,
  updateCmsPageAction,
  deleteCmsPageAction,
} from "./actions";

export function CmsPageForm({
  initial,
  locale,
}: {
  initial?: CmsPage;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CmsPageInput>({
    resolver: zodResolver(cmsPageSchema),
    defaultValues: initial
      ? (initial as unknown as CmsPageInput)
      : {
          slug: "",
          title_ar: "",
          title_en: "",
          content_ar: "",
          content_en: "",
          status: "draft",
          show_in_footer: false,
          sort_order: 0,
        },
  });

  function onSubmit(data: CmsPageInput) {
    startTransition(async () => {
      const result = initial?.id
        ? await updateCmsPageAction({ ...data, id: initial.id })
        : await createCmsPageAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : (isAr ? "تم الإنشاء" : "Created"));
      router.push(`/${locale}/admin/pages`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (initial.is_system) {
      toast.error(isAr ? "صفحة نظامية لا يمكن حذفها" : "System page cannot be deleted");
      return;
    }
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deleteCmsPageAction(initial.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.push(`/${locale}/admin/pages`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">{isAr ? "أساسي" : "Basic"}</TabsTrigger>
          <TabsTrigger value="content">{isAr ? "المحتوى" : "Content"}</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                {...register("slug")}
                dir="ltr"
                placeholder="privacy"
                disabled={initial?.is_system}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              {initial?.is_system && (
                <p className="text-xs text-muted-foreground">
                  {isAr ? "لا يمكن تغيير الـ slug لصفحة نظامية." : "System page slug cannot be changed."}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "ترتيب الفوتر" : "Footer order"}</Label>
              <Input
                {...register("sort_order", { valueAsNumber: true })}
                type="number"
                dir="ltr"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "العنوان (AR)" : "Title (AR)"}</Label>
              <Input {...register("title_ar")} dir="rtl" />
              {errors.title_ar && (
                <p className="text-sm text-destructive">{errors.title_ar.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input {...register("title_en")} dir="ltr" />
              {errors.title_en && (
                <p className="text-sm text-destructive">{errors.title_en.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1.5">
              <Label>{isAr ? "الحالة" : "Status"}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{isAr ? "مسودة" : "Draft"}</SelectItem>
                      <SelectItem value="published">{isAr ? "منشور" : "Published"}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Controller
                control={control}
                name="show_in_footer"
                render={({ field }) => (
                  <Checkbox
                    id="show_in_footer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="show_in_footer" className="cursor-pointer">
                {isAr ? "إظهار في الفوتر" : "Show in footer"}
              </Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "اكتب المحتوى بصيغة Markdown — يمكنك استخدام #, ##, **bold**, [text](url)، إلخ."
              : "Write content in Markdown — you can use #, ##, **bold**, [text](url), etc."}
          </p>
          <div className="space-y-2">
            <Label>{isAr ? "المحتوى (AR) — Markdown" : "Content (AR) — Markdown"}</Label>
            <Textarea
              {...register("content_ar")}
              dir="rtl"
              rows={20}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "المحتوى (EN) — Markdown" : "Content (EN) — Markdown"}</Label>
            <Textarea
              {...register("content_en")}
              dir="ltr"
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "عنوان SEO (AR)" : "SEO title (AR)"}</Label>
              <Input {...register("seo_title_ar")} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "عنوان SEO (EN)" : "SEO title (EN)"}</Label>
              <Input {...register("seo_title_en")} dir="ltr" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "وصف SEO (AR)" : "SEO description (AR)"}</Label>
              <Textarea {...register("seo_description_ar")} dir="rtl" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "وصف SEO (EN)" : "SEO description (EN)"}</Label>
              <Textarea {...register("seo_description_en")} dir="ltr" rows={3} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
