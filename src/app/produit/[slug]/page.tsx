import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProduitLegacyRedirectPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "medaillon-nfc-chien-chat" || slug === "medaillon-nfc-chien-et-chat") {
    redirect("/medaillon-nfc-chien-chat");
  }

  redirect(`/product/${slug}`);
}
