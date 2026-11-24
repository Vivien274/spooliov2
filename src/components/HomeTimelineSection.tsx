"use client";

import { Sprout, FlaskConical, Recycle, Printer, Sparkles } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function HomeTimelineSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-[1200px] px-4 py-14 relative z-10 border-t border-zinc-200">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Matière biosourcée &amp; fabrication locale</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal uppercase tracking-wide text-zinc-900 font-righteous">
          {t("home.timeline.title")}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-sans mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
          {t("home.timeline.subtitle")}
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mt-8 font-sans">
        {/* Timeline Connector Line (Dashed guide line behind circles) */}
        <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] border-t-2 border-dashed border-neutral-300 z-0 pointer-events-none" />

        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
            <Sprout className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
              1
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">
            {t("home.timeline.step1.title")}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {t("home.timeline.step1.description")}
          </p>
        </div>

        {/* Step 2 */}
        <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
            <FlaskConical className="w-6 h-6 text-amber-300 group-hover:text-white transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
              2
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">
            {t("home.timeline.step2.title")}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {t("home.timeline.step2.description")}
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
            <Recycle className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
              3
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">
            {t("home.timeline.step3.title")}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {t("home.timeline.step3.description")}
          </p>
        </div>

        {/* Step 4 */}
        <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
            <Printer className="w-6 h-6 text-[#ff4f00] group-hover:text-white transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
              4
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">
            {t("home.timeline.step4.title")}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {t("home.timeline.step4.description")}
          </p>
        </div>

        {/* Step 5 */}
        <div className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative w-14 h-14 rounded-2xl bg-zinc-950 group-hover:bg-[#ff4f00] text-white flex items-center justify-center mb-4 shrink-0 ring-4 ring-zinc-50 shadow-md transition-all duration-300 group-hover:scale-105">
            <Sparkles className="w-6 h-6 text-amber-300 group-hover:text-white transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center border border-zinc-200 shadow-xs">
              5
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2 font-outfit leading-tight text-center">
            {t("home.timeline.step5.title")}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {t("home.timeline.step5.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
