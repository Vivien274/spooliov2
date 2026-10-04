import { NextResponse } from "next/server";
import { getAllDrops } from "@/lib/drops";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") === "true";
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === "development";

    const isAuthorized =
      isDev ||
      isVercelCron ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupère les drops et exécute automatiquement syncAndAutoPublishDrops
    const drops = await getAllDrops();

    revalidatePath("/drops");
    revalidatePath("/boutique");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeDropsCount: drops.length,
      drops: drops.map((d) => ({
        id: d.id,
        slug: d.slug,
        status: d.status,
        startDate: d.startDate,
        productCount: d.productIds?.length || 0,
      })),
    });
  } catch (error: any) {
    console.error("Erreur cron publish-drops :", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
