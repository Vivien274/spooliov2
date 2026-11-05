import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CatalogGridSkeletonProps {
  title?: string;
  badge?: string;
  itemCount?: number;
}

export default function CatalogGridSkeleton({
  title,
  badge,
  itemCount = 8,
}: CatalogGridSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      {/* Header */}
      <Header />

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 flex-1">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-zinc-200/80 rounded animate-pulse" />
          <span className="text-zinc-300">/</span>
          <div className="h-4 w-24 bg-zinc-200/80 rounded animate-pulse" />
        </div>

        {/* Hero / Category Header Skeleton */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5500] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span>{badge || "Catalogue Spoolio"}</span>
          </div>

          <div className="h-10 sm:h-12 w-80 max-w-full bg-zinc-200/90 rounded-2xl animate-pulse mb-3" />
          <div className="h-4 sm:h-5 w-[460px] max-w-full bg-zinc-200/60 rounded-lg animate-pulse" />
        </div>

        {/* Filter Pills / Tabs Row Skeleton */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-4 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 px-4 rounded-full bg-white border border-[#E4E4E0] flex items-center gap-2 shrink-0 animate-pulse shadow-2xs"
            >
              <div className="w-2 h-2 rounded-full bg-zinc-200" />
              <div className={`h-3 bg-zinc-200 rounded ${i === 0 ? "w-16" : i === 1 ? "w-24" : "w-20"}`} />
            </div>
          ))}
        </div>

        {/* Responsive Grid of Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: itemCount }).map((_, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between h-full bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden shadow-xs"
            >
              <div className="flex flex-col flex-1">
                {/* Image Skeleton with Shimmer */}
                <div className="relative w-full aspect-square bg-zinc-100 border-b border-[#F0EFEA] overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300">
                    <svg className="w-10 h-10 mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[9px] uppercase font-mono font-bold tracking-widest opacity-40">Spoolio 3D</span>
                  </div>
                </div>

                {/* Content Section Skeleton */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-zinc-200/80 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-zinc-200/50 rounded w-3/5 animate-pulse" />
                  </div>

                  {/* Bottom Price & Button */}
                  <div className="pt-3 mt-auto flex items-center justify-between border-t border-[#F0EFEA]">
                    <div className="h-4 w-14 bg-zinc-200/90 rounded animate-pulse" />
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 animate-pulse shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
