import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const cleanHost = rawHost.replace(/:\d+$/, "").trim().toLowerCase();
  const { pathname, search } = request.nextUrl;

  // 1. Canonical domain enforcement (Objective 1): Permanent 301 redirect spoolio.fr -> www.spoolio.fr
  if (cleanHost === "spoolio.fr") {
    const canonicalTarget = new URL(`${pathname}${search}`, "https://www.spoolio.fr");
    return NextResponse.redirect(canonicalTarget, 301);
  }

  // 2. Protect all admin pages except the login route itself
  const token = request.cookies.get("spoolio_admin_session")?.value;
  const secret = process.env.JWT_SECRET || "";

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isValid = await verifySession(token || "", secret);
    
    if (!isValid) {
      // Clear flag cookie on frontend if session has expired or is invalid
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set("is_spoolio_admin", "", { maxAge: 0 });
      return response;
    }
  }

  // 3. Redirect already logged-in users away from the login page
  if (pathname === "/admin/login") {
    const isValid = await verifySession(token || "", secret);
    if (isValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - uploads/ (public uploads)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)",
  ],
};
