"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import ProductCard, { Product } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  Gift,
  Gamepad2,
  Brain,
  Smile,
  Home,
  User,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  ShoppingBag,
  Share2,
  PackageCheck,
  Layers,
  Leaf,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface TrouveurDeCadeauClientProps {
  products: Product[];
}

export type RecipientType =
  | "secret-santa"
  | "gamer-geek"
  | "stress-focus"
  | "kid-teen"
  | "deco-home"
  | "myself";

export type BudgetType = "under-10" | "10-25" | "25-50" | "over-50" | "any";

export type UniversType = "art-toys" | "tactile" | "desk-deco" | "tabletop" | "surprise";

export type VibeType = "wow" | "soothing" | "practical" | "random";

interface QuizAnswers {
  recipient: RecipientType | null;
  budget: BudgetType | null;
  univers: UniversType[];
  vibe: VibeType | null;
}

const RECIPIENT_OPTIONS: Array<{
  id: RecipientType;
  title: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "secret-santa",
    title: "Secret Santa / Collègue",
    badge: "Attention originale",
    desc: "Petite idée fun, surprenante et accessible pour le bureau ou les amis.",
    icon: Gift,
  },
  {
    id: "gamer-geek",
    title: "Ami Geek / Gamer / Rôliste",
    badge: "Univers & Passion",
    desc: "Tours à dés, dragons articulés, supports de manette et setup de bureau.",
    icon: Gamepad2,
  },
  {
    id: "stress-focus",
    title: "Proche Stressé / Focus / TDAH",
    badge: "Bien-être sensoriel",
    desc: "Clickers mécaniques ASMR, fidgets tactiles et objets haptiques apaisants.",
    icon: Brain,
  },
  {
    id: "kid-teen",
    title: "Enfant ou Adolescent",
    badge: "Ludique & Articulé",
    desc: "Créatures articulées flexibles, axolotls, dinosaures et mascottes pop.",
    icon: Smile,
  },
  {
    id: "deco-home",
    title: "Amateur de Déco & Design",
    badge: "Élégant & Utile",
    desc: "Vide-poches sculptés, porte-clés architecturés et curiosités de bureau.",
    icon: Home,
  },
  {
    id: "myself",
    title: "Pour moi-même !",
    badge: "Coup de cœur",
    desc: "Me faire plaisir avec une belle création d'atelier Spoolio imprimée en 3D.",
    icon: User,
  },
];

const BUDGET_OPTIONS: Array<{
  id: BudgetType;
  title: string;
  rangeLabel: string;
  desc: string;
}> = [
  {
    id: "under-10",
    title: "Petite Attention",
    rangeLabel: "Moins de 10 €",
    desc: "Idéal pour un Secret Santa malin, un porte-clé ou un fidget de poche.",
  },
  {
    id: "10-25",
    title: "Le Juste Équilibre",
    rangeLabel: "10 € à 25 €",
    desc: "Le format parfait : blind bags 3-6 créations, sculptures moyennes, clickers premium.",
  },
  {
    id: "25-50",
    title: "Le Beau Cadeau",
    rangeLabel: "25 € à 50 €",
    desc: "Grande créature articulée, tour à dés sculptée ou pack d'atelier complet.",
  },
  {
    id: "over-50",
    title: "Pack d'Exception",
    rangeLabel: "50 € et plus",
    desc: "Coffret collector d'atelier ou sélection multiple pour marquer le coup.",
  },
  {
    id: "any",
    title: "Sans Limite",
    rangeLabel: "Tous budgets",
    desc: "Surprenez-moi avec les meilleures créations de l'atelier sans restriction.",
  },
];

const UNIVERS_OPTIONS: Array<{
  id: UniversType;
  title: string;
  tag: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "art-toys",
    title: "Art Toys & Créatures",
    tag: "01 // FIGURINES",
    desc: "Dragons, animaux articulés et mascottes flexibles en PLA biosourcé.",
    icon: Sparkles,
  },
  {
    id: "tactile",
    title: "Tactile & Focus ASMR",
    tag: "02 // SENSORIEL",
    desc: "Clickers à switch mécanique, cubes haptiques et anneaux rotatifs.",
    icon: Brain,
  },
  {
    id: "desk-deco",
    title: "Desk Setup & Déco",
    tag: "03 // HABITAT",
    desc: "Vide-poches crâne, rangements stylisés et accessoires de bureau.",
    icon: Home,
  },
  {
    id: "tabletop",
    title: "Jeux & Tabletop",
    tag: "04 // JEUX",
    desc: "Tours à dés médiévales, pinces à cartes et accessoires rôlistes.",
    icon: Layers,
  },
  {
    id: "surprise",
    title: "Pochettes Mystères",
    tag: "05 // SURPRISE",
    desc: "Blind bags kraft scellés d'objets secrets pour le plaisir de l'unboxing.",
    icon: Gift,
  },
];

const VIBE_OPTIONS: Array<{
  id: VibeType;
  title: string;
  subtitle: string;
  desc: string;
  emoji: string;
}> = [
  {
    id: "wow",
    title: "Effet « Wouah ! »",
    subtitle: "Prouesse d'impression 3D",
    desc: "Une pièce articulée ou complexe qui fait dire : « Comment c'est imprimé en un seul bloc ?! »",
    emoji: "😲",
  },
  {
    id: "soothing",
    title: "Objet Apaisant & Anti-Stress",
    subtitle: "Bien-être au quotidien",
    desc: "Un geste tactile réconfortant qui occupe les mains et calme l'esprit.",
    emoji: "💆",
  },
  {
    id: "practical",
    title: "Utile & Malin",
    subtitle: "Fonctionnel & Durable",
    desc: "Un accessoire bien pensé qui trouvera immédiatement sa place sur le bureau ou les clés.",
    emoji: "🎯",
  },
  {
    id: "random",
    title: "Pleine Surprise",
    subtitle: "Carte blanche à l'Atelier",
    desc: "Laissez le Lutin d'Atelier sélectionner ses pépites favorites de la saison.",
    emoji: "🎲",
  },
];

function scoreProduct(p: Product, answers: QuizAnswers): number {
  let score = 0;
  const price = parseFloat(p.price || "0");
  const name = (p.name || "").toLowerCase();
  const desc = (p.short_description || p.description || "").toLowerCase();
  const cats = (p.categories || []).map((c) => (c.name || c.slug || "").toLowerCase()).join(" ");
  const text = `${name} ${desc} ${cats}`;

  // 1. Budget Score
  if (answers.budget === "under-10") {
    if (price <= 10.5) score += 35;
    else if (price <= 15) score -= 10;
    else score -= 45;
  } else if (answers.budget === "10-25") {
    if (price >= 9.5 && price <= 26) score += 35;
    else if (price < 9.5) score += 12;
    else score -= 30;
  } else if (answers.budget === "25-50") {
    if (price >= 24 && price <= 52) score += 35;
    else if (price >= 18) score += 12;
    else score -= 25;
  } else if (answers.budget === "over-50") {
    if (price >= 42) score += 35;
    else score += 5;
  } else {
    score += 15;
  }

  // 2. Recipient Score
  if (answers.recipient === "secret-santa") {
    if (price <= 12) score += 20;
    if (text.includes("porte-cl") || text.includes("clavier") || text.includes("blind") || text.includes("surprise")) {
      score += 30;
    }
  } else if (answers.recipient === "gamer-geek") {
    if (text.includes("tour") || text.includes("dragon") || text.includes("mecanique") || text.includes("carte") || text.includes("de ")) {
      score += 30;
    }
  } else if (answers.recipient === "stress-focus") {
    if (text.includes("fidget") || text.includes("clic") || text.includes("cube") || text.includes("sensoriel") || text.includes("bague")) {
      score += 30;
    }
  } else if (answers.recipient === "kid-teen") {
    if (text.includes("articul") || text.includes("animal") || text.includes("dragon") || text.includes("serpent") || text.includes("axolotl")) {
      score += 30;
    }
  } else if (answers.recipient === "deco-home") {
    if (text.includes("vide-poche") || text.includes("vase") || text.includes("bureau") || text.includes("deco") || text.includes("lampe")) {
      score += 30;
    }
  }

  // 3. Univers Score (multi-select)
  answers.univers.forEach((u) => {
    if (u === "art-toys" && (text.includes("articul") || text.includes("figurine") || text.includes("dragon") || text.includes("animal") || text.includes("serpent"))) {
      score += 22;
    }
    if (u === "tactile" && (text.includes("fidget") || text.includes("clavier") || text.includes("cube") || text.includes("clicker") || text.includes("anneau") || text.includes("twist"))) {
      score += 22;
    }
    if (u === "desk-deco" && (text.includes("vide-poche") || text.includes("vase") || text.includes("rangement") || text.includes("bureau") || text.includes("porte-cle"))) {
      score += 22;
    }
    if (u === "tabletop" && (text.includes("tour") || text.includes("dés") || text.includes("de ") || text.includes("carte") || text.includes("jeu") || text.includes("pince"))) {
      score += 22;
    }
    if (u === "surprise" && (text.includes("blind") || text.includes("pochette") || text.includes("surprise"))) {
      score += 35;
    }
  });

  // 4. Vibe Score
  if (answers.vibe === "wow") {
    if (text.includes("dragon") || text.includes("tour") || text.includes("articul") || text.includes("lampe")) {
      score += 20;
    }
  } else if (answers.vibe === "soothing") {
    if (text.includes("fidget") || text.includes("twist") || text.includes("cube") || text.includes("silencieux")) {
      score += 20;
    }
  } else if (answers.vibe === "practical") {
    if (text.includes("porte-cle") || text.includes("vide-poche") || text.includes("support") || text.includes("pince")) {
      score += 20;
    }
  } else if (answers.vibe === "random") {
    score += Math.floor(Math.random() * 15);
  }

  return score;
}

export default function TrouveurDeCadeauClient({ products }: TrouveurDeCadeauClientProps) {
  const { addToCart } = useCart();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    recipient: null,
    budget: null,
    univers: [],
    vibe: null,
  });

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Compute matched products
  const scoredResults = useMemo(() => {
    if (step < 5) return { spotlight: null, others: [] };

    // Clean valid products with positive price and images
    const valid = products.filter(
      (p) => parseFloat(p.price || "0") > 0 && p.images && p.images.length > 0
    );

    const scored = valid.map((p) => ({
      product: p,
      score: scoreProduct(p, answers),
    }));

    scored.sort((a, b) => b.score - a.score);

    const spotlight = scored[0]?.product || null;
    const others = scored.slice(1, 7).map((s) => s.product);

    return { spotlight, others };
  }, [step, products, answers]);

  // Trigger celebration confetti on results
  useEffect(() => {
    if (step === 5 && !isCalculating) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF5500", "#10B981", "#D97706", "#2563EB", "#18181B"],
        });
      } catch {
        // Fallback
      }
    }
  }, [step, isCalculating]);

  // Handle univers toggle
  const toggleUnivers = (key: UniversType) => {
    setAnswers((prev) => {
      const exists = prev.univers.includes(key);
      if (exists) {
        return { ...prev, univers: prev.univers.filter((u) => u !== key) };
      }
      return { ...prev, univers: [...prev.univers, key] };
    });
  };

  // Next step handler
  const handleNext = () => {
    if (step === 1 && !answers.recipient) return;
    if (step === 2 && !answers.budget) return;
    if (step === 3 && answers.univers.length === 0) return;

    if (step === 4) {
      setIsCalculating(true);
      setStep(5);
      setTimeout(() => {
        setIsCalculating(false);
      }, 450);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      recipient: null,
      budget: null,
      univers: [],
      vibe: null,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getRecipientLabel = () => {
    return RECIPIENT_OPTIONS.find((r) => r.id === answers.recipient)?.title || "Pour un proche";
  };

  const getBudgetLabel = () => {
    return BUDGET_OPTIONS.find((b) => b.id === answers.budget)?.rangeLabel || "Budget libre";
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-[family-name:var(--font-plus-jakarta)]">
      
      {/* HERO TITRE ÉDITORIAL NOËL */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LE LUTIN D&apos;ATELIER • GUIDE DE NOËL SPOOLIO</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)] mb-3">
          Trouveur de Cadeau 3D
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mx-auto">
          En panne d&apos;inspiration ? Répondez à 4 questions rapides pour dénicher le cadeau idéal
          façonné à la commande dans notre atelier de Comines.
        </p>
      </div>

      {/* QUESTIONNAIRE PROGRESS & CONTAINER */}
      {step < 5 && (
        <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col gap-8">
          
          {/* Header de progression */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E4E4E0]">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                Étape {step} sur 4
              </span>
            </div>

            <div className="w-48 h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-[#FF5500] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* ÉTAPE 1 : DESTINATAIRE */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                  Pour qui est ce cadeau de Noël ?
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Choisissez la personne à qui vous souhaitez faire plaisir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {RECIPIENT_OPTIONS.map((opt) => {
                  const isSelected = answers.recipient === opt.id;
                  const IconComp = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, recipient: opt.id }))}
                      className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/40 border-2 border-[#FF5500] shadow-sm ring-4 ring-[#FF5500]/10"
                          : "bg-white border-[#E4E4E0] hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-[#FF5500] text-white"
                                : "bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                          )}
                        </div>

                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          {opt.badge}
                        </span>
                        <h3 className="text-base font-bold text-zinc-950 mt-0.5 leading-snug">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 : BUDGET */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                  Quel est votre budget pour ce cadeau ?
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Nous adapterons les propositions aux tarifs de l&apos;atelier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = answers.budget === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, budget: opt.id }))}
                      className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/40 border-2 border-[#FF5500] shadow-sm ring-4 ring-[#FF5500]/10"
                          : "bg-white border-[#E4E4E0] hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                            {opt.title}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                          )}
                        </div>

                        <span className="text-xl font-extrabold font-[family-name:var(--font-antonio)] text-zinc-950 tracking-tight">
                          {opt.rangeLabel}
                        </span>

                        <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 : UNIVERS / CENTRES D'INTÉRÊT (MULTI-SÉLECTION) */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                    Quels univers lui correspondent le mieux ?
                  </h2>
                  <span className="text-xs font-mono font-semibold text-[#FF5500] hidden sm:inline">
                    Plusieurs choix possibles
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Sélectionnez un ou plusieurs domaines qui feront mouche sous le sapin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {UNIVERS_OPTIONS.map((opt) => {
                  const isSelected = answers.univers.includes(opt.id);
                  const IconComp = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleUnivers(opt.id)}
                      className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/40 border-2 border-[#FF5500] shadow-sm ring-4 ring-[#FF5500]/10"
                          : "bg-white border-[#E4E4E0] hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-[#FF5500] text-white"
                                : "bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                              isSelected
                                ? "bg-[#FF5500] border-[#FF5500] text-white"
                                : "border-zinc-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          {opt.tag}
                        </span>
                        <h3 className="text-base font-bold text-zinc-950 mt-0.5 leading-snug">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 4 : LE STYLE OU L'EFFET RECHERCHÉ */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                  Quel effet recherchez-vous pour ce cadeau ?
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Une dernière touche pour affiner la sélection du Lutin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {VIBE_OPTIONS.map((opt) => {
                  const isSelected = answers.vibe === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, vibe: opt.id }))}
                      className={`relative p-5 rounded-2xl border transition-all text-left flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/40 border-2 border-[#FF5500] shadow-sm ring-4 ring-[#FF5500]/10"
                          : "bg-white border-[#E4E4E0] hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <span className="text-3xl shrink-0 pt-0.5">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                            {opt.subtitle}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-zinc-950 leading-snug">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* BARRE D'ACTIONS INFÉRIEURE */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E4E4E0]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="py-3 px-5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !answers.recipient) ||
                (step === 2 && !answers.budget) ||
                (step === 3 && answers.univers.length === 0)
              }
              className="py-3.5 px-7 rounded-2xl bg-[#FF5500] hover:bg-[#ff4400] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_8px_25px_rgba(255,85,0,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{step === 4 ? "Découvrir mes cadeaux 🎁" : "Continuer"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* RÉSULTATS DU TROUVEUR DE CADEAU */}
      {step === 5 && (
        <div className="flex flex-col gap-10">
          
          {/* BARRE DE RAPPEL DES CRITÈRES ET BOUTON RESET */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-zinc-500 mr-1">
                Critères choisis :
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-bold">
                {getRecipientLabel()}
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-xs font-bold">
                {getBudgetLabel()}
              </span>
              {answers.univers.map((u) => (
                <span
                  key={u}
                  className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium"
                >
                  {UNIVERS_OPTIONS.find((opt) => opt.id === u)?.title}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Modifier</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2 px-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partager</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ANIMATION DE CHARGEMENT EXPRESS */}
          {isCalculating && (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5500] border border-orange-200 flex items-center justify-center animate-bounce">
                <Gift className="w-6 h-6" />
              </div>
              <span className="font-mono text-sm text-zinc-700 font-bold uppercase tracking-wider">
                Le Lutin d&apos;Atelier explore les créations de Comines...
              </span>
            </div>
          )}

          {!isCalculating && scoredResults.spotlight && (
            <>
              {/* ========================================================================= */}
              {/* LE COUP DE CŒUR N°1 DU LUTIN (HERO SPOTLIGHT)                            */}
              {/* ========================================================================= */}
              <div className="bg-white border-2 border-[#FF5500]/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_10px_35px_rgba(255,85,0,0.08)] relative overflow-hidden">
                
                <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-[#FF5500] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Choix Idéal du Lutin</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Photo Produit Spotlight */}
                  <div className="md:col-span-5 relative w-full h-64 sm:h-72 rounded-2xl bg-zinc-50 border border-[#E4E4E0] p-4 flex items-center justify-center overflow-hidden">
                    <Link
                      href={`/product/${scoredResults.spotlight.slug}`}
                      className="relative w-full h-full flex items-center justify-center group"
                    >
                      <Image
                        src={
                          scoredResults.spotlight.images?.[0]?.src ||
                          "/images/figma_keychains.jpg"
                        }
                        alt={scoredResults.spotlight.name}
                        width={400}
                        height={400}
                        className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
                        priority
                      />
                    </Link>
                  </div>

                  {/* Détails Produit Spotlight */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        {scoredResults.spotlight.categories?.[0]?.name || "Création Spoolio"}
                      </span>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-[family-name:var(--font-antonio)] uppercase tracking-tight mt-1">
                        <Link
                          href={`/product/${scoredResults.spotlight.slug}`}
                          className="hover:text-[#FF5500] transition-colors"
                        >
                          {scoredResults.spotlight.name}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-zinc-600 mt-2 line-clamp-3 leading-relaxed">
                        {scoredResults.spotlight.short_description?.replace(/<[^>]+>/g, "") ||
                          "Création artisanale imprimée en 3D à Comines en PLA biosourcé."}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 text-xs text-zinc-800 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span>
                        Parfait pour un cadeau <strong>{getRecipientLabel()}</strong> dans un budget{" "}
                        <strong>{getBudgetLabel()}</strong>.
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <span className="text-3xl font-extrabold font-[family-name:var(--font-antonio)] text-zinc-950 tracking-tight">
                        {parseFloat(scoredResults.spotlight.price || "0").toFixed(2)} €
                      </span>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/product/${scoredResults.spotlight.slug}`}
                          className="py-3.5 px-5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-900 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                          Voir la fiche
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            if (scoredResults.spotlight) {
                              addToCart(
                                {
                                  productId: scoredResults.spotlight.id,
                                  name: scoredResults.spotlight.name,
                                  slug: scoredResults.spotlight.slug,
                                  price: scoredResults.spotlight.price,
                                  selectedOptions: {},
                                  image:
                                    scoredResults.spotlight.images?.[0]?.src ||
                                    "/images/figma_keychains.jpg",
                                },
                                1,
                                true
                              );
                            }
                          }}
                          className="py-3.5 px-6 rounded-xl bg-[#FF5500] hover:bg-[#ff4400] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_8px_20px_rgba(255,85,0,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Ajouter au panier</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* ========================================================================= */}
              {/* LA GRILLE DES ALTERNATIVES PARFAITES                                     */}
              {/* ========================================================================= */}
              {scoredResults.others.length > 0 && (
                <div className="flex flex-col gap-6 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E0]">
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                        D&apos;autres pépites qui correspondent à vos critères
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                        Découvrez ces créations complémentaires fabriquées dans notre atelier.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scoredResults.others.map((p, idx) => (
                      <ProductCard key={p.id || idx} product={p} priority={idx < 3} />
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BANDEAU SPÉCIAL BLIND BAGS SUR-MESURE                                     */}
              {/* ========================================================================= */}
              <div className="bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5500] border border-orange-200 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950 font-[family-name:var(--font-antonio)]">
                      Vous hésitez encore ? Offrez une Pochette Mystère Kraft !
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl leading-relaxed">
                      Laissez faire la magie de l&apos;Atelier avec notre Blind Bag kraft scellé : 3, 6
                      ou 10 objets 3D surprises à doser selon vos envies (dès 10 €).
                    </p>
                  </div>
                </div>

                <Link
                  href="/blind-bags"
                  className="py-3.5 px-6 rounded-2xl bg-zinc-950 hover:bg-[#FF5500] text-white font-extrabold text-xs uppercase tracking-wider shrink-0 transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <span>Composer ma pochette</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* RÉASSURANCES D'ATELIER EN PIED DE PAGE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E4E4E0] text-center text-zinc-600">
                <div className="p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#FF5500]" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                    100% Végétal
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Imprimé en PLA biosourcé issu d&apos;amidon de maïs.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5500]" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                    Atelier à Comines
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Fabrication artisanale dans le Nord de la France (59560).
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E4E4E0] shadow-2xs flex flex-col items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                    Expédition Soignée
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Emballage sécurisé avec suivi et garantie satisfaction.
                  </span>
                </div>
              </div>

            </>
          )}

        </div>
      )}

    </div>
  );
}
