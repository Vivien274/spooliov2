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
    <section className="pt-1 pb-4 sm:pb-5 font-sans">
      {/* Editorial Heading */}
      <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-bold tracking-tight text-[#121212] leading-[1.15]">
        Des objets singuliers.{" "}
        <span className="text-[#71717A] font-normal block sm:inline">
          À manipuler, exposer ou collectionner.
        </span>
      </h1>
    </section>
  );
}
