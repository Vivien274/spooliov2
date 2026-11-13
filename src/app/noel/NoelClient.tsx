"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pack } from "@/types/packs";
import { Product } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { event as trackEvent } from "@/lib/gtag";
import {
  Sparkles,
  ArrowRight,
  Package,
  Check,
  Truck,
  RotateCcw,
  Clock,
  MapPin,
  Gift,
  Printer,
  ChevronRight,
  Compass,
  Users,
  Zap,
} from "lucide-react";

interface NoelClientProps {
  packs: Pack[];
  productsUnder10: Product[];
  products10To20: Product[];
  productsAbove20: Product[];
}

export default function NoelClient({
  packs,
  productsUnder10,
  products10To20,
  productsAbove20,
}: NoelClientProps) {
  const { addToCart } = useCart();
  const [activeBudget, setActiveBudget] = useState<"under10" | "10to20" | "above20">("under10");
  const [addedPackId, setAddedPackId] = useState<string | null>(null);

  // Track initial page view event on mount
  useEffect(() => {
    trackEvent({
      action: "view_campaign",
      category: "ecommerce",
      label: "noel_2026",
    });
  }, []);

  const handleAddPackToCart = (pack: Pack) => {
    addToCart(
      {
        productId: -2000 - pack.displayOrder,
        name: `PACK — ${pack.name}`,
        slug: pack.slug,
        price: pack.price.toString(),
        selectedOptions: {},
        image: pack.image,
        isPack: true,
        packId: pack.id,
        packComponents: pack.items.map((it) => ({
          productId: it.productId,
          name: it.productName || `Produit #${it.productId}`,
          quantity: it.quantity,
          variant: it.variant,
          image: it.productImage,
          slug: it.productSlug,
        })),
      },
      1,
      true
    );

    // Track analytics add_to_cart for pack
    trackEvent({
      action: "add_to_cart",
      category: "ecommerce",
      label: pack.slug,
      value: pack.price,
    });

    setAddedPackId(pack.id);
    setTimeout(() => {
      setAddedPackId(null);
    }, 2200);
  };

  const scrollToCoffrets = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("coffrets");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const snowFlakes = [
    { left: "6%", size: 4, duration: "7.5s", delay: "0s", opacity: 0.55 },
    { left: "14%", size: 6, duration: "9.2s", delay: "-2.1s", opacity: 0.45 },
    { left: "23%", size: 3, duration: "6.8s", delay: "-4.3s", opacity: 0.6 },
    { left: "31%", size: 5, duration: "8.4s", delay: "-1.2s", opacity: 0.5 },
    { left: "40%", size: 4, duration: "10.1s", delay: "-5.5s", opacity: 0.4 },
    { left: "49%", size: 6, duration: "7.9s", delay: "-3.0s", opacity: 0.55 },
    { left: "58%", size: 3, duration: "6.4s", delay: "-0.8s", opacity: 0.65 },
    { left: "66%", size: 5, duration: "9.5s", delay: "-4.7s", opacity: 0.45 },
    { left: "74%", size: 4, duration: "8.1s", delay: "-2.6s", opacity: 0.55 },
    { left: "82%", size: 6, duration: "10.4s", delay: "-6.1s", opacity: 0.4 },
    { left: "90%", size: 3, duration: "7.2s", delay: "-1.9s", opacity: 0.6 },
    { left: "95%", size: 5, duration: "8.8s", delay: "-3.8s", opacity: 0.5 },
  ];

  return (
    <div className="space-y-16 sm:space-y-28 pb-20">
      {/* ========================================================= */}
      {/* SECTION 1 — HERO NOËL                                     */}
      {/* ========================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 max-w-7xl mx-auto">
        <style>{`
          @keyframes noelSnowfall {
            0% {
              transform: translate3d(0, -16px, 0);
            }
            50% {
              transform: translate3d(10px, 50%, 0);
            }
            100% {
              transform: translate3d(-6px, 460px, 0);
            }
          }
          .noel-flake {
            animation-name: noelSnowfall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .noel-flake {
              animation: none;
              display: none;
            }
          }
        `}</style>

        <div className="relative rounded-3xl bg-gradient-to-br from-[#7A131B] via-[#5E0E14] to-[#42080D] border border-[#8E1B24] p-6 sm:p-10 lg:p-14 overflow-hidden shadow-lg text-white">
          {/* Subtle warm festive glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5500]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mb-24" />

          {/* Snowflakes strictly scoped to Hero background */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {snowFlakes.map((flake, idx) => (
              <span
                key={idx}
                className="noel-flake absolute -top-3 rounded-full bg-white"
                style={{
                  left: flake.left,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  opacity: flake.opacity,
                  animationDuration: flake.duration,
                  animationDelay: flake.delay,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Indexation Spoolio */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-black uppercase tracking-widest text-white bg-white/15 border border-white/25 px-3 py-1 rounded-full backdrop-blur-xs">
                  SPOOLIO // XMAS 2026
                </span>
                <span className="text-white/40 font-mono">/</span>
                <span className="text-xs font-mono text-white/80 uppercase tracking-wider">
                  ÉDITION ATELIER COMINES
                </span>
              </div>

              {/* Titre Principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] leading-[0.95]">
                NOËL, MAIS PAS COMME LES AUTRES.
              </h1>

              {/* Sous-titre */}
              <p className="text-base sm:text-lg text-white/85 font-sans leading-relaxed max-w-2xl">
                Des coffrets originaux, des curiosités tactiles et des idées Secret Santa imprimés en 3D dans notre atelier à Comines.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a
                  href="#coffrets"
                  onClick={scrollToCoffrets}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-[#FF5500] hover:bg-[#e04b00] shadow-md transition-all cursor-pointer group"
                >
                  <span>Découvrir les coffrets</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/trouveur-de-cadeau"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/12 hover:bg-white/20 border border-white/25 backdrop-blur-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-white !text-white keep-white" style={{ color: "#ffffff" }} />
                  <span>Trouver une idée cadeau</span>
                </Link>
              </div>
            </div>

            {/* Colonne droite : Repères de campagne */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-black/20 border border-white/15 backdrop-blur-md p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-orange-200">
                    SÉLECTION FESTIVE 2026
                  </span>
                  <span className="font-mono text-[11px] text-white/75">
                    DÈS 12 €
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white !text-white keep-white">
                      <Gift className="w-4 h-4 text-white !text-white keep-white" style={{ color: "#ffffff" }} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide font-[family-name:var(--font-antonio)] text-white">
                        3 Coffrets Exclusifs
                      </p>
                      <p className="text-xs text-white/75 font-sans">
                        Compositions prêtes à offrir à tarif avantageux jusqu&apos;à épuisement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white !text-white keep-white">
                      <Users className="w-4 h-4 text-white !text-white keep-white" style={{ color: "#ffffff" }} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide font-[family-name:var(--font-antonio)] text-white">
                        Idéal Secret Santa
                      </p>
                      <p className="text-xs text-white/75 font-sans">
                        Des pépites entre 5 € et 15 € pour surprendre collègues et proches.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white !text-white keep-white">
                      <Clock className="w-4 h-4 text-white !text-white keep-white" style={{ color: "#ffffff" }} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide font-[family-name:var(--font-antonio)] text-white">
                        Expédition 24–48h
                      </p>
                      <p className="text-xs text-white/75 font-sans">
                        Imprimé, vérifié et préparé à la main dans notre atelier à Comines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 — LES TROIS COFFRETS EXCLUSIFS                  */}
      {/* ========================================================= */}
      <section id="coffrets" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4E4E0] pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              01 // SÉLECTION EXCLUSIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mt-1">
              Les trois coffrets de Noël
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans mt-1">
              Des ensembles conçus pour faire mouche, à prix tout doux. Composition transparente, sans compromis sur la qualité d&apos;atelier.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider shrink-0">
            3 coffrets disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {packs.map((pack, packIndex) => {
            const isAdded = addedPackId === pack.id;

            return (
              <article
                key={pack.id}
                className="flex flex-col justify-between bg-white rounded-3xl border border-[#E4E4E0] hover:border-zinc-300 transition-all duration-300 shadow-2xs hover:shadow-md overflow-hidden group"
              >
                {/* PHOTO ET BADGES */}
                <div>
                  <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                    {pack.image ? (
                      <Image
                        src={pack.image}
                        alt={pack.name}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}

                    {/* Operational Tag */}
                    <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-xs text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      PACK 0{packIndex + 1}
                    </div>

                    {/* Real Savings Badge */}
                    {pack.savingsAmount && pack.savingsAmount > 0 && (
                      <div className="absolute top-3 right-3 bg-[#FF5500] text-white font-mono text-xs font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>ÉCONOMIE {pack.savingsAmount.toFixed(0)} €</span>
                      </div>
                    )}
                  </div>

                  {/* CORPS DE LA CARTE */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] group-hover:text-[#FF5500] transition-colors">
                        <Link href={`/product/${pack.slug}`}>
                          {pack.name}
                        </Link>
                      </h3>
                      {pack.tagline && (
                        <p className="text-xs sm:text-sm text-zinc-600 italic font-sans mt-1">
                          « {pack.tagline} »
                        </p>
                      )}
                    </div>

                    {/* PRIX ET VALEUR */}
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl font-black font-mono text-zinc-950">
                        {pack.price.toFixed(0)} €
                      </span>
                      {pack.totalComponentsValue && pack.totalComponentsValue > pack.price && (
                        <span className="text-xs font-mono text-zinc-400 line-through">
                          Valeur : {pack.totalComponentsValue.toFixed(0)} €
                        </span>
                      )}
                    </div>

                    {/* CONTENU DU COFFRET (SANS MYSTÈRE) */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                        <span>Contenu du coffret :</span>
                        <span>{pack.items.length} objets</span>
                      </div>

                      <div className="space-y-2 divide-y divide-zinc-200/60">
                        {pack.items.map((it, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2.5 ${idx > 0 ? "pt-2" : ""}`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-zinc-200 overflow-hidden relative shrink-0 border border-zinc-200">
                              {it.productImage && (
                                <Image
                                  src={it.productImage}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              {it.productSlug ? (
                                <Link
                                  href={`/product/${it.productSlug}`}
                                  target="_blank"
                                  className="text-xs font-bold text-zinc-900 hover:text-[#FF5500] hover:underline truncate block"
                                  title={it.productName}
                                >
                                  {it.productName}
                                </Link>
                              ) : (
                                <span className="text-xs font-bold text-zinc-900 truncate block">
                                  {it.productName}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-zinc-500">
                                Quantité : {it.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PIED DE CARTE & ACTION */}
                <div className="p-6 pt-0 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleAddPackToCart(pack)}
                    disabled={!pack.isAvailable}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : pack.isAvailable
                        ? "bg-[#FF5500] hover:bg-[#e04b00] text-white active:scale-98"
                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Coffret ajouté au panier !</span>
                      </>
                    ) : pack.isAvailable ? (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Ajouter le coffret • {pack.price.toFixed(0)} €</span>
                      </>
                    ) : (
                      <span>Rupture temporaire</span>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href={`/product/${pack.slug}`}
                      className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 group"
                    >
                      <span>Voir la fiche détaillée du pack</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 — TROUVER UN CADEAU PAR BUDGET                  */}
      {/* ========================================================= */}
      <section id="idees" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4E4E0] pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              02 // PARCOURS BUDGET
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mt-1">
              Trouver un cadeau par budget
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans mt-1">
              Des objets tangibles pour Secret Santa, petites attentions ou grandes surprises.
            </p>
          </div>

          {/* Budget Switcher */}
          <div className="inline-flex bg-zinc-200/80 p-1 rounded-2xl text-xs font-bold font-mono self-start sm:self-auto">
            <button
              onClick={() => setActiveBudget("under10")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeBudget === "under10"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              &lt; 10 €
            </button>
            <button
              onClick={() => setActiveBudget("10to20")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeBudget === "10to20"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              10 € à 20 €
            </button>
            <button
              onClick={() => setActiveBudget("above20")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeBudget === "above20"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              &gt; 20 €
            </button>
          </div>
        </div>

        {/* PRODUCTS GRID BY BUDGET */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {(activeBudget === "under10"
            ? productsUnder10
            : activeBudget === "10to20"
            ? products10To20
            : productsAbove20
          ).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
          >
            <span>Voir tout le catalogue ({activeBudget === "under10" ? "< 10€" : activeBudget === "10to20" ? "10-20€" : "> 20€"})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 — SPÉCIAL SECRET SANTA                          */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-[#E4E4E0] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-xs space-y-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E4E4E0] pb-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
                <Users className="w-3.5 h-3.5" />
                03 // SPÉCIAL SECRET SANTA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] leading-[1.05]">
                Un tirage au sort ? Visez juste entre 5 € et 15 €.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
                Collègue, ami ou cousin tiré au sort : oubliez le mug générique. Nos curiosités tactiles et coffrets de bureau font mouche dès le déballage, même avec un petit budget.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveBudget("under10");
                document.getElementById("idees")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-[#FF5500] hover:bg-[#e04b00] shadow-sm transition-all cursor-pointer shrink-0 font-[family-name:var(--font-antonio)]"
            >
              <span>Voir la sélection &lt; 10 €</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                setActiveBudget("under10");
                document.getElementById("idees")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-left p-5 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] hover:border-[#FF5500]/50 transition-all group cursor-pointer space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#FF5500]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] group-hover:text-[#FF5500] transition-colors">
                Valeurs sûres à moins de 10 €
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Clickers mécaniques, porte-clés clavier et mini-curiosités qui plaisent à coup sûr.
              </p>
            </button>

            <Link
              href={packs[0] ? `/product/${packs[0].slug}` : "#coffrets"}
              className="text-left p-5 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] hover:border-[#FF5500]/50 transition-all group space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#FF5500]">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] group-hover:text-[#FF5500] transition-colors">
                Le Kit Anti-Réunion (12 €)
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Le cadeau de bureau parfait pour un Secret Santa entre collègues, prêt à offrir.
              </p>
            </Link>

            <Link
              href="/blind-bags"
              className="text-left p-5 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] hover:border-[#005CFF]/50 transition-all group space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#005CFF]">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] group-hover:text-[#005CFF] transition-colors">
                Blind Bag Surprise
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Un assortiment mystère préparé à l&apos;atelier pour garder la surprise jusqu&apos;à l&apos;ouverture.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — PAS D'IDÉE ? LE TROUVEUR DE CADEAU           */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-[#E4E4E0] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              04 // GUIDE INTERACTIF
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] leading-[1.05]">
              Pas d&apos;idée précise ? On vous aide en 3 clics.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
              Pour qui est ce cadeau ? Quel est son profil (collègue stressé, amateur de pop culture, passionné de mécanique tactile) ?
              Notre Trouveur de Cadeau interactif filtre le catalogue pour vous dénicher l&apos;objet idéal.
            </p>
            <div className="pt-2">
              <Link
                href="/trouveur-de-cadeau"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-[#005CFF] hover:bg-[#004cd1] shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lancer le Trouveur de Cadeau</span>
              </Link>
            </div>
          </div>

          <Link
            href="/trouveur-de-cadeau"
            className="w-full md:w-80 aspect-square rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] hover:border-[#005CFF]/40 transition-all p-6 flex flex-col items-center justify-center text-center space-y-3.5 relative overflow-hidden shrink-0 group shadow-2xs hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#005CFF]/10 border border-[#005CFF]/20 flex items-center justify-center text-[#005CFF] group-hover:scale-105 transition-transform">
              <Compass className="w-8 h-8" />
            </div>
            <div className="font-black text-xl uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
              Trouveur de Cadeau Spoolio
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              100% interactif • Moins de 60 secondes pour trouver la bonne curiosité
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#005CFF] font-[family-name:var(--font-antonio)] group-hover:translate-x-0.5 transition-transform">
              <span>Tester le questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — L'ATELIER DE COMINES                          */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-[#E4E4E0] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              05 // FABRICATION LOCALE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] leading-[1.02]">
              L&apos;Atelier Spoolio à Comines.
            </h2>
            <blockquote className="text-base sm:text-lg text-zinc-700 font-sans italic border-l-2 border-[#FF5500] pl-4 leading-relaxed">
              « Derrière Spoolio, il y a un atelier à Comines, des imprimantes qui travaillent dur et une obsession pour les objets qui sortent de l&apos;ordinaire. »
            </blockquote>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
              Chaque pièce est modélisée avec précision, imprimée en 3D en petites séries avec du filament d&apos;origine végétale (PLA biosourcé à base d&apos;amidon de maïs), puis minutieusement ébavurée, assemblée et vérifiée à la main avant expédition.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-zinc-700">
              <span className="inline-flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                <MapPin className="w-3.5 h-3.5 text-[#FF5500]" /> Comines (Hauts-de-France)
              </span>
              <span className="inline-flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                <Printer className="w-3.5 h-3.5 text-zinc-700" /> Impression 3D haute précision
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
            <Image
              src="/images/clicker_gallery_2.jpg"
              alt="Atelier Spoolio à Comines"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 — LIVRAISON ET RÉASSURANCE                      */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
            06 // SÉRÉNITÉ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
            Livraison & engagements de Noël
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-sans">
            Des règles claires, sans fausse promesse, pour des paquets sous le sapin à l&apos;heure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* CARTE 1: FABRICATION */}
          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5500]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase text-zinc-950 font-[family-name:var(--font-antonio)]">
              Fabrication 24-48h
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Impression à la demande et assemblage rapide dans notre atelier des Hauts-de-France.
            </p>
          </div>

          {/* CARTE 2: DATES LIMITES NOËL */}
          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005CFF]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase text-zinc-950 font-[family-name:var(--font-antonio)]">
              Délais Colissimo & Relais
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Pour Noël : avant le <strong>18 décembre</strong> (Colissimo) ou le <strong>16 décembre</strong> (Mondial Relay).
            </p>
          </div>

          {/* CARTE 3: FRAIS DE PORT */}
          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase text-zinc-950 font-[family-name:var(--font-antonio)]">
              Livraison Offerte dès 35 €
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Frais de port offerts dès 35 € d&apos;achat en point relais. Sinon à partir de 3,90 €. Retrait atelier gratuit.
            </p>
          </div>

          {/* CARTE 4: RETOURS */}
          <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase text-zinc-950 font-[family-name:var(--font-antonio)]">
              Retours sereins 14 jours
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Droit de rétractation de 14 jours. Service client direct à l&apos;atelier par e-mail en cas de question.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
