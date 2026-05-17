"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GripVertical,
  Palette,
  Rocket,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  Volume2,
  Wand2,
  Box,
  Layers,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  themeCustomizationSchema,
  toCssVariables,
  type SectionAnimation,
  type SoundPreset,
  type ThemeCustomization,
} from "@/lib/validators/theme-builder";
import {
  saveThemeCustomizationAction,
  resetThemeCustomizationAction,
  activateThemeAction,
} from "../../actions";
import type { ThemeId } from "@/themes";
import { cn } from "@/lib/utils";

const ANIMATIONS: { id: SectionAnimation; ar: string; en: string }[] = [
  { id: "fade-up", ar: "ظهور لأعلى", en: "Fade up" },
  { id: "fade-in", ar: "ظهور تدريجي", en: "Fade in" },
  { id: "slide-up", ar: "انزلاق لأعلى", en: "Slide up" },
  { id: "slide-in", ar: "انزلاق جانبي", en: "Slide in" },
  { id: "zoom-in", ar: "تكبير", en: "Zoom in" },
  { id: "blur-in", ar: "إزالة ضبابية", en: "Blur in" },
  { id: "none", ar: "بدون", en: "None" },
];

const SOUND_PRESETS: { id: SoundPreset; ar: string; en: string }[] = [
  { id: "none", ar: "بدون", en: "None" },
  { id: "soft-click", ar: "نقرة خفيفة", en: "Soft click" },
  { id: "pop", ar: "بوب", en: "Pop" },
  { id: "swoosh", ar: "صوت رياح", en: "Swoosh" },
  { id: "blip", ar: "بليب", en: "Blip" },
];

const PRESET_PALETTES = [
  { name: "Aurora", primary: "#8b5cf6", accent: "#ec4899", accent_2: "#06b6d4", surface: "#0f0a1f", ink: "#0a0612", paper: "#f8fafc" },
  { name: "Moon", primary: "#60a5fa", accent: "#818cf8", accent_2: "#2dd4bf", surface: "#0d182e", ink: "#060a16", paper: "#f1f5f9" },
  { name: "Prism", primary: "#ff2bb5", accent: "#00e5ff", accent_2: "#c4ff3e", surface: "#14141f", ink: "#0b0b14", paper: "#f6f4ee" },
  { name: "Forest", primary: "#10b981", accent: "#84cc16", accent_2: "#0ea5e9", surface: "#0a1f1a", ink: "#040d0a", paper: "#f0fdf4" },
  { name: "Sunset", primary: "#f97316", accent: "#ef4444", accent_2: "#fbbf24", surface: "#1f100a", ink: "#0f0604", paper: "#fff7ed" },
  { name: "Ocean", primary: "#0ea5e9", accent: "#06b6d4", accent_2: "#14b8a6", surface: "#0a1929", ink: "#04101a", paper: "#f0f9ff" },
];

const FONT_CHOICES = [
  "Inter",
  "Manrope",
  "Cairo",
  "Tajawal",
  "IBM Plex Sans Arabic",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "DM Sans",
  "Outfit",
  "Sora",
];

export function ThemeBuilderForm({
  themeId,
  themeName,
  themeDescription,
  locale,
  initial,
  isActive,
}: {
  themeId: ThemeId;
  themeName: string;
  themeDescription: string;
  locale: string;
  initial: ThemeCustomization;
  isActive: boolean;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [state, setState] = useState<ThemeCustomization>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState<ThemeCustomization>(initial);
  const [isPending, startTransition] = useTransition();
  const [previewKey, setPreviewKey] = useState(0);
  const previewRef = useRef<HTMLIFrameElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function patch<K extends keyof ThemeCustomization>(key: K, val: ThemeCustomization[K]) {
    setState((s) => ({ ...s, [key]: val }));
  }
  function patchColors(k: keyof ThemeCustomization["colors"], v: string) {
    setState((s) => ({ ...s, colors: { ...s.colors, [k]: v } }));
  }
  function patchTypography(k: keyof ThemeCustomization["typography"], v: string | number | undefined) {
    setState((s) => ({ ...s, typography: { ...s.typography, [k]: v } }));
  }
  function patchShape(k: keyof ThemeCustomization["shape"], v: number) {
    setState((s) => ({ ...s, shape: { ...s.shape, [k]: v } }));
  }
  function patchEffects(k: keyof ThemeCustomization["effects"], v: boolean) {
    setState((s) => ({ ...s, effects: { ...s.effects, [k]: v } }));
  }
  function patchSounds<K extends keyof ThemeCustomization["sounds"]>(k: K, v: ThemeCustomization["sounds"][K]) {
    setState((s) => ({ ...s, sounds: { ...s.sounds, [k]: v } }));
  }
  function patchSection(i: number, p: Partial<ThemeCustomization["sections"][number]>) {
    setState((s) => {
      const next = [...s.sections];
      next[i] = { ...next[i], ...p };
      return { ...s, sections: next };
    });
  }
  function moveSection(from: number, to: number) {
    if (from === to || to < 0 || to >= state.sections.length) return;
    setState((s) => {
      const next = [...s.sections];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...s, sections: next };
    });
  }
  function applyPreset(p: (typeof PRESET_PALETTES)[number]) {
    setState((s) => ({
      ...s,
      colors: {
        primary: p.primary,
        accent: p.accent,
        accent_2: p.accent_2,
        surface: p.surface,
        ink: p.ink,
        paper: p.paper,
      },
    }));
  }

  const dirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(savedSnapshot),
    [state, savedSnapshot]
  );

  // Validate live so users see schema errors
  const validation = themeCustomizationSchema.safeParse(state);

  // ── Live preview style block — written into the iframe via postMessage
  const cssVars = toCssVariables(state);
  const previewCssText = useMemo(() => {
    const decls = Object.entries(cssVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    return `:root, .theme-${themeId} {\n${decls}\n}`;
  }, [cssVars, themeId]);

  // Send updated CSS variables into the iframe whenever they change.
  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: "theme-builder:vars", css: previewCssText },
      window.location.origin
    );
  }, [previewCssText]);

  function refreshPreview() {
    setPreviewKey((k) => k + 1);
  }

  function onSave() {
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Invalid customization");
      return;
    }
    startTransition(async () => {
      const r = await saveThemeCustomizationAction(themeId, validation.data);
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      // Snapshot what we just saved so the dirty flag resets without a reload.
      setSavedSnapshot(validation.data);
      // Refresh the iframe so the preview re-fetches the new server-rendered
      // CSS variables, and refresh the admin route's server data too.
      setPreviewKey((k) => k + 1);
      router.refresh();
      toast.success(isAr ? "تم حفظ التخصيصات وتطبيقها" : "Saved & applied");
    });
  }
  const [confirmDelete, setConfirmDelete] = useState(false);
  function onDelete() {
    startTransition(async () => {
      const r = await resetThemeCustomizationAction(themeId);
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      toast.success(isAr ? "تم حذف التخصيصات" : "Customization deleted");
      // Hard reload so the form re-initializes from the cleared server state.
      window.location.reload();
    });
  }
  function onDiscardLocal() {
    setState(savedSnapshot);
    toast.info(isAr ? "تم تجاهل التعديلات غير المحفوظة" : "Unsaved edits discarded");
  }
  function onActivate() {
    startTransition(async () => {
      const r = await activateThemeAction(themeId);
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      toast.success(isAr ? "تم تفعيل الثيم" : "Theme activated");
      refreshPreview();
    });
  }

  // Play a tiny test sound preview using WebAudio
  function playSoundPreview(preset: SoundPreset) {
    if (preset === "none") return;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(state.sounds.volume, t);
      switch (preset) {
        case "soft-click":
          o.type = "sine"; o.frequency.setValueAtTime(880, t);
          o.frequency.exponentialRampToValueAtTime(440, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
          o.start(t); o.stop(t + 0.1); break;
        case "pop":
          o.type = "triangle"; o.frequency.setValueAtTime(640, t);
          o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          o.start(t); o.stop(t + 0.15); break;
        case "swoosh":
          o.type = "sawtooth"; o.frequency.setValueAtTime(120, t);
          o.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          o.start(t); o.stop(t + 0.21); break;
        case "blip":
          o.type = "square"; o.frequency.setValueAtTime(1320, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
          o.start(t); o.stop(t + 0.07); break;
      }
    } catch {
      // audio context may be blocked by autoplay policy
    }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/themes">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isAr ? "كل الثيمات" : "All themes"}
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              {isAr ? "Theme Builder — " : "Theme Builder — "}
              <span className="capitalize">{themeName}</span>
              {isActive && (
                <Badge className="text-[10px]">{isAr ? "مفعّل" : "Live"}</Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-2xl">
              {themeDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isActive && (
            <Button variant="outline" size="sm" onClick={onActivate} disabled={isPending}>
              <Rocket className="h-3.5 w-3.5" />
              {isAr ? "تفعيل" : "Activate"}
            </Button>
          )}
          {dirty && (
            <Button variant="ghost" size="sm" onClick={onDiscardLocal} disabled={isPending}>
              <RotateCcw className="h-3.5 w-3.5" />
              {isAr ? "تجاهل التعديلات" : "Discard"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isAr ? "حذف التخصيصات" : "Delete customization"}
          </Button>
          <Button onClick={onSave} disabled={!dirty || isPending} size="sm">
            <Save className="h-3.5 w-3.5" />
            {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {isAr
                ? `حذف تخصيصات «${themeName}»؟`
                : `Delete the "${themeName}" customization?`}
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2">
              <span className="block">
                {isAr
                  ? "سيتم حذف كل التخصيصات المحفوظة لهذا الثيم (الألوان، الخطوط، الانحناءات، الحركات، الأصوات، ترتيب الأقسام) وسيعود لمظهره الأصلي."
                  : "All saved customizations for this theme (colors, fonts, radius, animations, sounds, section order) will be removed and the theme will revert to its built-in defaults."}
              </span>
              {isActive && (
                <span className="block text-amber-600 dark:text-amber-400 font-medium">
                  {isAr
                    ? "تنبيه: هذا الثيم مفعّل حالياً، فالتغيير سيظهر فوراً على الموقع العام."
                    : "Heads up: this theme is currently live, so the change will take effect on the public site immediately."}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              {isPending
                ? isAr
                  ? "جارٍ الحذف..."
                  : "Deleting..."
                : isAr
                ? "حذف نهائياً"
                : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,520px)]">
        {/* ── Builder controls ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "اسم الثيم المخصص" : "Display name"}</Label>
            <Input
              value={state.display_name}
              onChange={(e) => patch("display_name", e.target.value)}
            />
          </div>

          <Tabs defaultValue="colors">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="colors">
                <Palette className="h-3.5 w-3.5" />
                {isAr ? "الألوان" : "Colors"}
              </TabsTrigger>
              <TabsTrigger value="type">
                <Type className="h-3.5 w-3.5" />
                {isAr ? "الخطوط" : "Typography"}
              </TabsTrigger>
              <TabsTrigger value="shape">
                <Box className="h-3.5 w-3.5" />
                {isAr ? "الشكل" : "Shape"}
              </TabsTrigger>
              <TabsTrigger value="sections">
                <Layers className="h-3.5 w-3.5" />
                {isAr ? "الأقسام" : "Sections"}
              </TabsTrigger>
              <TabsTrigger value="effects">
                <Sparkles className="h-3.5 w-3.5" />
                {isAr ? "المؤثرات" : "Effects"}
              </TabsTrigger>
              <TabsTrigger value="sounds">
                <Volume2 className="h-3.5 w-3.5" />
                {isAr ? "الصوت" : "Sound"}
              </TabsTrigger>
            </TabsList>

            {/* COLORS */}
            <TabsContent value="colors" className="pt-5 space-y-5">
              <div>
                <Label className="text-xs mb-2 block">
                  {isAr ? "ابدأ من نمط جاهز" : "Start from a preset"}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PRESET_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="rounded-lg border bg-card hover:bg-muted p-3 text-start group"
                    >
                      <div className="flex gap-1 mb-2">
                        {[p.primary, p.accent, p.accent_2, p.surface, p.ink].map((c) => (
                          <span
                            key={c}
                            className="h-5 w-5 rounded-full border border-black/10"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium">{p.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <ColorField
                  label={isAr ? "اللون الأساسي" : "Primary"}
                  value={state.colors.primary || ""}
                  onChange={(v) => patchColors("primary", v)}
                />
                <ColorField
                  label={isAr ? "لون مميز" : "Accent"}
                  value={state.colors.accent || ""}
                  onChange={(v) => patchColors("accent", v)}
                />
                <ColorField
                  label={isAr ? "لون مميز 2" : "Accent 2"}
                  value={state.colors.accent_2 || ""}
                  onChange={(v) => patchColors("accent_2", v)}
                />
                <ColorField
                  label={isAr ? "لون السطح" : "Surface"}
                  value={state.colors.surface || ""}
                  onChange={(v) => patchColors("surface", v)}
                />
                <ColorField
                  label={isAr ? "الحبر (نص داكن)" : "Ink (dark)"}
                  value={state.colors.ink || ""}
                  onChange={(v) => patchColors("ink", v)}
                />
                <ColorField
                  label={isAr ? "الورق (خلفية فاتحة)" : "Paper (light bg)"}
                  value={state.colors.paper || ""}
                  onChange={(v) => patchColors("paper", v)}
                />
              </div>
            </TabsContent>

            {/* TYPOGRAPHY */}
            <TabsContent value="type" className="pt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "خط العناوين" : "Heading font"}</Label>
                  <select
                    value={state.typography.heading_font || ""}
                    onChange={(e) => patchTypography("heading_font", e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">{isAr ? "افتراضي الثيم" : "Theme default"}</option>
                    {FONT_CHOICES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <p
                    className="mt-2 text-2xl"
                    style={{ fontFamily: state.typography.heading_font || "inherit" }}
                  >
                    {isAr ? "نموذج عرض العناوين" : "Heading sample"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "خط النص" : "Body font"}</Label>
                  <select
                    value={state.typography.body_font || ""}
                    onChange={(e) => patchTypography("body_font", e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">{isAr ? "افتراضي الثيم" : "Theme default"}</option>
                    {FONT_CHOICES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ fontFamily: state.typography.body_font || "inherit" }}
                  >
                    {isAr
                      ? "هذا نموذج لنص الجسم لمعاينة الخط المختار."
                      : "This is a body-copy preview of the selected font."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  {isAr ? "مقياس الخط العام" : "Type scale"} ({state.typography.scale ?? 1})
                </Label>
                <input
                  type="range"
                  min={0.85}
                  max={1.25}
                  step={0.01}
                  value={state.typography.scale ?? 1}
                  onChange={(e) => patchTypography("scale", Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "أصغر — أو — أكبر. يُطبَّق عبر CSS var على كل النصوص."
                    : "Smaller ↔ larger. Applied via CSS var to every text element."}
                </p>
              </div>
            </TabsContent>

            {/* SHAPE */}
            <TabsContent value="shape" className="pt-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">
                  {isAr ? "انحناء الزوايا" : "Corner radius"} ({state.shape.radius ?? 12}px)
                </Label>
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={state.shape.radius ?? 12}
                  onChange={(e) => patchShape("radius", Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex items-center gap-3 mt-3">
                  {[
                    { v: 0, l: "Sharp" },
                    { v: 8, l: "Soft" },
                    { v: 16, l: "Rounded" },
                    { v: 28, l: "Pill" },
                  ].map((p) => (
                    <button
                      key={p.l}
                      type="button"
                      onClick={() => patchShape("radius", p.v)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <span
                        className="h-10 w-16 bg-gradient-to-br from-fuchsia-500 to-cyan-400 group-hover:scale-105 transition"
                        style={{ borderRadius: `${p.v}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{p.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SECTIONS — DnD reorder + per-section animation */}
            <TabsContent value="sections" className="pt-5 space-y-3">
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "اسحب لإعادة الترتيب. اختر تأثير الحركة ومدته لكل قسم."
                  : "Drag to reorder. Pick the animation effect and duration per section."}
              </p>
              <div className="space-y-2">
                {state.sections.map((s, i) => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => {
                      dragIndexRef.current = i;
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(i);
                    }}
                    onDragLeave={() => setDragOver((curr) => (curr === i ? null : curr))}
                    onDrop={() => {
                      const from = dragIndexRef.current;
                      if (from != null) moveSection(from, i);
                      dragIndexRef.current = null;
                      setDragOver(null);
                    }}
                    className={cn(
                      "rounded-lg border bg-card p-3 flex items-center gap-3 transition",
                      dragOver === i && "border-primary ring-2 ring-primary/20",
                      !s.visible && "opacity-60"
                    )}
                  >
                    <button
                      type="button"
                      className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                      aria-label="drag handle"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {String(i + 1).padStart(2, "0")}
                    </Badge>
                    <span className="text-sm font-medium capitalize flex-1 min-w-0 truncate">
                      {s.id.replace(/_/g, " ")}
                    </span>
                    <select
                      value={s.animation}
                      onChange={(e) =>
                        patchSection(i, { animation: e.target.value as SectionAnimation })
                      }
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      {ANIMATIONS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {isAr ? a.ar : a.en}
                        </option>
                      ))}
                    </select>
                    <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>{s.duration_ms}ms</span>
                      <input
                        type="range"
                        min={200}
                        max={2000}
                        step={50}
                        value={s.duration_ms}
                        onChange={(e) =>
                          patchSection(i, { duration_ms: Number(e.target.value) })
                        }
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => patchSection(i, { visible: !s.visible })}
                      aria-label="toggle visibility"
                    >
                      {s.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* EFFECTS */}
            <TabsContent value="effects" className="pt-5 space-y-4">
              <EffectToggle
                label={isAr ? "ضوء يلاحق المؤشر" : "Spotlight cursor"}
                description={
                  isAr
                    ? "هالة سماوية ناعمة تتبع مؤشر الفأرة عبر كل الصفحة."
                    : "A soft halo follows the cursor across the page."
                }
                checked={state.effects.spotlight_cursor}
                onCheckedChange={(v) => patchEffects("spotlight_cursor", v)}
              />
              <EffectToggle
                label={isAr ? "حبيبات" : "Grain"}
                description={
                  isAr
                    ? "طبقة SVG ناعمة فوق الموقع لإحساس ورقي."
                    : "Fine SVG grain overlay for a tactile, paper-like feel."
                }
                checked={state.effects.grain}
                onCheckedChange={(v) => patchEffects("grain", v)}
              />
              <EffectToggle
                label={isAr ? "كرات ضبابية عائمة" : "Floating blobs"}
                description={
                  isAr
                    ? "كرات gradient ملوّنة تتحرك ببطء في الخلفية."
                    : "Slowly drifting color blobs in the background."
                }
                checked={state.effects.blobs}
                onCheckedChange={(v) => patchEffects("blobs", v)}
              />
              <EffectToggle
                label={isAr ? "خطوط ماسحة" : "Scanlines"}
                description={
                  isAr
                    ? "خطوط CRT خفيفة فوق الفيديو والصور."
                    : "Subtle CRT-style scanlines over video & images."
                }
                checked={state.effects.scanlines}
                onCheckedChange={(v) => patchEffects("scanlines", v)}
              />
            </TabsContent>

            {/* SOUNDS */}
            <TabsContent value="sounds" className="pt-5 space-y-5">
              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 text-amber-900 dark:text-amber-100 text-xs p-3">
                {isAr
                  ? "ملاحظة: المتصفحات تطلب تفاعل المستخدم قبل تشغيل الأصوات تلقائياً. الأصوات تُولَّد بـ WebAudio (بدون ملفات)."
                  : "Note: browsers require user interaction before audio plays. Sounds are synthesized via WebAudio (no files needed)."}
              </div>
              <EffectToggle
                label={isAr ? "تفعيل الأصوات" : "Enable UI sounds"}
                description={
                  isAr
                    ? "تشغّل صوتاً قصيراً عند نقر أو تمرير على الأزرار."
                    : "Plays a short sound on button clicks and hovers."
                }
                checked={state.sounds.enabled}
                onCheckedChange={(v) => patchSounds("enabled", v)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">
                    {isAr ? "صوت النقر" : "Click sound"}
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={state.sounds.click}
                      onChange={(e) => patchSounds("click", e.target.value as SoundPreset)}
                      className="flex-1 h-10 rounded-md border bg-background px-3 text-sm"
                      disabled={!state.sounds.enabled}
                    >
                      {SOUND_PRESETS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {isAr ? s.ar : s.en}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => playSoundPreview(state.sounds.click)}
                      disabled={state.sounds.click === "none"}
                    >
                      ▶
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {isAr ? "صوت التمرير" : "Hover sound"}
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={state.sounds.hover}
                      onChange={(e) => patchSounds("hover", e.target.value as SoundPreset)}
                      className="flex-1 h-10 rounded-md border bg-background px-3 text-sm"
                      disabled={!state.sounds.enabled}
                    >
                      {SOUND_PRESETS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {isAr ? s.ar : s.en}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => playSoundPreview(state.sounds.hover)}
                      disabled={state.sounds.hover === "none"}
                    >
                      ▶
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  {isAr ? "مستوى الصوت" : "Volume"} ({Math.round(state.sounds.volume * 100)}%)
                </Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.sounds.volume}
                  onChange={(e) => patchSounds("volume", Number(e.target.value))}
                  disabled={!state.sounds.enabled}
                  className="w-full accent-primary"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Live preview ─────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-4 self-start space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              {isAr ? "معاينة حية" : "Live preview"}
            </Label>
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={refreshPreview}>
                {isAr ? "تحديث" : "Refresh"}
              </Button>
              <Button asChild type="button" size="sm" variant="ghost">
                <a href="/" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden">
            <iframe
              ref={previewRef}
              key={previewKey}
              src={`/?themeBuilder=1`}
              title="Theme preview"
              className="w-full h-[720px]"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isAr
              ? "التغييرات في الألوان والخطوط والانحناء تُعرض فوراً. الأقسام والأصوات تظهر بعد الحفظ."
              : "Color/font/radius changes reflect instantly. Sections & sounds apply on save."}
          </p>
        </aside>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded border bg-background cursor-pointer p-0"
          aria-label={`${label} swatch`}
        />
        <Input
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#0ea5e9"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return (
      "#" +
      v
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }
  return "#000000";
}

function EffectToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border bg-card p-3 cursor-pointer hover:bg-muted/40">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </label>
  );
}
