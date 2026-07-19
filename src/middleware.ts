import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("spoolio_admin_session")?.value;
  const secret = process.env.JWT_SECRET || "";

  // 1. Protect all admin pages except the login route itself
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isValid = await verifySession(token || "", secret);
    
    if (!isValid) {
      // Clear flag cookie on frontend if session has expired or is invalid
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set("is_spoolio_admin", "", { maxAge: 0 });
      return response;
    }
  }

  // 2. Redirect already logged-in users away from the login page
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
    "/admin/:path*",
  ],
};
