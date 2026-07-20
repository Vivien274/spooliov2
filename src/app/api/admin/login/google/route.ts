import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const adminGoogleEmails = (process.env.ADMIN_GOOGLE_EMAIL || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const jwtSecret = process.env.JWT_SECRET;

    if (!googleClientId || !jwtSecret || adminGoogleEmails.length === 0) {
      return NextResponse.json(
        { error: "Configuration Google Sign-In incomplète sur le serveur." },
        { status: 500 }
      );
    }

    if (!credential) {
      return NextResponse.json(
        { error: "Jeton de connexion manquant." },
        { status: 400 }
      );
    }

    // Validate Google ID token via official Google TokenInfo endpoint
    const responseGoogle = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!responseGoogle.ok) {
      return NextResponse.json(
        { error: "Jeton de connexion Google invalide ou expiré." },
        { status: 401 }
      );
    }

    const payload = await responseGoogle.json();

    // Verify audience matching our Google Client ID
    if (payload.aud !== googleClientId) {
      return NextResponse.json(
        { error: "Origine de la connexion Google non autorisée (audience)." },
        { status: 401 }
      );
    }

    const email = payload.email?.toLowerCase();
    
    // Check if the authenticated email is authorized to access admin dashboard
    if (!email || !adminGoogleEmails.includes(email)) {
      return NextResponse.json(
        { error: `Accès refusé. Le compte Google ${email || "Inconnu"} n'est pas autorisé.` },
        { status: 403 }
      );
    }

    // Google Sign-In Success: generate a secure session cookie
    const duration = 7 * 24 * 60 * 60 * 1000; // 7 days
    const exp = Date.now() + duration;
    
    const token = await signSession(exp, jwtSecret);

    const response = NextResponse.json({ success: true, email });

    // Set secure HTTP-Only session cookie
    response.cookies.set("spoolio_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: duration / 1000,
      path: "/",
    });

    // Set flag cookie for public clients
    response.cookies.set("is_spoolio_admin", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: duration / 1000,
      path: "/",
    });

    return response;
  } catch (e: any) {
    console.error("[Google Auth Backend Error]:", e.message || e);
    return NextResponse.json(
      { error: "Erreur de traitement de la connexion Google." },
      { status: 500 }
    );
  }
}
