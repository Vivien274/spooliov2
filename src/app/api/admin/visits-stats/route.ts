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

    // 1. Calculate dates ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 2. Fetch aggregate statistics
    const totalVisits = await prisma.visit.count();
    const todayVisits = await prisma.visit.count({
      where: { createdAt: { gte: todayStart } }
    });
    const weekVisits = await prisma.visit.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const monthVisits = await prisma.visit.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // Unique visitors count using ipHash
    const uniqueVisitorsCount = async (since: Date) => {
      const res = await prisma.visit.groupBy({
        by: ["ipHash"],
        where: { createdAt: { gte: since } }
      });
      return res.length;
    };
    const uniqueToday = await uniqueVisitorsCount(todayStart);
    const uniqueWeek = await uniqueVisitorsCount(sevenDaysAgo);

    // 3. Visits per day (Last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = d;
      const endOfDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);

      const count = await prisma.visit.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

      const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      dailyStats.push({ label: dayLabel, count });
    }

    // 4. Top visited pages
    const rawTopPages = await prisma.visit.groupBy({
      by: ["url"],
      _count: {
        url: true
      },
      orderBy: {
        _count: {
          url: "desc"
        }
      },
      take: 10
    });

    const topPages = rawTopPages.map((p) => ({
      url: p.url,
      count: p._count.url
    }));

    // 5. Top visited products
    // Fetch products list to match slugs easily
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    const productPages = topPages
      .filter((p) => p.url.startsWith("/product/"))
      .map((p) => {
        const slug = p.url.split("/product/")[1];
        const prod = products.find((prod) => prod.slug === slug);
        return {
          name: prod ? prod.name : slug,
          url: p.url,
          count: p.count
        };
      });

    return NextResponse.json({
      success: true,
      stats: {
        totalVisits,
        todayVisits,
        weekVisits,
        monthVisits,
        uniqueToday,
        uniqueWeek,
        dailyStats,
        topPages: topPages.slice(0, 5),
        topProducts: productPages.slice(0, 5)
      }
    });
  } catch (err: any) {
    console.error("Visits stats error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
