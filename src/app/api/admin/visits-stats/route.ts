import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Queries via Prisma
    let statsData: {
      recentVisits: any[];
      productsList: any[];
      ordersList: any[];
    } | null = null;

    if (prisma) {
      try {
        statsData = await Promise.race([
          (async () => {
            const [recentVisits, productsList, ordersList] = await Promise.all([
              prisma.visit.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { url: true, ipHash: true, createdAt: true },
                take: 3000,
                orderBy: { createdAt: "desc" },
              }),
              prisma.product.findMany({
                select: { id: true, name: true, slug: true },
              }),
              prisma.order.findMany({
                select: {
                  id: true,
                  shippingAddress: true,
                  shippingMethod: true,
                  relayDetails: true,
                  createdAt: true,
                },
                take: 1000,
                orderBy: { createdAt: "desc" },
              }),
            ]);
            return { recentVisits, productsList, ordersList };
          })(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Visits Stats DB Timeout")), 2800)
          ),
        ]);
      } catch (e: any) {
        console.warn("DB stats fetch warning:", e?.message);
      }
    }

    const recentVisits = statsData?.recentVisits || [];
    const productsList = statsData?.productsList || [];
    const ordersList = statsData?.ordersList || [];

    // 1. Visites & Utilisateurs Actifs
    const monthVisits = recentVisits.length;
    const weekVisits = recentVisits.filter((v) => new Date(v.createdAt) >= sevenDaysAgo).length;
    const todayVisits = recentVisits.filter((v) => new Date(v.createdAt) >= todayStart).length;
    const totalVisits = monthVisits;

    const liveActiveIps = new Set(
      recentVisits.filter((v) => new Date(v.createdAt) >= fiveMinutesAgo).map((v) => v.ipHash)
    );
    const liveActiveUsers = liveActiveIps.size;

    const uniqueTodayIps = new Set(
      recentVisits.filter((v) => new Date(v.createdAt) >= todayStart).map((v) => v.ipHash)
    );
    const uniqueWeekIps = new Set(
      recentVisits.filter((v) => new Date(v.createdAt) >= sevenDaysAgo).map((v) => v.ipHash)
    );

    // 2. Daily Stats (7 jours)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const endOfDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const count = recentVisits.filter((v) => {
        const t = new Date(v.createdAt).getTime();
        return t >= d.getTime() && t < endOfDay.getTime();
      }).length;

      const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      dailyStats.push({ label: dayLabel, count });
    }

    // 3. Top pages & Produits consultés
    const pageCounts: Record<string, number> = {};
    let totalProductViews = 0;

    recentVisits.forEach((v) => {
      if (v.url) {
        pageCounts[v.url] = (pageCounts[v.url] || 0) + 1;
        if (v.url.startsWith("/product/") || v.url.startsWith("/produit/")) {
          totalProductViews++;
        }
      }
    });

    const topPages = Object.entries(pageCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const productPages = topPages
      .filter((p) => p.url.startsWith("/product/") || p.url.startsWith("/produit/"))
      .map((p) => {
        const slug = p.url.replace(/^\/(product|produit)\//, "");
        const prod = productsList.find((prod) => prod.slug === slug);
        return {
          name: prod ? prod.name : slug,
          url: p.url,
          count: p.count,
        };
      });

    // 4. Plages Horaires
    const hourlySlots = [
      { key: "nuit", label: "00h - 06h (Nuit 🌙)", shortLabel: "00h-06h", count: 0 },
      { key: "matin", label: "06h - 12h (Matin ☕️)", shortLabel: "06h-12h", count: 0 },
      { key: "apres_midi", label: "12h - 18h (A-Midi ☀️)", shortLabel: "12h-18h", count: 0 },
      { key: "soiree", label: "18h - 00h (Soirée 🎬)", shortLabel: "18h-00h", count: 0 },
    ];

    recentVisits.forEach((v) => {
      const hour = new Date(v.createdAt).getHours();
      if (hour >= 0 && hour < 6) hourlySlots[0].count++;
      else if (hour >= 6 && hour < 12) hourlySlots[1].count++;
      else if (hour >= 12 && hour < 18) hourlySlots[2].count++;
      else hourlySlots[3].count++;
    });

    const maxSlotCount = Math.max(...hourlySlots.map((s) => s.count));
    const peakSlot = maxSlotCount > 0 ? hourlySlots.find((s) => s.count === maxSlotCount) || null : null;

    // 5. Entonnoir de Conversion (Funnel UX)
    const totalVisitors = Math.max(uniqueWeekIps.size, 1);
    const totalOrders = ordersList.length;
    const conversionRate = parseFloat(((totalOrders / totalVisitors) * 100).toFixed(1));

    const funnel = {
      step1_visitors: totalVisitors,
      step2_productViews: totalProductViews,
      step3_orders: totalOrders,
      conversionRate,
      dropoffProductRate:
        totalVisitors > 0
          ? Math.max(0, Math.round(((totalVisitors - Math.min(totalProductViews, totalVisitors)) / totalVisitors) * 100))
          : 0,
    };

    // 6. Répartition Géographique & Expédition
    const cityCounts: Record<string, number> = {};
    const shippingMethodCounts: Record<string, number> = {};

    ordersList.forEach((order) => {
      // Shipping Method
      const method = order.shippingMethod || "Mondial Relay";
      shippingMethodCounts[method] = (shippingMethodCounts[method] || 0) + 1;

      // Extract City
      let city = "Non spécifiée";
      if (order.shippingAddress) {
        const matches = order.shippingAddress.match(/\d{5}\s+([A-Za-zÀ-ÿ\s-]+)/);
        if (matches && matches[1]) {
          city = matches[1].trim();
        }
      } else if (order.relayDetails) {
        try {
          const relay = JSON.parse(order.relayDetails);
          if (relay.ville || relay.city) {
            city = relay.ville || relay.city;
          }
        } catch (e) {}
      }

      if (city && city !== "Non spécifiée") {
        const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        cityCounts[formattedCity] = (cityCounts[formattedCity] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const shippingMethodsBreakdown = Object.entries(shippingMethodCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // 7. IA Smart Insights (Calculé en local)
    let aiInsightTitle = "Conseil d'Optimisation IA Spoolio";
    let aiInsightText = "Vos métriques d'engagement sont stables.";
    let aiInsightBadge = "Recommandation";

    if (peakSlot) {
      if (peakSlot.key === "soiree") {
        aiInsightText = `Vos visiteurs sont particulièrement actifs en Soirée (${peakSlot.shortLabel}) avec ${peakSlot.count} vues. Nous vous recommandons de publier vos annonces de nouveautés et jeux-concours vers 17h30 pour maximiser l'impact !`;
        aiInsightBadge = "Pic d'Affluence Soirée";
      } else if (peakSlot.key === "apres_midi") {
        aiInsightText = `La majorité de votre trafic se concentre dans l'Après-midi (${peakSlot.shortLabel}). Privilégiez les promotions flash entre 12h et 16h pour stimuler la conversion.`;
        aiInsightBadge = "Pic d'Affluence Après-Midi";
      } else if (peakSlot.key === "matin") {
        aiInsightText = `Vos visiteurs consultent principalement votre boutique le Matin (${peakSlot.shortLabel}). Vos newsletters et emails de relance auront le meilleur taux d'ouverture vers 08h00.`;
        aiInsightBadge = "Pic d'Affluence Matin";
      }
    }

    if (productPages.length > 0) {
      const topProd = productPages[0];
      aiInsightText += ` Le produit phare le plus consulté est "${topProd.name}" (${topProd.count} vues). Assurez-vous d'avoir suffisamment de stock en impression 3D !`;
    }

    return NextResponse.json({
      totalVisits,
      todayVisits,
      weekVisits,
      monthVisits,
      liveActiveUsers,
      uniqueToday: uniqueTodayIps.size,
      uniqueWeek: uniqueWeekIps.size,
      dailyStats,
      topPages,
      topProducts: productPages,
      productPages,
      hourlySlots,
      peakSlot,
      funnel,
      geoDeliveryStats: {
        topCities,
        shippingMethods: shippingMethodsBreakdown,
      },
      aiInsight: {
        title: aiInsightTitle,
        text: aiInsightText,
        badge: aiInsightBadge,
      },
      conversionRate,
    });
  } catch (err: any) {
    console.warn("Visits stats error:", err.message);
    return NextResponse.json({
      totalVisits: 0,
      todayVisits: 0,
      weekVisits: 0,
      monthVisits: 0,
      liveActiveUsers: 0,
      uniqueToday: 0,
      uniqueWeek: 0,
      dailyStats: [],
      topPages: [],
      topProducts: [],
      productPages: [],
      hourlySlots: [],
      peakSlot: null,
      funnel: {
        step1_visitors: 0,
        step2_productViews: 0,
        step3_orders: 0,
        conversionRate: 0,
        dropoffProductRate: 0,
      },
      geoDeliveryStats: {
        topCities: [],
        shippingMethods: [],
      },
      aiInsight: {
        title: "Conseil IA Spoolio",
        text: "Données en cours de collecte...",
        badge: "Info",
      },
      conversionRate: 0,
    });
  }
}
