"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import type { TeamMember } from "@/types/database";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  uploadTeamAvatarAction,
} from "./actions";

type MemberForm = {
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  bio_ar: string;
  bio_en: string;
  avatar_url: string;
  sort_order: number;
  is_visible: boolean;
};

const EMPTY: MemberForm = {
  name_ar: "",
  name_en: "",
  role_ar: "",
  role_en: "",
  bio_ar: "",
  bio_en: "",
  avatar_url: "",
  sort_order: 0,
  is_visible: true,
};

export function TeamManager({
  initialMembers,
  locale,
}: {
  initialMembers: TeamMember[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<MemberForm>(EMPTY);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);

  function openCreate() {
    setForm({ ...EMPTY, sort_order: members.length });
    setCreating(true);
  }

  function openEdit(m: TeamMember) {
    setForm({
      name_ar: m.name_ar,
      name_en: m.name_en,
      role_ar: m.role_ar,
      role_en: m.role_en,
      bio_ar: m.bio_ar ?? "",
      bio_en: m.bio_en ?? "",
      avatar_url: m.avatar_url ?? "",
      sort_order: m.sort_order,
      is_visible: m.is_visible,
    });
    setEditing(m);
  }

  function onSave() {
    startTransition(async () => {
      let result;
      if (editing) {
        result = await updateTeamMemberAction(editing.id, form);
      } else {
        result = await createTeamMemberAction(form);
      }
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      setCreating(false);
      setEditing(null);
      // Optimistic: refetch not available in client, user will see on refresh
      // In practice Next.js revalidatePath will update server data
    });
  }

  function onDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteTeamMemberAction(deleting.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      setMembers((prev) => prev.filter((m) => m.id !== deleting.id));
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isAr ? `${members.length} عضو` : `${members.length} members`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {isAr ? "عضو جديد" : "Add member"}
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isAr ? "لا يوجد أعضاء بعد" : "No team members yet"}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Card key={m.id} className={m.is_visible ? "" : "opacity-60"}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted border shrink-0">
                    {m.avatar_url ? (
                      <Image src={m.avatar_url} alt={m.name_en} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{isAr ? m.name_ar : m.name_en}</p>
                    <p className="text-sm text-muted-foreground">{isAr ? m.role_ar : m.role_en}</p>
                    {!m.is_visible && (
                      <Badge variant="secondary" className="mt-1">{isAr ? "مخفي" : "Hidden"}</Badge>
                    )}
                  </div>
                </div>
                {(isAr ? m.bio_ar : m.bio_en) && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isAr ? m.bio_ar : m.bio_en}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(m)} className="flex-1">
                    <Pencil className="h-3.5 w-3.5" />
                    {isAr ? "تعديل" : "Edit"}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(m)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
              {editing ? (isAr ? "تعديل عضو" : "Edit member") : (isAr ? "عضو جديد" : "New member")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>{isAr ? "صورة الملف الشخصي" : "Avatar"}</Label>
              <ImageUpload
                value={form.avatar_url || null}
                onChange={(url) => setForm({ ...form, avatar_url: url ?? "" })}
                uploadAction={uploadTeamAvatarAction}
                locale={locale}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "الاسم (AR)" : "Name (AR)"}</Label>
                <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} dir="rtl" />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? "الاسم (EN)" : "Name (EN)"}</Label>
                <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "الدور (AR)" : "Role (AR)"}</Label>
                <Input value={form.role_ar} onChange={(e) => setForm({ ...form, role_ar: e.target.value })} dir="rtl" />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? "الدور (EN)" : "Role (EN)"}</Label>
                <Input value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} dir="ltr" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "السيرة الذاتية (AR)" : "Bio (AR)"}</Label>
                <Textarea value={form.bio_ar} onChange={(e) => setForm({ ...form, bio_ar: e.target.value })} dir="rtl" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>{isAr ? "السيرة الذاتية (EN)" : "Bio (EN)"}</Label>
                <Textarea value={form.bio_en} onChange={(e) => setForm({ ...form, bio_en: e.target.value })} dir="ltr" rows={3} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isAr ? "الترتيب" : "Sort order"}</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={form.is_visible}
                  onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
                />
                <Label>{isAr ? "مرئي" : "Visible"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }} disabled={isPending}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={onSave} disabled={isPending}>
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
            {isAr ? `حذف "${deleting ? (isAr ? deleting.name_ar : deleting.name_en) : ""}"؟` : `Delete "${deleting?.name_en}"?`}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)} disabled={isPending}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isPending}>
              {isAr ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
