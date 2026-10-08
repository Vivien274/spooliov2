import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import os from "os";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
    const file = (formData.get("file") || formData.get("image") || formData.get("video")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name);
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif|heic)$/i.test(file.name);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Le fichier doit être une image ou une vidéo." },
        { status: 400 }
      );
    }

    // Max file size: 50MB for videos, 10MB for images
    const MAX_SIZE = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const maxMb = isVideo ? 50 : 10;
      return NextResponse.json(
        { error: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). La taille maximale autorisée est de ${maxMb} Mo.` },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    let finalFilename = `upload_${timestamp}`;
    let finalBuffer = buffer;
    let finalContentType = file.type;

    // Video conversion / optimization via ffmpeg
    if (isVideo) {
      // Serverless deployments expose a read-only application filesystem. Video
      // conversion must therefore happen in the platform's writable temp folder.
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "spoolio-upload-"));
      const tempInputPath = path.join(tempDir, `source_${timestamp}`);
      const optimizedMp4Path = path.join(tempDir, `drop_video_${timestamp}.mp4`);

      try {
        fs.writeFileSync(tempInputPath, buffer);

        // Convert to universal web streaming MP4 (H.264 / AAC, faststart, max 1080p)
        await execAsync(
          `ffmpeg -y -i "${tempInputPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 -vf "scale='min(1080,iw)':-2" -c:a aac -b:a 128k -movflags +faststart "${optimizedMp4Path}"`
        );

        if (fs.existsSync(optimizedMp4Path)) {
          finalFilename = `drop_video_${timestamp}.mp4`;
          finalBuffer = fs.readFileSync(optimizedMp4Path);
          finalContentType = "video/mp4";
        }
      } catch (ffErr: unknown) {
        const ffmpegError = ffErr instanceof Error ? ffErr.message : String(ffErr);
        console.warn("FFmpeg conversion skipped/failed, using raw video:", ffmpegError);
        // Fall back to uploading the original video buffer.
        const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
        finalFilename = `drop_video_${timestamp}.${ext}`;
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } else {
      // Images can be sent directly to object storage without touching disk.
      const ext = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")
        ? "webp"
        : file.name.split(".").pop()?.toLowerCase() || "jpg";
      finalFilename = `upload_${timestamp}.${ext}`;
    }

    // Supabase Storage is the persistent source of truth in production.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: uploadError } = await supabase.storage
        .from("spoolio-uploads")
        .upload(finalFilename, finalBuffer, {
          contentType: finalContentType || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Échec de l'envoi vers le stockage : ${uploadError.message}`);
      }

      const { data: pubData } = supabase.storage
        .from("spoolio-uploads")
        .getPublicUrl(finalFilename);

      return NextResponse.json({
        success: true,
        url: pubData.publicUrl,
        imageUrl: pubData.publicUrl,
        src: pubData.publicUrl,
        filename: finalFilename,
        isOptimized: isVideo && finalContentType === "video/mp4",
      });
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Le stockage des fichiers n'est pas configuré (variables Supabase manquantes)."
      );
    }

    // Local development fallback only. The deployed app filesystem is read-only.
    const uploadDir = path.join(process.cwd(), "public/uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, finalFilename), finalBuffer);

    const fileUrl = `/uploads/${finalFilename}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      imageUrl: fileUrl,
      src: fileUrl,
      filename: finalFilename,
      isOptimized: isVideo && finalContentType === "video/mp4",
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error
      ? err.message
      : "Erreur interne lors du téléversement.";
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
