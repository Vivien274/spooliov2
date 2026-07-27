import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Helper to query with timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
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
      console.warn("Database query failed in admin GET reviews API, trying local reviews.json...", dbErr.message || dbErr);
      
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          reviews = JSON.parse(fileData || "[]");
        } catch (jsonErr: any) {
          console.error("Local reviews.json is corrupted, returning empty list:", jsonErr.message);
          reviews = [];
        }
      } else {
        console.warn("Local reviews.json does not exist, returning empty list.");
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

// POST: Moderate or Create a review (Admin only)
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

    const body = await request.json();
    const { action, id, approved, showOnHome, customerName, email, rating, comment, productId } = body;

    // Handle manual review creation
    if (action === "create") {
      if (!customerName || !rating || !comment) {
        return NextResponse.json(
          { error: "Champs obligatoires manquants (nom, note, commentaire)." },
          { status: 400 }
        );
      }

      const newReview = await withTimeout(prisma.review.create({
        data: {
          customerName,
          email: email || "contact@spoolio.fr",
          rating: parseInt(rating, 10),
          comment,
          approved: true, // Auto approve manual reviews
          showOnHome: !!showOnHome,
          productId: productId ? parseInt(productId, 10) : null
        },
        include: {
          product: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      }));

      // Flush local cache file if exists
      const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
      if (fs.existsSync(jsonPath)) {
        try {
          fs.unlinkSync(jsonPath);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, review: newReview });
    }

    // Handle existing review moderation
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
        data: updateData,
        include: {
          product: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      }));
      console.log(`[Admin Update] Avis ${id} modéré avec:`, updateData);
      
      // Flush cache
      const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
      if (fs.existsSync(jsonPath)) {
        try {
          fs.unlinkSync(jsonPath);
        } catch (e) {}
      }
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
      { error: e.message || "Erreur lors du traitement de l'avis." },
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
