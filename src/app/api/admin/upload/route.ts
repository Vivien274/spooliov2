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
    
    const isDev = process.env.NODE_ENV !== "production";
    const isAuthenticated = token ? await verifySession(token, secret) : false;
    
    if (!isDev && !isAuthenticated) {
      return NextResponse.json(
        { error: "Accès refusé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    // Validate max file size (4.5 MB - serverless request limit)
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). L'importation directe en ligne est limitée à 4,5 Mo. Veuillez la compresser sous 4 Mo ou utiliser l'ajout par URL.` },
        { status: 413 }
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
      const filename = `blog_upload_${Date.now()}.${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      // Ensure uploads directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    } catch (fsErr: any) {
      console.warn("Local disk write failed. Fallback to Base64 Data URL:", fsErr.message);
      const mimeType = file.type || "image/webp";
      const base64 = buffer.toString("base64");
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ success: true, url: imageUrl, imageUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne lors du téléversement." },
      { status: 500 }
    );
  }
}
