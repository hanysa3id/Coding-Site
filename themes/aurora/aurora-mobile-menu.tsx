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

const ITEMS = [
  { href: "/services", labelAr: "الخدمات", labelEn: "Services" },
  { href: "/portfolio", labelAr: "أعمالنا", labelEn: "Portfolio" },
  { href: "/blog", labelAr: "المدونة", labelEn: "Blog" },
  { href: "/about", labelAr: "من نحن", labelEn: "About" },
  { href: "/contact", labelAr: "اتصل بنا", labelEn: "Contact" },
];

// Dark-themed mobile menu that matches the Aurora aesthetic. Replaces the
// classic light MobileMenu when Aurora is active.
export function AuroraMobileMenu({
  profile,
  locale,
}: {
  profile: Profile | null;
  locale: string;
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
        className="theme-aurora w-72 p-0 border-white/10 bg-[#07070d]/95 backdrop-blur-xl"
        style={{ color: "rgba(255,255,255,0.96)" }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        {/* Decorative gradient line at the top */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(236,72,153,0.5), rgba(6,182,212,0.5), transparent)",
          }}
        />

        <div className="flex h-14 items-center px-5 pe-12 border-b border-white/[0.06]">
          <span className="aurora-mono text-xs text-white/55">
            {isAr ? "القائمة" : "MENU"}
          </span>
        </div>

        <nav className="p-3">
          {ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-base transition-colors",
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span>{isAr ? item.labelAr : item.labelEn}</span>
                <span className="text-white/30 text-xs aurora-mono">
                  {item.href.replace("/", "")}
                </span>
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
              className="flex items-center justify-center gap-2 rounded-full bg-white h-11 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
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
