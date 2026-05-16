import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/orders", "/profile", "/admin"];

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export async function proxy(request: NextRequest) {
  const pathWithoutLocale = stripLocale(request.nextUrl.pathname);
  const needsAuth = PROTECTED_PREFIXES.some((p) =>
    pathWithoutLocale.startsWith(p)
  );

  if (needsAuth) {
    const { response, user } = await updateSession(request);

    if (!user) {
      const locale =
        request.nextUrl.pathname.split("/")[1] || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
      response.cookies.getAll().forEach((c) =>
        intlResponse.cookies.set(c.name, c.value, c)
      );
      return intlResponse;
    }
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
