import type { Metadata } from "next";
import UniquePieceEditorClient from "./UniquePieceEditorClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ADMIN - Éditeur Pièce Unique | Spoolio",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UniquePieceEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <UniquePieceEditorClient pieceId={id} isNew={id === "new"} />;
}
