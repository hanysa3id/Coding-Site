"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  Briefcase,
  Image as ImageIcon,
  ShoppingCart,
  CreditCard,
  Star,
  FileText,
  Users,
  Settings,
  BarChart3,
  FileEdit,
  UsersRound,
  UserCheck,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database";

type NavItem = {
  href: string;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

type NavGroup = {
  labelAr?: string;
  labelEn?: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/admin", labelAr: "الرئيسية", labelEn: "Dashboard", icon: LayoutDashboard, roles: ["admin", "sales", "staff"] },
      { href: "/admin/orders", labelAr: "الطلبات", labelEn: "Orders", icon: ShoppingCart, roles: ["admin", "sales", "staff"] },
    ],
  },
  {
    labelAr: "المحتوى",
    labelEn: "Content",
    items: [
      { href: "/admin/categories", labelAr: "الأقسام", labelEn: "Categories", icon: FolderTree, roles: ["admin"] },
      { href: "/admin/services", labelAr: "الخدمات", labelEn: "Services", icon: Briefcase, roles: ["admin"] },
      { href: "/admin/portfolio", labelAr: "معرض الأعمال", labelEn: "Portfolio", icon: ImageIcon, roles: ["admin"] },
      { href: "/admin/blog", labelAr: "المدونة", labelEn: "Blog", icon: FileText, roles: ["admin"] },
      { href: "/admin/pages", labelAr: "الصفحات", labelEn: "Pages", icon: FileEdit, roles: ["admin"] },
    ],
  },
  {
    labelAr: "المستخدمون",
    labelEn: "Users",
    items: [
      { href: "/admin/customers", labelAr: "العملاء", labelEn: "Customers", icon: Users, roles: ["admin", "sales"] },
      { href: "/admin/groups", labelAr: "المجموعات", labelEn: "Groups", icon: UsersRound, roles: ["admin"] },
      { href: "/admin/team", labelAr: "الفريق", labelEn: "Team", icon: UserCheck, roles: ["admin"] },
    ],
  },
  {
    labelAr: "المالية",
    labelEn: "Finance",
    items: [
      { href: "/admin/payments", labelAr: "المدفوعات", labelEn: "Payments", icon: CreditCard, roles: ["admin", "sales"] },
      { href: "/admin/reviews", labelAr: "التقييمات", labelEn: "Reviews", icon: Star, roles: ["admin"] },
    ],
  },
  {
    items: [
      { href: "/admin/analytics", labelAr: "التحليلات", labelEn: "Analytics", icon: BarChart3, roles: ["admin"] },
      { href: "/admin/settings", labelAr: "الإعدادات", labelEn: "Settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

function SidebarNav({
  role,
  locale,
  pathname,
  onNavigate,
}: {
  role: UserRole;
  locale: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isAr = locale === "ar";
  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);

  return (
    <nav className="flex-1 px-2 py-3">
      {visibleGroups.map((group, gi) => (
        <div key={gi} className={cn(gi > 0 && "mt-5")}>
          {(group.labelAr || group.labelEn) && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
              {isAr ? group.labelAr : group.labelEn}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-100",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{isAr ? item.labelAr : item.labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ role, locale }: { role: UserRole; locale: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-e bg-card min-h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <SidebarNav role={role} locale={locale} pathname={pathname} />
    </aside>
  );
}

export function MobileAdminNav({ role, locale }: { role: UserRole; locale: string }) {
  const pathname = usePathname();
  const isAr = locale === "ar";
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{isAr ? "القائمة" : "Menu"}</span>
      </Button>
      <SheetContent side={isAr ? "right" : "left"} className="flex w-60 flex-col p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{isAr ? "القائمة الرئيسية" : "Navigation"}</SheetTitle>
        </SheetHeader>
        <div className="flex h-14 shrink-0 items-center border-b pe-12 ps-4">
          <span className="font-bold text-sm">
            <span className="text-primary">⚡</span> Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav
            role={role}
            locale={locale}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
