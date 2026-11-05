import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlindBagsLoading() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
      <Header />

      <main className="w-full max-w-[1200px] px-4 pt-28 lg:pt-32 pb-16 relative z-10 flex flex-col items-center">
        {/* Hero Title & Presentation Skeleton */}
        <div className="text-center max-w-2xl mb-10 flex flex-col items-center">
          <div className="h-7 w-48 rounded-full bg-orange-100/70 animate-pulse mb-3.5" />
          <div className="h-10 sm:h-12 w-96 max-w-full rounded-2xl bg-zinc-200/90 animate-pulse mb-3" />
          <div className="h-5 w-80 max-w-full rounded-lg bg-zinc-200/60 animate-pulse" />
        </div>

        {/* 3 Pack Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E4E4E0] rounded-3xl p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                {/* Pack Image Box */}
                <div className="relative aspect-[4/3] rounded-2xl bg-zinc-100 border border-zinc-200/60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                </div>
                
                {/* Pack Info */}
                <div className="space-y-2">
                  <div className="h-5 bg-zinc-200/90 rounded-lg w-2/3 animate-pulse" />
                  <div className="h-4 bg-zinc-200/60 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-200/50 rounded w-4/5 animate-pulse" />
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                <div className="h-6 w-16 bg-zinc-200/90 rounded-lg animate-pulse" />
                <div className="h-10 w-28 bg-zinc-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Configurator Box Skeleton */}
        <div className="w-full max-w-5xl h-[340px] rounded-3xl bg-white border border-[#E4E4E0] p-8 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="h-6 w-60 bg-zinc-200/90 rounded-lg animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-zinc-200/60 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-zinc-200/80 animate-pulse" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
