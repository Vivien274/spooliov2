import { Metadata } from "next";
import LinkHubClient from "@/components/LinkHubClient";
import fs from "fs";
import path from "path";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("liens");
}

function getFallbackFileLinksData() {
  try {
    const filePath = path.join(process.cwd(), "src/data/links.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileData);
      const publishedLinks = (parsed.links || [])
        .filter((link: any) => link.isPublished !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      const publishedEvents = (parsed.events || [])
        .filter((ev: any) => ev.isPublished !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      return {
        profile: parsed.profile,
        links: publishedLinks,
        events: publishedEvents,
      };
    }
  } catch (err) {
    console.error("Error reading links.json on server fallback:", err);
  }
  return { profile: undefined, links: undefined, events: undefined };
}

async function getInitialLinksData() {
  try {
    const page = await Promise.race([
      prisma.page.findUnique({
        where: { slug: "config-links" },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 3000)),
    ]);

    if (page && page.content) {
      const parsed = JSON.parse(page.content);
      const publishedLinks = (parsed.links || [])
        .filter((link: any) => link.isPublished !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      const publishedEvents = (parsed.events || [])
        .filter((ev: any) => ev.isPublished !== false)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      return {
        profile: parsed.profile,
        links: publishedLinks,
        events: publishedEvents,
      };
    }
  } catch (err) {
    console.warn("[Liens Page SSR] DB read timeout/error, using file fallback:", err);
  }

  return getFallbackFileLinksData();
}

export default async function LiensPage() {
  const { profile, links, events } = await getInitialLinksData();

  return <LinkHubClient initialProfile={profile} initialLinks={links} initialEvents={events} />;
}
