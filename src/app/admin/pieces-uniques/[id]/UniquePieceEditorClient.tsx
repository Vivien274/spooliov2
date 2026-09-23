"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDefaultUniquePieceData, UniquePieceData } from "@/lib/uniquePieceDefaults";

interface UniquePieceEditorClientProps {
  pieceId: string;
  isNew?: boolean;
}

export default function UniquePieceEditorClient({
  pieceId,
  isNew = false,
}: UniquePieceEditorClientProps) {
  const router = useRouter();

  // Basic Product fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("59.00");
  const [status, setStatus] = useState("publish");
  const [stock, setStock] = useState(1);
  const [image, setImage] = useState("/images/produits/monstre-skateur-fait-main.jpg");

  // Rich Unique Piece layout data
  const [uniqueData, setUniqueData] = useState<UniquePieceData>(getDefaultUniquePieceData(""));

  // UI state
  const [activeTab, setActiveTab] = useState<"hero" | "gallery" | "savoirFaire" | "lore" | "specs" | "ecrin" | "faq">("hero");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load existing product
  useEffect(() => {
    if (isNew) {
      setName("Nouvelle Figurine Peinte à la Main");
      setSlug("nouvelle-figurine-peinte");
      setUniqueData(getDefaultUniquePieceData("Nouvelle Figurine"));
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const res = await fetch(`/api/admin/pieces-uniques?id=${pieceId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.product) {
            const p = json.product;
            setName(p.name || "");
            setSlug(p.slug || "");
            setPrice(p.price || "59.00");
            setStatus(p.status || "publish");
            setStock(typeof p.stock === "number" ? p.stock : 1);
            setImage(p.images?.[0]?.src || p.image || "/images/produits/monstre-skateur-fait-main.jpg");
            const baseDefaults = getDefaultUniquePieceData(p.name || "Pièce Unique");
            if (p.uniquePieceData) {
              setUniqueData({
                ...baseDefaults,
                ...p.uniquePieceData,
                gallery: p.uniquePieceData.gallery || baseDefaults.gallery,
              });
            } else {
              setUniqueData(baseDefaults);
            }
          }
        }
      } catch (err) {
        console.error("Error loading piece data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [pieceId, isNew]);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/pieces-uniques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isNew ? "new" : pieceId,
          name,
          slug,
          price,
          status,
          stock,
          image,
          uniquePieceData: uniqueData,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (json.product?.id && (isNew || pieceId === "999901")) {
          router.replace(`/admin/pieces-uniques/${json.product.id}`);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erreur lors de l'enregistrement");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">
        Chargement de la pièce d'atelier... 🎨
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans pb-28">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-30 bg-[#121214]/95 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pieces-uniques"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Retour à la liste"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#ff4f00]">
                Éditeur Pièce Unique
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                status === "publish" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {status === "publish" ? "Publié" : "Brouillon"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white truncate max-w-md">
              {name || "Nouvelle Pièce Unique"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {slug && (
            <a
              href={`/product/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Voir sur le site</span>
              <span>↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              saveSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-[#ff4f00] hover:bg-[#ff6524] text-white shadow-[#ff4f00]/30 hover:scale-105 active:scale-95"
            }`}
          >
            {saving ? (
              <span>Enregistrement...</span>
            ) : saveSuccess ? (
              <span>✓ Enregistré !</span>
            ) : (
              <span>Enregistrer la fiche</span>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-none">
        {[
          { id: "hero", label: "1. Hero & Identité", icon: "🖼️" },
          { id: "gallery", label: "2. Galerie Photos", icon: "📸" },
          { id: "savoirFaire", label: "3. Savoir-Faire Artisanal", icon: "🖐️" },
          { id: "lore", label: "4. Histoire & Lore", icon: "🛹" },
          { id: "specs", label: "5. Fiche Technique", icon: "📐" },
          { id: "ecrin", label: "6. Écrin & Protection", icon: "🎁" },
          { id: "faq", label: "7. FAQ Fait Main", icon: "💬" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === tab.id
                ? "bg-[#ff4f00] border-[#ff4f00] text-white shadow-lg shadow-[#ff4f00]/20 scale-105"
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* ONGLET 1 : HERO & IDENTITÉ                                   */}
      {/* ============================================================ */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
                Informations Principales
              </h3>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Nom de la création (Titre du Hero)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-[#ff4f00] focus:outline-none"
                  placeholder="Gribouille le Skateur – Figurine Peinte à la Main"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Slug d'accès URL (/product/[slug])
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-[#ff4f00] focus:outline-none"
                    placeholder="monstre-skateur-fait-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Prix de vente (€)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-black focus:border-[#ff4f00] focus:outline-none"
                    placeholder="59.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Statut de publication
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-[#ff4f00] focus:outline-none"
                  >
                    <option value="publish">Publié (En ligne)</option>
                    <option value="draft">Brouillon (Invisible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Stock d'exemplaires
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
                Surimpressions du Hero
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Badge de Catégorie
                  </label>
                  <input
                    type="text"
                    value={uniqueData.hero.badge}
                    onChange={(e) =>
                      setUniqueData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, badge: e.target.value },
                      }))
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">
                    Badge de Disponibilité
                  </label>
                  <input
                    type="text"
                    value={uniqueData.hero.availabilityBadge}
                    onChange={(e) =>
                      setUniqueData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, availabilityBadge: e.target.value },
                      }))
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Accroche sous le titre
                </label>
                <textarea
                  rows={2}
                  value={uniqueData.hero.punchline}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, punchline: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#ff4f00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Micro-Pastilles de réassurance (Hero bar)
                </label>
                <div className="space-y-3">
                  {uniqueData.hero.microPerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={perk.icon}
                        onChange={(e) => {
                          const next = [...uniqueData.hero.microPerks];
                          next[i].icon = e.target.value;
                          setUniqueData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, microPerks: next },
                          }));
                        }}
                        className="w-12 bg-black/50 border border-white/10 rounded-xl text-center py-2 text-sm text-white"
                        placeholder="🎨"
                      />
                      <input
                        type="text"
                        value={perk.text}
                        onChange={(e) => {
                          const next = [...uniqueData.hero.microPerks];
                          next[i].text = e.target.value;
                          setUniqueData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, microPerks: next },
                          }));
                        }}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Preview */}
          <div className="space-y-6">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Photo Pleine Largeur
              </h3>

              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10">
                <Image
                  src={image || "/images/produits/monstre-skateur-fait-main.jpg"}
                  alt="Aperçu image hero"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Chemin / URL de l'image
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-[#ff4f00] focus:outline-none"
                  placeholder="/images/produits/monstre-skateur-fait-main.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 2 : GALERIE PHOTOS                                    */}
      {/* ============================================================ */}
      {activeTab === "gallery" && (
        <div className="space-y-6 max-w-5xl">
          {/* Card Header Settings */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Configuration de la Carte Galerie
              </h3>
              <span className="text-xs text-zinc-400">
                Affichée sous le bloc « Commande d'Atelier » sur la fiche publique
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={uniqueData.gallery?.badge || "📸 Galerie Photos"}
                  onChange={(e) => setUniqueData(prev => ({
                    ...prev,
                    gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), badge: e.target.value }
                  }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Titre de la carte</label>
                <input
                  type="text"
                  value={uniqueData.gallery?.title || "Vues Détaillées"}
                  onChange={(e) => setUniqueData(prev => ({
                    ...prev,
                    gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), title: e.target.value }
                  }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Description / Accroche</label>
              <textarea
                rows={2}
                value={uniqueData.gallery?.description || ""}
                onChange={(e) => setUniqueData(prev => ({
                  ...prev,
                  gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), description: e.target.value }
                }))}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
                placeholder="Explorez les finitions, les coups de pinceau et la patine sous tous les angles."
              />
            </div>
          </div>

          {/* Photos Management */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Photos de la Galerie ({(uniqueData.gallery?.items || []).length})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chaque photo dispose d'une miniature, d'une légende affichée sur la fiche publique et d'un zoom plein écran.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUniqueData(prev => {
                      const curGallery = prev.gallery || getDefaultUniquePieceData(name).gallery;
                      return {
                        ...prev,
                        gallery: {
                          ...curGallery,
                          items: [
                            ...curGallery.items,
                            {
                              src: image || "/images/produits/monstre-skateur-fait-main.jpg",
                              caption: "Vue détaillée de l'atelier",
                              alt: name,
                            }
                          ]
                        }
                      };
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#ff6524] text-white text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Ajouter une photo</span>
                </button>
              </div>
            </div>

            {/* List of Photo Cards */}
            <div className="space-y-4">
              {(uniqueData.gallery?.items || []).map((photo, pIdx) => (
                <div
                  key={`gallery-item-${pIdx}`}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center"
                >
                  {/* Thumbnail Preview */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black border border-white/15 shrink-0">
                    <Image
                      src={photo.src || "/images/produits/monstre-skateur-fait-main.jpg"}
                      alt={photo.alt || `Photo ${pIdx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                      #{pIdx + 1}
                    </span>
                  </div>

                  {/* Form Inputs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Chemin / URL de la photo
                      </label>
                      <input
                        type="text"
                        value={photo.src}
                        onChange={(e) => {
                          const items = [...(uniqueData.gallery?.items || [])];
                          items[pIdx] = { ...items[pIdx], src: e.target.value };
                          setUniqueData(prev => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                          }));
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        placeholder="/images/produits/monstre-skateur-fait-main.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Légende (affichée en pastille sous la photo)
                      </label>
                      <input
                        type="text"
                        value={photo.caption || ""}
                        onChange={(e) => {
                          const items = [...(uniqueData.gallery?.items || [])];
                          items[pIdx] = { ...items[pIdx], caption: e.target.value };
                          setUniqueData(prev => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                          }));
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="Gros plan sur le sweat bordeaux"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Texte alternatif (SEO / a11y)
                      </label>
                      <input
                        type="text"
                        value={photo.alt || ""}
                        onChange={(e) => {
                          const items = [...(uniqueData.gallery?.items || [])];
                          items[pIdx] = { ...items[pIdx], alt: e.target.value };
                          setUniqueData(prev => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                          }));
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="Vue de profil de la figurine"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center">
                    {pIdx > 0 && (
                      <button
                        type="button"
                        title="Monter"
                        onClick={() => {
                          const items = [...(uniqueData.gallery?.items || [])];
                          const tmp = items[pIdx - 1];
                          items[pIdx - 1] = items[pIdx];
                          items[pIdx] = tmp;
                          setUniqueData(prev => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                          }));
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        ↑
                      </button>
                    )}
                    {pIdx < (uniqueData.gallery?.items || []).length - 1 && (
                      <button
                        type="button"
                        title="Descendre"
                        onClick={() => {
                          const items = [...(uniqueData.gallery?.items || [])];
                          const tmp = items[pIdx + 1];
                          items[pIdx + 1] = items[pIdx];
                          items[pIdx] = tmp;
                          setUniqueData(prev => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                          }));
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      title="Supprimer cette photo"
                      onClick={() => {
                        const items = (uniqueData.gallery?.items || []).filter((_, i) => i !== pIdx);
                        setUniqueData(prev => ({
                          ...prev,
                          gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items }
                        }));
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {(!uniqueData.gallery?.items || uniqueData.gallery.items.length === 0) && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Aucune photo dans la galerie pour l'instant. Cliquez sur « + Ajouter une photo » ci-dessus.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3 : LE SAVOIR-FAIRE ARTISANAL                         */}
      {/* ============================================================ */}
      {activeTab === "savoirFaire" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Carte Savoir-Faire (En-tête)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={uniqueData.savoirFaire.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      savoirFaire: { ...prev.savoirFaire, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.savoirFaire.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      savoirFaire: { ...prev.savoirFaire, title: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Introduction</label>
              <textarea
                rows={2}
                value={uniqueData.savoirFaire.intro}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    savoirFaire: { ...prev.savoirFaire, intro: e.target.value },
                  }))
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Les 4 Étapes de Fabrication
            </h3>

            <div className="space-y-4">
              {uniqueData.savoirFaire.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const next = [...uniqueData.savoirFaire.steps];
                        next[idx].title = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          savoirFaire: { ...prev.savoirFaire, steps: next },
                        }));
                      }}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const next = [...uniqueData.savoirFaire.steps];
                      next[idx].description = e.target.value;
                      setUniqueData((prev) => ({
                        ...prev,
                        savoirFaire: { ...prev.savoirFaire, steps: next },
                      }));
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Citation / Mot de l'artisan en bas de carte
              </label>
              <input
                type="text"
                value={uniqueData.savoirFaire.quote}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    savoirFaire: { ...prev.savoirFaire, quote: e.target.value },
                  }))
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-amber-300 italic"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3 : HISTOIRE & LORE DU PERSONNAGE                     */}
      {/* ============================================================ */}
      {activeTab === "lore" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Histoire de la Création
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={uniqueData.lore.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Nom du personnage / de l'œuvre
                </label>
                <input
                  type="text"
                  value={uniqueData.lore.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, title: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-400">
                  Paragraphes du récit
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, paragraphs: [...prev.lore.paragraphs, ""] },
                    }))
                  }
                  className="text-xs text-[#ff4f00] font-bold hover:underline"
                >
                  + Ajouter un paragraphe
                </button>
              </div>

              <div className="space-y-3">
                {uniqueData.lore.paragraphs.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const next = [...uniqueData.lore.paragraphs];
                        next[idx] = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          lore: { ...prev.lore, paragraphs: next },
                        }));
                      }}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-300"
                    />
                    {uniqueData.lore.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = uniqueData.lore.paragraphs.filter((_, i) => i !== idx);
                          setUniqueData((prev) => ({
                            ...prev,
                            lore: { ...prev.lore, paragraphs: next },
                          }));
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 text-sm"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 4 : FICHE TECHNIQUE                                   */}
      {/* ============================================================ */}
      {activeTab === "specs" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Fiche Technique d'Atelier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={uniqueData.specs.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: { ...prev.specs, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.specs.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: { ...prev.specs, title: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-zinc-400">
                  Caractéristiques Clé / Valeur
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: {
                        ...prev.specs,
                        items: [...prev.specs.items, { label: "Nouvelle spec", value: "Valeur" }],
                      },
                    }))
                  }
                  className="text-xs text-[#ff4f00] font-bold hover:underline"
                >
                  + Ajouter une caractéristique
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueData.specs.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-2 relative group">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...uniqueData.specs.items];
                        next[idx].label = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-[11px] font-bold text-zinc-400 uppercase focus:outline-none focus:border-[#ff4f00]"
                      placeholder="Libellé"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const next = [...uniqueData.specs.items];
                        next[idx].value = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="w-full bg-transparent text-sm font-black text-white focus:outline-none"
                      placeholder="Valeur"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = uniqueData.specs.items.filter((_, i) => i !== idx);
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 5 : ÉCRIN & EXPÉDITION                                */}
      {/* ============================================================ */}
      {activeTab === "ecrin" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Écrin & Protection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                <input
                  type="text"
                  value={uniqueData.ecrin.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.ecrin.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, title: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Description</label>
              <textarea
                rows={2}
                value={uniqueData.ecrin.intro}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    ecrin: { ...prev.ecrin, intro: e.target.value },
                  }))
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">
                Les 4 Points du Packaging
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueData.ecrin.points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 p-2.5 rounded-xl">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const next = [...uniqueData.ecrin.points];
                        next[idx] = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          ecrin: { ...prev.ecrin, points: next },
                        }));
                      }}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Méthode d'Expédition
                </label>
                <input
                  type="text"
                  value={uniqueData.ecrin.shippingMethod}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, shippingMethod: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Origine d'Atelier
                </label>
                <input
                  type="text"
                  value={uniqueData.ecrin.origin}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, origin: e.target.value },
                    }))
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 6 : QUESTIONS FRÉQUENTES FAIT MAIN                    */}
      {/* ============================================================ */}
      {activeTab === "faq" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Foire Aux Questions Spécifique Fait Main
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Répondez précisément aux questions sur la fragilité, l'entretien et l'exclusivité.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUniqueData((prev) => ({
                    ...prev,
                    faq: {
                      ...prev.faq,
                      items: [...prev.faq.items, { q: "Nouvelle question ?", a: "Réponse..." }],
                    },
                  }))
                }
                className="px-3.5 py-2 rounded-xl bg-[#ff4f00] text-white text-xs font-bold hover:bg-[#ff6524] transition-all cursor-pointer"
              >
                + Ajouter une question
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {uniqueData.faq.items.map((item, idx) => (
                <div key={idx} className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2.5 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => {
                        const next = [...uniqueData.faq.items];
                        next[idx].q = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          faq: { ...prev.faq, items: next },
                        }));
                      }}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-[#ff4f00] focus:outline-none"
                      placeholder="Question..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = uniqueData.faq.items.filter((_, i) => i !== idx);
                        setUniqueData((prev) => ({
                          ...prev,
                          faq: { ...prev.faq, items: next },
                        }));
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 text-xs"
                      title="Supprimer la question"
                    >
                      ✕
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={(e) => {
                      const next = [...uniqueData.faq.items];
                      next[idx].a = e.target.value;
                      setUniqueData((prev) => ({
                        ...prev,
                        faq: { ...prev.faq, items: next },
                      }));
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-[#ff4f00] focus:outline-none"
                    placeholder="Réponse détaillée..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
