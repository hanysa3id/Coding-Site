"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignSalesAction, assignStaffAction } from "../../actions";

type StaffProfile = { id: string; full_name: string | null; email: string | null; role: string };

export function StaffAssigner({
  orderId,
  currentSalesId,
  currentStaffId,
  staffProfiles,
  locale,
}: {
  orderId: string;
  currentSalesId: string | null;
  currentStaffId: string | null;
  staffProfiles: StaffProfile[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sales = staffProfiles.filter((p) => p.role === "sales" || p.role === "admin");
  const team = staffProfiles.filter((p) => p.role === "staff" || p.role === "admin");

  function handleAssign(action: typeof assignSalesAction, value: string) {
    startTransition(async () => {
      const result = await action(orderId, value === "none" ? null : value);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم التعيين" : "Assigned");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{isAr ? "مسؤول المبيعات" : "Sales rep"}</Label>
        <Select
          value={currentSalesId ?? "none"}
          onValueChange={(v) => handleAssign(assignSalesAction, v)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{isAr ? "بدون" : "None"}</SelectItem>
            {sales.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name ?? p.email} ({p.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{isAr ? "المسؤول عن التنفيذ" : "Assigned executor"}</Label>
        <Select
          value={currentStaffId ?? "none"}
          onValueChange={(v) => handleAssign(assignStaffAction, v)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{isAr ? "بدون" : "None"}</SelectItem>
            {team.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name ?? p.email} ({p.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
