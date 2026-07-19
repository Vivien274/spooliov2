import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Mot de passe administrateur incorrect." },
        { status: 401 }
      );
    }

    // Session duration: 7 days
    const duration = 7 * 24 * 60 * 60 * 1000;
    const exp = Date.now() + duration;
    
    // Sign token cryptographically
    const token = await signSession(exp, jwtSecret);

    const response = NextResponse.json({ success: true });

    // Set secure HTTP-Only session cookie for backend middleware verification
    response.cookies.set("spoolio_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: duration / 1000,
      path: "/",
    });

    // Set non-HTTP-Only flag cookie so public client-side AdminToolbar can read it
    response.cookies.set("is_spoolio_admin", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: duration / 1000,
      path: "/",
    });

    return response;
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur de traitement de la requête." },
      { status: 400 }
    );
  }
}
