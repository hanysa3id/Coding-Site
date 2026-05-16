"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import {
  Trash2,
  Plus,
  Image as ImageIcon,
  Video,
  Sparkles,
  Clock,
  Star,
  Tag,
  X,
} from "lucide-react";
import { blogPostSchema, type BlogPostInput } from "@/lib/validators/blog";
import type { BlogPost, BlogCategory, PostStatus } from "@/types/database";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
  uploadBlogImage,
  autoGenerateSeoAction,
} from "./actions";

type Props = {
  initial?: BlogPost;
  initialCategoryIds: string[];
  allCategories: BlogCategory[];
  locale: string;
};

export function BlogForm({ initial, initialCategoryIds, allCategories, locale }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  // Format scheduled_at for the datetime-local input (drop seconds + Z)
  const initialScheduled = initial?.scheduled_at
    ? new Date(initial.scheduled_at).toISOString().slice(0, 16)
    : "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initial
      ? {
          ...initial,
          tags: initial.tags ?? [],
          media: initial.media ?? [],
          faqs: initial.faqs ?? [],
          category_ids: initialCategoryIds,
          scheduled_at: initial.scheduled_at,
        }
      : {
          slug: "",
          title_ar: "",
          title_en: "",
          status: "draft",
          is_featured: false,
          tags: [],
          media: [],
          faqs: [],
          category_ids: [],
        },
  });

  const status = watch("status");
  const tags = watch("tags") ?? [];
  const media = watch("media") ?? [];
  const faqs = watch("faqs") ?? [];
  const categoryIds = watch("category_ids") ?? [];
  const isFeatured = watch("is_featured");

  function onSubmit(data: BlogPostInput) {
    // Convert datetime-local back to full ISO string if scheduling
    const payload = { ...data };
    if (data.status === "scheduled" && data.scheduled_at) {
      payload.scheduled_at = new Date(data.scheduled_at).toISOString();
    }
    startTransition(async () => {
      const result = initial?.id
        ? await updatePostAction({ ...payload, id: initial.id })
        : await createPostAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? (isAr ? "تم التحديث" : "Updated") : isAr ? "تم الإنشاء" : "Created");
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

  function autoSeo() {
    const v = getValues();
    startTransition(async () => {
      const res = await autoGenerateSeoAction({
        title_ar: v.title_ar,
        title_en: v.title_en,
        content_ar: v.content_ar,
        content_en: v.content_en,
      });
      if (!res.success) return;
      setValue("seo_title_ar", res.ar.title);
      setValue("seo_description_ar", res.ar.description);
      setValue("seo_keywords_ar", res.ar.keywords);
      setValue("seo_title_en", res.en.title);
      setValue("seo_description_en", res.en.description);
      setValue("seo_keywords_en", res.en.keywords);
      toast.success(isAr ? "تم توليد بيانات SEO تلقائياً" : "SEO generated from content");
    });
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput("");
      return;
    }
    setValue("tags", [...tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setValue("tags", tags.filter((x) => x !== t));
  }

  function toggleCategory(id: string) {
    const has = categoryIds.includes(id);
    setValue(
      "category_ids",
      has ? categoryIds.filter((x) => x !== id) : [...categoryIds, id]
    );
  }

  function addMedia(type: "image" | "video") {
    setValue("media", [...media, { type, url: "", caption_ar: "", caption_en: "" }]);
  }
  function updateMedia(i: number, patch: Partial<(typeof media)[number]>) {
    const next = [...media];
    next[i] = { ...next[i], ...patch };
    setValue("media", next);
  }
  function removeMedia(i: number) {
    setValue("media", media.filter((_, idx) => idx !== i));
  }

  function addFaq() {
    setValue("faqs", [
      ...faqs,
      { question_ar: "", question_en: "", answer_ar: "", answer_en: "" },
    ]);
  }
  function updateFaq(i: number, patch: Partial<(typeof faqs)[number]>) {
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    setValue("faqs", next);
  }
  function removeFaq(i: number) {
    setValue("faqs", faqs.filter((_, idx) => idx !== i));
  }

  // Build category tree for display
  const categoryTree = buildCategoryTree(allCategories);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="basic">{isAr ? "أساسي" : "Basic"}</TabsTrigger>
          <TabsTrigger value="content">{isAr ? "المحتوى" : "Content"}</TabsTrigger>
          <TabsTrigger value="media">{isAr ? "الوسائط" : "Media"}</TabsTrigger>
          <TabsTrigger value="faqs">{isAr ? "الأسئلة الشائعة" : "FAQs"}</TabsTrigger>
          <TabsTrigger value="taxonomy">{isAr ? "التصنيف والوسوم" : "Categories & Tags"}</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ── BASIC ─────────────────────────────────────────────────────── */}
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "الحالة" : "Status"}</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as PostStatus)} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{isAr ? "📝 مسودة" : "📝 Draft"}</SelectItem>
                  <SelectItem value="scheduled">{isAr ? "⏰ مجدول" : "⏰ Scheduled"}</SelectItem>
                  <SelectItem value="published">{isAr ? "✅ منشور" : "✅ Published"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "scheduled" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {isAr ? "موعد النشر" : "Publish at"}
                </Label>
                <Input
                  type="datetime-local"
                  {...register("scheduled_at")}
                  defaultValue={initialScheduled}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "سيظهر المقال للزوار تلقائياً عند هذا الوقت"
                    : "Post becomes visible to visitors at this time"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Switch
              checked={isFeatured}
              onCheckedChange={(v) => setValue("is_featured", v)}
            />
            <div>
              <Label className="flex items-center gap-1.5 cursor-pointer">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                {isAr ? "مقالة مميزة" : "Featured post"}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "ستظهر في شريط المقالات المميزة على صفحة المدونة"
                  : "Shown in the featured strip on the blog index"}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "مقتطف (AR)" : "Excerpt (AR)"}</Label>
              <Textarea {...register("excerpt_ar")} dir="rtl" rows={3} />
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "1-2 جملة تظهر في بطاقة المقالة على صفحة المدونة"
                  : "1-2 sentences shown on the blog card"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "مقتطف (EN)" : "Excerpt (EN)"}</Label>
              <Textarea {...register("excerpt_en")} dir="ltr" rows={3} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "المحتوى الكامل (AR) — Markdown مدعوم" : "Full content (AR) — Markdown supported"}</Label>
            <Controller
              control={control}
              name="content_ar"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  dir="rtl"
                  rows={18}
                  locale={locale}
                  placeholder={isAr ? "اكتب المقال هنا..." : "Write the article in Arabic..."}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "المحتوى الكامل (EN) — Markdown supported" : "Full content (EN) — Markdown supported"}</Label>
            <Controller
              control={control}
              name="content_en"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  dir="ltr"
                  rows={18}
                  locale={locale}
                  placeholder="Write the article in English..."
                />
              )}
            />
          </div>
        </TabsContent>

        {/* ── MEDIA ─────────────────────────────────────────────────────── */}
        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">{isAr ? "معرض الوسائط" : "Media gallery"}</Label>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "أضف صوراً وفيديوهات إضافية تُعرض داخل المقال"
                  : "Add extra images and videos rendered inside the article"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addMedia("image")}>
                <ImageIcon className="h-3.5 w-3.5" />
                {isAr ? "صورة" : "Image"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addMedia("video")}>
                <Video className="h-3.5 w-3.5" />
                {isAr ? "فيديو" : "Video"}
              </Button>
            </div>
          </div>

          {media.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 border rounded-lg">
              {isAr ? "لا توجد وسائط مضافة بعد" : "No media yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {media.map((m, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      {m.type === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {m.type === "video" ? (isAr ? "فيديو" : "Video") : (isAr ? "صورة" : "Image")}
                      <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    </Badge>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeMedia(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  {m.type === "image" ? (
                    <ImageUpload
                      value={m.url || null}
                      onChange={(url) => updateMedia(i, { url: url ?? "" })}
                      uploadAction={uploadBlogImage}
                      locale={locale}
                    />
                  ) : (
                    <Input
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      value={m.url}
                      onChange={(e) => updateMedia(i, { url: e.target.value })}
                      dir="ltr"
                    />
                  )}
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder={isAr ? "تعليق (AR)" : "Caption (AR)"}
                      value={m.caption_ar ?? ""}
                      onChange={(e) => updateMedia(i, { caption_ar: e.target.value })}
                      dir="rtl"
                    />
                    <Input
                      placeholder={isAr ? "تعليق (EN)" : "Caption (EN)"}
                      value={m.caption_en ?? ""}
                      onChange={(e) => updateMedia(i, { caption_en: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── FAQs ──────────────────────────────────────────────────────── */}
        <TabsContent value="faqs" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">{isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</Label>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تظهر كقسم منسدل في نهاية المقال وتساعد على SEO (Schema.org)"
                  : "Rendered as an accordion at the end of the post (helps SEO via Schema.org)"}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addFaq}>
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "سؤال جديد" : "New FAQ"}
            </Button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 border rounded-lg">
              {isAr ? "لا توجد أسئلة بعد" : "No FAQs yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {isAr ? "سؤال" : "Question"} #{i + 1}
                    </span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeFaq(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder={isAr ? "السؤال (AR)" : "Question (AR)"}
                      value={f.question_ar}
                      onChange={(e) => updateFaq(i, { question_ar: e.target.value })}
                      dir="rtl"
                    />
                    <Input
                      placeholder={isAr ? "السؤال (EN)" : "Question (EN)"}
                      value={f.question_en}
                      onChange={(e) => updateFaq(i, { question_en: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Textarea
                      placeholder={isAr ? "الإجابة (AR)" : "Answer (AR)"}
                      value={f.answer_ar}
                      onChange={(e) => updateFaq(i, { answer_ar: e.target.value })}
                      dir="rtl"
                      rows={3}
                    />
                    <Textarea
                      placeholder={isAr ? "الإجابة (EN)" : "Answer (EN)"}
                      value={f.answer_en}
                      onChange={(e) => updateFaq(i, { answer_en: e.target.value })}
                      dir="ltr"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAXONOMY (categories + tags) ─────────────────────────────── */}
        <TabsContent value="taxonomy" className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="text-base">{isAr ? "الأقسام" : "Categories"}</Label>
            {allCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground border rounded-lg p-4">
                {isAr
                  ? "لا توجد أقسام. أنشئ أقساماً من صفحة أقسام المدونة أولاً."
                  : "No categories. Create some from the Blog Categories page first."}
              </p>
            ) : (
              <div className="rounded-lg border p-3 max-h-72 overflow-y-auto space-y-1">
                {renderCategoryTree(categoryTree, 0, isAr, categoryIds, toggleCategory)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-base flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {isAr ? "الوسوم (Tags)" : "Tags"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "كلمات قصيرة تصف موضوع المقال. اضغط Enter للإضافة."
                : "Short words describing the post. Press Enter to add."}
            </p>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={isAr ? "أضف وسم..." : "Add a tag..."}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-3.5 w-3.5" />
                {isAr ? "إضافة" : "Add"}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 py-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ms-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── SEO ──────────────────────────────────────────────────────── */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {isAr ? "✨ توليد SEO تلقائي" : "✨ Auto-generate SEO"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "ينشئ العنوان والوصف والكلمات المفتاحية من محتوى المقال"
                  : "Builds title, description, and keywords from your article content"}
              </p>
            </div>
            <Button type="button" variant="default" size="sm" onClick={autoSeo} disabled={isPending}>
              <Sparkles className="h-3.5 w-3.5" />
              {isAr ? "توليد" : "Generate"}
            </Button>
          </div>

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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Keywords (AR) — {isAr ? "مفصولة بفواصل" : "comma separated"}</Label>
              <Input {...register("seo_keywords_ar")} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>Keywords (EN) — comma separated</Label>
              <Input {...register("seo_keywords_en")} dir="ltr" />
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

// ─── Category tree helpers ───────────────────────────────────────────────────

type CatNode = BlogCategory & { children: CatNode[] };

function buildCategoryTree(items: BlogCategory[]): CatNode[] {
  const map = new Map<string, CatNode>();
  items.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: CatNode[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(n);
    } else {
      roots.push(n);
    }
  });
  return roots;
}

function renderCategoryTree(
  nodes: CatNode[],
  depth: number,
  isAr: boolean,
  selected: string[],
  toggle: (id: string) => void
): React.ReactNode {
  return nodes.map((n) => (
    <div key={n.id}>
      <label
        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer"
        style={{ paddingInlineStart: 8 + depth * 20 }}
      >
        <input
          type="checkbox"
          checked={selected.includes(n.id)}
          onChange={() => toggle(n.id)}
          className="h-4 w-4 rounded"
        />
        <span className="text-sm">{isAr ? n.name_ar : n.name_en}</span>
        <code className="text-xs text-muted-foreground">{n.slug}</code>
      </label>
      {n.children.length > 0 && renderCategoryTree(n.children, depth + 1, isAr, selected, toggle)}
    </div>
  ));
}
