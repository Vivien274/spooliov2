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
  return {
    profile: {
      title: "Spoolio 🌀",
      subtitle: "Impression 3D & Objets Fidgets Sensoriels TDAH 🇫🇷",
      avatar: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
      verifiedBadge: true,
      theme: "spoolio-dark",
      socials: {
        tiktok: "https://www.tiktok.com/@spoolio_3d",
        instagram: "https://www.instagram.com/spoolio.fr",
        email: "contact@spoolio.fr"
      }
    },
    links: []
  };
}

function saveLinksData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing links.json:", err);
  }
}

// GET: Return public profile and published links sorted by order
export async function GET() {
  try {
    const data = getLinksData();
    const publishedLinks = (data.links || [])
      .filter((link: any) => link.isPublished !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      success: true,
      profile: data.profile,
      links: publishedLinks,
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
      const data = getLinksData();
      const updatedLinks = (data.links || []).map((link: any) => {
        if (link.id === linkId) {
          return { ...link, clicks: (link.clicks || 0) + 1 };
        }
        return link;
      });

      data.links = updatedLinks;
      saveLinksData(data);

      return NextResponse.json({ success: true, linkId });
    }

    return NextResponse.json({ success: false, error: "Action invalide" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
