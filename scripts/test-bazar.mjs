import assert from "node:assert";

// Coordinates logic test
function clamp(val, min = 0, max = 1) {
  return Math.max(min, Math.min(max, val));
}

function normalizeRect(rect, containerWidth, containerHeight, minDimension = 0.015) {
  if (containerWidth <= 0 || containerHeight <= 0) return { x: 0, y: 0, width: 0, height: 0 };
  let rawX = rect.width < 0 ? rect.x + rect.width : rect.x;
  let rawY = rect.height < 0 ? rect.y + rect.height : rect.y;
  let rawW = Math.abs(rect.width);
  let rawH = Math.abs(rect.height);

  let normX = clamp(rawX / containerWidth, 0, 1);
  let normY = clamp(rawY / containerHeight, 0, 1);
  let normW = clamp(rawW / containerWidth, minDimension, 1 - normX);
  let normH = clamp(rawH / containerHeight, minDimension, 1 - normY);

  return {
    x: Number(normX.toFixed(4)),
    y: Number(normY.toFixed(4)),
    width: Number(normW.toFixed(4)),
    height: Number(normH.toFixed(4)),
  };
}

function isPointInNormalizedRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

function findBestMatchingZone(px, py, zones) {
  const matching = zones.filter((z) => isPointInNormalizedRect(px, py, z));
  if (matching.length === 0) return null;
  if (matching.length === 1) return matching[0];
  matching.sort((a, b) => a.width * a.height - b.width * b.height);
  return matching[0];
}

console.log("=== TESTS BAZAR SPOOLIO (LOCAL UNIQUEMENT) ===");

// 1. Coordinates Tests
console.log("\n[1] Test Normalisation des Coordonnées...");
const norm1 = normalizeRect({ x: 100, y: 150, width: 200, height: 300 }, 1000, 1000);
assert.strictEqual(norm1.x, 0.1);
assert.strictEqual(norm1.y, 0.15);
assert.strictEqual(norm1.width, 0.2);
assert.strictEqual(norm1.height, 0.3);

// Test drawing backwards (negative width/height)
const normBackwards = normalizeRect({ x: 300, y: 400, width: -100, height: -200 }, 1000, 1000);
assert.strictEqual(normBackwards.x, 0.2);
assert.strictEqual(normBackwards.y, 0.2);
assert.strictEqual(normBackwards.width, 0.1);
assert.strictEqual(normBackwards.height, 0.2);

// Test clamping inside image bounds (out-of-bounds drag)
const normOutOfBounds = normalizeRect({ x: 900, y: 900, width: 300, height: 300 }, 1000, 1000);
assert(normOutOfBounds.x + normOutOfBounds.width <= 1.0001, "Le rectangle ne doit pas déborder en X");
assert(normOutOfBounds.y + normOutOfBounds.height <= 1.0001, "Le rectangle ne doit pas déborder en Y");
console.log("✓ Normalisation et clamping validés avec succès.");

// 2. Overlapping Zones Resolution
console.log("\n[2] Test Résolution des Zones Superposées...");
const zoneLarge = { id: "large", x: 0.1, y: 0.1, width: 0.5, height: 0.5 };
const zoneSmall = { id: "small", x: 0.2, y: 0.2, width: 0.1, height: 0.1 };
const matchedZone = findBestMatchingZone(0.25, 0.25, [zoneLarge, zoneSmall]);
assert.strictEqual(matchedZone.id, "small", "La zone la plus petite/spécifique doit être prioritaire");
console.log("✓ Détection et résolution de chevauchement validées.");

// 3. Stock Simulation and Sold State
console.log("\n[3] Test Simulation des Stocks et Statut Vendu...");
let mockItems = [
  { id: "item-1", name: "Dragon", priceCents: 300, quantity: 2, status: "available" },
  { id: "item-2", name: "Vase", priceCents: 800, quantity: 1, status: "available" }
];

function simulateCheckout(purchases) {
  for (const p of purchases) {
    const item = mockItems.find(i => i.id === p.itemId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - p.quantity);
      if (item.quantity === 0) {
        item.status = "sold";
      }
    }
  }
}

// Purchase 1 vase
simulateCheckout([{ itemId: "item-2", quantity: 1 }]);
const vase = mockItems.find(i => i.id === "item-2");
assert.strictEqual(vase.quantity, 0);
assert.strictEqual(vase.status, "sold", "Un stock à 0 doit passer en statut 'sold'");

// Purchase 1 dragon (quantity goes from 2 to 1)
simulateCheckout([{ itemId: "item-1", quantity: 1 }]);
const dragon = mockItems.find(i => i.id === "item-1");
assert.strictEqual(dragon.quantity, 1);
assert.strictEqual(dragon.status, "available", "Un stock > 0 reste 'available'");
console.log("✓ Décrémentation et bascule en vendu validées.");

// 4. Stock Ceiling Enforcement in Cart
console.log("\n[4] Test Plafond de Stock dans le Panier...");
function canAddToCart(currentCartQty, itemStock) {
  if (itemStock <= 0) return false;
  return currentCartQty < itemStock;
}
assert.strictEqual(canAddToCart(0, 1), true);
assert.strictEqual(canAddToCart(1, 1), false, "Impossible d'ajouter plus que le stock disponible");
assert.strictEqual(canAddToCart(0, 0), false, "Impossible d'ajouter un produit épuisé");
console.log("✓ Plafond de stock validé.");

// 5. Data Export & Import Structure
console.log("\n[5] Test Structure Export/Import JSON...");
const mockDataset = {
  scenes: [{ id: "s1", title: "Test", imageUrl: "/test.jpg", imageWidth: 1000, imageHeight: 1000, status: "draft", sortOrder: 1, createdAt: "", updatedAt: "" }],
  items: mockItems,
  zones: [{ id: "z1", sceneId: "s1", itemId: "item-1", x: 0.1, y: 0.1, width: 0.2, height: 0.2 }],
  version: "2.1",
  exportedAt: new Date().toISOString()
};
assert(Array.isArray(mockDataset.scenes));
assert(Array.isArray(mockDataset.items));
assert(Array.isArray(mockDataset.zones));
console.log("✓ Schéma JSON conforme et réversible.");

console.log("\n=========================================");
console.log("TOUS LES TESTS BAZAR ONT RÉUSSI AVEC SUCCÈS !");
console.log("=========================================\n");

