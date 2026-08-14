import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WheelOfFortune from "@/components/lottery/WheelOfFortune";
import { getLotteryPrizesAction } from "@/app/actions/lotteryActions";
import { Sparkles, Trophy, Gift, Dices, ShieldCheck, Tag, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Roue de la Fortune Spoolio 🎰 | Gagne des Fidgets 3D & Bons d'achat",
  description:
    "Tourne la roue de la fortune officielle Spoolio ! Des réductions, fidgets sensoriels TDAH, produits 3D et bons d'achat à gagner instantanément.",
  openGraph: {
    title: "Roue de la Fortune Spoolio 🎰",
    description: "Tourne la roue et gagne des cadeaux 3D & réductions instantanées !",
    url: "https://www.spoolio.fr/loterie",
  },
};

export default async function LoteriePage() {
  const prizes = await getLotteryPrizesAction();

  return (
    <div className="min-h-screen bg-[#0A0A10] text-white flex flex-col items-center font-sans selection:bg-[#FF5500] selection:text-white">
      {/* Full Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-xs sm:text-sm font-bold uppercase tracking-wider animate-pulse">
            <Dices className="w-4 h-4" />
            Grand Jeu Concours Spoolio
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight max-w-3xl mx-auto leading-tight">
            Tourne la Roue <span className="text-[#FF5500]">Spoolio</span> & Gagne !
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Fais tourner la roue magique Spoolio et tente de remporter des **fidgets 3D**, des **bons d'achat exclusifs**, des **codes promo** et des surprises uniques.
          </p>
        </section>

        {/* Wheel Section */}
        <section className="relative flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#141420] via-[#10101A] to-[#0A0A10] border border-white/10 shadow-2xl space-y-8">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Wheel Component */}
          <WheelOfFortune prizes={prizes} />

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Gratuit & Sans Obligation
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Gains instantanés
            </span>
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#FF5500]" />
              Fabriqué en France 🇫🇷
            </span>
          </div>
        </section>

        {/* Prizes Up for Grabs Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-3">
              <Trophy className="w-7 h-7 text-[#FF5500]" />
              Les Lots à Gagner sur la Roue
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Chaque secteur de la roue vous réserve une surprise personnalisée
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="p-5 rounded-2xl bg-[#14141E] border border-white/10 hover:border-[#FF5500]/50 transition-all group flex flex-col justify-between space-y-4 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10 shrink-0"
                    style={{ backgroundColor: prize.color, color: prize.textColor }}
                  >
                    {prize.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#FF5500] transition-colors">
                      {prize.title}
                    </h3>
                    {prize.subtitle && (
                      <p className="text-xs text-neutral-400">{prize.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Chance d'obtention</span>
                  <span className="font-mono font-bold text-[#FF5500]">⚡ En jeu</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works Section */}
        <section className="p-8 rounded-3xl bg-[#12121A] border border-white/10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase text-center tracking-tight">
            Comment ça marche ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#0A0A10] border border-white/5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-black text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Cliquez sur Tourner</h3>
              <p className="text-xs text-neutral-400">
                La roue se lance et décélère de manière réaliste jusqu'à s'arrêter sur votre lot.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A0A10] border border-white/5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Découvrez votre Lot</h3>
              <p className="text-xs text-neutral-400">
                Un code promo exclusif ou une surprise s'affiche instantanément à l'écran.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A0A10] border border-white/5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Utilisez-le en Boutique</h3>
              <p className="text-xs text-neutral-400">
                Copiez le code et appliquez-le lors de votre commande d'objets 3D Spoolio !
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
