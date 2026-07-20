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
Rédige une description longue, attractive et détaillée pour le produit suivant :
Nom du produit : "${name}"
Description courte : "${shortDescription || ""}"
Catégorie : "${category || ""}"

Instructions de rédaction :
- Ton : cool, moderne, geek, transparent et enthousiaste.
- Décris les détails de l'objet, son intérêt comme fidget anti-stress ou objet décoratif/pratique de bureau.
- Rappelle de façon positive la fabrication écoresponsable en PLA Biosourcé (à base d'amidon de maïs) à Comines.
- Ajoute une note d'avertissement amicale concernant l'entretien (éviter d'exposer l'objet à de fortes chaleurs >60°C, par exemple sur le tableau de bord d'une voiture en plein soleil).
- Formate ton texte exclusivement sous forme de paragraphes HTML propres (uniquement avec des balises <p>, et quelques <strong> pour mettre en valeur les points clés). N'utilise AUCUN en-tête Markdown (# ou ##) ni bloc de code, retourne directement le texte HTML.`;

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
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Erreur de communication avec l'API Gemini.");
    }

    const data = await res.json();
    const generatedHtml = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedHtml) {
      throw new Error("Aucun contenu n'a été généré par l'IA.");
    }

    // Clean any potential markdown wrappers like ```html or ```
    let cleanedHtml = generatedHtml
      .replace(/^```html\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    return NextResponse.json({ success: true, description: cleanedHtml });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur lors de la génération avec l'IA." },
      { status: 500 }
    );
  }
}
