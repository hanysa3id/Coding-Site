"use client";

import { useState, useRef } from "react";
import { Link } from "@/i18n/routing";
import { ChevronDown, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

// Smooth dropdown for service categories — only ROOT categories are shown
// (max 8). Hover-controlled with a tiny delay so it does not close on
// minor mouse jitters.
export function NavCategoriesDropdown({
  label,
  categories,
  locale,
}: {
  label: string;
  categories: CategoryItem[];
  locale: string;
}) {
  const isAr = locale === "ar";
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <button
        type="button"
        className="sky-nav-link"
        data-active={open || undefined}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute top-full start-1/2 -translate-x-1/2 rtl:translate-x-1/2 pt-3 z-50",
          "transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="sky-dropdown w-[34rem] p-3">
          <div className="grid grid-cols-2 gap-1">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/services?category=${c.slug}`}
                className="sky-dropdown-item group"
                onClick={() => setOpen(false)}
              >
                <span className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200/70 text-sky-700 group-hover:from-sky-400 group-hover:to-indigo-500 group-hover:text-white transition-colors">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 group-hover:text-sky-700">
                    {c.name}
                  </p>
                  {c.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 px-3">
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              <span>{isAr ? "تصفّح كل الخدمات" : "Browse all services"}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
