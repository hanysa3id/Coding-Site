import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase auth cookie and return the current user.
 * Never throws — on misconfiguration / network failure, returns user=null
 * and lets downstream code decide what to do (typically redirect to /login
 * for protected routes, render normally for public ones).
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { response: supabaseResponse, user: null };
  }

  try {
    let mutableResponse = supabaseResponse;
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          mutableResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            mutableResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { response: mutableResponse, user };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[middleware] updateSession failed:", err);
    }
    return { response: supabaseResponse, user: null };
  }
}
