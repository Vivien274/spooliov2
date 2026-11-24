import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { isPreprodEnv } from "@/lib/env";
import { renderProductDetailPage } from "@/app/product/[slug]/ProductPageServer";

export const dynamic = "force-dynamic";

export default async function AdminProductPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("spoolio_admin_session")?.value || "";
  const secret = process.env.JWT_SECRET || "spoolio-ultra-secure-key-928372651";
  const isAdmin = token ? await verifySession(token, secret) : false;

  if (!isAdmin && !isPreprodEnv()) {
    notFound();
  }

  const { slug } = await params;
  return renderProductDetailPage(slug, true);
}
