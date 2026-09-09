import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/links.json");

function getLinksData() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading links.json:", err);
  }
  return { profile: {}, links: [], events: [] };
}

function saveLinksData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing links.json:", err);
  }
}

// GET: Return all links, events, and full profile for admin management
export async function GET() {
  try {
    const data = getLinksData();
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

    const currentData = getLinksData();

    const newData = {
      profile: profile ? { ...currentData.profile, ...profile } : currentData.profile,
      links: Array.isArray(links) ? links : (currentData.links || []),
      events: Array.isArray(events) ? events : (currentData.events || []),
    };

    saveLinksData(newData);

    return NextResponse.json({
      success: true,
      profile: newData.profile,
      links: newData.links,
      events: newData.events,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
