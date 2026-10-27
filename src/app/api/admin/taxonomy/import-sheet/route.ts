import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import migrationMapping from "@/data/catalog_migration_mapping.json";
import { ALLOW_REMOTE_TAXONOMY_WRITES } from "@/services/taxonomyService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Accès refusé." },
        { status: auth.status || 401 }
      );
    }

    const products = migrationMapping.products || [];
    const active = products.filter(
      (p) =>
        ["HERO", "KEEP", "REWORK"].includes(p.migrationStatus) &&
        p.universeId &&
        p.categoryId
    );

    return NextResponse.json({
      success: true,
      stats: migrationMapping.stats,
      version: migrationMapping.version,
      sourceGoogleSheet: migrationMapping.sourceGoogleSheet,
      activeCount: active.length,
      sample: active.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lecture mapping:", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Accès refusé." },
        { status: auth.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forceExecute = searchParams.get("force") === "true";

    const products = migrationMapping.products || [];
    const active = products.filter(
      (p) =>
        ["HERO", "KEEP", "REWORK"].includes(p.migrationStatus) &&
        p.universeId &&
        p.categoryId
    );

    // Si Dry Run
    if (!ALLOW_REMOTE_TAXONOMY_WRITES && !forceExecute) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Dry Run réussi. ${active.length} produits prêts à être synchronisés avec public.product_taxonomy.`,
        totalPrepared: active.length,
        productsPreview: active.slice(0, 15).map((p) => ({
          productId: p.productId,
          name: p.name,
          status: p.migrationStatus,
          universe: p.rawUniverse,
          category: p.rawCategory,
          collections: p.collectionIds,
        })),
      });
    }

    // Exécution réelle
    const supabase = getSupabaseServerClient();
    const insertedRows: { product_id: number; taxonomy_id: number; is_primary: boolean }[] = [];

    for (const p of active) {
      if (!p.universeId || !p.categoryId) continue;
      // 1. Univers
      insertedRows.push({
        product_id: p.productId,
        taxonomy_id: p.universeId,
        is_primary: false,
      });
      // 2. Catégorie
      insertedRows.push({
        product_id: p.productId,
        taxonomy_id: p.categoryId,
        is_primary: true,
      });
      // 3. Collections
      for (const colId of p.collectionIds || []) {
        insertedRows.push({
          product_id: p.productId,
          taxonomy_id: colId,
          is_primary: false,
        });
      }
    }

    // Supprimer les anciens mappings pour ces produits
    const productIds = active.map((p) => p.productId);
    await supabase.from("product_taxonomy").delete().in("product_id", productIds);

    // Insérer par lots de 100
    const batchSize = 100;
    for (let i = 0; i < insertedRows.length; i += batchSize) {
      const batch = insertedRows.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from("product_taxonomy").insert(batch);
      if (insertError) {
        console.error("Batch insert error:", insertError);
        throw insertError;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: `${active.length} produits associés avec succès (${insertedRows.length} liaisons dans product_taxonomy).`,
      totalProducts: active.length,
      totalRelations: insertedRows.length,
    });
  } catch (error: any) {
    console.error("Import Sheet Error:", error);
    return NextResponse.json(
      { error: "Échec de l'import de la taxonomie", details: error.message },
      { status: 500 }
    );
  }
}
