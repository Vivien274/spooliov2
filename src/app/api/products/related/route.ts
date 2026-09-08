import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&nbsp;/g, " ");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '3', 10), 1), 6);

    let relatedProducts: any[] = [];

    // 1. Try Prisma with a lightweight targeted query (1.5s timeout)
    if (prisma) {
      try {
        const dbProducts = await Promise.race([
          prisma.product.findMany({
            where: {
              status: { in: ['publish', ''] },
              ...(slug ? { slug: { not: slug } } : {}),
            },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              regularPrice: true,
              onSale: true,
              shortDescription: true,
              images: {
                take: 1,
                select: { id: true, src: true, alt: true, name: true },
              },
            },
            orderBy: { dateCreated: 'desc' },
            take: limit,
          }),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Prisma Timeout')), 1500)
          ),
        ]);

        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          relatedProducts = dbProducts.map((p) => ({
            id: p.id,
            name: decodeHtml(p.name),
            slug: p.slug,
            price: p.price || '4.00',
            regular_price: p.regularPrice || p.price || '4.00',
            on_sale: Boolean(p.onSale),
            short_description: p.shortDescription || '',
            images: (p.images && p.images.length > 0)
              ? p.images
              : [{ id: 1, src: '/images/figma_keychains.jpg', alt: p.name, name: p.name }],
          }));
        }
      } catch (err: any) {
        console.warn('[Related Products] Prisma query fallback:', err?.message);
      }
    }

    // 2. Fallback to local products.json if DB unavailable
    if (relatedProducts.length === 0) {
      try {
        const jsonPath = path.join(process.cwd(), 'src/data/products.json');
        if (fs.existsSync(jsonPath)) {
          const raw = fs.readFileSync(jsonPath, 'utf8');
          const allProducts = JSON.parse(raw);
          if (Array.isArray(allProducts)) {
            const filtered = allProducts
              .filter((p: any) => p.slug !== slug && (p.status === 'publish' || !p.status))
              .slice(0, limit);

            relatedProducts = filtered.map((p: any) => ({
              id: p.id,
              name: decodeHtml(p.name),
              slug: p.slug,
              price: p.price || '4.00',
              regular_price: p.regularPrice || p.regular_price || p.price || '4.00',
              on_sale: Boolean(p.onSale || p.on_sale),
              short_description: p.shortDescription || p.short_description || '',
              images: (p.images && p.images.length > 0)
                ? p.images.slice(0, 1)
                : [{ id: 1, src: '/images/figma_keychains.jpg', alt: p.name, name: p.name }],
            }));
          }
        }
      } catch (e: any) {
        console.warn('[Related Products] JSON fallback failed:', e?.message);
      }
    }

    return NextResponse.json(relatedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}
