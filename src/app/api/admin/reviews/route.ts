import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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

    const reviews = await prisma.review.findMany({
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
    });

    return NextResponse.json({ success: true, reviews });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur de chargement des avis." },
      { status: 500 }
    );
  }
}

// POST: Moderate (Approve) a review (Admin only)
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

    const { id, approved } = await request.json();

    if (id === undefined || approved === undefined) {
      return NextResponse.json({ error: "Paramètres id ou approved manquants." }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id, 10) },
      data: { approved: !!approved }
    });

    console.log(`[Admin Update] Avis ${id} modéré avec approved = ${approved}`);

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
    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant id invalide." }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id }
    });

    console.log(`[Admin Delete] Avis ${id} supprimé définitivement.`);

    return NextResponse.json({ success: true, message: "Avis supprimé avec succès." });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la suppression de l'avis." },
      { status: 500 }
    );
  }
}
