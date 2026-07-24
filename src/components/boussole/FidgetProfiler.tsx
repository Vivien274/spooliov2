'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, ArrowLeft, RotateCcw, Brain, ShieldAlert, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { FidgetProduct } from '@/types/boussole';

interface FidgetProfilerProps {
  products: FidgetProduct[];
}

interface QuizAnswers {
  profile: 'tdah' | 'anxiety' | 'autism' | 'focus' | null;
  context: 'silent' | 'free' | 'nomad' | null;
  gesture: 'click' | 'flow' | 'touch' | 'solve' | null;
}

const profileOptions = [
  {
    id: 'tdah' as const,
    title: '🧠 TDAH / Hyperactivité',
    desc: 'Besoin de canaliser un surplus moteur, de bouger les mains pour rester attentif.'
  },
  {
    id: 'anxiety' as const,
    title: '🌿 Stress / Anxiété',
    desc: 'Besoin de réconfort tactile pour évacuer les tensions ou apaiser le stress.'
  },
  {
    id: 'autism' as const,
    title: '🌀 Autisme / Stimming',
    desc: 'Autostimulation sensorielle répétitive, régulation en cas de surcharge cognitive.'
  },
  {
    id: 'focus' as const,
    title: '🎯 DYS / Concentration',
    desc: 'Besoin d\'un ancrage physique discret pour rester focus lors de tâches passives.'
  }
];

const contextOptions = [
  {
    id: 'silent' as const,
    title: '🏫 Classe / Bureau',
    desc: 'Silence total exigé. Pas de bruit mécanique pour respecter ton entourage.'
  },
  {
    id: 'free' as const,
    title: '🏠 Maison / Solo',
    desc: 'Bruit libre ! Clics francs et engrenages audibles ne posent aucun problème.'
  },
  {
    id: 'nomad' as const,
    title: '🚌 Transports / Voyage',
    desc: 'Format compact et discret requis, facile à transporter dans la poche.'
  }
];

const gestureOptions = [
  {
    id: 'click' as const,
    title: '🎯 Cliquer',
    desc: 'Boutons poussoirs, touches, sensation d\'activation mécanique instantanée.'
  },
  {
    id: 'flow' as const,
    title: '🐍 Manipuler',
    desc: 'Mouvements fluides, articulations souples, rotations et torsions infinies.'
  },
  {
    id: 'touch' as const,
    title: '🌊 Caresser',
    desc: 'Sensations de frottement, pics d\'acupression ou textures en relief.'
  },
  {
    id: 'solve' as const,
    title: '🧩 Résoudre',
    desc: 'Engrenages imbriqués, mini-casse-têtes mécaniques de concentration.'
  }
];

const profileBadges = {
  tdah: {
    title: "Le Canalisateur Tactile",
    desc: "Ton cerveau a besoin d'un mouvement de fond pour libérer l'hyperactivité motrice et ancrer l'attention. Les fidgets articulés ou mécaniques sont tes meilleurs alliés."
  },
  anxiety: {
    title: "L'Apaisé Sensoriel",
    desc: "Tu cherches un refuge tactile et un rythme pour calmer ton système nerveux. Privilégie les textures douces, les pics d'acupression et les pressions rassurantes."
  },
  autism: {
    title: "L'Harmonisé en Stimming",
    desc: "Le stimming t'aide à te réguler et à éviter les surcharges. Les mouvements géométriques infinis et les retours sensoriels réguliers sont idéaux."
  },
  focus: {
    title: "Le Focaliseur Ancré",
    desc: "Ton focus augmente quand tes doigts ont une occupation discrète et automatique. Les objets silencieux de poche te permettront de rester dans ta zone."
  }
};

export default function FidgetProfiler({ products }: FidgetProfilerProps) {
  const [step, setStep] = useState<number>(0); // 0 = start/intro, 1 = profile, 2 = context, 3 = gesture, 4 = results
  const [answers, setAnswers] = useState<QuizAnswers>({
    profile: null,
    context: null,
    gesture: null,
  });

  const handleSelectProfile = (profileId: QuizAnswers['profile']) => {
    setAnswers(prev => ({ ...prev, profile: profileId }));
    setStep(2);
  };

  const handleSelectContext = (contextId: QuizAnswers['context']) => {
    setAnswers(prev => ({ ...prev, context: contextId }));
    setStep(3);
  };

  const handleSelectGesture = (gestureId: QuizAnswers['gesture']) => {
    setAnswers(prev => ({ ...prev, gesture: gestureId }));
    setStep(4);
  };

  const handleReset = () => {
    setAnswers({ profile: null, context: null, gesture: null });
    setStep(1);
  };

  // Score calculation for recommendations
  const getRecommendations = () => {
    if (!answers.profile) return [];

    return products.map(product => {
      let score = 0;
      let matchReasons: string[] = [];

      // 1. Profile Match
      if (answers.profile && product.profiles.includes(answers.profile)) {
        score += 40;
        matchReasons.push("Conçu pour ton profil");
      }

      // 2. Context Match
      if (answers.context === 'silent') {
        if (product.noiseLevel === 'silent') {
          score += 30;
          matchReasons.push("100% Silencieux (Idéal classe/bureau)");
        } else if (product.noiseLevel === 'low') {
          score += 15;
          matchReasons.push("Bruit très faible");
        } else {
          score -= 25;
        }
      } else if (answers.context === 'nomad') {
        if (product.size === 'pocket') {
          score += 30;
          matchReasons.push("Format poche facile à emporter");
        }
      } else if (answers.context === 'free') {
        score += 20;
      }

      // 3. Gesture Category Match
      const gestureCategoryMap = {
        click: 'cliquer',
        flow: 'manipuler',
        touch: 'caresser',
        solve: 'resoudre'
      };

      if (answers.gesture && product.category === gestureCategoryMap[answers.gesture]) {
        score += 30;
        matchReasons.push("Correspond à ton geste préféré");
      }

      return {
        product,
        score,
        reason: matchReasons.length > 0 ? matchReasons.join(" • ") : "Recommandé pour ton besoin"
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  };

  const recommendations = getRecommendations();
  const currentBadge = answers.profile ? profileBadges[answers.profile] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-8">
      {/* Intro Card */}
      {step === 0 && (
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIAGNOSTIC SUR-MESURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase font-[family-name:var(--font-antonio)] text-neutral-900 dark:text-white mb-4">
            Trouve ton Fidget Idéal en 3 questions 🧭
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed font-[family-name:var(--font-plus-jakarta)]">
            Tu ne sais pas quel objet sensoriel choisir pour tes besoins ? Réponds à ces 3 questions simples et notre Boussole ciblera exactement les 3 fidgets les plus adaptés à ton profil.
          </p>

          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl bg-[#FF5500] hover:bg-[#ff661a] text-black font-extrabold text-base uppercase tracking-wider shadow-lg hover:shadow-[#FF5500]/25 transition-all cursor-pointer active:scale-95 border border-amber-300"
          >
            <span>Démarrer le Test (30 secondes)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-[#FF5500]">ÉTAPE 1 / 3</span>
            <span className="text-xs text-neutral-500 font-bold">Ton besoin principal</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quel est ton besoin ou ton profil sensoriel ?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectProfile(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#FF5500] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#FF5500] transition-colors mb-1">
                  {opt.title}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Context */}
      {step === 2 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(1)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-[#FF5500]">ÉTAPE 2 / 3</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Dans quel contexte vas-tu utiliser ton fidget ?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contextOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectContext(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#FF5500] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#FF5500] transition-colors mb-1">
                  {opt.title}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Gesture */}
      {step === 3 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-[#FF5500]">ÉTAPE 3 / 3</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quel geste te détend le plus les mains ?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gestureOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectGesture(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#FF5500] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#FF5500] transition-colors mb-1">
                  {opt.title}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-[#00FF66]">DIAGNOSTIC COMPLÉTÉ ✅</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> recommencer
            </button>
          </div>

          {/* Profile Summary Badge */}
          {currentBadge && (
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-[#FF5500]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#FF5500] font-bold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>Ton Profil : {currentBadge.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {currentBadge.desc}
              </p>
            </div>
          )}

          {/* Top 3 Product Recommendations */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>🎯 Vos 3 Fidgets les plus compatibles :</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map(({ product, reason }) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4 flex flex-col justify-between space-y-4 hover:border-[#FF5500] transition-all"
                >
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-950">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#FF5500] text-black font-extrabold text-xs">
                      {product.price}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-base text-neutral-900 dark:text-white leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{reason}</span>
                  </div>

                  {/* Fixed product CTA route to SpoolioV2 product page */}
                  <Link
                    href={`/product/${product.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all border border-amber-300"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Personnaliser &amp; Acheter</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
