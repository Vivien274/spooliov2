import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    // Validate that file is an image or video
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image ou une vidéo." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageUrl = "";

    try {
      // Create unique filename
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `hero_upload_${Date.now()}.${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      // Ensure uploads directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    } catch (fsErr: any) {
      console.warn("Local disk write failed (Vercel serverless read-only environment). Fallback to Base64 Data URL:", fsErr.message);
      const mimeType = file.type || "image/webp";
      const base64 = buffer.toString("base64");
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne lors du téléversement." },
      { status: 500 }
    );
  }
}
