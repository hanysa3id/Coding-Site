"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeSettings } from "@/lib/validators/settings";
import { saveThemeSettingsAction } from "../actions";

type ThemeId = "pro";

type ThemeOption = {
  id: ThemeId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  preview: React.ReactNode;
};

const OPTIONS: ThemeOption[] = [
  {
    id: "pro",
    nameAr: "Pro",
    nameEn: "Pro",
    descAr: "ثيم احترافي متقدم يعكس هوية شركتك بأفضل شكل مع التحكم الكامل بكل قسم.",
    descEn: "Advanced professional theme reflecting your company identity with full control.",
    preview: <ProPreview />,
  },
];

export function ThemeSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const current = ((initial as ThemeSettings | null)?.active ?? "classic") as ThemeId;
  const [selected, setSelected] = useState<ThemeId>(current);
  const [isPending, startTransition] = useTransition();
  const dirty = selected !== current;

  function onSave() {
    startTransition(async () => {
      const result = await saveThemeSettingsAction({ active: selected });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        isAr
          ? `تم تفعيل ${selected.charAt(0).toUpperCase() + selected.slice(1)} — قد تحتاج لتحديث الصفحة العامة`
          : `${selected.charAt(0).toUpperCase() + selected.slice(1)} activated — public pages may need a refresh`
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <Palette className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {isAr ? "كيف يعمل التبديل" : "How switching works"}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {isAr
              ? "اختر الـ theme واضغط حفظ. سيُطبَّق فوراً على كل صفحات الموقع العامة (الرئيسية، الخدمات، المدونة، إلخ). صفحات الأدمن لا تتأثر. لا يتطلب تشغيل أوامر أو نشر."
              : "Pick a theme and save. It applies instantly to every public page (home, services, blog, etc.). Admin pages are not affected. No redeploy required."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((option) => {
          const isActive = option.id === current;
          const isPicked = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={cn(
                "group relative text-start rounded-xl border p-4 transition-all",
                "hover:shadow-md hover:-translate-y-0.5",
                isPicked
                  ? "border-primary ring-2 ring-primary/30 shadow-md"
                  : "border-border bg-card"
              )}
            >
              {/* Selection indicator */}
              {isPicked && (
                <span className="absolute end-3 top-3 grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              {isActive && !isPicked && (
                <Badge variant="secondary" className="absolute end-3 top-3 text-xs">
                  {isAr ? "حالي" : "Active"}
                </Badge>
              )}

              {/* Preview */}
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                {option.preview}
              </div>

              {/* Meta */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {isAr ? option.nameAr : option.nameEn}
                  </h3>
                  {isActive && (
                    <Badge variant="outline" className="text-[10px]">
                      {isAr ? "مفعَّل" : "live"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {isAr ? option.descAr : option.descEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isAr ? "افتح الموقع العام في تبويب جديد" : "Open public site in a new tab"}
        </a>

        <div className="flex items-center gap-2">
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(current)}
              disabled={isPending}
            >
              {isAr ? "تراجع" : "Reset"}
            </Button>
          )}
          <Button type="button" onClick={onSave} disabled={!dirty || isPending}>
            {isPending
              ? isAr
                ? "جارٍ التطبيق..."
                : "Applying..."
              : dirty
              ? isAr
                ? "تفعيل التصميم"
                : "Activate theme"
              : isAr
              ? "محفوظ"
              : "Saved"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Theme preview mini-mockups ──────────────────────────────────────────────

function ProPreview() {
  const grad = "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)";
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(18rem 14rem at 0% 0%, rgba(79,70,229,.10), transparent 60%), radial-gradient(18rem 14rem at 100% 100%, rgba(6,182,212,.10), transparent 60%)",
      }}
    >
      <div className="flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-1.5 py-1 shadow-sm">
        <div className="h-2 w-2 rounded-sm" style={{ background: grad }} />
        <div className="h-1.5 w-10 rounded bg-slate-700" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-3 rounded bg-slate-400" />
          <div className="h-1 w-3 rounded bg-slate-400" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 mt-4 px-0.5 text-center">
        <div className="h-2 w-20 rounded bg-slate-800" />
        <div className="h-1.5 w-12 rounded" style={{ background: grad }} />
        <div className="mt-1 flex gap-1 justify-center">
          <div className="h-3 w-8 rounded text-white shadow-sm" style={{ background: grad }} />
          <div className="h-3 w-8 rounded border border-slate-300 bg-transparent" />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-1">
        <div className="h-5 rounded border border-slate-200 bg-white p-0.5 shadow-sm" />
        <div className="h-5 rounded border border-slate-200 bg-white p-0.5 shadow-sm" />
        <div className="h-5 rounded border border-slate-200 bg-white p-0.5 shadow-sm" />
      </div>
    </div>
  );
}
