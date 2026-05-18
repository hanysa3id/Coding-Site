"use client";

import { useState } from "react";
import { Menu, LogIn, UserPlus } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

export function HanyMobileMenu({
  profile,
  locale,
  items,
}: {
  profile: Profile | null;
  locale: string;
  items: { href: string; label: string }[];
}) {
  const isAr = locale === "ar";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-[color:var(--hany-fg)] hover:bg-[color:var(--hany-bg-mute)]"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{isAr ? "القائمة" : "Menu"}</span>
      </Button>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="theme-hany w-80 p-0 border-[color:var(--hany-border)] bg-white/95 backdrop-blur-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #06b6d4)" }}
        />

        <div className="flex h-14 items-center px-5 pe-12 border-b border-[color:var(--hany-border-soft)]">
          <span className="hany-eyebrow">{isAr ? "القائمة" : "MENU"}</span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base transition-colors",
                  active
                    ? "bg-[var(--hany-grad-soft)] text-[color:var(--hany-brand)] font-semibold"
                    : "text-[color:var(--hany-fg-muted)] hover:bg-[color:var(--hany-bg-mute)] hover:text-[color:var(--hany-fg)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!profile && (
          <div className="mt-auto border-t border-[color:var(--hany-border-soft)] p-4 space-y-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-[color:var(--hany-border)] bg-white h-11 text-sm text-[color:var(--hany-fg)] hover:bg-[color:var(--hany-bg-mute)]"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Log in"}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full h-11 text-sm font-medium text-white hany-btn-primary"
            >
              <UserPlus className="h-4 w-4" />
              {isAr ? "حساب جديد" : "Create account"}
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
