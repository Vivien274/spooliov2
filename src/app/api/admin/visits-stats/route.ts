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
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Perform queries with a 2.5s Promise.race timeout
    const statsData = (await Promise.race([
      (async () => {
        const [recentVisits, productsList] = await Promise.all([
          prisma.visit.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { url: true, ipHash: true, createdAt: true },
            take: 2000,
            orderBy: { createdAt: "desc" }
          }),
          prisma.product.findMany({
            select: { id: true, name: true, slug: true }
          })
        ]);
        return { recentVisits, productsList };
      })(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Visits Stats DB Timeout")), 2500))
    ])) as { recentVisits: any[]; productsList: any[] } | null;

    if (!statsData || !statsData.recentVisits) {
      return NextResponse.json({
        totalVisits: 0,
        todayVisits: 0,
        weekVisits: 0,
        monthVisits: 0,
        uniqueToday: 0,
        uniqueWeek: 0,
        dailyStats: [],
        topPages: [],
        productPages: [],
        hourlySlots: [],
        conversionRate: 0
      });
    }

    const { recentVisits, productsList } = statsData;

    // Process counts in JS memory
    const monthVisits = recentVisits.length;
    const weekVisits = recentVisits.filter(v => new Date(v.createdAt) >= sevenDaysAgo).length;
    const todayVisits = recentVisits.filter(v => new Date(v.createdAt) >= todayStart).length;
    const totalVisits = monthVisits;

    const uniqueTodayIps = new Set(recentVisits.filter(v => new Date(v.createdAt) >= todayStart).map(v => v.ipHash));
    const uniqueWeekIps = new Set(recentVisits.filter(v => new Date(v.createdAt) >= sevenDaysAgo).map(v => v.ipHash));

    // Daily stats (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const endOfDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const count = recentVisits.filter(v => {
        const t = new Date(v.createdAt).getTime();
        return t >= d.getTime() && t < endOfDay.getTime();
      }).length;

      const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      dailyStats.push({ label: dayLabel, count });
    }

    // Top pages
    const pageCounts: Record<string, number> = {};
    recentVisits.forEach(v => {
      if (v.url) {
        pageCounts[v.url] = (pageCounts[v.url] || 0) + 1;
      }
    });

    const topPages = Object.entries(pageCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const productPages = topPages
      .filter((p) => p.url.startsWith("/product/"))
      .map((p) => {
        const slug = p.url.split("/product/")[1];
        const prod = productsList.find((prod) => prod.slug === slug);
        return {
          name: prod ? prod.name : slug,
          url: p.url,
          count: p.count
        };
      });

    // Hourly Slots
    const hourlySlots = [
      { key: "nuit", label: "00h - 06h (Nuit 🌙)", shortLabel: "00h-06h", count: 0 },
      { key: "matin", label: "06h - 12h (Matin ☕️)", shortLabel: "06h-12h", count: 0 },
      { key: "apres_midi", label: "12h - 18h (A-Midi ☀️)", shortLabel: "12h-18h", count: 0 },
      { key: "soiree", label: "18h - 00h (Soirée 🎬)", shortLabel: "18h-00h", count: 0 }
    ];

    recentVisits.forEach((v) => {
      const hour = new Date(v.createdAt).getHours();
      if (hour >= 0 && hour < 6) hourlySlots[0].count++;
      else if (hour >= 6 && hour < 12) hourlySlots[1].count++;
      else if (hour >= 12 && hour < 18) hourlySlots[2].count++;
      else hourlySlots[3].count++;
    });

    return NextResponse.json({
      totalVisits,
      todayVisits,
      weekVisits,
      monthVisits,
      uniqueToday: uniqueTodayIps.size,
      uniqueWeek: uniqueWeekIps.size,
      dailyStats,
      topPages,
      productPages,
      hourlySlots,
      conversionRate: 0
    });
  } catch (err: any) {
    console.warn("Visits stats warning / timeout:", err.message);
    return NextResponse.json({
      totalVisits: 0,
      todayVisits: 0,
      weekVisits: 0,
      monthVisits: 0,
      uniqueToday: 0,
      uniqueWeek: 0,
      dailyStats: [],
      topPages: [],
      productPages: [],
      hourlySlots: [],
      conversionRate: 0
    });
  }
}
