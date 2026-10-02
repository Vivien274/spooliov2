"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <span className="text-xs font-black uppercase tracking-widest text-[#ff4f00]">
              Atelier d'Art & Création
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Pièces Uniques (Fait Main)
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Gérez ici vos créations artisanales et pièces uniques peintes à la main. Ces produits bénéficient de la mise en page immersive (grand hero pleine largeur et cartes d'informations personnalisables).
          </p>
        </div>

        <Link
          href="/admin/pieces-uniques/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#ff4f00] hover:bg-[#ff6524] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ff4f00]/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>+ Nouvelle Pièce Unique</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pièce unique..."
            className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ff4f00] transition-colors"
          />
        </div>
      </div>

      {/* Table / Cards List */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
          Chargement des pièces d'atelier...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
          <span className="text-3xl block mb-2">🎨</span>
          <h3 className="text-base font-bold text-white mb-1">Aucune pièce unique trouvée</h3>
          <p className="text-xs text-zinc-400 mb-4">Créez votre première pièce d'artisanat peinte à la main.</p>
          <Link
            href="/admin/pieces-uniques/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4f00] text-white text-xs font-bold"
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
                className="bg-zinc-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl hover:border-[#ff4f00]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-black">
                    <Image
                      src={item.image || "/images/produits/monstre-skateur-fait-main.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                        isPublish
                          ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                          : "bg-amber-500/20 border border-amber-400/40 text-amber-300"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPublish ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                        {isPublish ? "Publié" : "Brouillon"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-white font-black text-xs backdrop-blur-md">
                      {parseFloat(item.price || "0").toFixed(2).replace(".", ",")} €
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <h3 className="text-base font-black text-white group-hover:text-[#ff4f00] transition-colors line-clamp-1 mb-1">
                    {item.name}
                  </h3>
                  <div className="text-[11px] text-zinc-500 font-mono mb-4 truncate">
                    /{item.slug}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Link
                    href={`/admin/pieces-uniques/${item.id}`}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-[#ff4f00] text-zinc-200 hover:text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Modifier la fiche</span>
                  </Link>

                  <a
                    href={`/product/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
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
