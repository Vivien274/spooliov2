const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        categories: true,
      }
    });
    for (const p of products) {
      if (p.attributes && p.attributes.includes("Boite")) {
        console.log("=========================================");
        console.log(`PRODUIT TROUVÉ EN BDD : ID #${p.id} (${p.name})`);
        console.log(`Attributes (typeof: ${typeof p.attributes}) :`);
        console.log(p.attributes);
        console.log("=========================================");
      }
    }
  } catch (err) {
    console.error("Erreur Prisma :", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
