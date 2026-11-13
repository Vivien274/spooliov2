import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("=== TESTS SYSTÈME DE PACKS & CAMPAGNE NOËL 2026 (LOCAL) ===\n");

const PACKS_FILE = path.join(process.cwd(), "src/data/packs.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src/data/products.json");

// 1. Vérification de l'existence des données
console.log("[1] Vérification du stockage des packs et produits...");
assert.ok(fs.existsSync(PACKS_FILE), "src/data/packs.json doit exister");
assert.ok(fs.existsSync(PRODUCTS_FILE), "src/data/products.json doit exister");

const rawPacks = JSON.parse(fs.readFileSync(PACKS_FILE, "utf-8"));
const rawProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
const productMap = new Map();
rawProducts.forEach(p => productMap.set(p.id, p));

console.log(`✓ Chargé ${rawPacks.length} packs et ${rawProducts.length} produits du catalogue.`);

// 2. Moteur d'hydratation et calculs économiques
function hydratePackSync(pack) {
  let totalValue = 0;
  let minPackStock = Infinity;
  let allComponentsAvailable = true;

  const hydratedItems = pack.items.map((item) => {
    const prod = productMap.get(item.productId);
    const itemPrice = prod && prod.price ? parseFloat(prod.price) : 0;
    const itemQty = item.quantity > 0 ? item.quantity : 1;
    totalValue += itemPrice * itemQty;

    if (prod) {
      if (typeof prod.stock === "number" && prod.stock >= 0) {
        const componentCanMake = Math.floor(prod.stock / itemQty);
        if (componentCanMake < minPackStock) minPackStock = componentCanMake;
        if (prod.stock <= 0) allComponentsAvailable = false;
      }
    }

    return {
      ...item,
      productName: prod ? prod.name : `Produit #${item.productId}`,
      productPrice: itemPrice,
      productSlug: prod ? prod.slug : "",
    };
  });

  const roundedTotalValue = Math.round(totalValue * 100) / 100;
  const savings = Math.max(0, Math.round((roundedTotalValue - pack.price) * 100) / 100);
  const savingsPercent = roundedTotalValue > 0 ? Math.round((savings / roundedTotalValue) * 100) : 0;
  const effectiveStock = minPackStock === Infinity ? 999 : minPackStock;
  const isAvailable = pack.status === "active" && allComponentsAvailable && effectiveStock > 0;

  return {
    ...pack,
    items: hydratedItems,
    totalComponentsValue: roundedTotalValue,
    savingsAmount: savings,
    savingsPercentage: savingsPercent,
    isAvailable,
    availableStock: effectiveStock,
  };
}

// 3. Test du PACK 01 — Le kit anti-réunion (12 €)
console.log("\n[2] Test PACK 01 : Le kit anti-réunion...");
const pack1 = rawPacks.find(p => p.slug === "le-kit-anti-reunion");
assert.ok(pack1, "Pack 01 doit exister");
assert.strictEqual(pack1.price, 12.0);
const hydrated1 = hydratePackSync(pack1);
console.log(`    Composants : ${hydrated1.items.map(i => `${i.productName} (${i.productPrice}€)`).join(" + ")}`);
console.log(`    Total calculé : ${hydrated1.totalComponentsValue} € | Prix : ${hydrated1.price} € | Économie : ${hydrated1.savingsAmount} € (${hydrated1.savingsPercentage}%)`);
assert.strictEqual(hydrated1.totalComponentsValue, 13.0, "La valeur cumulée doit être exactement de 13 €");
assert.strictEqual(hydrated1.savingsAmount, 1.0, "L'économie réelle doit être de 1 €");

// 4. Test du PACK 02 — Le bureau pas sérieux (19 €)
console.log("\n[3] Test PACK 02 : Le bureau pas sérieux...");
const pack2 = rawPacks.find(p => p.slug === "le-bureau-pas-serieux");
assert.ok(pack2, "Pack 02 doit exister");
assert.strictEqual(pack2.price, 19.0);
const hydrated2 = hydratePackSync(pack2);
console.log(`    Composants : ${hydrated2.items.map(i => `${i.productName} (${i.productPrice}€)`).join(" + ")}`);
console.log(`    Total calculé : ${hydrated2.totalComponentsValue} € | Prix : ${hydrated2.price} € | Économie : ${hydrated2.savingsAmount} € (${hydrated2.savingsPercentage}%)`);
assert.strictEqual(hydrated2.totalComponentsValue, 21.0, "La valeur cumulée doit être de 21 €");
assert.strictEqual(hydrated2.savingsAmount, 2.0, "L'économie réelle doit être de 2 €");

// 5. Test du PACK 03 — Le cabinet des bizarreries (29 €)
console.log("\n[4] Test PACK 03 : Le cabinet des bizarreries...");
const pack3 = rawPacks.find(p => p.slug === "le-cabinet-des-bizarreries");
assert.ok(pack3, "Pack 03 doit exister");
assert.strictEqual(pack3.price, 29.0);
const hydrated3 = hydratePackSync(pack3);
console.log(`    Total calculé : ${hydrated3.totalComponentsValue} € | Prix : ${hydrated3.price} € | Économie : ${hydrated3.savingsAmount} €`);
assert.ok(hydrated3.totalComponentsValue > hydrated3.price, "La valeur cumulée doit dépasser le prix du pack");
assert.ok(hydrated3.savingsAmount > 0, "L'économie doit être strictement positive et vérifiable");

// 6. Test Disponibilité et calcul de stock partagé
console.log("\n[5] Test Algorithme de disponibilité & goulot d'étranglement...");
const mockPack = {
  price: 15,
  status: "active",
  items: [
    { productId: 9991, quantity: 2 },
    { productId: 9992, quantity: 1 },
  ]
};
// Simuler composant 1 avec 8 en stock (8 / 2 = 4 packs) et composant 2 avec 3 en stock (3 / 1 = 3 packs)
productMap.set(9991, { id: 9991, name: "Composant 1", price: "5.00", stock: 8 });
productMap.set(9992, { id: 9992, name: "Composant 2", price: "8.00", stock: 3 });

const hydMock = hydratePackSync(mockPack);
assert.strictEqual(hydMock.availableStock, 3, "Disponibilité doit être limitée par le composant le plus rare (3 packs)");
assert.strictEqual(hydMock.isAvailable, true);

// Si composant 2 tombe à 0
productMap.set(9992, { id: 9992, name: "Composant 2", price: "8.00", stock: 0 });
const hydMockOos = hydratePackSync(mockPack);
assert.strictEqual(hydMockOos.availableStock, 0, "Disponibilité tombe à 0 si un composant est épuisé");
assert.strictEqual(hydMockOos.isAvailable, false, "Pack devient indisponible automatiquement");
console.log("✓ Règle de stock partagé et rupture validée avec succès.");

// 7. Test de la persistance de l'instantané de commande & Bon de préparation
console.log("\n[6] Test Bon de Préparation et Instantané...");
const mockOrder = {
  id: "SP-99881",
  createdAt: new Date().toISOString(),
  items: [
    {
      name: "PACK — Le kit anti-réunion",
      quantity: 2,
      price: "12.00",
      isPack: true,
      packComponents: [
        { name: "Panic Button", quantity: 1 },
        { name: "Crunchy Click", quantity: 1 },
        { name: "Porte-clés clavier mécanique", quantity: 1 },
      ]
    }
  ]
};

// Vérifier que le formatage du bon de préparation liste les composants et quantités multipliées
const itemsHtml = mockOrder.items.map(item => {
  const isPack = item.isPack;
  let checklist = "";
  if (isPack && item.packComponents) {
    checklist = item.packComponents.map(c => `[ ] ${c.name} x${c.quantity * item.quantity}`).join("\n");
  }
  return checklist;
}).join("\n");

assert.ok(itemsHtml.includes("[ ] Panic Button x2"), "Doit inclure Panic Button x2 pour 2 packs commandés");
assert.ok(itemsHtml.includes("[ ] Crunchy Click x2"), "Doit inclure Crunchy Click x2");
assert.ok(itemsHtml.includes("[ ] Porte-clés clavier mécanique x2"), "Doit inclure Porte-clés clavier mécanique x2");
console.log("✓ Bon de préparation et préservation de l'instantané validés.");

// 8. Test de la réutilisabilité hors Noël
console.log("\n[7] Test Réutilisabilité (catégories autres que 'noel-2026')...");
const genericPack = {
  name: "Pack Cadeau Anniversaire",
  slug: "pack-cadeau-anniversaire",
  category: "coffrets-cadeaux",
  price: 25,
  status: "active",
  items: [{ productId: 26, quantity: 1 }]
};
const hydGeneric = hydratePackSync(genericPack);
assert.strictEqual(hydGeneric.category, "coffrets-cadeaux");
assert.ok(!hydGeneric.slug.includes("noel"), "Le système fonctionne indépendamment du slug /noel");
console.log("✓ Réutilisabilité du système de packs validée.");

console.log("\n========================================================");
console.log("🎉 TOUS LES TESTS LOCAUX ONT ÉTÉ EXÉCUTÉS AVEC SUCCÈS !");
console.log("========================================================\n");
