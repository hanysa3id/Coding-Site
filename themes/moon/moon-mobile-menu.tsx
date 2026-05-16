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

export function MoonMobileMenu({
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
        className="md:hidden text-white/70 hover:text-white hover:bg-white/[0.06]"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{isAr ? "القائمة" : "Menu"}</span>
      </Button>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="theme-moon w-72 p-0 border-white/10 bg-[#060a16]/95 backdrop-blur-xl"
        style={{ color: "rgba(241,245,249,0.96)" }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(96,165,250,0.55), rgba(129,140,248,0.50), rgba(45,212,191,0.45), transparent)",
          }}
        />

        <div className="flex h-14 items-center px-5 pe-12 border-b border-white/[0.06]">
          <span className="moon-eyebrow">{isAr ? "القائمة" : "MENU"}</span>
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
                  "block rounded-lg px-3 py-3 text-base transition-colors",
                  active
                    ? "bg-white/[0.06] text-white"
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
              className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] h-11 text-sm text-white hover:bg-white/[0.08]"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Log in"}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full h-11 text-sm font-medium text-white moon-btn-primary"
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
