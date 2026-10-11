import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

/**
 * Vérifie l'authentification administrateur côté serveur pour les routes API sensibles.
 * 
 * Sécurité :
 * 1. Vérifie le cookie de session signé cryptographiquement `spoolio_admin_session`.
 * 2. Vérifie également l'en-tête `Authorization: Bearer <token>` si présent.
 * 3. En production : Aucun bypass possible.
 */
export async function requireAdminAuth(req?: Request): Promise<{
  authorized: boolean;
  status?: number;
  error?: string;
}> {
  const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

  try {
    // 1. Vérifier le cookie HTTP-only de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("spoolio_admin_session")?.value;

    if (sessionCookie && (await verifySession(sessionCookie, secret))) {
      return { authorized: true };
    }

    // 2. Vérifier l'en-tête Authorization Bearer si présent
    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const bearerToken = authHeader.substring(7);
        if (await verifySession(bearerToken, secret)) {
          return { authorized: true };
        }
      }

      // 3. Mode dev local : STRICTEMENT ET UNIQUEMENT si process.env.NODE_ENV === "development"
      // En production (NODE_ENV !== "development"), ce header est totalement ignoré.
      if (process.env.NODE_ENV === "development") {
        const devHeader = req.headers.get("x-spoolio-dev-auth");
        if (devHeader === "spoolio-local-dev-bypass") {
          return { authorized: true };
        }
      }
    }

    return {
      authorized: false,
      status: 401,
      error: "Accès refusé. Session administrateur requise ou expirée.",
    };
  } catch (error: any) {
    console.error("Erreur requireAdminAuth:", error);
    return {
      authorized: false,
      status: 500,
      error: "Erreur serveur lors de la vérification des droits administrateur.",
    };
  }
}
