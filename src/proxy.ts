import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),

      setAll: (items) => {
        items.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        response = NextResponse.next({ request });

        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  /* =========================================
     AUTHENTICATION SESSION
  ========================================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /* =========================================
     PROTECTED CUSTOMER ROUTES
  ========================================= */

  const protectedRoute =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/");

  if (!protectedRoute) {
    return response;
  }

  // Preserve authentication cookies when redirecting.

  function redirectToLogin(reason?: string) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = "/login";
    redirectUrl.search = "";

    if (reason) {
      redirectUrl.searchParams.set("reason", reason);
    }

    const redirectResponse =
      NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  /* =========================================
     REQUIRE AUTHENTICATION
  ========================================= */

  if (!user) {
    return redirectToLogin();
  }

  /* =========================================
     ACCOUNT SUSPENSION CHECK
  ========================================= */

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("is_suspended")
      .eq("id", user.id)
      .single();

  // Fail securely if account status cannot be verified.

  if (profileError || !profile) {
    return redirectToLogin("verification-failed");
  }

  if (profile.is_suspended !== false) {
    await supabase.auth.signOut({
      scope: "local",
    });

    return redirectToLogin("account-suspended");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};