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

    // 1. If Supabase is configured, prioritize uploading to Supabase Storage (reliable on Vercel Serverless)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("spoolio-uploads")
          .upload(filename, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from("spoolio-uploads")
            .getPublicUrl(filename);
          if (pubData?.publicUrl) {
            return NextResponse.json({ success: true, url: pubData.publicUrl, imageUrl: pubData.publicUrl });
          }
        } else {
          console.warn("Supabase Storage error:", uploadError.message);
        }
      } catch (sbErr: any) {
        console.warn("Supabase client upload failed:", sbErr.message);
      }
    }

    // 2. Fallback to local disk (works in local dev mode)
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `upload_${Date.now()}.${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      const imageUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: imageUrl, imageUrl });
    } catch (fsErr: any) {
      console.error("Local disk write failed:", fsErr.message);
      return NextResponse.json(
        { error: "Impossible de stocker l'image sur le serveur. Veuillez vérifier la configuration de stockage." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne lors du téléversement." },
      { status: 500 }
    );
  }
}
