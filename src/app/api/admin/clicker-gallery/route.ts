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
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    fs.writeFileSync(GALLERY_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, count: body.length });
  } catch (error) {
    console.error("Error saving clicker gallery:", error);
    return NextResponse.json({ error: "Failed to save gallery" }, { status: 500 });
  }
}
