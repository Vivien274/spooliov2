import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Helper to query with timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 800): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Prisma Query Timeout")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

// GET: Retrieve all reviews (Admin only)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
    let reviews: any[] = [];

    try {
      console.log("Fetching reviews from Prisma Database...");
      reviews = await withTimeout(prisma.review.findMany({
        include: {
          product: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }));

      // Cache to local JSON
      try {
        fs.writeFileSync(jsonPath, JSON.stringify(reviews, null, 2), 'utf-8');
      } catch (err) {
        console.warn("Could not cache reviews to local JSON:", err);
      }
    } catch (dbErr: any) {
      console.warn("Database failed or timed out. Falling back to local reviews.json:", dbErr.message);
      
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          reviews = JSON.parse(fileData || "[]");
        } catch (jsonErr: any) {
          console.error("Failed to parse local reviews.json:", jsonErr.message);
          reviews = [];
        }
      } else {
        reviews = [];
      }
    }

    return NextResponse.json({ success: true, reviews });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de chargement des avis." },
      { status: 500 }
    );
  }
}

// POST: Moderate (Approve / showOnHome) a review (Admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { id, approved, showOnHome } = await request.json();

    if (id === undefined) {
      return NextResponse.json({ error: "Paramètre id manquant." }, { status: 400 });
    }

    const updateData: any = {};
    if (approved !== undefined) updateData.approved = !!approved;
    if (showOnHome !== undefined) updateData.showOnHome = !!showOnHome;

    let updatedReview;
    try {
      updatedReview = await withTimeout(prisma.review.update({
        where: { id: parseInt(id, 10) },
        data: updateData
      }));
      console.log(`[Admin Update] Avis ${id} modéré avec:`, updateData);
    } catch (dbErr: any) {
      console.warn("Failed to moderate review in DB, performing local cache update only...", dbErr.message);
      // Fallback simulated update on local json cache
      const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        const list = JSON.parse(fileData || "[]");
        const idx = list.findIndex((r: any) => r.id === parseInt(id, 10));
        if (idx !== -1) {
          if (approved !== undefined) list[idx].approved = !!approved;
          if (showOnHome !== undefined) list[idx].showOnHome = !!showOnHome;
          fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2), 'utf-8');
          updatedReview = list[idx];
        }
      }
    }

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la modération de l'avis." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a review permanently (Admin only)
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Identifiant id manquant." }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    try {
      await withTimeout(prisma.review.delete({
        where: { id }
      }));
      console.log(`[Admin Delete] Avis ${id} supprimé.`);
    } catch (dbErr: any) {
      console.warn("Failed to delete review in DB, performing local cache delete...", dbErr.message);
      // Fallback delete on local json cache
      const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        let list = JSON.parse(fileData || "[]");
        list = list.filter((r: any) => r.id !== id);
        fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2), 'utf-8');
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la suppression de l'avis." },
      { status: 500 }
    );
  }
}
