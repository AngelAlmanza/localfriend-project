import { updateSession } from "@shared/lib/supabase/proxy"
import { type NextRequest } from "next/server"

const protectedRoutes = ['/workers', '/locals', '/admin', '/auth/login', '/auth/register'];

export async function proxy(request: NextRequest) {
  if (protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))) {
    return await updateSession(request)
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
