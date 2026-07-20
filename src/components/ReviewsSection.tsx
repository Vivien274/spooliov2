"use client";

import { useState, useEffect } from "react";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  product?: {
    name: string;
    slug: string;
  } | null;
}

interface ReviewsSectionProps {
  displayReviews: Review[];
}

export default function ReviewsSection({ displayReviews }: ReviewsSectionProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLight, setIsLight] = useState<boolean>(false);

  useEffect(() => {
    // Detect theme class on html tag
    setIsLight(document.documentElement.classList.contains("light"));
    
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Left Block (2 columns width, premium warm-gradient container, review cards) */}
      <div className="md:col-span-2 relative rounded-3xl bg-gradient-to-tr from-[#ff3c00] via-[#ff6200] to-[#e60067] p-6 md:p-8 flex flex-col justify-start gap-6 overflow-hidden shadow-2xl shadow-[#ff4f00]/10 border border-white/5 transition-all duration-500">
        {/* Soft grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white font-antonio uppercase tracking-wide">
              Nos clients adorent Spoolio ⭐
            </h3>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/70 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mt-1">
              Avis Vérifiés
            </span>
          </div>
          
          {/* Button to leave review on Google */}
          <a
            href="https://g.page/r/CZEMl8MXwp-kEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs px-4 py-2.5 rounded-xl bg-white text-black font-extrabold shadow-lg hover:bg-black hover:text-white border border-white transition-all duration-300 select-none cursor-pointer shrink-0"
          >
            <span>Déposer un avis Google ✍️</span>
          </a>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayReviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              onClick={() => setSelectedReview(rev)}
              className="relative bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-full select-none hover:-translate-y-1 hover:scale-[1.015] hover:bg-white/15 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg shadow-black/10 group/card"
            >
              {/* Decorative quote mark */}
              <span className="absolute top-2 right-4 text-5xl font-serif text-white/5 select-none pointer-events-none font-bold">
                ”
              </span>

              <p className="text-[13px] text-white/90 leading-relaxed font-medium font-sans italic relative z-10 mb-4 line-clamp-4">
                "{rev.comment}"
              </p>

              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                <span className="text-[12px] font-black text-white/95 font-sans tracking-wide flex items-center gap-1">
                  {rev.customerName}
                  <span className="text-[10px] text-white/70">✔️</span>
                </span>
                <span className="text-[12px] text-[#ffd166] font-sans tracking-wide drop-shadow-[0_0_6px_rgba(255,209,102,0.4)]">
                  {Array(rev.rating).fill("★").join("")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedReview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedReview(null)}
        >
          <div 
            className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl text-left animate-reveal border ${
              isLight 
                ? "bg-[#ffffff] text-gray-800 border-gray-200" 
                : "bg-[#131316] text-gray-200 border-white/10"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedReview(null)}
              className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer select-none ${
                isLight ? "text-gray-400 hover:text-gray-900 hover:bg-gray-100" : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Stars & Source Badge */}
            <div className="flex items-center justify-between gap-4 mb-4 pr-8">
              <span className="text-xl text-[#ffbc00] tracking-wider drop-shadow-[0_0_8px_rgba(255,188,0,0.3)]">
                {Array(selectedReview.rating).fill("★").join("")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ff4f00] px-2 py-0.5 rounded-md bg-[#ff4f00]/10 border border-[#ff4f00]/25">
                {selectedReview.product ? `Avis produit : ${selectedReview.product.name}` : "Avis Google Général"}
              </span>
            </div>

            {/* Comment Body */}
            <div className={`max-h-[300px] overflow-y-auto pr-1 text-sm md:text-base leading-relaxed font-medium italic mb-6 whitespace-pre-line font-sans scrollbar-thin ${
              isLight ? "text-gray-700" : "text-gray-200"
            }`}>
              "{selectedReview.comment}"
            </div>

            {/* Author details */}
            <div className={`flex items-center justify-between border-t pt-4 mt-4 ${
              isLight ? "border-gray-100" : "border-white/5"
            }`}>
              <div>
                <h4 className={`text-sm font-black font-sans tracking-wide ${
                  isLight ? "text-gray-900" : "text-white"
                }`}>
                  {selectedReview.customerName}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                  Avis vérifié ✓
                </span>
              </div>
              
              <a
                href="https://g.page/r/CZEMl8MXwp-kEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#ff4f00] hover:text-[#e64400] transition-colors hover:underline"
              >
                Déposer un avis sur Google &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
