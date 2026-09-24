import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
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

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    let finalFilename = `upload_${timestamp}`;
    let finalBuffer = buffer;
    let finalContentType = file.type;

    // Video conversion / optimization via ffmpeg
    if (isVideo) {
      const tempInputPath = path.join(uploadDir, `temp_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`);
      const optimizedMp4Path = path.join(uploadDir, `drop_video_${timestamp}.mp4`);

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

        // Clean up temp file
        if (fs.existsSync(tempInputPath)) {
          fs.unlinkSync(tempInputPath);
        }
      } catch (ffErr: any) {
        console.warn("FFmpeg conversion skipped/failed, using raw video:", ffErr.message);
        // Fallback to saving raw video
        const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
        finalFilename = `drop_video_${timestamp}.${ext}`;
        if (fs.existsSync(tempInputPath)) {
          fs.renameSync(tempInputPath, path.join(uploadDir, finalFilename));
        } else {
          fs.writeFileSync(path.join(uploadDir, finalFilename), buffer);
        }
      }
    } else {
      // Image: use .webp if provided, otherwise preserve or save as webp/original
      const ext = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")
        ? "webp"
        : file.name.split(".").pop()?.toLowerCase() || "jpg";
      finalFilename = `upload_${timestamp}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, finalFilename), finalBuffer);
    }

    // Optional Supabase Storage mirror
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error: uploadError } = await supabase.storage
          .from("spoolio-uploads")
          .upload(finalFilename, finalBuffer, {
            contentType: finalContentType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from("spoolio-uploads")
            .getPublicUrl(finalFilename);
          if (pubData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: pubData.publicUrl,
              filename: finalFilename,
              isOptimized: isVideo,
            });
          }
        }
      } catch (sbErr: any) {
        console.warn("Supabase upload notice:", sbErr.message);
      }
    }

    const fileUrl = `/uploads/${finalFilename}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: finalFilename,
      isOptimized: isVideo,
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne lors du téléversement." },
      { status: 500 }
    );
  }
}
