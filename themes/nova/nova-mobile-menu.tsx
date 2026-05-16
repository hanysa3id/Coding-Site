"use client";

import { useState } from "react";
import { Menu, LogIn, UserPlus, Github } from "lucide-react";
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

export function NovaMobileMenu({
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
        className="theme-nova w-72 p-0 border-white/10 bg-[#06060a]/95 backdrop-blur-xl"
        style={{ color: "rgba(255,255,255,0.96)" }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        <div className="flex h-14 items-center px-5 pe-12 border-b border-white/[0.06]">
          <span className="nova-eyebrow">{isAr ? "القائمة" : "MENU"}</span>
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
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-base transition-colors nova-mono",
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span>{isAr ? item.labelAr : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[0.06] p-4 space-y-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.04] h-11 px-4 text-sm text-white/75 hover:text-white hover:bg-white/[0.08]"
          >
            <span className="inline-flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </span>
            <span className="nova-mono text-xs">7.2k ★</span>
          </a>

          {!profile && (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] h-11 text-sm text-white hover:bg-white/[0.08]"
              >
                <LogIn className="h-4 w-4" />
                {isAr ? "تسجيل الدخول" : "Log in"}
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg h-11 text-sm font-medium text-white nova-btn-primary"
              >
                <UserPlus className="h-4 w-4" />
                {isAr ? "حساب جديد" : "Create account"}
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
