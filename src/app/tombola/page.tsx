import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolaPublicGrid from "@/components/TombolaPublicGrid";
import { getTombolaTicketsAction } from "@/app/actions/tombolaActions";
import { Sparkles, Calendar, Ticket, Gift, Tag, Clock } from "lucide-react";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tombola Spoolio 🎁 | 50 cases à 2€ - Gagne ton Pack Fidgets",
    description:
      "Participe à la grand Tombola Spoolio ! Reserve ton numéro parmi les 50 cases à 2€ la case et tente de remporter le Pack Fidgets exclusif (Valeur 20€). Tirage le 15 Août à 17h30.",
  };
}

export default async function TombolaPage() {
  const initialTickets = await getTombolaTicketsAction();

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white font-sans flex flex-col items-center selection:bg-[#FF5500] selection:text-white overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ backgroundColor: "#FF5500", filter: "blur(160px)" }}
        />
        <div
          className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-15"
          style={{ backgroundColor: "#FF8800", filter: "blur(160px)" }}
        />
      </div>

      {/* Header component */}
      <Header />

      {/* Main Content */}
      <main className="w-full max-w-[1100px] px-4 pt-28 lg:pt-32 pb-16 relative z-10 flex flex-col items-center space-y-10">
        
        {/* Hero Section / Header Bento Card */}
        <div className="w-full bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5500]/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Prize & Details Left Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-xs font-bold text-[#FF5500] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
                <span>Jeu Concours Exclusif</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight">
                TOMBOLA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FFAA00]">SPOOLIO</span> 🎁
              </h1>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Tente ta chance de remporter le super <strong className="text-white font-bold">Pack Fidgets 3D Spoolio</strong> ! Choisis ton numéro fétiche parmi les 50 cases disponible et viens récupérer ton lot sur le stand.
              </p>

              {/* Badges / Highlights */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-white">
                  <Gift className="w-4 h-4 text-[#FF5500]" />
                  <span>Lot : Pack Fidgets (20€)</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-white">
                  <Tag className="w-4 h-4 text-[#FF5500]" />
                  <span className="text-[#FF5500] font-bold">2,00 €</span>
                  <span>la case</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-amber-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Tirage : 15 Août à 17h30</span>
                </div>
              </div>
            </div>

            {/* Prize Image / Feature Card Right Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#181818] p-2">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/images/imported/Spoolio_Kit-Festival-16-scaled.webp"
                    alt="Pack Fidgets Spoolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF5500] font-bold">
                        Grand Lot
                      </span>
                      <h4 className="text-sm font-bold text-white">Pack Fidgets Spoolio 20€</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Interactive Grid Component */}
        <TombolaPublicGrid initialTickets={initialTickets} />
      </main>

      {/* Footer */}
      <Footer className="w-full relative z-10 border-t border-white/10 mt-12" />
    </div>
  );
}
