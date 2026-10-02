"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../AdminThemeContext";

interface UniquePieceItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  status: string;
  stock: number;
  image: string;
  uniquePieceData?: any;
}

export default function AdminUniquePiecesPage() {
  const { cls } = useAdminTheme();
  const [items, setItems] = useState<UniquePieceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPieces() {
      try {
        const res = await fetch("/api/admin/pieces-uniques");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (e) {
        console.error("Failed to load unique pieces", e);
      } finally {
        setLoading(false);
      }
    }
    loadPieces();
  }, []);

  const filtered = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    it.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <span>✨</span>
            <span>Atelier d'Art & Pièces Uniques</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black ${cls.textMain} tracking-tight`}>
            Pièces Uniques (Fait Main)
          </h1>
          <p className={`text-xs sm:text-sm ${cls.textMuted} mt-1 max-w-2xl`}>
            Gérez vos créations artisanales et pièces d'atelier. Ces fiches bénéficient du gabarit immersif (hero photo/vidéo grand format, sections savoir-faire, lore et storytelling).
          </p>
        </div>

        <Link
          href="/admin/pieces-uniques/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#ff4f00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>+ Nouvelle Pièce Unique</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pièce unique par nom ou slug..."
            className={`w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} placeholder:${cls.textFaint} focus:outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] transition-colors`}
          />
        </div>
      </div>

      {/* Table / Cards List */}
      {loading ? (
        <div className={`py-20 text-center text-xs font-bold ${cls.textMuted} uppercase tracking-widest animate-pulse`}>
          Chargement des pièces d'atelier... 🎨
        </div>
      ) : filtered.length === 0 ? (
        <div className={`py-16 text-center ${cls.cardBg} border ${cls.border} rounded-2xl p-8`}>
          <span className="text-3xl block mb-2">🎨</span>
          <h3 className={`text-base font-bold ${cls.textMain} mb-1`}>Aucune pièce unique trouvée</h3>
          <p className={`text-xs ${cls.textMuted} mb-4`}>Créez votre première pièce d'artisanat peinte à la main.</p>
          <Link
            href="/admin/pieces-uniques/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4f00] text-white text-xs font-bold shadow-md shadow-[#ff4f00]/20"
          >
            Créer une pièce unique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isPublish = item.status === "publish" || item.status === "" || !item.status;
            return (
              <div
                key={item.id}
                className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xs hover:border-[#ff4f00]/50 hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-zinc-900 border border-zinc-200/50 dark:border-white/10">
                    <Image
                      src={item.image || "/images/produits/monstre-skateur-fait-main.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        isPublish
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {isPublish ? "Publié" : "Brouillon"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-white/20 text-white font-black text-xs backdrop-blur-md shadow-xs">
                      {parseFloat(item.price || "0").toFixed(2).replace(".", ",")} €
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <h3 className={`text-base font-black ${cls.textMain} group-hover:text-[#ff4f00] transition-colors line-clamp-1 mb-1`}>
                    {item.name}
                  </h3>
                  <div className={`text-[11px] ${cls.textMuted} font-mono mb-4 truncate`}>
                    /{item.slug}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 pt-4 border-t ${cls.divider}`}>
                  <Link
                    href={`/admin/pieces-uniques/${item.id}`}
                    className={`flex-1 py-2.5 px-4 rounded-xl ${cls.inputBg} hover:bg-[#ff4f00] ${cls.textMain} hover:text-white font-bold text-xs text-center border ${cls.border} hover:border-[#ff4f00] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs`}
                  >
                    <span>✏️ Modifier la fiche</span>
                  </Link>

                  <a
                    href={`/product/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2.5 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMuted} hover:${cls.textMain} transition-colors`}
                    title="Voir sur le site public"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
