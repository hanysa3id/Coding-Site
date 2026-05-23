"use client";

import { useEffect, useState } from "react";
import { LogIn, UserPlus, Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

export function ProMobileMenu({
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

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={isAr ? "القائمة" : "Menu"}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-[color:var(--pro-border)] text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5 text-[color:var(--pro-primary)]" />
        </button>
      </SheetTrigger>

      <SheetContent
        side={isAr ? "right" : "left"}
        className="w-[88vw] max-w-sm p-0 border-[color:var(--pro-border)] bg-[#02040a]/95 backdrop-blur-xl text-white theme-pro"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Main Navigation"}</SheetTitle>
        </SheetHeader>

        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--pro-primary), var(--pro-secondary))" }}
        />

        <div className="flex h-14 items-center px-5 border-b border-[color:var(--pro-border-soft)]">
          <span className="text-xs font-semibold tracking-wider text-[color:var(--pro-primary)] uppercase">
            {isAr ? "القائمة" : "Navigation"}
          </span>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto" aria-label={isAr ? "روابط الهاتف" : "Mobile links"}>
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all",
                  active && "text-white bg-white/[0.08] border-s-2 border-[color:var(--pro-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!profile && (
          <div className="mt-auto border-t border-[color:var(--pro-border-soft)] p-5 space-y-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold border border-white/10 hover:border-white/20 transition-all text-white bg-white/5"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Log in"}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold text-slate-950 hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, var(--pro-primary), var(--pro-secondary))" }}
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
