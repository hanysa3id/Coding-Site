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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  bankAccountSchema,
  type BankAccountInput,
} from "@/lib/validators/settings";
import {
  upsertBankAccountAction,
  deleteBankAccountAction,
} from "../actions";
import type { BankAccount } from "@/types/database";

export function BankAccountsManager({
  accounts,
  locale,
}: {
  accounts: BankAccount[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!confirm(isAr ? "متأكد من الحذف؟" : "Confirm delete?")) return;
    startTransition(async () => {
      const result = await deleteBankAccountAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحذف" : "Deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)} disabled={isPending}>
          <Plus className="h-4 w-4" />
          {isAr ? "حساب جديد" : "New account"}
        </Button>
      </div>

      {accounts.length === 0 && !creating ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {isAr
            ? "لا توجد حسابات بنكية. أضف واحدًا ليظهر للعميل في صفحة الدفع."
            : "No bank accounts. Add one to show on the customer's payment page."}
        </p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li key={a.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{isAr ? a.name_ar : a.name_en}</p>
                  {!a.is_visible && (
                    <span className="text-xs text-muted-foreground">
                      ({isAr ? "مخفي" : "Hidden"})
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{a.bank_name}</p>
                {a.account_number && (
                  <p className="text-xs font-mono" dir="ltr">
                    {isAr ? "الحساب: " : "Account: "}{a.account_number}
                  </p>
                )}
                {a.iban && (
                  <p className="text-xs font-mono" dir="ltr">
                    IBAN: {a.iban}
                  </p>
                )}
                {a.account_holder && (
                  <p className="text-xs text-muted-foreground">
                    {isAr ? "صاحب الحساب: " : "Holder: "}{a.account_holder}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => setEditing(a)} disabled={isPending}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(a.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <Card className="p-4">
          <BankAccountForm
            initial={editing}
            locale={locale}
            defaultSortOrder={accounts.length}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </Card>
      )}
    </div>
  );
}

function BankAccountForm({
  initial,
  locale,
  defaultSortOrder,
  onDone,
}: {
  initial: BankAccount | null;
  locale: string;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: initial
      ? (initial as BankAccountInput)
      : {
          name_ar: "",
          name_en: "",
          bank_name: "",
          is_visible: true,
          sort_order: defaultSortOrder,
        },
  });

  function onSubmit(data: BankAccountInput) {
    startTransition(async () => {
      const result = await upsertBankAccountAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      onDone();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="font-semibold">
        {initial
          ? isAr ? "تعديل حساب" : "Edit account"
          : isAr ? "حساب جديد" : "New account"}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{isAr ? "اسم العرض (AR)" : "Display name (AR)"}</Label>
          <Input {...register("name_ar")} dir="rtl" />
          {errors.name_ar && <p className="text-sm text-destructive">{errors.name_ar.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{isAr ? "اسم العرض (EN)" : "Display name (EN)"}</Label>
          <Input {...register("name_en")} dir="ltr" />
          {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{isAr ? "اسم البنك" : "Bank name"}</Label>
        <Input {...register("bank_name")} />
        {errors.bank_name && <p className="text-sm text-destructive">{errors.bank_name.message}</p>}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{isAr ? "رقم الحساب" : "Account number"}</Label>
          <Input {...register("account_number")} dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label>IBAN</Label>
          <Input {...register("iban")} dir="ltr" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{isAr ? "صاحب الحساب" : "Account holder"}</Label>
        <Input {...register("account_holder")} />
      </div>

      <div className="space-y-1.5">
        <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 items-end">
        <div className="space-y-1.5">
          <Label>{isAr ? "ترتيب" : "Sort order"}</Label>
          <Input
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Controller
            control={control}
            name="is_visible"
            render={({ field }) => (
              <Checkbox
                id="is_visible"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="is_visible" className="cursor-pointer">
            {isAr ? "ظاهر للعملاء" : "Visible to customers"}
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
