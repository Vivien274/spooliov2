import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { Drop } from "@/lib/drops";

export const dynamic = "force-dynamic";

const DROPS_PATH = path.join(process.cwd(), "src/data/drops.json");
const PRODUCTS_PATH = path.join(process.cwd(), "src/data/products.json");

function readDrops(): Drop[] {
  try {
    if (fs.existsSync(DROPS_PATH)) {
      const content = fs.readFileSync(DROPS_PATH, "utf-8");
      return JSON.parse(content || "[]");
    }
  } catch (e) {
    console.error("Error reading drops.json:", e);
  }
  return [];
}

function writeDrops(drops: Drop[]) {
  const dir = path.dirname(DROPS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DROPS_PATH, JSON.stringify(drops, null, 2), "utf-8");
}

function readProductsSummary() {
  try {
    if (fs.existsSync(PRODUCTS_PATH)) {
      const raw = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
      return raw.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || `Produit #${p.id}`,
        price: p.price,
        image: p.image || (p.images && p.images[0]) || "",
        category: p.category || "",
        inStock: p.inStock ?? true,
      }));
    }
  } catch (e) {
    console.error("Error reading products.json:", e);
  }
  return [];
}

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

// GET: Returns all drops and summary of store products
export async function GET() {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const drops = readDrops();
    const products = readProductsSummary();

    return NextResponse.json({ success: true, drops, products });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

// POST: Create or Update a Drop
export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const drops = readDrops();

    const dropNumber = body.dropNumber?.trim() || "";
    const dropName = body.dropName?.trim() || body.title?.trim() || "";
    if (!dropName && !dropNumber && !body.title?.trim()) {
      return NextResponse.json({ error: "Le nom ou titre du drop est requis." }, { status: 400 });
    }
    const fullTitle = dropNumber && dropName ? `${dropNumber} — ${dropName}` : dropName || dropNumber || "Nouveau Drop";

    // Auto slug generation if empty
    const slug = body.slug && body.slug.trim()
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : (dropName || fullTitle)
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

    const dropId = body.id || `drop-${Date.now()}`;

    const newDrop: Drop = {
      id: dropId,
      slug,
      dropNumber: dropNumber || undefined,
      dropName: dropName || undefined,
      title: fullTitle,
      tagline: body.tagline || "",
      quote: body.quote?.trim() || undefined,
      description: body.description || "",
      status: body.status || "upcoming",
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || undefined,
      bannerImage: body.bannerImage || "/images/hero_background.jpg",
      bannerVideo: body.bannerVideo?.trim() || undefined,
      badge: body.badge || "Drop • Série Limitée",
      themeColor: body.theme?.accentColor || body.themeColor || "#ff4f00",
      editionSize: body.editionSize ? Number(body.editionSize) : undefined,
      productIds: Array.isArray(body.productIds) ? body.productIds.map(Number) : [],
      theme: body.theme || {
        bgColor: "#ffffff",
        textColor: "#09090b",
        subtitleColor: "#52525b",
        accentColor: "#ff4f00",
        borderColor: "rgba(228, 228, 231, 0.9)",
        cardBgColor: "rgba(255, 255, 255, 0.08)",
        titleFont: "var(--font-antonio)",
        buttonBgColor: "#ff4f00",
        buttonTextColor: "#ffffff",
      },
    };

    const existingIndex = drops.findIndex((d) => d.id === dropId || d.slug === slug);
    let updatedDrops: Drop[];

    if (existingIndex >= 0) {
      updatedDrops = [...drops];
      updatedDrops[existingIndex] = newDrop;
    } else {
      updatedDrops = [newDrop, ...drops];
    }

    writeDrops(updatedDrops);

    revalidatePath("/drops");
    revalidatePath(`/drops/${slug}`);

    return NextResponse.json({
      success: true,
      message: existingIndex >= 0 ? "Drop mis à jour avec succès !" : "Drop créé avec succès !",
      drop: newDrop,
      drops: updatedDrops,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}

// PUT: Quick update (status toggle, reorder)
export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const drops = readDrops();

    if (body.reorderedDrops && Array.isArray(body.reorderedDrops)) {
      writeDrops(body.reorderedDrops);
      revalidatePath("/drops");
      return NextResponse.json({ success: true, drops: body.reorderedDrops });
    }

    if (!body.id) {
      return NextResponse.json({ error: "ID de drop requis" }, { status: 400 });
    }

    const targetIndex = drops.findIndex((d) => d.id === body.id);
    if (targetIndex === -1) {
      return NextResponse.json({ error: "Drop introuvable" }, { status: 404 });
    }

    const updated = {
      ...drops[targetIndex],
      ...(body.status ? { status: body.status } : {}),
      ...(body.editionSize !== undefined ? { editionSize: Number(body.editionSize) } : {}),
      ...(body.theme ? { theme: { ...drops[targetIndex].theme, ...body.theme } } : {}),
    };

    drops[targetIndex] = updated;
    writeDrops(drops);

    revalidatePath("/drops");
    revalidatePath(`/drops/${updated.slug}`);

    return NextResponse.json({ success: true, drop: updated, drops });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE: Remove a drop
export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "ID requis pour supprimer un drop" }, { status: 400 });
    }

    const drops = readDrops();
    const filtered = drops.filter((d) => d.id !== id);

    if (filtered.length === drops.length) {
      return NextResponse.json({ error: "Drop introuvable" }, { status: 404 });
    }

    writeDrops(filtered);
    revalidatePath("/drops");

    return NextResponse.json({
      success: true,
      message: "Drop supprimé avec succès.",
      drops: filtered,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur lors de la suppression" }, { status: 500 });
  }
}
