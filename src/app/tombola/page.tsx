import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolaPublicGrid from "@/components/TombolaPublicGrid";
import {
  getTombolaTicketsAction,
  getTombolaConfigAction,
} from "@/app/actions/tombolaActions";
import {
  Sparkles,
  Ticket,
  Gift,
  Tag,
  Clock,
  ShoppingBag,
  Compass,
  ArrowRight,
  Smile,
  Bell,
  HelpCircle,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTombolaConfigAction();
  const isActive = config.status === "active";

  return {
    title: isActive
      ? `${config.title} | Tombola Spoolio 🎟️`
      : "Tombola Spoolio 🎟️ | Aucune tombola en ce moment",
    description: isActive
      ? config.description || "Participe à la grande Tombola Spoolio !"
      : "Nos tombolas sont organisées ponctuellement. Découvre la boutique Spoolio et nos créations 3D en attendant la prochaine session !",
  };
}

export default async function TombolaPage() {
  const [initialTickets, tombolaConfig] = await Promise.all([
    getTombolaTicketsAction(),
    getTombolaConfigAction(),
  ]);

  const isActive = tombolaConfig.status === "active";

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
        {isActive ? (
          /* ================= ACTIVE TOMBOLA VIEW ================= */
          <>
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
                    {tombolaConfig.description || (
                      <>
                        Tente ta chance de remporter le super{" "}
                        <strong className="text-white font-bold">{tombolaConfig.title}</strong> !
                        Choisis ton numéro fétiche parmi les {tombolaConfig.totalCases} cases disponibles et viens récupérer ton lot sur le stand.
                      </>
                    )}
                  </p>

                  {/* Badges / Highlights */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-white">
                      <Gift className="w-4 h-4 text-[#FF5500]" />
                      <span>Lot : {tombolaConfig.title} ({tombolaConfig.estimatedValue}€)</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-white">
                      <Tag className="w-4 h-4 text-[#FF5500]" />
                      <span className="text-[#FF5500] font-bold">
                        {tombolaConfig.ticketPrice.toFixed(2)} €
                      </span>
                      <span>la case</span>
                    </div>

                    {tombolaConfig.endDate && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-amber-400">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Tirage : {tombolaConfig.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prize Image / Feature Card Right Column */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative group w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#181818] p-2">
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={tombolaConfig.image || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp"}
                        alt={tombolaConfig.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF5500] font-bold">
                            Grand Lot
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {tombolaConfig.title} ({tombolaConfig.estimatedValue}€)
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Interactive Grid Component */}
            <TombolaPublicGrid initialTickets={initialTickets} />
          </>
        ) : (
          /* ================= INACTIVE TOMBOLA VIEW ================= */
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Main Bento Inactive Card */}
            <div className="w-full bg-[#121212]/90 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden text-center space-y-6">
              {/* Decorative Background Accents */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5500]/10 rounded-full filter blur-3xl pointer-events-none" />

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-neutral-400" />
                <span>Session actuellement en pause</span>
              </div>

              {/* Big Emoji / Icon Display */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-black/60 relative">
                <span>🎟️</span>
                <span className="absolute -bottom-1 -right-1 text-xl">⏳</span>
              </div>

              {/* Title & Description */}
              <div className="max-w-2xl mx-auto space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                  Pas de tombola <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF8800] to-[#FFAA00]">en ce moment</span>
                </h1>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                  Nos tombolas et tirages au sort sont organisés lors d&apos;événements spéciaux, salons ou sur notre stand physique. La prochaine session arrive très bientôt !
                </p>
              </div>

              {/* Stay tuned notice */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#181818]/90 border border-white/10 text-xs text-neutral-400 flex items-center justify-center gap-2.5">
                <Bell className="w-4 h-4 text-[#FF5500] shrink-0" />
                <span>Suis nos actualités sur nos réseaux pour ne pas manquer la prochaine ouverture des cases !</span>
              </div>
            </div>

            {/* Quick Alternatives Navigation Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1: Boutique */}
              <Link
                href="/"
                className="group bg-[#141417]/90 border border-white/10 hover:border-[#FF5500]/50 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] shadow-xl"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#FF5500] transition-colors">
                    Explorer la Boutique
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Découvre nos fidgets sensoriels biosourcés, créations 3D exclusives et objets personnalisés.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF5500] pt-2">
                  <span>Voir le catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Roue de la Loterie */}
              <Link
                href="/loterie"
                className="group bg-[#141417]/90 border border-white/10 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] shadow-xl"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    Roue de la Loterie
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Tente ta chance sur notre roue de la fortune interactive pour gagner des codes promo et surprises 3D.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 pt-2">
                  <span>Tourner la roue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: Hub de Liens & Réseaux */}
              <Link
                href="/liens"
                className="group bg-[#141417]/90 border border-white/10 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] shadow-xl"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    Hub & Réseaux
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Retrouve tous nos liens officiels, vidéos TikTok, Instagram, et prochains événements en direct.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 pt-2">
                  <span>Rejoindre la communauté</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer className="w-full relative z-10 border-t border-white/10 mt-12" />
    </div>
  );
}
