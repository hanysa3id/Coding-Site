"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
} from "lucide-react";
import type { UserRole } from "@/types/database";

type Item = {
  href: string;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const ITEMS: Item[] = [
  { href: "/admin", labelAr: "اللوحة", labelEn: "Dashboard", icon: LayoutDashboard, roles: ["admin", "sales", "staff"] },
  { href: "/admin/orders", labelAr: "الطلبات", labelEn: "Orders", icon: ShoppingCart, roles: ["admin", "sales", "staff"] },
  { href: "/admin/categories", labelAr: "الأقسام", labelEn: "Categories", icon: FolderTree, roles: ["admin"] },
  { href: "/admin/services", labelAr: "الخدمات", labelEn: "Services", icon: Briefcase, roles: ["admin"] },
  { href: "/admin/portfolio", labelAr: "معرض الأعمال", labelEn: "Portfolio", icon: ImageIcon, roles: ["admin"] },
  { href: "/admin/payments", labelAr: "المدفوعات", labelEn: "Payments", icon: CreditCard, roles: ["admin", "sales"] },
  { href: "/admin/reviews", labelAr: "التقييمات", labelEn: "Reviews", icon: Star, roles: ["admin"] },
  { href: "/admin/blog", labelAr: "المدونة", labelEn: "Blog", icon: FileText, roles: ["admin"] },
  { href: "/admin/pages", labelAr: "الصفحات", labelEn: "Pages", icon: FileEdit, roles: ["admin"] },
  { href: "/admin/customers", labelAr: "العملاء", labelEn: "Customers", icon: Users, roles: ["admin", "sales"] },
  { href: "/admin/groups", labelAr: "المجموعات", labelEn: "Groups", icon: UsersRound, roles: ["admin"] },
  { href: "/admin/team", labelAr: "الفريق", labelEn: "Team", icon: Users, roles: ["admin"] },
  { href: "/admin/analytics", labelAr: "التحليلات", labelEn: "Analytics", icon: BarChart3, roles: ["admin"] },
  { href: "/admin/settings", labelAr: "الإعدادات", labelEn: "Settings", icon: Settings, roles: ["admin"] },
];

export function AdminSidebar({ role, locale }: { role: UserRole; locale: string }) {
  const pathname = usePathname();
  const isAr = locale === "ar";
  const items = ITEMS.filter((i) => i.roles.includes(role));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-e bg-muted/30 min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {isAr ? item.labelAr : item.labelEn}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
