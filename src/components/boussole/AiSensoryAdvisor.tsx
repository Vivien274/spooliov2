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
  { emoji: "🧠", text: "Un accessoire pour m'aider à rester concentré pendant mes révisions." },
  { emoji: "🧡", text: "Un cadeau apaisant et ludique pour un proche TDAH / anxieux." },
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
    <div className="relative rounded-3xl bg-gradient-to-b from-[#181a28] to-[#0f1019] border border-purple-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden my-8 select-none">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff4f00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            Conseiller IA Sensoriel Gemini
          </span>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-semibold ml-auto transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-[family-name:var(--font-antonio)]">
          Décris ton besoin ou ce que tu ressens 🧭
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl font-medium">
          L'IA Spoolio analyse en direct tes sensations pour sélectionner les fidgets 3D les plus adaptés à ton quotidien (cours, réunions, stress, TDAH).
        </p>
      </div>

      {/* Quick Suggestion Pills */}
      {!result && !loading && (
        <div className="relative z-10 flex flex-wrap gap-2 mb-6">
          <span className="w-full text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
            Exemples de besoins :
          </span>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(item.text);
                handleSubmit(undefined, item.text);
              }}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-gray-200 text-xs font-semibold transition-all duration-200 text-left flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-sm group-hover:scale-125 transition-transform">{item.emoji}</span>
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
              className="w-full p-4 pr-14 rounded-2xl bg-[#0b0c13] text-white placeholder-gray-500 text-sm border border-white/15 focus:outline-none focus:border-purple-500 shadow-inner transition-colors resize-none font-sans"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`absolute right-3 bottom-4 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-[#ff4f00] text-white transition-all shadow-lg cursor-pointer ${
                loading || !prompt.trim() ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              }`}
              title="Lancer l'analyse IA"
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
        <div className="relative z-10 p-8 rounded-2xl bg-[#0c0e17] border border-purple-500/30 text-center space-y-3 animate-pulse my-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-[#ff4f00] flex items-center justify-center text-white text-xl shadow-lg">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
            L'IA Gemini analyse votre profil sensoriel...
          </h4>
          <p className="text-xs text-purple-300 font-medium">
            Sélection des produits Spoolio compatibles en cours.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 my-4 font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display Box */}
      {result && (
        <div className="relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 rounded-2xl bg-[#0c0e17] border border-purple-500/40 text-gray-200 text-sm leading-relaxed space-y-3 shadow-inner font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-purple-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recommandation personnalisée de l'IA
              </span>
              <span className="text-gray-400 font-normal">
                {result.recommendedSlugs.length} produit(s) recommandé(s)
              </span>
            </div>

            <div
              className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: result.advice }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Les produits ci-dessous ont été filtrés selon votre recherche !</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer ml-auto"
            >
              Posez une autre question 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
