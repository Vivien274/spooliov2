import { NextResponse } from "next/server";
import { saveTaxonomyItem } from "@/services/taxonomyService";
import { requireAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const auth = await requireAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Accès refusé. Session administrateur requise." },
        { status: auth.status || 401 }
      );
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return NextResponse.json(
        { error: "Identifiant de taxonomie invalide (doit être un entier positif)." },
        { status: 400 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const result = await saveTaxonomyItem({
      ...body,
      id: numericId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API PUT /api/admin/taxonomy/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour." },
      { status: 400 }
    );
  }
}
