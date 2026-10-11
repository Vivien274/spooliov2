"use client";

interface BoutiqueEditorialHeroProps {
  onExploreClick?: () => void;
  onUniversesClick?: () => void;
}

export default function BoutiqueEditorialHero({
  onExploreClick,
  onUniversesClick,
}: BoutiqueEditorialHeroProps) {
  return (
    <section className="pt-1 pb-6 sm:pb-7 font-sans">
      <div className="flex flex-col items-start gap-1.5 sm:gap-2">
        {/* Eyebrow Studio Tag */}
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FF5500]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
          <span>SPOOLIO / BOUTIQUE</span>
          <span className="text-[#D0D0CA]">•</span>
          <span className="text-[#71717A]">ATELIER DE COMINES (59)</span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-bold tracking-tight text-[#121212] leading-[1.15]">
          Des objets singuliers.{" "}
          <span className="text-[#71717A] font-normal block sm:inline">
            À manipuler, exposer ou collectionner.
          </span>
        </h1>

        {/* Short Atelier Subtitle */}
        <p className="text-xs sm:text-sm text-[#52525B] max-w-2xl leading-relaxed">
          Des curiosités imaginées et fabriquées dans notre atelier du Nord.
        </p>
      </div>
    </section>
  );
}
