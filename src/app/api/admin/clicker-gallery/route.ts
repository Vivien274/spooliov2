import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GALLERY_FILE = path.join(process.cwd(), "src/data/clicker_gallery.json");

export async function GET() {
  try {
    if (!fs.existsSync(GALLERY_FILE)) {
      return NextResponse.json([]);
    }
    const content = fs.readFileSync(GALLERY_FILE, "utf-8");
    const gallery = JSON.parse(content);
    return NextResponse.json(gallery);
  } catch (error) {
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

    const dirPath = path.dirname(GALLERY_FILE);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(GALLERY_FILE, JSON.stringify(sanitized, null, 2), "utf-8");
    return NextResponse.json({ success: true, count: sanitized.length });
  } catch (error: any) {
    console.error("Error saving clicker gallery:", error);
    return NextResponse.json(
      { error: `Erreur lors de la sauvegarde du fichier : ${error?.message || "Erreur inconnue"}` },
      { status: 500 }
    );
  }
}
