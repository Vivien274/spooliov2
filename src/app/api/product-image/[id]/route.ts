import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { isPreprodEnv } from "@/lib/env";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const imageId = Number(id);
    if (!Number.isInteger(imageId) || imageId <= 0) {
      return new NextResponse("Invalid image id", { status: 400 });
    }

    const img = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: {
        src: true,
        product: {
          select: { status: true },
        },
      },
    });

    if (!img?.src) {
      return new NextResponse("Not found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const isPublished = img.product?.status === "publish";
    const isPreprod = isPreprodEnv();

    if (!isPublished && !isPreprod) {
      const cookieStore = await cookies();
      const token = cookieStore.get("spoolio_admin_session")?.value || "";
      const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
      const isAdmin = token ? await verifySession(token, secret) : false;

      if (!isAdmin) {
        return new NextResponse("Not found", {
          status: 404,
          headers: { "Cache-Control": "private, no-store" },
        });
      }
    }

    const cacheControl = isPublished
      ? "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
      : "private, no-store";

    if (img.src.startsWith("data:image/")) {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(img.src);
      if (!match) {
        return new NextResponse("Unsupported data URI", { status: 400 });
      }
      const [, mimeType, base64Data] = match;
      const buffer = Buffer.from(base64Data, "base64");
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": cacheControl,
        },
      });
    }

    const redirectTarget = img.src.startsWith("http://") || img.src.startsWith("https://")
      ? img.src
      : new URL(img.src, _req.url);

    return NextResponse.redirect(redirectTarget, {
      status: 307,
      headers: { "Cache-Control": cacheControl },
    });
  } catch (err) {
    console.error("GET /api/product-image/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
