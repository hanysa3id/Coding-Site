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

export function PrismMobileMenu({
  profile,
  locale,
  navItems,
}: {
  profile: Profile | null;
  locale: string;
  navItems: { href: string; label: string }[];
}) {
  const isAr = locale === "ar";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white/75 hover:text-white hover:bg-white/[0.06]"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{isAr ? "القائمة" : "Menu"}</span>
      </Button>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="theme-prism w-72 p-0 border-white/15 bg-[#0b0b14]/96 backdrop-blur-xl"
        style={{ color: "rgba(245,244,255,0.96)" }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        <div className="prism-divider" />

        <div className="flex h-14 items-center px-5 pe-12 border-b border-white/[0.06]">
          <span className="prism-eyebrow">{isAr ? "القائمة" : "MENU"}</span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-semibold transition-colors",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!profile && (
          <div className="mt-auto border-t border-white/[0.06] p-4 space-y-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white h-11 text-sm font-bold text-white hover:bg-white hover:text-[#0b0b14] transition"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Log in"}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-11 text-sm prism-btn-primary"
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
