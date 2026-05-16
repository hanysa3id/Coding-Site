"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeUserRoleAction } from "./actions";
import type { UserRole } from "@/types/database";

export function CustomerRoleSelector({
  userId,
  currentRole,
  locale,
}: {
  userId: string;
  currentRole: UserRole;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(role: string) {
    if (role === currentRole) return;
    if (
      !confirm(
        isAr
          ? `هل تريد تغيير الدور إلى "${role}"؟`
          : `Change role to "${role}"?`
      )
    )
      return;
    startTransition(async () => {
      const result = await changeUserRoleAction(userId, role as UserRole);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم تغيير الدور" : "Role updated");
      router.refresh();
    });
  }

  return (
    <Select value={currentRole} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">{isAr ? "عميل" : "Customer"}</SelectItem>
        <SelectItem value="sales">{isAr ? "مبيعات" : "Sales"}</SelectItem>
        <SelectItem value="staff">{isAr ? "فريق" : "Staff"}</SelectItem>
        <SelectItem value="admin">{isAr ? "إدارة" : "Admin"}</SelectItem>
      </SelectContent>
    </Select>
  );
}
