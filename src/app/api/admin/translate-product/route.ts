import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("spoolio_admin_session")?.value;
    const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";

    if (!token || !(await verifySession(token, secret))) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { name, shortDescription, description, metaTitle, metaDescription } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Le nom du produit est requis pour traduire." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Clé d'API Gemini manquante pour la traduction auto." 
      }, { status: 500 });
    }

    const prompt = `You are a professional e-commerce translator for Spoolio (a brand selling 3D-printed sensory fidgets, desk accessories, keychains, and figurines made in France from plant-based PLA cornstarch plastic).
Translate the following French product details into natural, high-converting English. Keep the tone warm, engaging, enthusiast, and maker-oriented. Do not use generic AI buzzwords like "delve into", "the ideal companion", "boasts", etc.

French Input:
- Title: "${name}"
- Short Description: "${shortDescription || ""}"
- Full Description: "${description || ""}"
- SEO Title: "${metaTitle || ""}"
- Meta Description: "${metaDescription || ""}"

Return a valid JSON object with EXACTLY these key names:
- "nameEn": translated title in English
- "shortDescriptionEn": translated short description in English
- "descriptionEn": translated full description in English, preserving HTML structure (<p>, <strong>, etc.)
- "metaTitleEn": translated SEO title in English (under 60 chars)
- "metaDescriptionEn": translated SEO meta description in English (under 155 chars)

Return ONLY valid raw JSON, without markdown formatting or code blocks.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Erreur de communication avec l'API Gemini.");
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Aucun contenu n'a été généré par l'IA.");
    }

    let cleanResponse = responseText.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.substring(7);
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.substring(3);
    }
    if (cleanResponse.endsWith("```")) {
      cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
    }
    cleanResponse = cleanResponse.trim();

    const translated = JSON.parse(cleanResponse);

    return NextResponse.json({
      success: true,
      nameEn: translated.nameEn || "",
      shortDescriptionEn: translated.shortDescriptionEn || "",
      descriptionEn: translated.descriptionEn || "",
      metaTitleEn: translated.metaTitleEn || "",
      metaDescriptionEn: translated.metaDescriptionEn || ""
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la traduction avec l'IA." },
      { status: 500 }
    );
  }
}
