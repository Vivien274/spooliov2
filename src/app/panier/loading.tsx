import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PanierLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      <Header />

      <main className="w-full max-w-5xl mx-auto px-4 pt-28 lg:pt-32 pb-16 flex-1">
        <div className="h-9 w-44 rounded-xl bg-zinc-200/90 animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#E4E4E0] rounded-2xl p-4 flex gap-4 items-center shadow-xs"
              >
                <div className="w-20 h-20 rounded-xl bg-zinc-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-4 w-1/4 bg-zinc-200/70 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-zinc-100 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Cart summary card skeleton */}
          <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 h-fit space-y-4 shadow-xs">
            <div className="h-5 w-32 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-zinc-200 animate-pulse pt-2" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
