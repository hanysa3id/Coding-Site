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

/** Apply the `?previewTheme=` query (used by the admin Theme Builder iframe)
 *  as a short-lived cookie so the public layout can read it without needing
 *  search params (layouts don't receive search params in App Router). */
function applyThemePreviewCookie(request: NextRequest, response: NextResponse) {
  const url = request.nextUrl;
  if (url.searchParams.get("themeBuilder") !== "1") return;
  const t = url.searchParams.get("previewTheme");
  if (!t) return;
  // Allowlist via simple character check; the actual id is validated by
  // themeIdSchema inside the layout before being applied.
  if (!/^[a-z0-9_-]{1,32}$/.test(t)) return;
  response.cookies.set("hany_preview_theme", t, {
    path: "/",
    maxAge: 300, // 5 minutes — long enough for an editing session
    sameSite: "strict",
  });
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
      applyThemePreviewCookie(request, intlResponse);
      return intlResponse;
    }
    applyThemePreviewCookie(request, response);
    return response;
  }

  const res = intlMiddleware(request) ?? NextResponse.next();
  applyThemePreviewCookie(request, res);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
