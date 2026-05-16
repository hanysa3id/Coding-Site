"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { Trash2 } from "lucide-react";
import { blogPostSchema, type BlogPostInput } from "@/lib/validators/blog";
import type { BlogPost, PostStatus } from "@/types/database";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
  uploadBlogImage,
} from "./actions";

export function BlogForm({
  initial,
  locale,
}: {
  initial?: BlogPost;
  locale: string;
}) {
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
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initial
      ? (initial as BlogPostInput)
      : {
          slug: "",
          title_ar: "",
          title_en: "",
          status: "draft",
        },
  });

  const status = watch("status");

  function onSubmit(data: BlogPostInput) {
    startTransition(async () => {
      const result = initial?.id
        ? await updatePostAction({ ...data, id: initial.id })
        : await createPostAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : (isAr ? "تم النشر" : "Created"));
      router.push(`/${locale}/admin/blog`);
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deletePostAction(initial.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.push(`/${locale}/admin/blog`);
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
              <Label>{isAr ? "العنوان (AR)" : "Title (AR)"}</Label>
              <Input {...register("title_ar")} dir="rtl" />
              {errors.title_ar && <p className="text-sm text-destructive">{errors.title_ar.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input {...register("title_en")} dir="ltr" />
              {errors.title_en && <p className="text-sm text-destructive">{errors.title_en.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...register("slug")} dir="ltr" placeholder="my-blog-post" />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
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
                  uploadAction={uploadBlogImage}
                  locale={locale}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "الحالة" : "Status"}</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as PostStatus)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{isAr ? "مسودة" : "Draft"}</SelectItem>
                <SelectItem value="published">{isAr ? "منشور" : "Published"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "مقتطف (AR)" : "Excerpt (AR)"}</Label>
              <Textarea {...register("excerpt_ar")} dir="rtl" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "مقتطف (EN)" : "Excerpt (EN)"}</Label>
              <Textarea {...register("excerpt_en")} dir="ltr" rows={3} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "المحتوى الكامل (AR)" : "Full content (AR)"}</Label>
              <Textarea {...register("content_ar")} dir="rtl" rows={15} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "المحتوى الكامل (EN)" : "Full content (EN)"}</Label>
              <Textarea {...register("content_en")} dir="ltr" rows={15} />
            </div>
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
            onClick={() => router.push(`/${locale}/admin/blog`)}
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
