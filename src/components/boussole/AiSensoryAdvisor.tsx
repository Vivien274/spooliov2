"use client";

import { useState } from "react";
import { Sparkles, Send, RefreshCw, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { FidgetProduct } from "@/types/boussole";

interface AiSensoryAdvisorProps {
  products: FidgetProduct[];
  onRecommend: (slugs: string[]) => void;
  onResetFilter: () => void;
}

const QUICK_PROMPTS = [
  { emoji: "🤫", text: "Je cherche un fidget 100% silencieux pour les cours ou le bureau." },
  { emoji: "⚡", text: "J'ai besoin de libérer beaucoup d'énergie manuelle et de cliquer." },
  { emoji: "🧩", text: "Je veux un objet hyper satisfaisant avec différentes textures tactiles." },
  { emoji: "🎯", text: "Un accessoire pour m'aider à garder les doigts occupés pendant les révisions." },
  { emoji: "🧡", text: "Un objet tactile apaisant et ludique pour garder les mains occupées." },
];

export default function AiSensoryAdvisor({
  products,
  onRecommend,
  onResetFilter,
}: AiSensoryAdvisorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    advice: string;
    recommendedSlugs: string[];
  } | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || prompt;
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const formattedCatalog = products.map((p) => ({
        name: p.name,
        slug: p.slug || p.id,
        category: p.category,
        description: p.description,
        noiseLevel: p.noiseLevel,
        profiles: p.profiles,
      }));

      const res = await fetch("/api/boussole/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          products: formattedCatalog,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          advice: data.advice,
          recommendedSlugs: data.recommendedSlugs || [],
        });
        if (data.recommendedSlugs && data.recommendedSlugs.length > 0) {
          onRecommend(data.recommendedSlugs);
        }
      } else {
        setError(data.error || "Une erreur est survenue lors de l'analyse.");
      }
    } catch (err: any) {
      setError("Impossible de contacter le conseiller IA. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setResult(null);
    setError(null);
    onResetFilter();
  };

  return (
    <div className="relative rounded-3xl bg-white border border-[#E4E4E0] p-6 sm:p-8 shadow-sm overflow-hidden my-8 select-none">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-neutral-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-[11px] font-bold uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
            Conseiller Tactile Intelligent
          </span>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-semibold ml-auto transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#121212] tracking-tight uppercase">
          Décris ton besoin ou les sensations recherchées 🧭
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl font-medium">
          L&apos;assistant Spoolio analyse vos préférences de manipulation pour identifier les créations d&apos;atelier les plus adaptées (bureau, réunion, concentration prolongée).
        </p>
      </div>

      {/* Quick Suggestion Pills */}
      {!result && !loading && (
        <div className="relative z-10 flex flex-wrap gap-2 mb-6">
          <span className="w-full text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono">
            Exemples de manipulations :
          </span>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(item.text);
                handleSubmit(undefined, item.text);
              }}
              className="px-3.5 py-2 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold transition-all duration-200 text-left flex items-center gap-2 cursor-pointer group hover:border-neutral-300 shadow-2xs"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      {!result && (
        <form onSubmit={(e) => handleSubmit(e)} className="relative z-10 space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: J'ai besoin d'un objet très discret sous le bureau pour m'occuper les mains sans déranger mes collègues..."
              disabled={loading}
              className="w-full p-4 pr-14 rounded-2xl bg-[#FAFAFA] text-neutral-900 placeholder-neutral-400 text-sm border border-neutral-200 focus:outline-none focus:border-[#FF5500] focus:bg-white shadow-2xs transition-colors resize-none font-sans"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`absolute right-3 bottom-4 p-3 rounded-xl bg-[#FF5500] text-white transition-all shadow-md cursor-pointer ${
                loading || !prompt.trim() ? "opacity-40 cursor-not-allowed" : "hover:bg-[#E04B00] hover:scale-105 active:scale-95"
              }`}
              title="Lancer l'analyse tactile"
            >
              {loading ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Loading Animation State */}
      {loading && (
        <div className="relative z-10 p-8 rounded-2xl bg-[#FAF9F6] border border-orange-200 text-center space-y-3 animate-pulse my-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF5500] flex items-center justify-center text-white text-xl shadow-md">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
            Analyse de vos préférences tactiles en cours...
          </h4>
          <p className="text-xs text-neutral-600 font-medium">
            Sélection des créations Spoolio compatibles.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 my-4 font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display Box */}
      {result && (
        <div className="relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-neutral-200 text-neutral-800 text-sm leading-relaxed space-y-3 font-sans shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
              <span className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recommandation de l'Atelier
              </span>
              <span className="text-neutral-500 font-normal">
                {result.recommendedSlugs.length} création(s) sélectionnée(s)
              </span>
            </div>

            <div
              className="prose max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: result.advice }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Les objets ci-dessous ont été filtrés selon votre recherche !</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-200 cursor-pointer ml-auto"
            >
              Poser une autre question 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
