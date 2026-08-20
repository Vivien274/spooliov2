import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIG_FILE = path.join(process.cwd(), "src/data/clicker_config.json");
const DB_SLUG = "config-clicker-options";

export async function GET() {
  try {
    // 1. Try fetching from Prisma Database
    try {
      const page = await prisma.page.findUnique({
        where: { slug: DB_SLUG },
      });
      if (page && page.content) {
        const parsed = JSON.parse(page.content);
        if (parsed && typeof parsed === "object") {
          return NextResponse.json(parsed);
        }
      }
    } catch (dbErr: any) {
      console.warn("Prisma query for clicker-config failed/fallback:", dbErr?.message);
    }

    // 2. Fallback to disk file if DB record is not found
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const config = JSON.parse(content);
      return NextResponse.json(config);
    }

    return NextResponse.json({});
  } catch (error: any) {
    console.error("Error reading clicker config:", error);
    return NextResponse.json({ error: "Failed to load clicker config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jsonStr = JSON.stringify(body, null, 2);

    // 1. Save to Prisma Database (bypasses EROFS read-only serverless filesystems)
    try {
      await prisma.page.upsert({
        where: { slug: DB_SLUG },
        update: {
          content: jsonStr,
        },
        create: {
          title: "Configuration Options Clicker",
          slug: DB_SLUG,
          content: jsonStr,
          status: "publish",
        },
      });
    } catch (dbErr: any) {
      console.error("Failed saving clicker config to Prisma DB:", dbErr?.message);
    }

    // 2. Try writing to local disk
    try {
      const dirPath = path.dirname(CONFIG_FILE);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, jsonStr, "utf-8");
    } catch (fsErr: any) {
      // Ignore read-only filesystem errors (EROFS) on Vercel/serverless
      console.log("Local disk save bypassed (serverless environment):", fsErr?.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving clicker config:", error);
    return NextResponse.json({ error: "Failed to save clicker config" }, { status: 500 });
  }
}
