import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TrouveurDeCadeauLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      <Header />

      <main className="w-full max-w-3xl mx-auto px-4 pt-28 lg:pt-32 pb-16 flex-1 flex flex-col items-center">
        {/* Title & Badge */}
        <div className="h-7 w-48 rounded-full bg-orange-100/70 animate-pulse mb-3" />
        <div className="h-10 sm:h-12 w-80 max-w-full rounded-2xl bg-zinc-200/90 animate-pulse mb-3" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-zinc-200/60 animate-pulse mb-8" />

        {/* Wizard Card Skeleton */}
        <div className="w-full bg-white border border-[#E4E4E0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="h-6 w-3/4 bg-zinc-200/90 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-zinc-100 border border-zinc-200/70 animate-pulse"
              />
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
            <div className="h-10 w-24 rounded-xl bg-zinc-100 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-zinc-200 animate-pulse" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

