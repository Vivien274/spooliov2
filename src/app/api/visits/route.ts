import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    // Ignore admin pages and API routes
    if (url.startsWith("/admin") || url.startsWith("/api") || url.includes("_next")) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Get IP address safely from request headers
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    // Anonymize IP according to GDPR by hashing it with salt (daily changed)
    const todayStr = new Date().toISOString().split("T")[0];
    const ipHash = crypto
      .createHash("sha256")
      .update(`${ip}-${todayStr}`)
      .digest("hex")
      .slice(0, 16);

    // Create the visit record
    await prisma.visit.create({
      data: {
        url: url.trim(),
        ipHash,
        userAgent: userAgent.slice(0, 255)
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to register visit:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
