const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting insertion of preset colors attribute...");
    const attribute = await prisma.attribute.create({
      data: {
        name: "Couleurs",
        values: "Arc en ciel, Bicolore Bleu clair – Rose, Bicolore Bleu-Vert, Bicolore Bleu-Violet, Bicolore Bleu-Violet Mat, Rouge feu (dégradé), Feu, Noir Pailleté, Gris Pailleté, Vert foncé Pailleté, Argenté, Bois (imitation chêne), Imitation Roche, Marbre, Phosphorescent, Transparent, Blanc, Noir, Gris, Beige (cacahuète), Jaune, Jaune soleil, Orange, Orange pêche, Orange translucide, Rose pâle, Rose poudré, Rouge, Rouge Brique, Vert fluo / pomme, Vert foncé, Vert pâle, Violet, Bleu, Bleu canard, Bleu marine, Bleu turquoise, Marron clair, Marron moyen, Marron foncé"
      }
    });
    console.log("Success! Created attribute:", attribute);
  } catch (err) {
    console.error("Prisma error caught on insert:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
