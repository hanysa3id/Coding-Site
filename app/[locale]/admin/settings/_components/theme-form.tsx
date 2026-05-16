"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeSettings } from "@/lib/validators/settings";
import { saveThemeSettingsAction } from "../actions";

type ThemeId = "classic" | "aurora" | "nova";

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
    id: "classic",
    nameAr: "Classic",
    nameEn: "Classic",
    descAr: "تصميم فاتح بسيط، عملي، يصلح لمعظم الأعمال — شريط علوي بسيط، بطاقات بيضاء، أزرار داكنة.",
    descEn: "Clean light layout — neutral header, white cards, dark buttons. Safe choice for most businesses.",
    preview: <ClassicPreview />,
  },
  {
    id: "aurora",
    nameAr: "Aurora",
    nameEn: "Aurora",
    descAr: "مظلم متدرّج — كرات gradient عائمة، glass cards، bento layouts. مستوحى من invertase / n8n.",
    descEn: "Dark + gradient — floating orbs, glass cards, bento layouts. Inspired by invertase / n8n.",
    preview: <AuroraPreview />,
  },
  {
    id: "nova",
    nameAr: "Nova",
    nameEn: "Nova",
    descAr: "مظلم تطويري — بنفسجي صاف، code blocks، 3D mockups. مستوحى من novu.co.",
    descEn: "Developer-platform dark — pure violet, code blocks, 3D mockups. Inspired by novu.co.",
    preview: <NovaPreview />,
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

      <div className="grid gap-4 md:grid-cols-3">
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

function ClassicPreview() {
  return (
    <div className="h-full w-full bg-white p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-1.5">
        <div className="h-2 w-2 rounded-full bg-zinc-900" />
        <div className="h-1.5 w-10 rounded bg-zinc-900" />
        <div className="ms-auto flex gap-1">
          <div className="h-1 w-4 rounded bg-zinc-400" />
          <div className="h-1 w-4 rounded bg-zinc-400" />
          <div className="h-1 w-4 rounded bg-zinc-400" />
        </div>
      </div>
      <div className="flex-1 grid place-items-center gap-1">
        <div className="h-1.5 w-20 rounded bg-zinc-900" />
        <div className="h-1 w-16 rounded bg-zinc-400" />
        <div className="mt-1.5 flex gap-1">
          <div className="h-3 w-10 rounded bg-zinc-900" />
          <div className="h-3 w-10 rounded border border-zinc-300 bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div className="h-3 rounded border border-zinc-200 bg-zinc-50" />
        <div className="h-3 rounded border border-zinc-200 bg-zinc-50" />
        <div className="h-3 rounded border border-zinc-200 bg-zinc-50" />
      </div>
    </div>
  );
}

function AuroraPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#07070d",
        backgroundImage:
          "radial-gradient(20rem 20rem at 10% -10%, rgba(139,92,246,.35), transparent 60%), radial-gradient(20rem 20rem at 100% 100%, rgba(236,72,153,.25), transparent 60%)",
      }}
    >
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1.5">
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
        />
        <div className="h-1.5 w-10 rounded bg-white/70" />
      </div>
      <div className="flex-1 grid place-items-center gap-1">
        <div className="h-1.5 w-20 rounded bg-white/85" />
        <div
          className="h-1.5 w-14 rounded"
          style={{ background: "linear-gradient(90deg, #c084fc, #f472b6)" }}
        />
        <div className="mt-1.5 flex gap-1">
          <div className="h-3 w-10 rounded bg-white" />
          <div className="h-3 w-10 rounded border border-white/15 bg-white/[0.06]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div className="h-3 rounded border border-white/[0.08] bg-white/[0.03]" />
        <div className="h-3 rounded border border-white/[0.08] bg-white/[0.03]" />
        <div className="h-3 rounded border border-white/[0.08] bg-white/[0.03]" />
      </div>
    </div>
  );
}

function NovaPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#06060a",
        backgroundImage:
          "radial-gradient(20rem 15rem at 50% -20%, rgba(139,92,246,.35), transparent 60%)",
      }}
    >
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-1.5">
        <div className="h-2 w-2 rounded-sm bg-gradient-to-br from-violet-500 to-purple-700" />
        <div className="h-1.5 w-10 rounded bg-white/80" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-2 rounded bg-white/30" />
          <div className="h-1 w-2 rounded bg-white/30" />
        </div>
      </div>
      <div className="flex-1 grid place-items-center gap-1">
        <div className="h-1.5 w-24 rounded bg-white/85" />
        <div
          className="h-1.5 w-16 rounded"
          style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)" }}
        />
        <div className="mt-1.5 flex gap-1">
          <div
            className="h-3 w-10 rounded"
            style={{ background: "linear-gradient(180deg, #a78bfa, #7c3aed)" }}
          />
          <div className="h-3 w-10 rounded border border-white/15 bg-white/[0.05]" />
        </div>
      </div>
      <div className="h-4 rounded border border-white/[0.06] bg-black/40 flex items-center px-1 gap-0.5">
        <div className="h-1 w-1 rounded-full bg-red-400/70" />
        <div className="h-1 w-1 rounded-full bg-yellow-400/70" />
        <div className="h-1 w-1 rounded-full bg-green-400/70" />
        <div className="ms-1 h-1 w-12 rounded bg-violet-400/70" />
      </div>
    </div>
  );
}
