"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addGroupMemberAction,
  removeGroupMemberAction,
} from "./actions";
import type { Profile } from "@/types/database";

type Member = Pick<Profile, "id" | "full_name" | "email" | "role">;

export function GroupMembers({
  groupId,
  members,
  candidates,
  locale,
}: {
  groupId: string;
  members: Member[];
  candidates: Member[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");

  const filteredCandidates = candidates.filter(
    (c) =>
      !members.some((m) => m.id === c.id) &&
      (query === "" ||
        (c.full_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  function onAdd() {
    if (!selected) return;
    startTransition(async () => {
      const r = await addGroupMemberAction({ group_id: groupId, user_id: selected });
      if (!r.success) { toast.error(r.error); return; }
      toast.success(isAr ? "تمت الإضافة" : "Added");
      setSelected("");
      router.refresh();
    });
  }

  function onRemove(userId: string) {
    if (!confirm(isAr ? "إزالة هذا العضو؟" : "Remove this member?")) return;
    startTransition(async () => {
      const r = await removeGroupMemberAction({ group_id: groupId, user_id: userId });
      if (!r.success) { toast.error(r.error); return; }
      toast.success(isAr ? "تمت الإزالة" : "Removed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAr ? "ابحث بالاسم أو البريد..." : "Search by name or email..."}
        />
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1">
              <SelectValue
                placeholder={isAr ? "اختر مستخدماً للإضافة" : "Pick a user to add"}
              />
            </SelectTrigger>
            <SelectContent>
              {filteredCandidates.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {isAr ? "لا توجد نتائج" : "No results"}
                </div>
              ) : (
                filteredCandidates.slice(0, 50).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.full_name ?? c.email ?? c.id).slice(0, 60)}{" "}
                    <span className="text-muted-foreground">· {c.role}</span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button onClick={onAdd} disabled={isPending || !selected}>
            <UserPlus className="h-4 w-4" />
            {isAr ? "إضافة" : "Add"}
          </Button>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isAr ? "لا يوجد أعضاء بعد" : "No members yet"}
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">{m.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {m.email} · {m.role}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(m.id)}
                disabled={isPending}
                aria-label={isAr ? "إزالة" : "Remove"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
