import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GALLERY_FILE = path.join(process.cwd(), "src/data/clicker_gallery.json");
const DB_SLUG = "config-clicker-gallery";

export async function GET() {
  try {
    // 1. Try fetching from Prisma Database first
    try {
      const page = await prisma.page.findUnique({
        where: { slug: DB_SLUG },
      });
      if (page && page.content) {
        const parsed = JSON.parse(page.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json(parsed);
        }
      }
    } catch (dbErr: any) {
      console.warn("Prisma query for clicker-gallery failed/fallback:", dbErr?.message);
    }

    // 2. Fallback to reading disk file if database record is absent
    if (fs.existsSync(GALLERY_FILE)) {
      const content = fs.readFileSync(GALLERY_FILE, "utf-8");
      const gallery = JSON.parse(content);
      return NextResponse.json(gallery);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error reading clicker gallery:", error);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Le format des données doit être un tableau." }, { status: 400 });
    }

    // Sanitize array items
    const sanitized = body.map((item: any, idx: number) => ({
      id: item?.id ? Number(item.id) : Date.now() + idx,
      src: String(item?.src || "").trim(),
      title: String(item?.title || "Création Clicker Spoolio 3D").trim(),
      caption: String(item?.caption || "Réalisation personnalisée sur-mesure imprimée en 3D").trim(),
    })).filter((item: any) => Boolean(item.src));

    const jsonStr = JSON.stringify(sanitized, null, 2);

    // 1. Save to Prisma Database (works 100% on serverless / Vercel read-only filesystems)
    try {
      await prisma.page.upsert({
        where: { slug: DB_SLUG },
        update: {
          content: jsonStr,
        },
        create: {
          title: "Configuration Galerie Clicker",
          slug: DB_SLUG,
          content: jsonStr,
          status: "publish",
        },
      });
    } catch (dbErr: any) {
      console.error("Failed saving clicker gallery to Prisma DB:", dbErr?.message);
    }

    // 2. Try writing to local disk (ignore EROFS gracefully on read-only serverless platforms)
    try {
      const dirPath = path.dirname(GALLERY_FILE);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(GALLERY_FILE, jsonStr, "utf-8");
    } catch (fsErr: any) {
      // Ignore read-only filesystem errors (EROFS) on Vercel/serverless
      console.log("Local disk save bypassed (serverless environment):", fsErr?.message);
    }

    return NextResponse.json({ success: true, count: sanitized.length });
  } catch (error: any) {
    console.error("Error saving clicker gallery:", error);
    return NextResponse.json(
      { error: `Erreur lors de la sauvegarde : ${error?.message || "Erreur inconnue"}` },
      { status: 500 }
    );
  }
}
