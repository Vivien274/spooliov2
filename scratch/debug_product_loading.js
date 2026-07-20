const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const numericId = 12369;
  try {
    const p = await prisma.product.findUnique({
      where: { id: numericId },
      include: {
        images: true,
        categories: true,
      }
    });

    if (p) {
      console.log("=== PRODUCT FROM BDD ===");
      console.log("Attributes Raw in BDD:", p.attributes);
      
      let attributesObj = { attributes: [], variationPrices: [] };
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
          }
        } catch (e) {
          console.warn("Could not parse product attributes:", e);
        }
      }
      
      console.log("\n=== CONVERTED ATTRIBUTES OBJ ===");
      console.log(JSON.stringify(attributesObj, null, 2));
    } else {
      console.log("Product not found in BDD");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
