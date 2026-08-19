import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Sparkles, Tag } from "lucide-react";
import Particles from "@/components/badges/Particles";

export const metadata: Metadata = {
  title: "Fiches SOS & Badges NFC | Spoolio",
  description: "Accédez à votre fiche d'urgence SOS pour animaux, enfants et festivaliers Spoolio.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SosRedirectPage({ searchParams }: Props) {
  const params = await searchParams;

  // Extract token from various legacy query parameters
  const rawToken = params.t || params.token || params.tag || params.id;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  if (token && token.trim()) {
    const cleanToken = token.trim();
    redirect(`/badges/${encodeURIComponent(cleanToken)}`);
  }

  return (
    <main className="min-h-screen bg-[#0e0e12] text-white px-4 py-12 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <Particles />

      <div className="w-full max-w-lg bg-[#16161c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2F3CD9] to-[#ff4f00] mx-auto flex items-center justify-center text-3xl shadow-lg border border-white/20">
          🏷️
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#ff4f00] bg-[#ff4f00]/10 px-3 py-1 rounded-full border border-[#ff4f00]/20 mb-2">
            <ShieldAlert className="w-3 h-3" /> Espace Sécurité SOS Spoolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-antonio uppercase tracking-tight text-white">
            Consulter ou Activer un Badge
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Approchez votre smartphone du médaillon NFC ou saisissez le code unique inscrit sur votre badge.
          </p>
        </div>

        {/* Manual code input form */}
        <form
          action={async (formData: FormData) => {
            "use server";
            const code = formData.get("token") as string;
            if (code && code.trim()) {
              redirect(`/badges/${encodeURIComponent(code.trim())}`);
            }
          }}
          className="space-y-3 pt-2"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="token"
              placeholder="Ex: DEMO123 ou votre identifiant"
              className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/20 rounded-2xl text-sm font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4f00] transition-colors uppercase tracking-wider"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#FF8800] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Accéder à la fiche SOS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Discovery & Links */}
        <div className="pt-4 border-t border-white/10 space-y-3 text-xs">
          <Link
            href="/medaillon-nfc-chien-chat"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🐾</span>
              <div>
                <div className="font-bold text-white text-xs">Découvrir les médaillons NFC animaux</div>
                <div className="text-[10px] text-gray-400">Sans pile, sans abonnement, étanche et garanti à vie</div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          </Link>

          <Link
            href="/"
            className="inline-block text-gray-400 hover:text-white transition-colors text-xs font-semibold"
          >
            ← Retour à l&apos;accueil Spoolio
          </Link>
        </div>
      </div>
    </main>
  );
}
