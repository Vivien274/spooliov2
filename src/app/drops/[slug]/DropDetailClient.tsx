"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import DropCountdown from "@/components/drops/DropCountdown";
import { Drop } from "@/lib/drops";
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Package,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface DropDetailClientProps {
  drop: Drop & { products: Product[] };
}

export default function DropDetailClient({ drop }: DropDetailClientProps) {
  const isUpcoming = drop.status === "upcoming";
  const isLive = drop.status === "live";
  const isEnded = drop.status === "ended";

  const formattedDate = new Date(drop.startDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(255, 79, 0, 0.05)", filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(14, 165, 233, 0.04)", filter: "blur(120px)" }}
        />
      </div>

      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-16 relative z-10 flex flex-col items-center">
        
        {/* Navigation Breadcrumb */}
        <div className="w-full flex items-center justify-between mb-6 text-xs text-zinc-500 font-mono">
          <Link
            href="/drops"
            className="inline-flex items-center gap-1.5 hover:text-zinc-950 transition-colors font-bold group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Retour à tous les Drops</span>
          </Link>

          <span className="hidden sm:inline">
            Accueil / Drops / {drop.slug}
          </span>
        </div>

        {/* Drop Hero Showcase */}
        <div className="w-full rounded-3xl bg-white border border-zinc-200/90 shadow-xl overflow-hidden mb-12">
          
          {/* Cover Banner */}
          <div className="relative aspect-21/9 min-h-[260px] sm:min-h-[340px] lg:min-h-[400px] w-full bg-neutral-950 overflow-hidden">
            <img
              src={drop.bannerImage}
              alt={drop.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Status Badge in Banner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  EN DIRECT MAINTENANT
                </span>
              ) : isUpcoming ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider shadow-lg">
                  <Clock className="w-3.5 h-3.5" />
                  PROCHAIN DROP
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider border border-white/10 shadow-lg">
                  ÉDITION ARCHIVÉE
                </span>
              )}
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 max-w-3xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff4f00] bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 inline-block">
                {drop.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight font-[family-name:var(--font-antonio)] leading-none drop-shadow">
                {drop.title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed drop-shadow line-clamp-2">
                {drop.tagline}
              </p>
            </div>
          </div>

          {/* Details & Specs Bar */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Story & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-xl font-black text-zinc-950 uppercase font-[family-name:var(--font-antonio)]">
                  L'Histoire de ce Drop 📖
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line font-[family-name:var(--font-plus-jakarta)]">
                  {drop.description}
                </p>
              </div>

              {/* Specs & Countdown Box */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-4">
                
                {isUpcoming && (
                  <div className="space-y-2 pb-4 border-b border-zinc-200/80">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#ff4f00]" />
                      Ouverture des commandes dans :
                    </span>
                    <DropCountdown targetDate={drop.startDate} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Date de sortie</span>
                    <strong className="text-zinc-950 font-bold">{formattedDate}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[11px]">Tirage atelier</span>
                    <strong className="text-zinc-950 font-bold">
                      {drop.editionSize ? `${drop.editionSize} exemplaires` : "Édition limitée"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[11px]">Fabrication</span>
                    <strong className="text-zinc-950 font-bold">Comines (Nord, 59)</strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[11px]">Statut</span>
                    <strong className="text-zinc-950 font-bold">
                      {isLive ? "En vente active" : isUpcoming ? "Bientôt disponible" : "Épuisé"}
                    </strong>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Products Section Header */}
        <div className="w-full mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/90">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00] text-xs font-bold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>Catalogue Exclusif</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
              Créations incluses dans ce Drop ({drop.products.length})
            </h3>
          </div>

          {isUpcoming && (
            <div className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl">
              🔒 Vente active dès le {formattedDate}
            </div>
          )}
          {isEnded && (
            <div className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl">
              📦 Édition clôturée
            </div>
          )}
        </div>

        {/* Products Grid */}
        {drop.products && drop.products.length > 0 ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {drop.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="w-full p-12 text-center rounded-3xl bg-white border border-zinc-200/80 mb-16">
            <p className="text-zinc-500 text-sm">
              Les fiches produits de ce drop sont en cours de préparation en atelier. Revenez très vite !
            </p>
          </div>
        )}

        {/* Back Link CTA */}
        <div className="w-full flex justify-center mb-12">
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-900 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs hover:shadow cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voir les autres Drops Spoolio</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
