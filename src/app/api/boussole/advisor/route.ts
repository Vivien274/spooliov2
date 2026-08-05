import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { prompt, products: clientProducts } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Veuillez entrer une description de votre besoin." },
        { status: 400 }
      );
    }

    // 1. Get Product Catalog Context for Gemini
    let catalog = clientProducts || [];
    if (!catalog || catalog.length === 0) {
      try {
        const dbProducts = await prisma.product.findMany({
          where: { showInSensoryCompass: true },
          select: {
            name: true,
            slug: true,
            shortDescription: true,
            description: true,
            sensoryCategory: true,
            sensoryNoiseLevel: true,
            sensoryProfiles: true,
            price: true,
          },
        });
        catalog = dbProducts.map((p) => ({
          name: p.name,
          slug: p.slug,
          category: p.sensoryCategory || "fidget",
          description: (p.shortDescription || p.description || "").replace(/<[^>]*>/g, "").substring(0, 150),
          noiseLevel: p.sensoryNoiseLevel || "silent",
          profiles: p.sensoryProfiles || ["tdah", "focus"],
        }));
      } catch (e) {
        console.warn("DB fetch failed for Gemini advisor, falling back to JSON...");
      }

      if (!catalog || catalog.length === 0) {
        try {
          const jsonPath = path.join(process.cwd(), "src/data/products.json");
          if (fs.existsSync(jsonPath)) {
            const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            catalog = data.slice(0, 15).map((p: any) => ({
              name: p.name,
              slug: p.slug,
              category: p.category || "fidget",
              description: (p.short_description || p.description || "").replace(/<[^>]*>/g, "").substring(0, 150),
              noiseLevel: "silent",
              profiles: ["tdah", "focus"],
            }));
          }
        } catch (e) { }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "La clé API Gemini n'est pas configurée dans les variables d'environnement." },
        { status: 500 }
      );
    }

    // System prompt for Gemini
    const systemPrompt = `Tu es l'Expert Conseiller IA Sensoriel de Spoolio, la marque française spécialisée dans les fidgets sensoriels, créations 3D et objets apaisants pour la concentration et le TDAH / autisme.

Voici le catalogue des produits Spoolio disponibles :
${JSON.stringify(catalog, null, 2)}

Instructions :
1. Analyse le besoin exprimé par l'utilisateur : "${prompt}".
2. Sélectionne entre 1 et 3 produits du catalogue qui correspondent le mieux à sa recherche.
3. Rédige un conseil chaleureux, positif, bienveillant et synthétique (2 à 3 paragraphes max) en HTML clair (utilise des balises <p>, <strong>, <span> avec style si besoin) expliquant pourquoi ces produits vont l'aider au quotidien.
4. Réponds STRICTEMENT au format JSON valide avec la structure suivante (sans bloc de code Markdown autour) :
{
  "advice": "<p>Votre texte de conseil en HTML...</p>",
  "recommendedSlugs": ["slug-du-produit-1", "slug-du-produit-2"]
}`;

    // Call Gemini API
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    let responseData = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const json = await geminiRes.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            // Clean Markdown JSON wrapper if any
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            responseData = JSON.parse(cleaned);
            break;
          }
        } else {
          const errText = await geminiRes.text();
          lastError = `Model ${model} failed (${geminiRes.status}): ${errText}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!responseData) {
      console.warn("Gemini API call returned an error, activating local smart advisor fallback:", lastError);

      const lowerPrompt = prompt.toLowerCase();
      let matchedSlugs: string[] = [];
      let fallbackAdvice = "";

      if (lowerPrompt.includes("silencieux") || lowerPrompt.includes("bureau") || lowerPrompt.includes("cours") || lowerPrompt.includes("fac") || lowerPrompt.includes("discret")) {
        matchedSlugs = catalog.filter((p: any) => p.noiseLevel === "silent" || p.category === "manipuler" || p.category === "caresser").map((p: any) => p.slug || p.id);
        fallbackAdvice = "<p><strong>Conseil Spoolio :</strong> Pour une utilisation en cours ou au bureau sans déranger votre entourage, nous vous recommandons nos fidgets 100% silencieux à mouvement fluide et apaisant sous les doigts.</p>";
      } else if (lowerPrompt.includes("cliquer") || lowerPrompt.includes("énergie") || lowerPrompt.includes("pression") || lowerPrompt.includes("bruit")) {
        matchedSlugs = catalog.filter((p: any) => p.category === "cliquer" || p.noiseLevel === "high" || p.noiseLevel === "medium").map((p: any) => p.slug || p.id);
        fallbackAdvice = "<p><strong>Conseil Spoolio :</strong> Pour évacuer le surplus d'énergie tactile ou combler le besoin d'un clic mécanique franc, nos clickers et fidgets à pression sont idéaux !</p>";
      } else {
        matchedSlugs = catalog.slice(0, 3).map((p: any) => p.slug || p.id);
        fallbackAdvice = "<p><strong>Conseil Spoolio :</strong> Voici une sélection d'objets sensoriels équilibrés pour calmer le stress et favoriser la concentration.</p>";
      }

      if (matchedSlugs.length === 0 && catalog.length > 0) {
        matchedSlugs = catalog.slice(0, 3).map((p: any) => p.slug || p.id);
      }

      return NextResponse.json({
        success: true,
        advice: fallbackAdvice + "<p className='text-xs opacity-75 pt-2 font-normal'>💡 <em>(Conseiller autonome Spoolio) — Pour activer les réponses de l'IA Gemini 2.0 en temps réel, ajoutez une clé Google AI Studio gratuite (type AIzaSy...) dans votre .env.local.</em></p>",
        recommendedSlugs: matchedSlugs.slice(0, 3),
      });
    }

    return NextResponse.json({
      success: true,
      advice: responseData.advice || "<p>Voici nos meilleures recommandations pour vous.</p>",
      recommendedSlugs: responseData.recommendedSlugs || [],
    });
  } catch (err: any) {
    console.error("Error in boussole advisor route:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération des recommandations." },
      { status: 500 }
    );
  }
}
