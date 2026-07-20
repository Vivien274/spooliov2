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

    const { name, shortDescription, category } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Le nom du produit est requis pour générer une description." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Clé d'API Gemini manquante. Veuillez ajouter GEMINI_API_KEY dans votre fichier .env.local et redémarrer le serveur." 
      }, { status: 500 });
    }

    // 2. Call Gemini API via fetch (Lightweight HTTP)
    const prompt = `Tu es l'assistant de rédaction marketing de Spoolio, un site e-commerce d'objets et fidgets funs imprimés en 3D à Comines.
Tu dois analyser le produit suivant :
Nom du produit : "${name}"
Description courte : "${shortDescription || ""}"
Catégorie : "${category || ""}"

Génère les données d'optimisation SEO sous forme de JSON avec les propriétés exactes suivantes :
- "description": Description longue et détaillée. Elle doit être attractive, faire environ 150-250 mots, être rédigée sur un ton cool, geek et enthousiaste, et formatée exclusivement avec des paragraphes HTML propres (balises <p>, et quelques <strong>). Rappelle positivement la fabrication en PLA Biosourcé (amidon de maïs) à Comines, et ajoute une note d'avertissement amicale sur la chaleur (>60°C). Pas de titre Markdown, retourne uniquement du HTML.
- "seoTitle": Un titre SEO accrocheur et optimisé pour le référencement, de moins de 60 caractères (ex: "Support Téléphone Industriel 3D | Spoolio").
- "seoMetaDesc": Une meta description vendeuse et incitant au clic de moins de 155 caractères, résumant les forces du produit.
- "seoScore": Un score SEO simulé sur 100 basé sur les bonnes pratiques e-commerce (de 0 à 100).
- "seoAdvice": Une liste de 3 conseils d'optimisation SEO rapides sous forme de tableau de chaînes de caractères (ex: ["Ajouter une photo de l'objet utilisé en situation", "Inclure le mot-clé principal au début de la description courte"]).

Retourne uniquement le code JSON valide, sans balise markdown ni bloc de code.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
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

    // Parse the generated JSON response
    const seoResult = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      description: seoResult.description || "",
      seoTitle: seoResult.seoTitle || "",
      seoMetaDesc: seoResult.seoMetaDesc || "",
      seoScore: seoResult.seoScore || 70,
      seoAdvice: seoResult.seoAdvice || []
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la génération avec l'IA." },
      { status: 500 }
    );
  }
}
