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
  return { profile: {}, links: [], events: [] };
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
    console.warn("[Admin Links] Could not read config-links from DB, falling back to file:", err);
  }

  return getFallbackFileLinksData();
}

async function saveLinksData(data: any) {
  // 1. Sauvegarde principale en Base de Données (persistant sur Vercel serverless)
  try {
    const jsonString = JSON.stringify(data);
    await Promise.race([
      prisma.page.upsert({
        where: { slug: "config-links" },
        update: {
          content: jsonString,
        },
        create: {
          title: "Configuration Liens Hub",
          slug: "config-links",
          content: jsonString,
          status: "publish",
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 5000)),
    ]);
  } catch (dbErr) {
    console.error("[Admin Links] Error saving to DB:", dbErr);
    throw dbErr;
  }

  // 2. Synchronisation secondaire du fichier local (pour environnement local)
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Silencieux sur environnements read-only comme Vercel
  }
}

// GET: Return all links, events, and full profile for admin management
export async function GET() {
  try {
    const data = await getLinksData();
    return NextResponse.json({
      success: true,
      profile: data.profile || {},
      links: (data.links || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
      events: (data.events || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// POST: Update link configuration, events & profile settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, links, events } = body;

    const currentData = await getLinksData();

    const newData = {
      profile: profile ? { ...currentData.profile, ...profile } : currentData.profile,
      links: Array.isArray(links) ? links : (currentData.links || []),
      events: Array.isArray(events) ? events : (currentData.events || []),
    };

    await saveLinksData(newData);

    return NextResponse.json({
      success: true,
      profile: newData.profile,
      links: newData.links,
      events: newData.events,
    });
  } catch (error: any) {
    console.error("[Admin Links POST] Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Erreur de sauvegarde" }, { status: 500 });
  }
}
