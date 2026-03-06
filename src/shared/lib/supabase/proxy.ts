import { Environment } from "@shared/constants/Environment";
import { SystemRole } from "@/src/shared/types/systemRoles";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin/";
    case "worker":
      return "/workers/dashboard";
    case "local":
      return "/locals/search";
    default:
      return "/auth/login";
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    Environment.SUPABASE_URL,
    Environment.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run code between createServerClient and getClaims().
  // A simple mistake could make it very hard to debug issues with users being randomly logged out.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  const { pathname } = request.nextUrl;

  // Fetch role from public.users (source of truth) instead of JWT metadata
  let role: SystemRole | undefined = undefined;
  if (user?.sub) {
    const { data: userRecord } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.sub)
      .single();
    role = userRecord?.role as SystemRole | undefined;
  }

  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  const isPrivateRoute =
    pathname.startsWith("/locals") ||
    pathname.startsWith("/workers") ||
    pathname.startsWith("/admin");

  // Authenticated users trying to access auth pages → redirect to their dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardPath(role);
    return NextResponse.redirect(url);
  }

  // Unauthenticated users on private routes → redirect to login
  if (!user && isPrivateRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users on wrong-role routes → redirect to their correct dashboard
  if (user && isPrivateRoute) {
    const wrongRole =
      (pathname.startsWith("/admin") && role !== "admin") ||
      (pathname.startsWith("/workers") && role !== "worker") ||
      (pathname.startsWith("/locals") && role !== "local");

    if (wrongRole) {
      const url = request.nextUrl.clone();
      url.pathname = getDashboardPath(role);
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse;
}
