import { NextResponse } from "next/server";
import { getTaxonomies, saveTaxonomyItem } from "@/services/taxonomyService";
import { requireAdminAuth } from "@/lib/adminAuth";
import type { TaxonomyType } from "@/types/taxonomy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Vérification de l'authentification admin
    const auth = await requireAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Accès refusé. Session administrateur requise." },
        { status: auth.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as TaxonomyType | null;

    const items = await getTaxonomies();
    const filtered = type ? items.filter((i) => i.type === type) : items;

    return NextResponse.json({
      success: true,
      items: filtered,
      counts: {
        universes: items.filter((i) => i.type === "universe").length,
        categories: items.filter((i) => i.type === "category").length,
        collections: items.filter((i) => i.type === "collection").length,
        tags: items.filter((i) => i.type === "tag").length,
      },
    });
  } catch (error: any) {
    console.error("API GET /api/admin/taxonomy error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les taxonomies", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Vérification de l'authentification admin
    const auth = await requireAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Accès refusé. Session administrateur requise." },
        { status: auth.status || 401 }
      );
    }

    const body = await req.json();

    // Validation stricte du payload
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Corps de requête invalide." },
        { status: 400 }
      );
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Le nom est obligatoire et doit être une chaîne non vide." },
        { status: 400 }
      );
    }

    const validTypes = ["universe", "category", "collection", "tag"];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Type de taxonomie invalide. Valeurs autorisées: ${validTypes.join(", ")}.` },
        { status: 400 }
      );
    }

    const result = await saveTaxonomyItem(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API POST /api/admin/taxonomy error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création." },
      { status: 400 }
    );
  }
}
