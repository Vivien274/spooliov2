import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { getAllPacks, savePack, deletePack, getPackById } from "@/lib/serverPacks";
import { getPublishedProducts } from "@/lib/serverProducts";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function isAuthorized() {
  if (process.env.NODE_ENV !== "production") return true;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
    if (token && (await verifySession(token, secret))) {
      return true;
    }
  } catch (e) {
    console.error("Session verification error:", e);
  }
  return false;
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const pack = await getPackById(id);
      if (!pack) {
        return NextResponse.json({ error: "Pack introuvable" }, { status: 404 });
      }
      return NextResponse.json({ success: true, pack });
    }

    const packs = await getAllPacks(true);
    const products = await getPublishedProducts();

    const catalogSummary = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images && p.images.length > 0 ? p.images[0].src : "/images/figma_keychains.jpg",
      stock: p.stock,
      attributes: p.attributes,
      categories: p.categories,
    }));

    return NextResponse.json({
      success: true,
      packs,
      products: catalogSummary,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    console.error("[API Admin Packs GET Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Le nom du pack est obligatoire." }, { status: 400 });
    }

    if (typeof body.price !== "number" || isNaN(body.price) || body.price < 0) {
      return NextResponse.json({ error: "Le prix du pack doit être un nombre valide positif." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Le pack doit contenir au moins un produit composant." }, { status: 400 });
    }

    const saved = await savePack(body);

    revalidatePath("/admin/packs");
    revalidatePath("/noel");
    revalidatePath(`/product/${saved.slug}`);
    revalidatePath("/boutique");

    return NextResponse.json({ success: true, pack: saved });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la sauvegarde";
    console.error("[API Admin Packs POST Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant du pack manquant" }, { status: 400 });
    }

    const ok = await deletePack(id);
    if (!ok) {
      return NextResponse.json({ error: "Pack non trouvé ou impossible à supprimer" }, { status: 404 });
    }

    revalidatePath("/admin/packs");
    revalidatePath("/noel");
    revalidatePath("/boutique");

    return NextResponse.json({ success: true, message: "Pack supprimé avec succès." });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la suppression";
    console.error("[API Admin Packs DELETE Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
