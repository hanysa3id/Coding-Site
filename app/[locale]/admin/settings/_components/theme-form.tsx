"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeSettings } from "@/lib/validators/settings";
import { saveThemeSettingsAction } from "../actions";

type ThemeId = "classic" | "aurora" | "nova" | "sky" | "moon" | "prism" | "combo";

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
  {
    id: "sky",
    nameAr: "Sky",
    nameEn: "Sky",
    descAr: "فاتح سماوي مفعم بالحركة — Navbar زجاجي، Hero بشرائح متعددة، marquee لشعارات العملاء، أقسام خدمات حسب التصنيف.",
    descEn: "Bright sky-blue with motion — glass navbar, multi-slide hero, client logo marquee, services by category.",
    preview: <SkyPreview />,
  },
  {
    id: "moon",
    nameAr: "Moon",
    nameEn: "Moon",
    descAr: "ليلي غامق متكامل — starfield, moon disc, hero بأربع شرائح، كل أقسام لوحة التحكم مدعومة. أكثر الثيمات شمولاً.",
    descEn: "Deep midnight + cool tones — starfield, moon disc, 4-slide hero, every landing section covered. The most comprehensive theme.",
    preview: <MoonPreview />,
  },
  {
    id: "prism",
    nameAr: "Prism",
    nameEn: "Prism",
    descAr: "ثيم الوكالات — ألوان طيفية صاخبة، ستيكرز، marquee، فيديو في الـ Hero، spotlight cursor، يعبر عن كود + تصميم + تسويق.",
    descEn: "Full-spectrum agency theme — bold magenta/cyan/lime, sticker tags, marquee strips, video hero, spotlight cursor. Code + design + marketing in one voice.",
    preview: <PrismPreview />,
  },
  {
    id: "combo",
    nameAr: "Combo",
    nameEn: "Combo",
    descAr: "ثيم استوديو هندسي مستوحى من invertase.io — بنفسجي غامق، شبكة منقطة، مكعبات 3D متحركة في الـ Hero، gradient orbs، typography جريء.",
    descEn: "Engineering-studio theme inspired by invertase.io — deep violet, dotted grid backdrop, animated 3D cube cluster, gradient orbs, bold display type.",
    preview: <ComboPreview />,
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

function ComboPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#0a0418",
        backgroundImage:
          "radial-gradient(20rem 14rem at 5% -10%, rgba(139,92,246,.45), transparent 60%), radial-gradient(18rem 14rem at 100% 30%, rgba(236,72,153,.35), transparent 60%), radial-gradient(16rem 12rem at 50% 110%, rgba(6,182,212,.30), transparent 60%)",
      }}
    >
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(167,139,250,.5) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
        aria-hidden
      />
      {/* navbar */}
      <div className="relative flex items-center gap-1 rounded-lg bg-white/[0.06] backdrop-blur border border-white/15 px-1.5 py-1">
        <div
          className="h-2 w-2 rounded-sm"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899,#06b6d4)" }}
        />
        <div className="h-1.5 w-8 rounded bg-white/85" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-3 rounded bg-white/35" />
          <div className="h-1 w-3 rounded bg-white/35" />
          <div className="h-1 w-3 rounded bg-white/35" />
        </div>
      </div>
      {/* hero with little cube */}
      <div className="relative flex-1 grid grid-cols-[1.2fr_1fr] gap-1 px-1">
        <div className="flex flex-col items-start justify-center gap-1">
          <div className="h-1 w-6 rounded-full bg-violet-300" />
          <div className="h-1.5 w-20 rounded bg-white/90" />
          <div
            className="h-1.5 w-14 rounded"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899,#06b6d4)" }}
          />
          <div className="mt-1.5 flex gap-1">
            <div
              className="h-3 w-10 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899,#06b6d4)" }}
            />
            <div className="h-3 w-10 rounded-full border border-white/20 bg-white/[0.04]" />
          </div>
        </div>
        <div className="grid place-items-center">
          {/* mini 3D cube */}
          <div
            className="relative w-8 h-8"
            style={{ transform: "rotateX(-22deg) rotateY(28deg)", transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", transform: "translateZ(8px)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,#ec4899,#db2777)", transform: "rotateY(90deg) translateZ(8px)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", transform: "rotateX(90deg) translateZ(8px)" }}
            />
          </div>
        </div>
      </div>
      {/* cards row */}
      <div className="relative grid grid-cols-3 gap-1">
        <div className="h-3 rounded border border-white/10 bg-white/[0.04]" />
        <div className="h-3 rounded border border-violet-400/30 bg-violet-500/[0.10]" />
        <div className="h-3 rounded border border-white/10 bg-white/[0.04]" />
      </div>
    </div>
  );
}

function PrismPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#0b0b14",
        backgroundImage:
          "radial-gradient(20rem 14rem at 5% -10%, rgba(255,43,181,.35), transparent 60%), radial-gradient(18rem 14rem at 100% 30%, rgba(0,229,255,.30), transparent 60%), radial-gradient(16rem 12rem at 50% 110%, rgba(196,255,62,.20), transparent 60%)",
      }}
    >
      {/* sticker */}
      <span
        className="absolute top-1.5 left-2 px-1.5 py-0.5 text-[7px] font-black text-[#0b0b14]"
        style={{ background: "#c4ff3e", border: "1.5px solid #0b0b14", borderRadius: 2, transform: "rotate(-3deg)", boxShadow: "2px 2px 0 #0b0b14" }}
      >
        STUDIO
      </span>
      {/* navbar */}
      <div className="flex items-center gap-1 rounded-lg bg-white/[0.06] backdrop-blur border-2 border-white/15 px-1.5 py-1 mt-3" style={{ boxShadow: "3px 3px 0 rgba(255,43,181,.5)" }}>
        <div className="h-2 w-2 rounded-sm" style={{ background: "linear-gradient(135deg,#ff2bb5,#00e5ff)" }} />
        <div className="h-1.5 w-8 rounded bg-white/85" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-3 rounded bg-white/35" />
          <div className="h-1 w-3 rounded bg-white/35" />
          <div className="h-1 w-3 rounded bg-white/35" />
        </div>
      </div>
      {/* hero */}
      <div className="relative flex-1 flex flex-col items-start justify-center gap-1 px-1">
        <div className="h-1 w-6 rounded-full bg-cyan-300" />
        <div className="h-1.5 w-20 rounded bg-white/90" />
        <div className="h-1.5 w-14 rounded" style={{ background: "linear-gradient(90deg,#ff2bb5,#7c3aed,#00e5ff,#c4ff3e)" }} />
        <div className="mt-1.5 flex gap-1">
          <div className="h-3 w-10 rounded-full" style={{ background: "linear-gradient(90deg,#ff2bb5,#00e5ff,#c4ff3e)", border: "1.5px solid #0b0b14", boxShadow: "2px 2px 0 #0b0b14" }} />
          <div className="h-3 w-10 rounded-full border-2 border-white/85 bg-transparent" />
        </div>
      </div>
      {/* marquee strip */}
      <div className="h-3 rounded-sm overflow-hidden" style={{ background: "linear-gradient(90deg,#ff2bb5,#00e5ff,#c4ff3e)", border: "1.5px solid #0b0b14" }}>
        <div className="flex items-center gap-2 h-full px-1">
          <span className="text-[6px] font-black text-[#0b0b14]">CODE • DESIGN • MARKETING</span>
        </div>
      </div>
    </div>
  );
}

function MoonPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#060a16",
        backgroundImage:
          "radial-gradient(18rem 14rem at 85% -10%, rgba(96,165,250,.35), transparent 60%), radial-gradient(16rem 14rem at 0% 100%, rgba(45,212,191,.22), transparent 60%)",
      }}
    >
      {/* tiny stars */}
      <div className="absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute top-2 left-3 h-[2px] w-[2px] rounded-full bg-white" />
        <div className="absolute top-4 left-8 h-[1px] w-[1px] rounded-full bg-white/70" />
        <div className="absolute top-3 right-6 h-[2px] w-[2px] rounded-full bg-white/80" />
        <div className="absolute top-7 right-10 h-[1px] w-[1px] rounded-full bg-white/60" />
        <div className="absolute bottom-6 left-12 h-[1px] w-[1px] rounded-full bg-white/70" />
      </div>
      {/* moon disc */}
      <div
        className="absolute -top-3 -right-3 h-10 w-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #f1f5f9, #94a3b8 60%, #334155)",
          boxShadow: "0 0 16px rgba(96,165,250,.45)",
        }}
        aria-hidden
      />
      <div className="relative flex items-center gap-1 rounded-lg bg-white/[0.06] backdrop-blur border border-white/10 px-1.5 py-1">
        <div
          className="h-2 w-2 rounded-sm"
          style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)" }}
        />
        <div className="h-1.5 w-8 rounded bg-white/80" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-3 rounded bg-white/30" />
          <div className="h-1 w-3 rounded bg-white/30" />
          <div className="h-1 w-3 rounded bg-white/30" />
        </div>
      </div>
      <div className="relative flex-1 flex flex-col items-start justify-center gap-1 px-1">
        <div className="h-1 w-6 rounded-full bg-sky-400/60" />
        <div className="h-1.5 w-20 rounded bg-white/85" />
        <div
          className="h-1.5 w-14 rounded"
          style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8, #2dd4bf)" }}
        />
        <div className="mt-1.5 flex gap-1">
          <div
            className="h-3 w-10 rounded-full"
            style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)" }}
          />
          <div className="h-3 w-10 rounded-full border border-white/15 bg-white/[0.05]" />
        </div>
      </div>
      <div className="relative grid grid-cols-3 gap-1">
        <div className="h-3 rounded border border-white/10 bg-white/[0.04]" />
        <div className="h-3 rounded border border-sky-400/30 bg-sky-400/[0.08]" />
        <div className="h-3 rounded border border-white/10 bg-white/[0.04]" />
      </div>
    </div>
  );
}

function SkyPreview() {
  return (
    <div
      className="relative h-full w-full p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        backgroundColor: "#f0f9ff",
        backgroundImage:
          "radial-gradient(20rem 15rem at 80% -10%, rgba(14,165,233,.25), transparent 60%), radial-gradient(20rem 15rem at -10% 50%, rgba(99,102,241,.18), transparent 60%)",
      }}
    >
      {/* Glass navbar pill */}
      <div className="flex items-center gap-1 rounded-lg bg-white/70 backdrop-blur border border-white/60 px-1.5 py-1 shadow-sm">
        <div className="h-2 w-2 rounded-sm bg-gradient-to-br from-sky-400 to-indigo-500" />
        <div className="h-1.5 w-8 rounded bg-slate-700" />
        <div className="ms-auto flex gap-0.5">
          <div className="h-1 w-3 rounded bg-slate-300" />
          <div className="h-1 w-3 rounded bg-slate-300" />
          <div className="h-1 w-3 rounded bg-slate-300" />
        </div>
      </div>
      {/* Hero slide */}
      <div className="flex-1 flex flex-col items-start justify-center gap-1 px-1">
        <div className="h-1 w-6 rounded-full bg-sky-300" />
        <div className="h-1.5 w-20 rounded bg-slate-800" />
        <div
          className="h-1.5 w-14 rounded"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
        />
        <div className="mt-1.5 flex gap-1">
          <div
            className="h-3 w-10 rounded-full"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
          />
          <div className="h-3 w-10 rounded-full border border-slate-300 bg-white" />
        </div>
      </div>
      {/* Category pills */}
      <div className="flex gap-0.5">
        <div
          className="h-2 w-6 rounded-full"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
        />
        <div className="h-2 w-5 rounded-full bg-white border border-slate-200" />
        <div className="h-2 w-5 rounded-full bg-white border border-slate-200" />
        <div className="h-2 w-5 rounded-full bg-white border border-slate-200" />
      </div>
    </div>
  );
}
