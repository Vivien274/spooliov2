"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  Gift,
  Lock,
  Sparkles,
  CheckCircle2,
  Share2,
  ShoppingBag,
  RefreshCw,
  Heart,
  Truck,
  Leaf,
  ChevronDown,
  X,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { AdventData, AdventObjectItem } from "@/types/avent";
import { getAdventDataAction, likeAdventObjectAction } from "@/app/actions/aventActions";
import { useCart } from "@/context/CartContext";

const FAQ_ITEMS = [
  {
    q: "Quand vais-je recevoir mon calendrier de l'Avent ?",
    a: "Tous les calendriers seront expédiés mi-novembre par Colissimo ou Mondial Relay (ou disponibles en retrait gratuit à notre atelier de Comines). Vous le recevrez largement à temps avant le 1er décembre pour démarrer le rituel.",
  },
  {
    q: "Y a-t-il des doublons avec les objets du site ?",
    a: "Non, aucun ! Les 24 créations ont été spécialement conçues pour cette édition de Noël. Vous y trouverez des modèles inédits, des prototypes et des variantes de couleurs introuvables au catalogue habituel.",
  },
  {
    q: "Comment s'installe le calendrier dans la maison ?",
    a: "Chaque objet est emballé dans un sachet kraft scellé et numéroté de 1 à 24 (avec le 25ème cadeau bonus). Un kit avec cordelette et attaches est inclus pour former une jolie guirlande murale ou les disposer au pied du sapin.",
  },
  {
    q: "Quelles sont les matières utilisées ?",
    a: "100% de nos pièces sont imprimées en PLA biosourcé (un matériau durable à base d'amidon de maïs), dans une démarche zéro déchet et de production artisanale raisonnée.",
  },
];

export default function CalendrierAventClient({
  initialData,
}: {
  initialData?: AdventData | null;
} = {}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [data, setData] = useState<AdventData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal State for Object Detail
  const [selectedObject, setSelectedObject] = useState<AdventObjectItem | null>(null);
  const [openedDays, setOpenedDays] = useState<number[]>([]);

  // Real calendar date calculation
  // Avant le 1er Décembre (mois < 11 ou année < 2026), TOUTES les cases sont strictement verrouillées.
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Janvier ... 10 = Novembre, 11 = Décembre
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const isDecemberActive = currentYear >= 2026 && currentMonth === 11;

  // Load Data
  useEffect(() => {
    async function load() {
      try {
        const res = await getAdventDataAction();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Automatic Redirection to Homepage if Page is Private
  useEffect(() => {
    if (data && data.config.isPublicActive === false) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("admin") === "true") return;
      }
      router.replace("/");
    }
  }, [data, router]);

  // Confetti trigger
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF5500", "#10b981", "#ffffff", "#ffd700", "#ef4444"],
      });
    } catch (e) {}
  };

  // Open Door Handler
  const handleOpenDoor = (obj: AdventObjectItem, isUnlocked: boolean) => {
    if (isUnlocked) {
      if (!openedDays.includes(obj.day)) {
        setOpenedDays((prev) => [...prev, obj.day]);
        triggerConfetti();
      }
      setSelectedObject(obj);
    } else {
      // Strictly locked: No spoilers of name, teaser or description
      setSelectedObject({
        ...obj,
        title: `Fenêtre du Jour ${obj.day}`,
        category: "Surprise Verrouillée",
        description: !isDecemberActive
          ? `Le calendrier de l'Avent démarre le 1er Décembre ! Chaque matin de décembre, une nouvelle fenêtre pourra être ouverte pour révéler sa surprise.`
          : `Cette case s'ouvrira le ${obj.day} Décembre. Revenez ce jour-là pour découvrir la création cachée dans votre calendrier !`,
        teaser: "",
        filamentColor: "",
        imageUrl: "",
      });
    }
  };

  // Like Object
  const handleLikeObject = async (day: number) => {
    if (!selectedObject) return;
    const currentLikes = selectedObject.likesCount || 0;
    const updatedObj = { ...selectedObject, likesCount: currentLikes + 1 };
    setSelectedObject(updatedObj);

    if (data) {
      const updatedObjects = data.objects.map((o) => (o.day === day ? updatedObj : o));
      setData({ ...data, objects: updatedObjects });
    }

    try {
      await likeAdventObjectAction(day);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#FF5500] animate-spin" />
          <span className="text-sm font-mono text-neutral-600">
            Chargement du Calendrier de l'Avent...
          </span>
        </div>
      </div>
    );
  }

  const preorder = data.config.preorder || {
    tier1Price: 45,
    tier2Price: 50,
    totalLimit: 50,
    totalSold: 0,
  };

  const totalLimit = preorder.totalLimit || 50;
  const totalSold = preorder.totalSold ?? 0;
  const remainingStock = Math.max(0, totalLimit - totalSold);
  const currentPrice = preorder.tier2Price || 50;

  const handlePreorder = () => {
    triggerConfetti();
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);

    addToCart(
      {
        productId: 202612,
        name: data.config.title || "Calendrier de l'Avent Spoolio 2026",
        slug: "calendrier-avent",
        price: currentPrice.toFixed(2),
        selectedOptions: {
          Formule: "Édition Artisanale Complète (50€)",
          Contenu: `${data.objects.length} créations 3D + Kit Guirlande DIY`,
        },
        image: "/images/calendrier-avent-hero.jpg",
      },
      1,
      true
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121212] font-sans selection:bg-[#FF5500] selection:text-white">
      {/* Site Header */}
      <Header />

      <main className="flex-1 pt-28 sm:pt-32 lg:pt-36 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
          {/* ========================================================= */}
          {/* HERO SECTION : Clarté & Achat direct                      */}
          {/* ========================================================= */}
          <section className="space-y-6">
            {/* Header pill & title */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF5500] border border-orange-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Édition Artisanale Limitée • 50 Coffrets</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#121212] font-antonio uppercase tracking-tight leading-none">
                Le Calendrier de l'Avent.
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
                {data.config.subtitle ||
                  "24 jours de créations 3D exclusives, fidgets magiques et surprises fabriquées à la main dans notre atelier en France."}
              </p>
            </div>

            {/* Product Hero Card */}
            <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Visual Box */}
              <div className="md:col-span-5 relative">
                <div className="aspect-square rounded-2xl overflow-hidden relative border border-[#E4E4E0] shadow-sm bg-[#FAF9F6]">
                  <Image
                    src="/images/calendrier-avent-hero.jpg"
                    alt="Calendrier de l'Avent Spoolio"
                    fill
                    className="object-cover"
                    priority
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-xs text-[#121212] border border-[#E4E4E0] shadow-2xs">
                    Atelier Comines 🇫🇷
                  </span>
                </div>
              </div>

              {/* Offer & Preorder Action */}
              <div className="md:col-span-7 space-y-6">
                {/* Price Row */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-[#121212] font-mono tracking-tight">
                    {currentPrice.toFixed(2)} €
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Valeur réelle des objets : +80 €
                  </span>
                </div>

                {/* Jauge de disponibilité */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0]">
                  <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                    <span>Coffrets réservés sur la série :</span>
                    <strong className="text-[#121212] font-mono font-bold">
                      {totalSold} / {totalLimit}
                    </strong>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#FF5500] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((totalSold / Math.max(1, totalLimit)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {remainingStock > 0
                      ? `Il reste ${remainingStock} exemplaires disponibles pour cette fin d'année.`
                      : "Série complète réservée."}
                  </div>
                </div>

                {/* Checklist des inclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span>24 créations 3D inédites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span>Sachets kraft scellés numérotés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span>Kit DIY (cordon & fixations inclus)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                    <span>PLA végétal & fabrication locale</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handlePreorder}
                    disabled={remainingStock <= 0}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-3 cursor-pointer ${
                      addedSuccess
                        ? "bg-emerald-600 text-white"
                        : remainingStock > 0
                        ? "bg-[#FF5500] hover:bg-[#e04b00] text-white"
                        : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {addedSuccess ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <ShoppingBag className="w-5 h-5" />
                      )}
                      <span className="text-base font-antonio tracking-wide uppercase">
                        {addedSuccess ? "Ajouté au panier ! ✨" : "Précommander mon calendrier"}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-black/20 text-xs font-mono font-bold">
                      {currentPrice.toFixed(2)} €
                    </span>
                  </button>

                  <p className="text-center text-xs text-neutral-500">
                    📦 Expédition mi-novembre garantie avant le 1er décembre • Retrait atelier offert à Comines
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* GRILLE DU CALENDRIER (STRICTEMENT VERROUILLÉE)           */}
          {/* ========================================================= */}
          <section className="space-y-5">
            <div className="border-b border-[#E4E4E0] pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5500]">
                Rituel quotidien
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#121212] font-antonio uppercase tracking-tight">
                Les fenêtres de l'Avent ({data.objects.length} jours)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                {isDecemberActive
                  ? "Chaque matin, découvrez la surprise du jour !"
                  : "Le rituel démarrera le 1er Décembre. Toutes les cases restent closes pour préserver la surprise !"}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {data.objects.map((obj) => {
                // Avant le 1er décembre : strictement verrouillé pour toutes les cases.
                // En décembre : déverrouillage progressif jour par jour.
                const isUnlockedByDate = isDecemberActive && obj.day <= currentDay;
                const isManuallyRevealed = obj.visibility === "devoile_manuel";
                const isUnlocked = isUnlockedByDate || isManuallyRevealed;
                const isOpen = isUnlocked && openedDays.includes(obj.day);
                const isSpecialDay = obj.day === 24 || obj.day === 25;

                return (
                  <div
                    key={obj.day}
                    onClick={() => handleOpenDoor(obj, isUnlocked)}
                    className={`group relative min-h-[145px] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden border ${
                      isSpecialDay
                        ? "bg-gradient-to-b from-orange-50/60 to-white border-[#FF5500]/40 shadow-xs hover:border-[#FF5500] hover:shadow-md"
                        : "bg-white border-[#E4E4E0] hover:border-neutral-400 hover:shadow-sm"
                    }`}
                  >
                    {/* Top: Day badge + lock state */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                          isSpecialDay
                            ? "bg-[#FF5500] text-white shadow-xs"
                            : "bg-neutral-100 text-[#121212] border border-[#E4E4E0]"
                        }`}
                      >
                        {obj.day}
                      </span>

                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {isOpen ? "Ouvert" : "À ouvrir"}
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>

                    {/* Center: Padlock or Unveiled gift */}
                    <div className="my-2 text-center flex flex-col items-center justify-center min-h-[55px]">
                      {isUnlocked ? (
                        isOpen ? (
                          <div className="space-y-1">
                            <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[#E4E4E0] mx-auto bg-neutral-100 flex items-center justify-center">
                              {obj.imageUrl ? (
                                <Image src={obj.imageUrl} alt={obj.title} fill className="object-cover" />
                              ) : (
                                <span className="text-xl">🎁</span>
                              )}
                            </div>
                            <h3 className="text-xs font-bold text-[#121212] line-clamp-1">
                              {obj.title}
                            </h3>
                          </div>
                        ) : (
                          <div className="space-y-1 group-hover:scale-105 transition-transform">
                            <Gift className="w-8 h-8 text-[#FF5500] mx-auto" />
                            <span className="text-[10px] text-[#FF5500] font-black uppercase font-mono block">
                              Ouvrir !
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="space-y-1">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-[#E4E4E0] flex items-center justify-center mx-auto text-sm text-neutral-400">
                            🔒
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            {obj.day} Décembre
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Only show title if unveiled/opened. Strictement masqué sinon. */}
                    {isOpen ? (
                      <div className="text-[11px] font-bold text-neutral-700 truncate text-center bg-[#FAF9F6] py-1 px-2 rounded-lg border border-[#E4E4E0]">
                        {obj.title}
                      </div>
                    ) : (
                      <div className="text-[10px] text-neutral-400 font-mono text-center">
                        {isUnlocked ? "Prêt à ouvrir" : "Mystère garanti"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========================================================= */}
          {/* LES 3 ENGAGEMENTS SPOOLIO                                  */}
          {/* ========================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5500]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#121212] text-sm uppercase font-antonio tracking-wide">
                100% Fait dans le Nord
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Toutes les pièces sont modélisées et imprimées dans notre atelier de Comines, en séries très limitées.
              </p>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#121212] text-sm uppercase font-antonio tracking-wide">
                Matières Biosourcées
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Imprimé en PLA d'origine végétale (amidon de maïs), recyclable et sans aucune substance toxique.
              </p>
            </div>

            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#121212] text-sm uppercase font-antonio tracking-wide">
                Livraison Avant Décembre
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Expédié mi-novembre avec suivi pour que votre calendrier soit prêt à être ouvert dès le 1er décembre.
              </p>
            </div>
          </section>

          {/* ========================================================= */}
          {/* FAQ CONCISE                                               */}
          {/* ========================================================= */}
          <section className="bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5500]">
                Besoin d'aide ?
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#121212] font-antonio uppercase tracking-wide">
                Questions Fréquentes
              </h2>
            </div>

            <div className="divide-y divide-[#E4E4E0]">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3.5">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#121212] hover:text-[#FF5500] transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FF5500]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-neutral-600 leading-relaxed animate-in fade-in duration-200">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Site Footer */}
      <Footer />

      {/* ========================================================= */}
      {/* MODAL DÉTAIL D'UN JOUR (Révélée seulement si dévoilée)    */}
      {/* ========================================================= */}
      {selectedObject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedObject(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] font-black text-xs font-mono">
                JOUR {selectedObject.day}
              </span>
              <span className="text-xs font-mono text-neutral-600 font-bold uppercase tracking-wider">
                {selectedObject.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-[#121212] font-antonio leading-tight">
              {selectedObject.title}
            </h2>

            {/* Visual Box */}
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E4E4E0] relative flex items-center justify-center shadow-inner">
              {selectedObject.imageUrl ? (
                <Image
                  src={selectedObject.imageUrl}
                  alt={selectedObject.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-5xl">🎁</div>
                  <span className="text-xs text-neutral-500 font-mono block">
                    Surprise scellée dans son sachet
                  </span>
                </div>
              )}
            </div>

            {/* Filament (seulement si dévoilé) */}
            {selectedObject.filamentColor && (
              <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E4E4E0] text-xs flex items-center justify-between">
                <span className="text-neutral-500 font-mono uppercase font-bold text-[10px]">
                  Finition & Teinte
                </span>
                <span className="font-bold text-[#121212]">{selectedObject.filamentColor}</span>
              </div>
            )}

            {/* Description / Story */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-neutral-500 font-mono uppercase block">
                ✨ Histoire de l'objet :
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-[#E4E4E0]">
                {selectedObject.description || selectedObject.teaser}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                      title: selectedObject.title,
                      text: `Regarde le jour ${selectedObject.day} du Calendrier de l'Avent Spoolio ! 🎄`,
                      url: window.location.href,
                    });
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Lien copié dans le presse-papier !");
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#E4E4E0]"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>

              <button
                onClick={() => handleLikeObject(selectedObject.day)}
                className="flex-1 py-2.5 px-5 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>J'aime ({selectedObject.likesCount || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
