"use client";

import { useState } from "react";
import { Menu, LogIn, UserPlus, ChevronDown, Layers } from "lucide-react";
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
  { href: "/portfolio", labelAr: "أعمالنا", labelEn: "Portfolio" },
  { href: "/blog", labelAr: "المدونة", labelEn: "Blog" },
  { href: "/about", labelAr: "من نحن", labelEn: "About" },
  { href: "/contact", labelAr: "اتصل بنا", labelEn: "Contact" },
];

export function SkyMobileMenu({
  profile,
  locale,
  categories,
}: {
  profile: Profile | null;
  locale: string;
  categories: { id: string; slug: string; name: string; description: string | null }[];
}) {
  const isAr = locale === "ar";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-slate-700 hover:text-slate-900 hover:bg-sky-100"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{isAr ? "القائمة" : "Menu"}</span>
      </Button>
      <SheetContent
        side={isAr ? "right" : "left"}
        className="theme-sky w-80 p-0 border-sky-100 bg-white/95 backdrop-blur-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>

        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #0ea5e9, #6366f1, #38bdf8)" }}
        />

        <div className="flex h-14 items-center px-5 pe-12 border-b border-slate-100">
          <span className="sky-eyebrow">{isAr ? "القائمة" : "MENU"}</span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto">
          {/* Services group */}
          <button
            type="button"
            onClick={() => setServicesOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-base text-slate-700 hover:bg-sky-50 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600" />
              {isAr ? "الخدمات" : "Services"}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", servicesOpen && "rotate-180")}
            />
          </button>
          {servicesOpen && (
            <div className="ps-6 space-y-0.5 pb-2">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/services?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/services"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
              >
                {isAr ? "كل الخدمات →" : "All services →"}
              </Link>
            </div>
          )}

          {ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base transition-colors",
                  active
                    ? "bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-800 font-medium"
                    : "text-slate-700 hover:bg-sky-50"
                )}
              >
                {isAr ? item.labelAr : item.labelEn}
              </Link>
            );
          })}
        </nav>

        {!profile && (
          <div className="mt-auto border-t border-slate-100 p-4 space-y-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white h-11 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Log in"}
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full h-11 text-sm font-medium text-white sky-btn-primary"
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
