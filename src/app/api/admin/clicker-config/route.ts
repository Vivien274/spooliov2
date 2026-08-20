import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIG_FILE = path.join(process.cwd(), "src/data/clicker_config.json");

export async function GET() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return NextResponse.json({});
    }
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    const config = JSON.parse(content);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading clicker config:", error);
    return NextResponse.json({ error: "Failed to load clicker config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving clicker config:", error);
    return NextResponse.json({ error: "Failed to save clicker config" }, { status: 500 });
  }
}
