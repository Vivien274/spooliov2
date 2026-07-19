import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Delete backend session cookie
  response.cookies.set("spoolio_admin_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  // Delete frontend flag cookie
  response.cookies.set("is_spoolio_admin", "", {
    httpOnly: false,
    maxAge: 0,
    path: "/",
  });

  return response;
}
