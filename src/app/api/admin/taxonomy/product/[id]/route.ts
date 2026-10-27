import { NextResponse } from "next/server";
import {
  getProductTaxonomy,
  saveProductTaxonomy,
} from "@/services/taxonomyService";
import { requireAdminAuth } from "@/lib/adminAuth";
import type { SaveProductTaxonomyPayload } from "@/types/taxonomy";

export const dynamic = "force-dynamic";

export async function GET(
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
        { error: "Identifiant produit invalide (doit être un entier positif)." },
        { status: 400 }
      );
    }

    const mapping = await getProductTaxonomy(numericId);
    return NextResponse.json({ success: true, mapping });
  } catch (error: any) {
    console.error("API GET /api/admin/taxonomy/product/[id] error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer la taxonomie du produit.", details: error.message },
      { status: 500 }
    );
  }
}

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
        { error: "Identifiant produit invalide (doit être un entier positif)." },
        { status: 400 }
      );
    }

    const body = (await req.json()) as SaveProductTaxonomyPayload;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Corps de requête invalide." },
        { status: 400 }
      );
    }

    // Validation des types de données
    const universeId = body.universeId !== undefined && body.universeId !== null
      ? Number(body.universeId)
      : null;
    const categoryId = body.categoryId !== undefined && body.categoryId !== null
      ? Number(body.categoryId)
      : null;

    if (universeId !== null && (isNaN(universeId) || universeId <= 0)) {
      return NextResponse.json(
        { error: "Identifiant d'univers invalide." },
        { status: 400 }
      );
    }

    if (categoryId !== null && (isNaN(categoryId) || categoryId <= 0)) {
      return NextResponse.json(
        { error: "Identifiant de catégorie invalide." },
        { status: 400 }
      );
    }

    const collectionIds = Array.isArray(body.collectionIds)
      ? body.collectionIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    const tagIds = Array.isArray(body.tagIds)
      ? body.tagIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    const result = await saveProductTaxonomy(numericId, {
      universeId,
      categoryId,
      collectionIds,
      tagIds,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API PUT /api/admin/taxonomy/product/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la sauvegarde de la taxonomie." },
      { status: 400 }
    );
  }
}
