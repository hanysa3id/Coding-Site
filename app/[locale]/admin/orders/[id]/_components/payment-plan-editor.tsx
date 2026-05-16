"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import type { PaymentInstallment } from "@/types/database";
import { setPaymentPlanAction } from "../../actions";

export function PaymentPlanEditor({
  orderId,
  initialPlan,
  finalPrice,
  currency,
  locale,
}: {
  orderId: string;
  initialPlan: PaymentInstallment[] | null;
  finalPrice: number | null;
  currency: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [plan, setPlan] = useState<PaymentInstallment[]>(
    initialPlan ?? []
  );
  const [isPending, startTransition] = useTransition();

  function addInstallment() {
    setPlan([
      ...plan,
      { label_ar: "", label_en: "", amount: 0, due_date: null, paid: false },
    ]);
  }

  function update(i: number, field: keyof PaymentInstallment, value: string | number | boolean | null) {
    const next = [...plan];
    next[i] = { ...next[i], [field]: value };
    setPlan(next);
  }

  function remove(i: number) {
    setPlan(plan.filter((_, idx) => idx !== i));
  }

  function onSave() {
    startTransition(async () => {
      const result = await setPaymentPlanAction(orderId, plan);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(isAr ? "تم حفظ خطة الدفع" : "Payment plan saved");
      }
    });
  }

  const totalPlanned = plan.reduce((a, p) => a + Number(p.amount), 0);
  const paidAmount = plan.filter((p) => p.paid).reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {isAr ? "إجمالي مُخطط: " : "Planned: "}
            <span className="tabular-nums">
              {totalPlanned.toLocaleString()} {currency}
            </span>
          </p>
          {finalPrice && (
            <p className={`text-xs ${totalPlanned !== finalPrice ? "text-amber-600" : "text-green-600"}`}>
              {totalPlanned !== finalPrice
                ? `${isAr ? "لا يتطابق مع المبلغ النهائي " : "Doesn't match final price "}(${finalPrice.toLocaleString()} ${currency})`
                : isAr ? "يتطابق مع المبلغ النهائي ✓" : "Matches final price ✓"}
            </p>
          )}
          {paidAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              {isAr ? "مدفوع: " : "Paid: "}{paidAmount.toLocaleString()} {currency}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={addInstallment} type="button">
          <Plus className="h-4 w-4" />
          {isAr ? "قسط جديد" : "Add installment"}
        </Button>
      </div>

      {plan.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isAr ? "لا توجد خطة دفع. أضف أقساطاً للتقسيط." : "No payment plan. Add installments to split the payment."}
        </p>
      ) : (
        <div className="space-y-3">
          {plan.map((inst, i) => (
            <Card key={i} className={inst.paid ? "bg-green-50 dark:bg-green-950/20" : ""}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {isAr ? `القسط ${i + 1}` : `Installment ${i + 1}`}
                    {inst.paid && (
                      <span className="ms-2 text-xs text-green-600">
                        {isAr ? "✓ مدفوع" : "✓ Paid"}
                      </span>
                    )}
                  </p>
                  <Button size="icon" variant="ghost" onClick={() => remove(i)} type="button">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "التسمية (AR)" : "Label (AR)"}</Label>
                    <Input
                      value={inst.label_ar}
                      onChange={(e) => update(i, "label_ar", e.target.value)}
                      placeholder={isAr ? "مثلاً: دفعة أولى 50%" : "e.g. First payment 50%"}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "التسمية (EN)" : "Label (EN)"}</Label>
                    <Input
                      value={inst.label_en}
                      onChange={(e) => update(i, "label_en", e.target.value)}
                      placeholder="e.g. First payment 50%"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "المبلغ" : "Amount"} ({currency})</Label>
                    <Input
                      type="number"
                      value={inst.amount}
                      onChange={(e) => update(i, "amount", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "تاريخ الاستحقاق (اختياري)" : "Due date (optional)"}</Label>
                    <Input
                      type="date"
                      value={inst.due_date ?? ""}
                      onChange={(e) => update(i, "due_date", e.target.value || null)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={inst.paid}
                    onCheckedChange={(v) => update(i, "paid", v)}
                  />
                  <Label className="text-sm cursor-pointer">
                    {isAr ? "تم الدفع" : "Paid"}
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={onSave} disabled={isPending} size="sm">
        <Save className="h-4 w-4" />
        {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ الخطة" : "Save plan"}
      </Button>
    </div>
  );
}
