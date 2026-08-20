import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JeuxDeSocieteClient from "./JeuxDeSocieteClient";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("jeux-de-societe");
}

export default async function JeuxDeSocietePage() {
  // Fetch STRICTLY products with the "jeuxsociete" tag or category
  let gameProducts: any[] = [];
  try {
    gameProducts = await prisma.product.findMany({
      where: {
        status: "publish",
        OR: [
          {
            categories: {
              some: {
                name: {
                  contains: "jeuxsociete",
                  mode: "insensitive",
                },
              },
            },
          },
          {
            attributes: {
              contains: "jeuxsociete",
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        images: true,
        categories: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  } catch (e) {
    console.error("Error fetching board game accessories:", e);
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-[#ff4f00] selection:text-white font-sans overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full pt-24 sm:pt-28 pb-16">
        <JeuxDeSocieteClient initialProducts={gameProducts} />
      </main>
      <Footer />
    </div>
  );
}
