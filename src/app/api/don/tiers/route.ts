import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if the table is empty and seed default tiers if necessary
    const count = await prisma.donationTier.count();
    if (count === 0) {
      await prisma.donationTier.createMany({
        data: [
          { amount: 5, title: "Café du Maker", subtitle: "Petite Attention", description: "Aide le créateur à rester concentré pendant les longues nuits d'impression.", emoji: "☕", color: "orange" },
          { amount: 10, title: "Une Buse en Laiton", subtitle: "Entretien Précision", description: "Remplace une buse usée pour conserver une précision chirurgicale sur les objets fins.", emoji: "⚙️", color: "blue" },
          { amount: 30, title: "Un Plateau PEI", subtitle: "Adhérence Parfaite", description: "Assure une adhérence parfaite des premières couches pour éviter les ratés au démarrage.", emoji: "📐", color: "orange" },
          { amount: 60, title: "2 Bobines de PLA", subtitle: "Matière Biosourcée", description: "Finance l'achat de filaments biodégradables à base d'amidon de maïs recyclé.", emoji: "♻️", color: "blue" },
          { amount: 120, title: "Chouchouter une Machine", subtitle: "Maintenance Atelier", description: "Sponsorise la révision complète (courroies, calibrage) d'une de nos 5 imprimantes.", emoji: "🤖", color: "orange" },
        ]
      });
    }

    // Retrieve active tiers ordered by amount
    const tiers = await prisma.donationTier.findMany({
      where: { isActive: true },
      orderBy: { amount: "asc" }
    });

    return NextResponse.json(tiers);
  } catch (e: any) {
    console.error("[Donation Tiers Get Error]:", e.message || e);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paliers de dons." },
      { status: 500 }
    );
  }
}
