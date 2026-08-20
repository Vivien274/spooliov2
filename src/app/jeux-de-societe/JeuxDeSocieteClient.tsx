"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import UnicornIcon from "@/components/UnicornIcon";
import cartIconData from "@/components/shopping bag.json";
import {
  Sparkles,
  Gamepad2,
  Trophy,
  Users,
  Smartphone,
  CheckCircle2,
  Plus,
  ArrowRight,
  Flame,
  Shield,
  Layers,
  Heart,
  ChevronRight,
  Clock,
  Dices,
  Check,
  Send,
  Zap,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  productType?: string;
  attributes?: any;
  images?: { src: string }[];
  shortDescription?: string;
}

interface JeuxDeSocieteClientProps {
  initialProducts: Product[];
}

function hasProductVariables(p: any): boolean {
  if (p.productType === "variable") return true;
  if (!p.attributes) return false;
  try {
    const parsed = typeof p.attributes === "string" ? JSON.parse(p.attributes) : p.attributes;
    if (Array.isArray(parsed) && parsed.length > 0) return true;
    if (parsed.attributes && Array.isArray(parsed.attributes) && parsed.attributes.length > 0) return true;
  } catch (e) {}
  return false;
}

export default function JeuxDeSocieteClient({ initialProducts }: JeuxDeSocieteClientProps) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const [activeProfile, setActiveProfile] = useState<"apero" | "famille" | "expert">("apero");
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  // Email Early Access state
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAddToCart = (product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
  }) => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        selectedOptions: {},
        image: product.image,
      },
      1,
      true
    );

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const handleButtonClick = (product: any) => {
    const isVariable = hasProductVariables(product);
    if (isVariable) {
      router.push(`/product/${product.slug}`);
    } else {
      handleAddToCart(product);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) return;

    setSubmitting(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          tag: "Beta-App-Enjeu",
        }),
      });
      setSubscribed(true);
      setEmailInput("");
    } catch (err) {
      console.warn("Beta subscribe error:", err);
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Supported games in Enjeu App
  const supportedGames = [
    { name: "Skull King", badge: "Scores & Paris", icon: "🏴‍☠️" },
    { name: "Skyjo", badge: "Calcul rapide", icon: "🔢" },
    { name: "Yams / Yahtzee", badge: "Feuille auto", icon: "🎲" },
    { name: "Qwixx", badge: "Feuille de marque", icon: "🔴" },
    { name: "Belote & Coinche", badge: "Compteur 1000", icon: "♠️" },
    { name: "Tarot FFT", badge: "Contrats & Bouts", icon: "🃏" },
    { name: "Faraway", badge: "Calcul sanctuaire", icon: "🏜️" },
    { name: "Sea Salt & Paper", badge: "Duo & Effets", icon: "🦀" },
    { name: "6 qui prend !", badge: "Têtes de bœufs", icon: "🐂" },
    { name: "Papier & Crayon", badge: "Libre", icon: "✏️" },
  ];

  // REAL products strictly from "Jeux & activités" category
  const fallbackProducts = [
    {
      id: 11795,
      name: "Support de cartes de jeu",
      price: "6.00",
      slug: "support-cartes-de-jeu",
      productType: "variable",
      attributes: [{ name: "Couleur", options: ["Noir", "Blanc", "Bleu"] }],
      image: "/images/imported/Spoolio-support-de-cartes-de-jeu-4-scaled.webp",
      badge: "Cartes & Famille",
      desc: "Ce support en arc de cercle maintient tes cartes bien en place, visibles et organisées. Idéal pour jouer les mains libres en grignotant ou pour les enfants.",
    },
    {
      id: 12029,
      name: "Tour à dé médiévale",
      price: "20.00",
      slug: "tour-a-de-medievale",
      productType: "simple",
      attributes: [],
      image: "/images/imported/Spoolio-tour-a-de-chateau-simple-9-scaled.webp",
      badge: "Lancers Parfaits",
      desc: "Une véritable tour de château pour lancer vos dés. Imprimée avec escalier en colimaçon intérieur pour un lancer immersif et spectaculaire.",
    },
    {
      id: 10934,
      name: "Tour à dé Château & Pont-levis",
      price: "20.00",
      slug: "tour-a-de-chateau-pont-levis",
      productType: "variable",
      attributes: [{ name: "Couleur", options: ["Gris", "Noir"] }],
      image: "/images/imported/Spoolio-tour-a-de-pont-levis-1-scaled.webp",
      badge: "Pont-levis Mobile",
      desc: "Tour à Dé façon château avec pont-levis magique qui mélange les dés sans triche et transforme chaque lancer en mini-spectacle.",
    },
    {
      id: 10937,
      name: "Tetris 3D de voyage",
      price: "10.00",
      slug: "tetris-3d-de-voyage",
      productType: "simple",
      attributes: [],
      image: "/images/imported/Spoolio_Tetris3D-1.jpeg",
      badge: "Casse-Tête 3D",
      desc: "Mets ton équilibre à l’épreuve avec ce jeu de Tetris en 3D, amusant et compact, parfait pour vos soirées et voyages !",
    },
    {
      id: 8502,
      name: "Jeu de morpion \"toilettes\"",
      price: "16.00",
      slug: "jeu-de-morpion-toilettes",
      productType: "simple",
      attributes: [],
      image: "/images/imported/Spoolio-Morpion1-4.jpg",
      badge: "Jeu Nomade",
      desc: "Redécouvre le classique jeu du morpion avec des pions amusants. Compact, magnétique et idéal à transporter partout.",
    },
    {
      id: 8938,
      name: "Spoolinks - Jeu de construction",
      price: "9.50",
      slug: "spoolinks-jeu-de-construction",
      productType: "variable",
      attributes: [{ name: "Couleur", options: ["Multicolore"] }],
      image: "/images/imported/Spoolio-Spoolinks-9.jpg",
      badge: "Créativité 3D",
      desc: "30 pièces à clipser, un mini univers à construire, coloré et créatif livré dans sa boîte de rangement.",
    },
    {
      id: 7736,
      name: "Pistolet à disques",
      price: "5.00",
      slug: "pistolet-a-disques",
      productType: "variable",
      attributes: [{ name: "Couleur", options: ["Rouge", "Bleu"] }],
      image: "/images/imported/Spoolio-Pistolet_Disques-1.jpg",
      badge: "Gages & Apéro",
      desc: "Propulse des disques jusqu’à 10 mètres pour des parties endiablées et animer les gages en soirée.",
    },
    {
      id: 7252,
      name: "Cacatapulte : la catapulte à caca d'imprimante",
      price: "5.00",
      slug: "cacatapulte-caca-imprimante",
      productType: "variable",
      attributes: [{ name: "Couleur", options: ["Violet", "Vert"] }],
      image: "/images/imported/Spoolio-Cacatapulte-catapulte-2.jpg",
      badge: "Fun & Gages",
      desc: "Recyclage ludique en 3D ! On transforme nos résidus d’impression en projectiles grâce à cette catapulte amusante.",
    },
  ];

  // Merge initialProducts with fallback list
  const displayProducts = (initialProducts && initialProducts.length > 0)
    ? initialProducts.map((p) => {
        const found = fallbackProducts.find((fb) => fb.id === p.id || fb.slug === p.slug);
        const cleanDesc = p.shortDescription
          ? p.shortDescription.replace(/<[^>]*>?/gm, "").trim()
          : (found?.desc || "");
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          slug: p.slug,
          productType: p.productType || found?.productType || "simple",
          attributes: p.attributes || found?.attributes || [],
          image: p.images?.[0]?.src || found?.image || "/images/imported/Spoolio-support-de-cartes-de-jeu-4-scaled.webp",
          badge: found?.badge || "Jeux & Activités",
          desc: cleanDesc || "Création 3D artisanale conçue en France par Spoolio.",
        };
      })
    : fallbackProducts;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 space-y-16 sm:space-y-24">
      
      {/* =========================================================================
          1. HERO SECTION : L'EXPÉRIENCE JEU AUGMENTÉE
         ========================================================================= */}
      <section className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#12111d] via-[#0d0c15] to-[#070709] border border-white/10 p-6 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff4f00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-black uppercase tracking-wider shadow-inner">
            <Dices className="w-4 h-4 text-indigo-400" />
            <span>Spoolio x Enjeu • Le Hub des Joueurs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-antonio leading-[1.05] drop-shadow-md">
            Des soirées jeux <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-400 to-indigo-400">100% fun</span>, zéro prise de tête.
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Que tu sois adepte des jeux d'ambiance à l'apéro, des après-midis cartes en famille ou des lancers de dés palpitants : découvre nos <strong className="text-white">jeux &amp; accessoires 3D</strong> et notre <strong className="text-indigo-300">application compagnon Enjeu</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <a
              href="#accessoires"
              className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-[#ff4f00] hover:bg-[#e04500] text-white font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2.5 shadow-lg shadow-[#ff4f00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Voir la Collection Jeux</span>
            </a>

            <a
              href="#enjeu-app"
              className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/30"
            >
              <Smartphone className="w-4 h-4" />
              <span>Découvrir l'App Enjeu</span>
            </a>
          </div>
        </div>
      </section>


      {/* =========================================================================
          2. SONDAGE INTERACTIF : VOTES DE LA COMMUNAUTÉ
         ========================================================================= */}
      <section className="space-y-8 bg-gradient-to-b from-[#100f1c] via-[#0d0c17] to-[#070709] border border-indigo-500/20 rounded-3xl sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="text-center max-w-xl mx-auto space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4f00]/15 text-[#ff4f00] border border-[#ff4f00]/30 text-xs font-mono font-bold uppercase tracking-wider">
            <span>🗳️ Sondage Communauté</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-antonio tracking-tight">
            Quelle est ta plus grande galère lors des soirées jeux ?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-sans">
            Vote ci-dessous pour découvrir ce que répondent les autres joueurs :
          </p>
        </div>

        {/* Poll Component with Live Results & Local Storage */}
        {(() => {
          // Poll state
          const POLL_KEY = "spoolio_boardgame_poll_voted_option";
          const INITIAL_VOTES: Record<number, number> = {
            1: 142, // Dés qui tombent
            2: 189, // Feuilles de score volantes
            3: 98,  // Cartes en main
            4: 124, // Paris & historique
          };

          const [votedOption, setVotedOption] = useState<number | null>(() => {
            if (typeof window !== "undefined") {
              const saved = localStorage.getItem(POLL_KEY);
              return saved ? parseInt(saved, 10) : null;
            }
            return null;
          });

          const [votes, setVotes] = useState<Record<number, number>>(INITIAL_VOTES);

          const handleVote = (optionId: number) => {
            if (votedOption !== null) return; // Already voted

            const updatedVotes = { ...votes, [optionId]: votes[optionId] + 1 };
            setVotes(updatedVotes);
            setVotedOption(optionId);

            try {
              localStorage.setItem(POLL_KEY, optionId.toString());
            } catch (e) {}

            // Send silent analytics vote POST
            fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "Vote Sondage Jeux",
                email: "vote@spoolio.fr",
                message: `Option votée : ${optionId}`,
              }),
            }).catch(() => {});
          };

          const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

          const options = [
            {
              id: 1,
              icon: "🎲",
              title: "Les dés qui tombent au sol ou renversent les verres",
              desc: "Les lancers sauvages qui finissent sous la table ou sous le canapé...",
              accent: "from-amber-500/20 to-amber-900/30 border-amber-500/40 text-amber-300",
            },
            {
              id: 2,
              icon: "📝",
              title: "Les feuilles de score volantes & les calculs chiants",
              desc: "Chercher un stylo qui marche et faire des additions à 1h du matin...",
              accent: "from-indigo-500/20 to-indigo-900/30 border-indigo-500/40 text-indigo-300",
            },
            {
              id: 3,
              icon: "🃏",
              title: "Avoir trop de cartes en main (fatigue & cartes cachées)",
              desc: "Ne pas savoir où poser son jeu ou devoir tenir 12 cartes en même temps...",
              accent: "from-cyan-500/20 to-cyan-900/30 border-cyan-500/40 text-cyan-300",
            },
            {
              id: 4,
              icon: "🔥",
              title: "Retrouver qui a gagné la dernière fois & gérer les paris",
              desc: "« Mais si, la semaine dernière c'est toi qui devais faire la vaisselle ! »",
              accent: "from-pink-500/20 to-pink-900/30 border-pink-500/40 text-pink-300",
            },
          ];

          return (
            <div className="space-y-4 max-w-3xl mx-auto relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {options.map((opt) => {
                  const voteCount = votes[opt.id];
                  const percentage = Math.round((voteCount / totalVotes) * 100);
                  const isSelected = votedOption === opt.id;
                  const hasVoted = votedOption !== null;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleVote(opt.id)}
                      disabled={hasVoted}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden cursor-pointer ${
                        isSelected
                          ? `bg-gradient-to-r ${opt.accent} shadow-xl scale-[1.01]`
                          : hasVoted
                          ? "bg-white/[0.02] border-white/10 opacity-80 cursor-default"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 active:scale-[0.99]"
                      }`}
                    >
                      {/* Animated Percentage Fill Bar (Visible after voting) */}
                      {hasVoted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-1000 ease-out pointer-events-none"
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl">{opt.icon}</span>

                          {hasVoted ? (
                            <div className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" /> Ton vote
                                </span>
                              )}
                              <span className="text-sm font-mono font-black text-white">
                                {percentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                              Cliquer pour voter
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-white font-sans leading-snug">
                            {opt.title}
                          </h3>
                          <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Poll Footer Message */}
              {votedOption !== null ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="text-white font-extrabold text-xs">
                        Merci pour ton vote ! ({totalVotes} joueurs ont voté)
                      </p>
                      <p className="text-[11px] text-emerald-300/90 font-normal">
                        C'est exactement pour résoudre ce problème qu'on a créé les créations 3D Spoolio &amp; l'App Enjeu !
                      </p>
                    </div>
                  </div>
                  <a
                    href="#accessoires"
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider shrink-0 transition-colors"
                  >
                    Voir la solution 3D ↓
                  </a>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 text-center font-mono">
                  💡 {totalVotes} votes enregistrés à ce jour par la communauté Spoolio.
                </p>
              )}
            </div>
          );
        })()}
      </section>


      {/* =========================================================================
          3. VITRINE DES PRODUITS "JEUX & ACTIVITÉS" (Avec Corner Notch & Picto Panier Animé)
         ========================================================================= */}
      <section id="accessoires" className="space-y-8 scroll-mt-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ff4f00]">
              Catégorie Jeux &amp; Activités 🇫🇷
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-antonio tracking-tight mt-1">
              Les Créations 3D Spoolio
            </h2>
          </div>
          <Link
            href="/categorie/Jeux %26 activit%C3%A9s"
            className="text-xs font-bold text-gray-400 hover:text-[#ff4f00] transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Voir toute la catégorie Jeux</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid with Corner Scoop Notch Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayProducts.map((product) => {
            const isAlreadyInCart = cartItems.some((ci) => ci.productId === product.id || ci.slug === product.slug);
            const wasJustAdded = justAddedId === product.id;
            const isVariable = hasProductVariables(product);

            return (
              <div
                key={product.id}
                className="group relative aspect-square w-full rounded-[28px] bg-transparent border-none overflow-hidden transition-all duration-300 shadow-xl"
              >
                {/* Full-bleed Product Image */}
                <Link href={`/product/${product.slug}`} className="block w-full h-full relative group/img">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover group-hover/img:scale-105 transition-transform duration-500 no-invert"
                  />
                </Link>

                {/* Apple Specular Bevel Edge (Liseré de verre supérieur) */}
                <div className="absolute inset-0 pointer-events-none rounded-[28px] border-t border-l border-white/20 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.3)] z-10" />

                {/* Bottom Gradient overlay for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-0" />

                {/* Product Name on the image, at bottom-left, aligned with the button */}
                <div className="absolute bottom-3 left-4 right-[160px] z-10 flex items-center min-h-[44px] pointer-events-auto">
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs sm:text-sm font-black text-white hover:text-[#ff4f00] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-2 leading-tight transition-colors font-sans"
                  >
                    {product.name}
                  </Link>
                </div>

                {/* =========================================================
                    BOTTOM-RIGHT INVERTED CORNER SCOOP & LIQUID GLASS BUTTON
                   ========================================================= */}
                <div className="absolute bottom-0 right-0 bg-[#070709] p-2 rounded-tl-[24px] z-20 flex items-center justify-center">
                  
                  {/* Top Inverted Fillet Curve */}
                  <div className="absolute -top-[16px] right-0 w-[16px] h-[16px] overflow-hidden pointer-events-none">
                    <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#070709]" />
                  </div>

                  {/* Left Inverted Fillet Curve */}
                  <div className="absolute bottom-0 -left-[16px] w-[16px] h-[16px] overflow-hidden pointer-events-none">
                    <div className="w-full h-full rounded-br-[16px] shadow-[6px_6px_0_6px_#070709]" />
                  </div>

                  {/* Button: Liquid Glass Pill (Verre translucide + Reflet spéculaire interne net) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleButtonClick(product);
                    }}
                    onMouseEnter={() => setHoveredCardId(product.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    title={isVariable ? "Choisir les options (couleur, taille...)" : "Ajouter au panier"}
                    aria-label={isVariable ? "Choisir les options" : "Ajouter au panier"}
                    className={`relative h-11 px-4 rounded-full transition-all duration-300 flex items-center gap-2.5 cursor-pointer outline-none active:scale-95 no-invert shrink-0 ${
                      !isVariable && (isAlreadyInCart || wasJustAdded)
                        ? "bg-emerald-500 text-white border border-emerald-400/50 shadow-[0_4px_16px_rgba(16,185,129,0.4)]"
                        : "bg-white/95 hover:bg-white text-black backdrop-blur-xl border border-white/80 hover:border-white shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_6px_16px_rgba(0,0,0,0.45)] hover:scale-[1.03]"
                    }`}
                  >
                    {!isVariable && (isAlreadyInCart || wasJustAdded) ? (
                      <>
                        <Check className="w-5 h-5 text-white shrink-0" />
                        <span className="text-xs font-black uppercase font-mono tracking-tight text-white">Ajouté</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 flex items-center justify-center pointer-events-none shrink-0 overflow-hidden brightness-0">
                          <UnicornIcon
                            animationData={cartIconData}
                            className="w-10 h-10 scale-[2.2] pointer-events-none"
                            isHovered={hoveredCardId === product.id}
                          />
                        </div>
                        <span className="text-sm font-black font-mono tracking-tight shrink-0 text-black">
                          {product.price}€
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          4. FOCUS APPLICATION ENJEU (APP COMPAGNON)
         ========================================================================= */}
      <section id="enjeu-app" className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#0c0d1c] via-[#10132b] to-[#18112e] border border-indigo-500/30 p-6 sm:p-12 overflow-hidden shadow-2xl scroll-mt-28">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Présentation Enjeu */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bientôt disponible • 100% Gratuite</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-antonio tracking-tight">
                L'Application <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400">Enjeu.</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                L'application compagnon conçue pour remplacer définitivement les feuilles volantes et pimenter vos soirées jeux avec des paris amusants.
              </p>
            </div>

            {/* Feature Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Calcul Automatique des Scores</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Feuilles de marque numériques pour Skull King, Skyjo, Yams, Tarot, Qwixx, Belote...
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-xs">
                  <Flame className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Paris Amicaux (« L'Enjeu »)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <em>« Le perdant fait la vaisselle ! »</em> Enregistre les gages et paris de ta table en début de partie.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Stats &amp; Historique des Joueurs</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Garde en mémoire qui a gagné, vos records de points et le classement de votre groupe.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Minuteur &amp; Dés Intégrés</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Chronomètre pour les joueurs lents et générateur de dés virtuels en cas de besoin.
                </p>
              </div>
            </div>

            {/* Supported Games Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
                Jeux pris en charge nativement :
              </span>
              <div className="flex flex-wrap gap-2">
                {supportedGames.map((g) => (
                  <span
                    key={g.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200"
                  >
                    <span>{g.icon}</span>
                    <span>{g.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Early Access Form Card */}
          <div className="lg:col-span-5 bg-[#0a0a14]/90 backdrop-blur-xl border border-indigo-400/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white font-antonio uppercase tracking-wide">
                    Rejoins la Bêta Android Enjeu
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>🤖</span> Android Uniquement
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Sois prévenu(e) en avant-première lors de l'ouverture du test sur Android (Google Play), et reçois un <strong className="text-amber-400">cadeau exclusif Spoolio</strong> dans ta boîte mail.
              </p>
            </div>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold space-y-1 text-center">
                <div className="text-xl">🎉</div>
                <p className="font-extrabold text-sm text-white">Merci pour ton inscription à la Bêta Android !</p>
                <p className="text-emerald-300 font-normal">Tu seras parmi les tout premiers à tester l'application Enjeu sur Android.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Ton adresse email (Compte Google Play / Android)..."
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 focus:border-indigo-400 focus:outline-none text-white text-xs font-sans placeholder:text-gray-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Inscription..." : "Rejoindre la Bêta Android 🤖"}</span>
                </button>

                <p className="text-[10px] text-gray-500 text-center">
                  🔒 Zéro spam. Inscription synchronisée avec le tag Mailchimp <code>Beta-App-Enjeu</code>.
                </p>
              </form>
            )}

            {/* Badges Stores */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                <span>🤖</span> Disponible en Bêta sur Android uniquement
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          5. CONSEILS POUR DES SOIRÉES JEUX INOUBLIABLES
         ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            Astuces de Joueurs
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-antonio tracking-tight">
            Les 3 règles d'or d'une soirée réussie
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <span className="text-2xl">⚡</span>
            <h3 className="text-sm font-extrabold text-white uppercase">1. Pas de temps mort</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enchaînez les tours de jeu rapidement sans perdre 10 minutes à recompter les points avec un crayon écrasé.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <span className="text-2xl">🍕</span>
            <h3 className="text-sm font-extrabold text-white uppercase">2. La table reste propre</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Utilisez des supports de cartes pour pouvoir manger et boire sans tacher le matériel de jeu.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <span className="text-2xl">🏆</span>
            <h3 className="text-sm font-extrabold text-white uppercase">3. Un enjeu clair</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fixez un gage marrant dès le début de la partie : cela motive tout le monde et crée des souvenirs mémorables.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
