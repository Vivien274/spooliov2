import { Metadata } from "next";
import LinkHubClient from "@/components/LinkHubClient";
import fs from "fs";
import path from "path";
import { getPageSeoMetadata } from "@/lib/seoPages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("liens");
}

function getInitialLinksData() {
  try {
    const filePath = path.join(process.cwd(), "src/data/links.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileData);
      const publishedLinks = (parsed.links || [])
        .filter((link: any) => link.isPublished !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      return {
        profile: parsed.profile,
        links: publishedLinks,
      };
    }
  } catch (err) {
    console.error("Error reading links.json on server:", err);
  }
  return { profile: undefined, links: undefined };
}

export default function LiensPage() {
  const { profile, links } = getInitialLinksData();

  return <LinkHubClient initialProfile={profile} initialLinks={links} />;
}
