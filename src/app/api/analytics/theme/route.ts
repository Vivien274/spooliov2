import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STATS_FILE_PATH = path.join(process.cwd(), "src/data/theme_stats.json");

function getStats() {
  try {
    if (fs.existsSync(STATS_FILE_PATH)) {
      const fileData = fs.readFileSync(STATS_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error("Error reading theme_stats.json:", error);
  }
  return {
    lightThemeToggles: 0,
    darkThemeToggles: 0,
    lastToggleAt: new Date().toISOString(),
  };
}

function saveStats(stats: any) {
  try {
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing theme_stats.json:", error);
  }
}

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { theme } = body;

    const stats = getStats();

    if (theme === "light") {
      stats.lightThemeToggles = (stats.lightThemeToggles || 0) + 1;
    } else if (theme === "dark") {
      stats.darkThemeToggles = (stats.darkThemeToggles || 0) + 1;
    }

    stats.lastToggleAt = new Date().toISOString();
    saveStats(stats);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Error handling theme stats POST:", error);
    return NextResponse.json({ error: "Failed to update theme stats" }, { status: 500 });
  }
}
