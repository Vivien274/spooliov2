import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Retrieve approved reviews for a specific product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get("productId");

    if (!productIdStr) {
      return NextResponse.json({ error: "Identifiant du produit manquant." }, { status: 400 });
    }

    const productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Identifiant du produit invalide." }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true
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

// POST: Submit a new client review (Requires matching order email)
export async function POST(request: Request) {
  try {
    const { productId, customerName, email, rating, comment } = await request.json();

    // 1. Validations
    if (!productId || !customerName || !email || !rating || !comment) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs requis." }, { status: 400 });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "La note doit être comprise entre 1 et 5." }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // 2. Validate email has purchased something in the shop (Check Order table)
    const existingOrder = await prisma.order.findFirst({
      where: {
        email: cleanedEmail
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Vous devez avoir passé commande avec cet e-mail pour pouvoir déposer un avis." },
        { status: 403 }
      );
    }

    // 3. Create the review (pending approval by default)
    const newReview = await prisma.review.create({
      data: {
        productId: parseInt(productId, 10),
        customerName: customerName.trim(),
        email: cleanedEmail,
        rating: parsedRating,
        comment: comment.trim(),
        approved: false // requires admin approval
      }
    });

    return NextResponse.json({
      success: true,
      message: "Votre avis a été soumis avec succès ! Il sera affiché après validation par notre équipe.",
      review: newReview
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la soumission de l'avis." },
      { status: 500 }
    );
  }
}
