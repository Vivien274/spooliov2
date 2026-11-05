import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Skeleton Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 lg:mb-8">
          <div className="h-4 w-16 bg-zinc-200/80 rounded animate-pulse" />
          <span className="text-zinc-300">/</span>
          <div className="h-4 w-20 bg-zinc-200/80 rounded animate-pulse" />
          <span className="text-zinc-300">/</span>
          <div className="h-4 w-32 bg-zinc-200/80 rounded animate-pulse" />
        </div>

        {/* 2-Column Product Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Gallery Skeleton */}
          <div className="flex flex-col gap-4">
            {/* Main square image skeleton */}
            <div className="relative w-full aspect-square rounded-2xl bg-zinc-200/70 border border-[#E4E4E0] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest opacity-60">Spoolio 3D</span>
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-xl bg-zinc-200/60 border border-[#E4E4E0] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info & Actions Skeleton */}
          <div className="flex flex-col gap-6">
            
            {/* Category / Badge */}
            <div className="h-5 w-24 bg-zinc-200/80 rounded-full animate-pulse" />

            {/* Product Title */}
            <div className="space-y-2">
              <div className="h-8 sm:h-9 bg-zinc-200/90 rounded-xl w-5/6 animate-pulse" />
              <div className="h-8 sm:h-9 bg-zinc-200/70 rounded-xl w-3/5 animate-pulse" />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <div className="h-9 w-28 bg-zinc-200/90 rounded-xl animate-pulse" />
              <div className="h-4 w-24 bg-zinc-200/60 rounded animate-pulse" />
            </div>

            {/* Short Description */}
            <div className="space-y-2 py-2 border-y border-zinc-200/70">
              <div className="h-4 bg-zinc-200/70 rounded w-full animate-pulse" />
              <div className="h-4 bg-zinc-200/70 rounded w-4/5 animate-pulse" />
              <div className="h-4 bg-zinc-200/50 rounded w-2/3 animate-pulse" />
            </div>

            {/* Options Skeleton (Color dropdown / chips) */}
            <div className="space-y-2">
              <div className="h-4 w-28 bg-zinc-200/80 rounded animate-pulse" />
              <div className="h-12 w-full bg-white border border-[#E4E4E0] rounded-xl flex items-center px-4 gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
              </div>
            </div>

            {/* CTA & Quantity Button Skeleton */}
            <div className="flex items-center gap-3 pt-3">
              <div className="h-14 w-32 bg-white border border-[#E4E4E0] rounded-2xl animate-pulse" />
              <div className="h-14 flex-1 bg-zinc-900/10 rounded-2xl border border-zinc-200/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
              </div>
            </div>

            {/* Reassurance pills */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-12 bg-white border border-[#E4E4E0] rounded-xl animate-pulse" />
              <div className="h-12 bg-white border border-[#E4E4E0] rounded-xl animate-pulse" />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

