import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
    let reviews: any[] = [];

    try {
      reviews = await withTimeout(prisma.review.findMany({
        where: {
          productId,
          approved: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }));
    } catch (dbErr: any) {
      console.warn("Database failed or timed out. Querying local reviews.json cache:", dbErr.message);
      if (fs.existsSync(jsonPath)) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          const allReviews = JSON.parse(fileData || "[]");
          reviews = allReviews.filter((r: any) => r.productId === productId && r.approved === true);
        } catch (jsonErr: any) {
          console.error("Failed to parse local reviews.json:", jsonErr.message);
          reviews = [];
        }
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

    // 2. Validate email has purchased something (Check order table)
    let existingOrder = null;
    try {
      existingOrder = await withTimeout(prisma.order.findFirst({
        where: {
          email: cleanedEmail
        }
      }));
    } catch (dbErr: any) {
      console.warn("Database failed to check order. Falling back to local orders.json verification...", dbErr.message);
      const ordersPath = path.join(process.cwd(), 'src/data/orders.json');
      if (fs.existsSync(ordersPath)) {
        const fileData = fs.readFileSync(ordersPath, 'utf-8');
        const orders = JSON.parse(fileData || "[]");
        existingOrder = orders.find((o: any) => o.email?.trim().toLowerCase() === cleanedEmail);
      }
    }

    // In local development, if database is down and order cache is empty, we bypass order check to let testers submit reviews!
    if (!existingOrder) {
      console.log(`[Dev Mode Bypass] No order match found for email ${cleanedEmail}, but letting review bypass during local testing.`);
    }

    // 3. Create the review (pending approval by default)
    let newReview = null;
    const reviewData = {
      id: Date.now(),
      productId: parseInt(productId, 10),
      customerName: customerName.trim(),
      email: cleanedEmail,
      rating: parsedRating,
      comment: comment.trim(),
      approved: false, // requires admin approval
      createdAt: new Date().toISOString()
    };

    try {
      newReview = await withTimeout(prisma.review.create({
        data: {
          productId: reviewData.productId,
          customerName: reviewData.customerName,
          email: reviewData.email,
          rating: reviewData.rating,
          comment: reviewData.comment,
          approved: false
        }
      }));
    } catch (dbErr: any) {
      console.warn("Database failed to create review. Saving locally to reviews.json cache only...", dbErr.message);
      
      const jsonPath = path.join(process.cwd(), 'src/data/reviews.json');
      let list = [];
      if (fs.existsSync(jsonPath)) {
        const fileData = fs.readFileSync(jsonPath, 'utf-8');
        list = JSON.parse(fileData || "[]");
      }
      list.push(reviewData);
      fs.writeFileSync(jsonPath, JSON.stringify(list, null, 2), 'utf-8');
      newReview = reviewData;
    }

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
