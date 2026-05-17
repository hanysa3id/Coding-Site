"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2, AlertTriangle } from "lucide-react";
import { resetThemeCustomizationAction } from "../actions";
import type { ThemeId } from "@/themes";

/**
 * Action row for a theme card on /admin/themes:
 *
 * - Customize → opens the Theme Builder for this base theme
 * - Preview   → opens the public homepage in a new tab
 * - Delete    → only shown when the theme has saved customizations;
 *   resets them with a confirm dialog.
 */
export function ThemeCardActions({
  themeId,
  themeName,
  customized,
  isActive,
  locale,
}: {
  themeId: ThemeId;
  themeName: string;
  customized: boolean;
  isActive: boolean;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirmDelete() {
    startTransition(async () => {
      const r = await resetThemeCustomizationAction(themeId);
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      setOpen(false);
      toast.success(
        isAr ? "تم حذف تخصيصات هذا الثيم" : "Theme customization deleted"
      );
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 pt-1 flex-wrap">
      <Link
        href={`/admin/themes/${themeId}`}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 h-9 text-sm font-medium hover:opacity-90"
      >
        <Wrench className="h-3.5 w-3.5" />
        {isAr ? "تخصيص" : "Customize"}
      </Link>
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 h-9 text-sm font-medium hover:bg-muted"
      >
        {isAr ? "معاينة" : "Preview"}
      </Link>
      {customized && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setOpen(true)}
            disabled={isPending}
            aria-label={
              isAr
                ? `حذف تخصيصات ${themeName}`
                : `Delete ${themeName} customization`
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isAr ? "حذف" : "Delete"}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
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
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onConfirmDelete}
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
        </>
      )}
    </div>
  );
}
