import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface AnnouncementBannerConfig {
  enabled: boolean;
  badgeText: string;
  message: string;
  buttonText?: string;
  buttonLink?: string;
  bgGradient?: string;
  dismissible: boolean;
}

export const DEFAULT_BANNER_CONFIG: AnnouncementBannerConfig = {
  enabled: true,
  badgeText: "Vacances",
  message: "Spoolio prend quelques jours de vacances, les imprimantes reprennent du service à partir du 29 Août !",
  buttonText: "",
  buttonLink: "",
  bgGradient: "from-[#12131c] via-[#1c1e2d] to-[#12131c]",
  dismissible: true,
};

export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "config-announcement-banner" },
    });

    if (!page) {
      return NextResponse.json({
        success: true,
        config: DEFAULT_BANNER_CONFIG,
      });
    }

    let config = DEFAULT_BANNER_CONFIG;
    try {
      const parsed = JSON.parse(page.content);
      config = { ...DEFAULT_BANNER_CONFIG, ...parsed };
    } catch {
      config = DEFAULT_BANNER_CONFIG;
    }

    return NextResponse.json({ success: true, config });
  } catch (e: any) {
    console.warn("Error fetching announcement banner config:", e.message || e);
    return NextResponse.json({ success: true, config: DEFAULT_BANNER_CONFIG });
  }
}
