import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/links.json");

function getFallbackFileLinksData() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading links.json fallback:", err);
  }
  return {
    profile: {
      title: "Spoolio",
      subtitle: "Atelier d'impression 3D & Fidgets sensoriels façonnés en France",
      avatar: "/images/logo-spoolio-eyes.png",
      verifiedBadge: true,
      theme: "spoolio-light",
      socials: {
        tiktok: "https://www.tiktok.com/@spoolio.fr",
        instagram: "https://www.instagram.com/spoolio.fr",
        facebook: "https://www.facebook.com/spoolio.fr",
        email: "contact@spoolio.fr"
      }
    },
    links: [],
    events: []
  };
}

async function getLinksData() {
  try {
    const page = await Promise.race([
      prisma.page.findUnique({
        where: { slug: "config-links" },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 3000)),
    ]);

    if (page && page.content) {
      return JSON.parse(page.content);
    }
  } catch (err) {
    console.warn("[Public Links] Could not read config-links from DB, falling back to file:", err);
  }

  return getFallbackFileLinksData();
}

async function saveLinksData(data: any) {
  try {
    const jsonString = JSON.stringify(data);
    await Promise.race([
      prisma.page.upsert({
        where: { slug: "config-links" },
        update: { content: jsonString },
        create: {
          title: "Configuration Liens Hub",
          slug: "config-links",
          content: jsonString,
          status: "publish",
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 4000)),
    ]);
  } catch (err) {
    console.warn("[Public Links] DB save error:", err);
  }

  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

// GET: Return public profile and published links sorted by order
export async function GET() {
  try {
    const data = await getLinksData();
    const publishedLinks = (data.links || [])
      .filter((link: any) => link.isPublished !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const publishedEvents = (data.events || [])
      .filter((ev: any) => ev.isPublished !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      success: true,
      profile: data.profile,
      links: publishedLinks,
      events: publishedEvents,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// POST: Record link click analytics
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, linkId } = body;

    if (action === "click" && linkId) {
      const data = await getLinksData();
      const updatedLinks = (data.links || []).map((link: any) => {
        if (link.id === linkId) {
          return { ...link, clicks: (link.clicks || 0) + 1 };
        }
        return link;
      });

      data.links = updatedLinks;
      await saveLinksData(data);

      return NextResponse.json({ success: true, linkId });
    }

    return NextResponse.json({ success: false, error: "Action invalide" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
