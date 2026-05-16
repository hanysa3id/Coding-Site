"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { ServiceFaq } from "@/types/database";
import {
  listServiceFaqsAction,
  upsertFaqAction,
  deleteFaqAction,
} from "./faq-actions";

type FaqForm = {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
};

const EMPTY: FaqForm = {
  question_ar: "",
  question_en: "",
  answer_ar: "",
  answer_en: "",
};

export function ServiceFaqEditor({
  serviceId,
  locale,
}: {
  serviceId: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<ServiceFaq | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FaqForm>(EMPTY);
  const [deleting, setDeleting] = useState<ServiceFaq | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listServiceFaqsAction(serviceId);
    if (result.success) setFaqs(result.data as ServiceFaq[]);
    setLoading(false);
  }, [serviceId]);

  useEffect(() => { refresh(); }, [refresh]);

  function openCreate() {
    setForm(EMPTY);
    setCreating(true);
  }

  function openEdit(faq: ServiceFaq) {
    setForm({
      question_ar: faq.question_ar,
      question_en: faq.question_en,
      answer_ar: faq.answer_ar,
      answer_en: faq.answer_en,
    });
    setEditing(faq);
  }

  function onSave() {
    startTransition(async () => {
      const result = await upsertFaqAction({
        id: editing?.id,
        service_id: serviceId,
        ...form,
        sort_order: editing?.sort_order ?? faqs.length,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      setCreating(false);
      setEditing(null);
      refresh();
    });
  }

  function onDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteFaqAction(deleting.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      setDeleting(null);
      refresh();
    });
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isAr ? `${faqs.length} سؤال` : `${faqs.length} questions`}
        </p>
        <Button size="sm" onClick={openCreate} type="button">
          <Plus className="h-4 w-4" />
          {isAr ? "سؤال جديد" : "New question"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{isAr ? "جارٍ التحميل..." : "Loading..."}</p>
      ) : faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {isAr ? "لا توجد أسئلة بعد" : "No FAQs yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <Card key={faq.id} className="bg-muted/30">
              <CardContent className="p-3 flex items-start gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {isAr ? faq.question_ar : faq.question_en}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {isAr ? faq.answer_ar : faq.answer_en}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" type="button" onClick={() => openEdit(faq)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" onClick={() => setDeleting(faq)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog
        open={creating || !!editing}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? isAr ? "تعديل سؤال" : "Edit question"
                : isAr ? "سؤال جديد" : "New question"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "السؤال (AR)" : "Question (AR)"}</Label>
                <Input
                  value={form.question_ar}
                  onChange={(e) => setForm({ ...form, question_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? "السؤال (EN)" : "Question (EN)"}</Label>
                <Input
                  value={form.question_en}
                  onChange={(e) => setForm({ ...form, question_en: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "الإجابة (AR)" : "Answer (AR)"}</Label>
                <Textarea
                  value={form.answer_ar}
                  onChange={(e) => setForm({ ...form, answer_ar: e.target.value })}
                  dir="rtl"
                  rows={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? "الإجابة (EN)" : "Answer (EN)"}</Label>
                <Textarea
                  value={form.answer_en}
                  onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
                  dir="ltr"
                  rows={4}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => { setCreating(false); setEditing(null); }}
              disabled={isPending}
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="button" onClick={onSave} disabled={isPending}>
              {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تأكيد الحذف" : "Confirm delete"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isAr ? "هل أنت متأكد من حذف هذا السؤال؟" : "Are you sure you want to delete this question?"}
          </p>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setDeleting(null)} disabled={isPending}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" type="button" onClick={onDelete} disabled={isPending}>
              {isAr ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
