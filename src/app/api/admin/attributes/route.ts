import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attributes = (await Promise.race([
      prisma.attribute.findMany({
        orderBy: { name: "asc" }
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Attribute DB Timeout 2.5s")), 2500))
    ])) as any[];

    return NextResponse.json({ attributes: attributes || [] });
  } catch (err: any) {
    console.warn("GET Attributes Error / Timeout:", err.message);
    const fallbackAttributes = [
      {
        id: 1,
        name: "Couleur",
        values: JSON.stringify(["Arc en ciel","Argenté","Beige (cacahuète)","Bicolore Bleu clair – Rose","Bicolore Bleu-Vert","Bicolore Bleu-Violet","Bicolore Bleu-Violet Mat","Blanc","Bleu","Bleu canard","Bleu marine","Bleu turquoise","Bois (imitation chêne)","Feu","Gris","Gris Pailleté","Imitation Roche","Jaune","Jaune soleil","Marbre","Marron clair","Marron foncé","Marron moyen","Noir","Noir Pailleté","Orange","Orange pêche","Orange translucide","Phosphorescent","Rose pâle","Rose poudré","Rouge","Rouge Brique","Rouge feu (dégradé)","Transparent","Vert fluo / pomme","Vert foncé","Vert foncé Pailleté","Vert pâle","Violet"]),
        controlType: "color_swatch"
      }
    ];
    return NextResponse.json({ attributes: fallbackAttributes });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, values, controlType } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de l'attribut est obligatoire" }, { status: 400 });
    }

    const existing = await prisma.attribute.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return NextResponse.json({ error: "Un attribut avec ce nom existe déjà" }, { status: 400 });
    }

    const attribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        values: values ? values.trim() : "",
        controlType: controlType || "dropdown"
      }
    });

    return NextResponse.json({ attribute }, { status: 201 });
  } catch (err: any) {
    console.error("POST Attribute Error:", err);
    return NextResponse.json({ error: "Impossible de créer l'attribut" }, { status: 500 });
  }
}
