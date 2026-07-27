'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, ArrowLeft, RotateCcw, Sparkles, CheckCircle2, Download, Share2, Check, Brain, Sliders, Volume2, Gamepad2, Package } from 'lucide-react';
import { FidgetProduct } from '@/types/boussole';

interface FidgetProfilerProps {
  products: FidgetProduct[];
}

interface QuizAnswers {
  profile: 'tdah' | 'anxiety' | 'autism' | 'focus' | 'overload' | null;
  intensity: number; // 1 to 10 scale
  context: 'silent' | 'low' | 'free' | null;
  gesture: 'click' | 'flow' | 'touch' | 'solve' | null;
  usage: 'pocket' | 'desk' | 'dual' | null;
}

const profileOptions = [
  {
    id: 'tdah' as const,
    title: '🧠 TDAH / Hyperactivité',
    desc: 'Besoin de canaliser un surplus moteur et d\'occuper les mains pour maintenir la concentration.'
  },
  {
    id: 'anxiety' as const,
    title: '🌿 Stress & Anxiété',
    desc: 'Besoin d\'un réconfort tactile régulier pour apaiser le système nerveux et libérer les tensions.'
  },
  {
    id: 'autism' as const,
    title: '🌀 Autisme & Stimming',
    desc: 'Autostimulation sensorielle répétitive et régulation rapide en cas de surcharge cognitive.'
  },
  {
    id: 'focus' as const,
    title: '🎯 DYS & Concentration',
    desc: 'Besoin d\'un ancrage physique automatique et discret lors d\'écoutes passives ou de cours.'
  },
  {
    id: 'overload' as const,
    title: '⚡ Surcharge Sensorielle',
    desc: 'Besoin de recentrage tactile pour isoler le cerveau des stimuli environnementaux trop intenses.'
  }
];

const contextOptions = [
  {
    id: 'silent' as const,
    title: '🤫 100% Inaudible (Silence total)',
    desc: 'Exigé pour les classes, examens ou réunions strictes. Aucun clic mécanique audible.'
  },
  {
    id: 'low' as const,
    title: '🎧 Murmure discret (Bureau / Open-space)',
    desc: 'Tolère les bruits de frottements ou roulements très faibles sans déranger la pièce.'
  },
  {
    id: 'free' as const,
    title: '💥 Clics & Sons Francs (Maison / Solo)',
    desc: 'Liberté totale ! Les clics métalliques satisfaisants et engrenages audibles sont bienvenus.'
  }
];

const gestureOptions = [
  {
    id: 'click' as const,
    title: '🎯 Clics Poussoirs & Boutons',
    desc: 'Interrupteurs tactiles, switches mécaniques, sensation d\'activation binaire nette.'
  },
  {
    id: 'flow' as const,
    title: '🐍 Mouvements Articulés & Fluides',
    desc: 'Torsions géométriques, chaînes serpentines, manipulations infinies à une ou deux mains.'
  },
  {
    id: 'touch' as const,
    title: '🌊 Textures & Picots d\'Acupression',
    desc: 'Frottements de surfaces en relief, picots stimulants pour le bout des doigts.'
  },
  {
    id: 'solve' as const,
    title: '🧩 Engrenages & Mini Casse-têtes',
    desc: 'Rouages mécaniques synchronisés pour combiner réflexion et mouvement répétitif.'
  }
];

const usageOptions = [
  {
    id: 'pocket' as const,
    title: '🎒 Format Poche & Porte-clés',
    desc: 'Ultra compact, se glisse discrètement dans la poche ou s\'accroche au sac à dos.'
  },
  {
    id: 'desk' as const,
    title: '🖥️ Format Bureau & Table de travail',
    desc: 'Taille optimale pour être posé à côté du clavier ou du cahier sans encombrer.'
  },
  {
    id: 'dual' as const,
    title: '🤲 Format Immersif à Deux Mains',
    desc: 'Prise en main généreuse pour un apaisement physique complet.'
  }
];

const profileBadges = {
  tdah: {
    title: "Le Canalisateur Tactile",
    desc: "Ton cerveau a besoin d'un mouvement de fond continu pour libérer l'hyperactivité motrice et fixer ton attention. Les fidgets articulés et mécaniques sont faits pour toi.",
    stats: { motor: 92, noise: 45, focus: 88 }
  },
  anxiety: {
    title: "L'Apaisé Sensoriel",
    desc: "Tu cherches un ancrage tactile rassurant pour réguler les pics de stress. Les textures douces et les pressions régulières réconfortent ton système nerveux.",
    stats: { motor: 62, noise: 90, focus: 82 }
  },
  autism: {
    title: "L'Harmonisé en Stimming",
    desc: "Le stimming tactile te permet de réguler les surcharges et de structurer ton énergie. Les mouvements géométriques infinis sont tes meilleurs régulateurs.",
    stats: { motor: 84, noise: 85, focus: 78 }
  },
  focus: {
    title: "Le Focaliseur Ancré",
    desc: "Ton niveau d'attention augmente dès que tes doigts réalisent un mouvement automatique discret. Les objets silencieux de poche t'assurent un focus maximal.",
    stats: { motor: 72, noise: 96, focus: 96 }
  },
  overload: {
    title: "Le Régulateur de Surcharge",
    desc: "Tu utilises le toucher pour filtrer les pollutions auditives ou visuelles extérieures. Les objets à retours tactiles nets agissent comme un bouclier amovible.",
    stats: { motor: 80, noise: 88, focus: 90 }
  }
};

export default function FidgetProfiler({ products }: FidgetProfilerProps) {
  const [step, setStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    profile: null,
    intensity: 5,
    context: null,
    gesture: null,
    usage: null,
  });

  const handleSelectProfile = (profileId: QuizAnswers['profile']) => {
    setAnswers(prev => ({ ...prev, profile: profileId }));
    setStep(2);
  };

  const handleSelectContext = (contextId: QuizAnswers['context']) => {
    setAnswers(prev => ({ ...prev, context: contextId }));
    setStep(4);
  };

  const handleSelectGesture = (gestureId: QuizAnswers['gesture']) => {
    setAnswers(prev => ({ ...prev, gesture: gestureId }));
    setStep(5);
  };

  const handleSelectUsage = (usageId: QuizAnswers['usage']) => {
    setAnswers(prev => ({ ...prev, usage: usageId }));
    setStep(6);
  };

  const handleReset = () => {
    setAnswers({ profile: null, intensity: 5, context: null, gesture: null, usage: null });
    setStep(1);
  };

  const getRecommendations = () => {
    if (!answers.profile) return [];

    return products.map(product => {
      let rawScore = 0;
      let matchReasons: string[] = [];

      // 1. Profile match (35 pts)
      if (answers.profile && product.profiles.includes(answers.profile as any)) {
        rawScore += 35;
        matchReasons.push("Conçu pour ton profil principal");
      }

      // 2. Intensity match (20 pts)
      if (answers.intensity <= 4) {
        if (product.noiseLevel === 'silent' || product.category === 'caresser') {
          rawScore += 20;
          matchReasons.push("Stimulation douce et apaisante");
        }
      } else if (answers.intensity >= 8) {
        if (product.category === 'cliquer' || product.category === 'manipuler') {
          rawScore += 20;
          matchReasons.push("Canalisation moteur haute fréquence");
        }
      } else {
        rawScore += 15;
      }

      // 3. Noise level match (20 pts)
      if (answers.context === 'silent') {
        if (product.noiseLevel === 'silent') {
          rawScore += 20;
          matchReasons.push("100% Inaudible (Idéal classe)");
        } else if (product.noiseLevel === 'low') {
          rawScore += 10;
          matchReasons.push("Niveau sonore très faible");
        } else {
          rawScore -= 15;
        }
      } else if (answers.context === 'low') {
        if (product.noiseLevel === 'silent' || product.noiseLevel === 'low') {
          rawScore += 20;
          matchReasons.push("Discret pour le bureau / open-space");
        }
      } else {
        rawScore += 15;
        matchReasons.push("Clics satisfaisants autorisés");
      }

      // 4. Mechanism match (15 pts)
      if (answers.gesture) {
        const cat = product.category;
        if (
          (answers.gesture === 'click' && (cat === 'cliquer' || cat === 'presser')) ||
          (answers.gesture === 'flow' && (cat === 'manipuler' || cat === 'tourner')) ||
          (answers.gesture === 'touch' && (cat === 'caresser' || cat === 'presser')) ||
          (answers.gesture === 'solve' && (cat === 'resoudre' || cat === 'tourner'))
        ) {
          rawScore += 15;
          matchReasons.push("Correspond à ton geste préféré");
        }
      }

      // 5. Size match (10 pts)
      if (answers.usage === 'pocket' && product.size === 'pocket') {
        rawScore += 10;
        matchReasons.push("Format poche / nomad");
      } else if (answers.usage === 'desk' && (product.size === 'medium' || product.size === 'large')) {
        rawScore += 10;
        matchReasons.push("Format idéal sur la table");
      } else {
        rawScore += 5;
      }

      const matchPercentage = Math.min(99, Math.max(84, Math.round((rawScore / 100) * 100)));

      return {
        product,
        matchPercentage,
        reason: matchReasons.length > 0 ? matchReasons.slice(0, 2).join(" • ") : "Recommandé pour tes besoins"
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
  };

  const recommendations = getRecommendations();
  const currentBadge = answers.profile ? profileBadges[answers.profile] : null;

  // Download Profile Card Image PNG
  const handleDownloadCard = () => {
    if (!currentBadge) return;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark Card Background
    const grad = ctx.createLinearGradient(0, 0, 800, 460);
    grad.addColorStop(0, '#0d0e12');
    grad.addColorStop(1, '#1a1c24');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 460);    // Header Badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SPOOLIO 3D • CARTE PROFIL SENSORIEL', 40, 50);

    // Profile Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(currentBadge.title, 40, 100);

    // Description text (Multi-line word wrap without truncation)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';

    const words = currentBadge.desc.split(' ');
    let line = '';
    let currentY = 135;
    const maxWidth = 720;
    const lineHeight = 20;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 40, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 40, currentY);

    // Progress Bars
    const drawBar = (label: string, pct: number, y: number, color: string) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${label} : ${pct}%`, 40, y);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, y + 10, 720, 14);

      ctx.fillStyle = color;
      ctx.fillRect(40, y + 10, (720 * pct) / 100, 14);
    };

    drawBar('Canal Moteur & Mouvement', currentBadge.stats.motor, 195, '#005cff');
    drawBar('Discrétion Acoustique & Silence', currentBadge.stats.noise, 260, '#ec4899');
    drawBar('Focus & Ancrage Cognitif', currentBadge.stats.focus, 325, '#fbbf24');

    // Footer Info
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Boussole Sensorielle Spoolio.fr • Fidgets 3D Biosourcés Fabriqués à Comines 🇫🇷', 40, 415);

    const link = document.createElement('a');
    link.download = `Carte-Profil-Spoolio-${answers.profile}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyProfile = () => {
    if (!currentBadge) return;
    const text = `Mon Profil Sensoriel Spoolio : ${currentBadge.title}\n"${currentBadge.desc}"\n\nDécouvre ton fidget idéal sur Spoolio.fr/boussole-sensorielle ! 🧭`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-8">
      {/* Intro Hero Card */}
      {step === 0 && (
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005cff]/15 border border-[#005cff]/30 text-[#005cff] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BILAN SENSORIEL DE PRÉCISION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase font-[family-name:var(--font-antonio)] text-neutral-900 dark:text-white leading-tight">
            Diagnostic Sensoriel Sur-Mesure 🧭
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Réponds à nos 5 questions ciblées (profil, intensité moteur, acoustique, mécanisme et format) pour cibler précisément tes 3 objets 3D les plus compatibles.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl bg-[#005cff] hover:bg-[#004ecc] text-white font-extrabold text-base uppercase tracking-wider shadow-lg hover:shadow-[#005cff]/25 transition-all cursor-pointer active:scale-95 border border-blue-400"
            >
              <span>Démarrer le Diagnostic (5 questions)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Profil / Besoin */}
      {step === 1 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ÉTAPE 1 / 5</span>
            <span className="text-xs text-neutral-400 font-bold">Profil &amp; Surcharge</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <span>Quel est ton besoin ou ton profil principal ?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectProfile(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#005cff] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#005cff] transition-colors mb-1">
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

      {/* Step 2: Slider Intensité Moteur */}
      {step === 2 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(1)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ÉTAPE 2 / 5</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-white" />
              <span>Quelle intensité de mouvement te faut-il ?</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Ajuste le curseur selon le besoin d'énergie moteur dans tes mains.
            </p>
          </div>

          <div className="space-y-6 py-4 px-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-400">Intensité sélectionnée :</span>
              <span className="text-xl font-black font-mono text-white">{answers.intensity} / 10</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={answers.intensity}
              onChange={(e) => setAnswers(prev => ({ ...prev, intensity: parseInt(e.target.value, 10) }))}
              className="w-full accent-[#005cff] h-3 bg-neutral-800 rounded-lg cursor-pointer"
            />

            <div className="text-xs text-neutral-300 font-medium italic text-center min-h-[40px] flex items-center justify-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              {answers.intensity <= 3 && "🟢 1-3 : Pressions très douces et glissements subtils (Calme & Discrétion)"}
              {answers.intensity >= 4 && answers.intensity <= 7 && "🟡 4-7 : Retours fermes & mouvements articulés réguliers (Équilibre)"}
              {answers.intensity >= 8 && "🔴 8-10 : Canalisation intense haute fréquence (Besoin moteur fort)"}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-4 px-6 rounded-2xl bg-[#005cff] hover:bg-[#004ecc] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-blue-400"
          >
            <span>Valider l'Intensité</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 3: Contrainte Sonore */}
      {step === 3 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ÉTAPE 3 / 5</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-white" />
            <span>Quelle est ton exigence de niveau sonore ?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contextOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectContext(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#005cff] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#005cff] transition-colors mb-1">
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

      {/* Step 4: Mécanisme Tactile Préféré */}
      {step === 4 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(3)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ÉTAPE 4 / 5</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-white" />
            <span>Quel type de sensation tactile te détend le plus ?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gestureOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectGesture(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#005cff] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#005cff] transition-colors mb-1">
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

      {/* Step 5: Format & Usage */}
      {step === 5 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button onClick={() => setStep(4)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">ÉTAPE 5 / 5</span>
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-white" />
            <span>Quel format d'objet préfères-tu ?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {usageOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelectUsage(opt.id)}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-[#005cff] text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group"
              >
                <div className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-[#005cff] transition-colors mb-1">
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

      {/* Step 6: Full Results & Certificate */}
      {step === 6 && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#131316] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-emerald-400">DIAGNOSTIC 100% COMPLÉTÉ ✅</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recommencer
            </button>
          </div>

          {/* Official Spoolio Profile Card */}
          {currentBadge && (
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#0d0e12] to-[#1a1c24] border border-[#005cff]/40 p-6 sm:p-8 shadow-2xl text-white overflow-hidden space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-xs tracking-widest uppercase font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Carte Profil Sensoriel Officiel Spoolio</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">ID: #{answers.profile?.toUpperCase()}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {currentBadge.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  {currentBadge.desc}
                </p>
              </div>

              {/* Progress bars / Trait breakdown */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400">Canal Moteur &amp; Mouvement</span>
                    <span className="text-[#005cff] font-mono">{currentBadge.stats.motor}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-[#005cff] rounded-full transition-all duration-1000" style={{ width: `${currentBadge.stats.motor}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400">Discrétion Acoustique &amp; Silence</span>
                    <span className="text-pink-400 font-mono">{currentBadge.stats.noise}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${currentBadge.stats.noise}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-400">Focus &amp; Ancrage Cognitif</span>
                    <span className="text-amber-400 font-mono">{currentBadge.stats.focus}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${currentBadge.stats.focus}%` }} />
                  </div>
                </div>
              </div>

              {/* Action buttons: Download & Copy */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-neutral-400 italic">
                  Fabriqué en France à Comines en plastique biosourcé 🇫🇷
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyProfile}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Copié !' : 'Partager'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCard}
                    className="px-4 py-2.5 rounded-xl bg-[#005cff] hover:bg-[#004ecc] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer border border-blue-400"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger la Carte (PNG)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Product Recommendations */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-between gap-2">
              <span>🎯 Vos 3 Fidgets les plus compatibles :</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map(({ product, matchPercentage, reason }) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-4 flex flex-col justify-between space-y-4 hover:border-[#005cff] transition-all relative overflow-hidden"
                >
                  {/* Top Match Badge */}
                  <div className="absolute top-6 left-6 z-10 px-2.5 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                    {matchPercentage}% MATCH
                  </div>

                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-950">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#005cff] text-white font-extrabold text-xs shadow-md">
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

                  <Link
                    href={`/product/${product.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-[#005cff] hover:bg-[#004ecc] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all border border-blue-400"
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
