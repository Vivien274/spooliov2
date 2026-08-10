import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Identifiant produit manquant" }, { status: 400 });
    }

    if (idStr === "new") {
      return NextResponse.json({ product: null });
    }

    const numericId = parseInt(idStr, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    }

    // 1. Try Prisma DB first
    try {
      const p = (await Promise.race([
        prisma.product.findUnique({
          where: { id: numericId },
          include: {
            images: true,
            categories: true,
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB findUnique Timeout 2.5s")), 2500))
      ])) as any;

      if (p) {
        let tagsList: string[] = [];
        let attributesObj = { attributes: [] as any[], variationPrices: [] as any[] };
        if (p.attributes) {
          try {
            const parsed = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
            if (Array.isArray(parsed)) {
              attributesObj.attributes = parsed;
            } else if (parsed && typeof parsed === 'object') {
              attributesObj = {
                attributes: parsed.attributes || [],
                variationPrices: parsed.variationPrices || [],
              };
              tagsList = parsed.tags || [];
            }
          } catch (e) {
            console.warn("Could not parse product attributes:", e);
          }
        }

        const product = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          category: p.categories[0]?.name || "",
          tags: tagsList,
          price: p.price,
          salePrice: p.salePrice || "",
          productType: p.productType || "simple",
          status: p.status || "publish",
          stock: p.stock,
          metaTitle: p.metaTitle || p.name + " — Spoolio",
          metaDescription: p.metaDescription || p.shortDescription || p.name,
          images: p.images.map((img: any) => ({
            id: img.id,
            src: img.src,
            alt: img.alt || p.name
          })),
          attributes: attributesObj,
          variations: [],
          showInSensoryCompass: !!p.showInSensoryCompass,
          sensoryNoiseLevel: p.sensoryNoiseLevel || "1",
          sensorySize: p.sensorySize || "pocket",
          sensoryCategory: p.sensoryCategory || "manipuler",
          sensoryProfiles: p.sensoryProfiles ? (typeof p.sensoryProfiles === "string" ? p.sensoryProfiles.split(",").map((s: string) => s.trim()) : p.sensoryProfiles) : [],
        };

        return NextResponse.json({ product });
      }
    } catch (err: any) {
      console.error("Error loading product from Prisma DB in admin API:", err.message);
    }

    // 2. Try JSON file fallback
    try {
      const jsonPath = path.join(process.cwd(), "src/data/products.json");
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed)) {
          const match = parsed.find(p => p.id === numericId);
          if (match) {
            let tagsList: string[] = [];
            let attributesObj = { attributes: [] as any[], variationPrices: [] as any[] };
            if (match.attributes) {
              try {
                const parsed = typeof match.attributes === 'string' ? JSON.parse(match.attributes) : match.attributes;
                if (Array.isArray(parsed)) {
                  attributesObj.attributes = parsed;
                } else if (parsed && typeof parsed === 'object') {
                  attributesObj = {
                    attributes: parsed.attributes || [],
                    variationPrices: parsed.variationPrices || [],
                  };
                  tagsList = parsed.tags || [];
                }
              } catch (e) {
                console.warn("Could not parse JSON product attributes:", e);
              }
            }

            const product = {
              id: match.id,
              name: match.name,
              slug: match.slug,
              shortDescription: match.short_description || "",
              description: match.description || "",
              category: match.categories?.[0]?.name || "",
              tags: tagsList,
              price: match.price || "0",
              salePrice: match.sale_price || "",
              productType: match.type || "simple",
              status: match.status || "publish",
              stock: match.stock_quantity || 10,
              metaTitle: match.name + " — Spoolio",
              metaDescription: match.short_description || match.name,
              images: (match.images || []).map((img: any, idx: number) => ({
                id: img.id || idx,
                src: img.src || "/images/figma_keychains.jpg",
                alt: img.alt || match.name
              })),
              attributes: attributesObj,
              variations: [],
              showInSensoryCompass: !!(match.showInSensoryCompass || match.show_in_sensory_compass),
              sensoryNoiseLevel: match.sensoryNoiseLevel || match.sensory_noise_level || "1",
              sensorySize: match.sensorySize || match.sensory_size || "pocket",
              sensoryCategory: match.sensoryCategory || match.sensory_category || "manipuler",
              sensoryProfiles: match.sensoryProfiles || match.sensory_profiles || [],
            };

            return NextResponse.json({ product });
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading product from JSON in admin API:", err.message);
    }

    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  } catch (err: any) {
    console.error("GET Admin Product Error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function syncJsonFile(updatedIds: number[], action: "status" | "price" | "delete", params?: any) {
  try {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    if (!fs.existsSync(jsonPath)) return;
    const fileData = fs.readFileSync(jsonPath, "utf8");
    let jsonProducts = JSON.parse(fileData);
    if (!Array.isArray(jsonProducts)) return;

    if (action === "delete") {
      jsonProducts = jsonProducts.filter(p => !updatedIds.includes(p.id));
    } else if (action === "status") {
      jsonProducts = jsonProducts.map(p => {
        if (updatedIds.includes(p.id)) {
          return { ...p, status: params.status };
        }
        return p;
      });
    } else if (action === "price") {
      jsonProducts = jsonProducts.map(p => {
        if (updatedIds.includes(p.id)) {
          const currentPrice = parseFloat(p.price) || 0;
          let newPrice = currentPrice;
          const { type, direction, value } = params;
          if (type === "percentage") {
            const diff = (currentPrice * value) / 100;
            newPrice = direction === "increase" ? currentPrice + diff : currentPrice - diff;
          } else {
            newPrice = direction === "increase" ? currentPrice + value : currentPrice - value;
          }
          const priceStr = Math.max(0, parseFloat(newPrice.toFixed(2))).toString();

          let regularPriceStr = p.regular_price;
          if (p.regular_price) {
            const curReg = parseFloat(p.regular_price) || 0;
            let newReg = curReg;
            if (type === "percentage") {
              const diff = (curReg * value) / 100;
              newReg = direction === "increase" ? curReg + diff : curReg - diff;
            } else {
              newReg = direction === "increase" ? curReg + value : curReg - value;
            }
            regularPriceStr = Math.max(0, parseFloat(newReg.toFixed(2))).toString();
          }

          return {
            ...p,
            price: priceStr,
            regular_price: regularPriceStr,
            sale_price: p.sale_price ? priceStr : p.sale_price
          };
        }
        return p;
      });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(jsonProducts, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to sync products.json in bulk operation:", err);
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json({ error: "Accès refusé. Veuillez vous connecter." }, { status: 401 });
    }

    const { ids, action, status, priceType, priceDirection, priceValue } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Aucun produit sélectionné" }, { status: 400 });
    }

    const numericIds = ids.map((id: any) => parseInt(id, 10)).filter((id: number) => !isNaN(id));

    if (numericIds.length === 0) {
      return NextResponse.json({ error: "Aucun identifiant valide fourni" }, { status: 400 });
    }

    if (action === "delete") {
      // Delete from Prisma DB
      await prisma.product.deleteMany({
        where: { id: { in: numericIds } }
      });
      // Sync fallback JSON
      await syncJsonFile(numericIds, "delete");
    } 
    else if (action === "status") {
      if (status !== "publish" && status !== "draft") {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      // Update in Prisma DB
      await prisma.product.updateMany({
        where: { id: { in: numericIds } },
        data: { status }
      });
      // Sync fallback JSON
      await syncJsonFile(numericIds, "status", { status });
    } 
    else if (action === "price") {
      if (typeof priceValue !== "number" || priceValue <= 0) {
        return NextResponse.json({ error: "Valeur de prix invalide" }, { status: 400 });
      }
      if (priceType !== "percentage" && priceType !== "fixed") {
        return NextResponse.json({ error: "Type d'ajustement de prix invalide" }, { status: 400 });
      }
      if (priceDirection !== "increase" && priceDirection !== "decrease") {
        return NextResponse.json({ error: "Direction d'ajustement de prix invalide" }, { status: 400 });
      }

      // Read current products to calculate new prices individually
      const products = await prisma.product.findMany({
        where: { id: { in: numericIds } }
      });

      for (const p of products) {
        const currentPrice = parseFloat(p.price) || 0;
        let newPrice = currentPrice;
        if (priceType === "percentage") {
          const diff = (currentPrice * priceValue) / 100;
          newPrice = priceDirection === "increase" ? currentPrice + diff : currentPrice - diff;
        } else {
          newPrice = priceDirection === "increase" ? currentPrice + priceValue : currentPrice - priceValue;
        }
        const priceStr = Math.max(0, parseFloat(newPrice.toFixed(2))).toString();

        let regularPriceStr = p.regularPrice;
        if (p.regularPrice) {
          const curReg = parseFloat(p.regularPrice) || 0;
          let newReg = curReg;
          if (priceType === "percentage") {
            const diff = (curReg * priceValue) / 100;
            newReg = priceDirection === "increase" ? curReg + diff : curReg - diff;
          } else {
            newReg = priceDirection === "increase" ? curReg + priceValue : curReg - priceValue;
          }
          regularPriceStr = Math.max(0, parseFloat(newReg.toFixed(2))).toString();
        }

        // Apply price modification in DB
        await prisma.product.update({
          where: { id: p.id },
          data: {
            price: priceStr,
            regularPrice: regularPriceStr
          }
        });
      }

      // Sync fallback JSON
      await syncJsonFile(numericIds, "price", { type: priceType, direction: priceDirection, value: priceValue });
    } 
    else {
      return NextResponse.json({ error: "Action non prise en charge" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Opération effectuée avec succès" });
  } catch (err: any) {
    console.error("POST Bulk Products Error:", err);
    return NextResponse.json({ error: "Erreur serveur lors de l'opération par lots", details: err.message }, { status: 500 });
  }
}
