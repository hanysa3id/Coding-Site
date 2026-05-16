"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, Home, Briefcase, ImageIcon, FileText, Info, Mail, LogIn, UserPlus, LogOut, User as UserIcon, ShoppingBag, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/types/database";
import { logoutAction } from "@/app/[locale]/(auth)/actions";

type Props = {
  profile: Profile | null;
  siteName: string;
  locale: string;
};

const PUBLIC_LINKS = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/services", icon: Briefcase, key: "services" as const },
  { href: "/portfolio", icon: ImageIcon, key: "portfolio" as const },
  { href: "/blog", icon: FileText, key: "blog" as const },
  { href: "/about", icon: Info, key: "about" as const },
  { href: "/contact", icon: Mail, key: "contact" as const },
];

export function MobileMenu({ profile, siteName, locale }: Props) {
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAr = locale === "ar";
  const side = isAr ? "right" : "left";

  const initials = (profile?.full_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function close() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isAr ? "فتح القائمة" : "Open menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-72 sm:w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle>{siteName}</SheetTitle>
        </SheetHeader>

        {profile && (
          <>
            <div className="flex items-center gap-3 py-2">
              <Avatar className="h-10 w-10">
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{profile.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate" dir="ltr">
                  {profile.email}
                </p>
              </div>
            </div>
            <Separator />
          </>
        )}

        <nav className="flex-1 space-y-1 py-2 overflow-y-auto">
          {PUBLIC_LINKS.map(({ href, icon: Icon, key }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tc(key)}
              </Link>
            );
          })}

          {profile && (
            <>
              <Separator className="my-3" />
              <Link
                href="/dashboard"
                onClick={close}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" />
                {tc("dashboard")}
              </Link>
              <Link
                href="/orders"
                onClick={close}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" />
                {tc("myOrders")}
              </Link>
              <Link
                href="/profile"
                onClick={close}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
              >
                <UserIcon className="h-4 w-4" />
                {tc("profile")}
              </Link>
              <Link
                href="/notifications"
                onClick={close}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
              >
                <Bell className="h-4 w-4" />
                {tc("notifications")}
              </Link>
              {profile.role !== "customer" && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted text-primary font-medium"
                >
                  {isAr ? "لوحة الإدارة" : "Admin panel"}
                </Link>
              )}
            </>
          )}
        </nav>

        <Separator />
        <div className="pt-3">
          {profile ? (
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {tc("logout")}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" onClick={close}>
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  {tc("login")}
                </Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href="/register">
                  <UserPlus className="h-4 w-4" />
                  {tc("register")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
