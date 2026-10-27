import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPageSeoMetadata } from "@/lib/seoPages";
import { BUSINESS_CONFIG } from "@/lib/businessConfig";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Cpu, 
  Layers, 
  Sparkles, 
  Hammer, 
  ShieldCheck, 
  MousePointerClick, 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  RotateCw 
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeoMetadata("a-propos");
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#121212] font-sans selection:bg-[#FF5500] selection:text-white overflow-x-hidden flex flex-col">
      {/* Discreet background engineering grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0" 
        style={{
          backgroundImage: "radial-gradient(#121212 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      <Header isDark={false} />

      <main className="relative z-10 flex-grow w-full">

        {/* =========================================================================
            SECTION 01 — MANIFESTE (HERO ÉDITORIAL & PHOTO IMMERSIVE)
           ========================================================================= */}
        <section className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28">
          
          {/* Studio Meta Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E4E4E0] font-mono text-[11px] uppercase tracking-wider text-[#666663]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span className="font-bold text-[#18181B]">ATELIER SPOOLIO</span>
              <span className="text-[#D0D0CA]">•</span>
              <span>59560 COMINES, HAUTS-DE-FRANCE</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#0055FF] bg-[#0055FF]/5 border border-[#0055FF]/20 px-2.5 py-0.5 rounded-full">
              <span>MANIFESTE ÉDITION V2.1</span>
            </div>
          </div>

          {/* Hero Typography */}
          <div className="pt-12 sm:pt-16 max-w-4xl space-y-8">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
              01 // NOTRE RAISON D&apos;ÊTRE
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#121212] leading-[1.12]">
              Des objets qui ne servent pas toujours à quelque chose.{" "}
              <span className="text-[#666663] block font-normal mt-2">
                Mais auxquels on s&apos;attache.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#3F3F46] font-normal leading-relaxed max-w-2xl">
              Spoolio, c&apos;est un petit atelier du Nord où l&apos;on imagine et fabrique des objets singuliers. Des pièces à manipuler, à exposer ou simplement à garder près de soi.
            </p>
          </div>

          {/* Hero Immersive Photograph */}
          <div className="mt-12 sm:mt-16 relative">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-[#E4E4E0] shadow-sm bg-[#F6F5F2]">
              <Image
                src="/images/clicker_gallery_2.jpg"
                alt="Pièces mécaniques et clickers conçus à l'atelier Spoolio"
                fill
                priority
                className="object-cover object-center hover:scale-[1.02] transition-transform duration-700 ease-out"
                sizes="(max-width: 1240px) 100vw, 1240px"
              />
              
              {/* Technical Calibration Marks */}
              <div className="absolute top-4 left-4 font-mono text-[10px] text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded border border-white/20">
                CLICHÉ D&apos;ATELIER // CLICKER STUDIO
              </div>
              <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded border border-white/20 hidden sm:block">
                50.7333° N, 3.0000° E
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#71717A] px-1">
              <span>FIG. 01 — FINITION MATIÈRE PLA &amp; SWITCHS MÉCANIQUES</span>
              <span className="uppercase">ASSEMBLAGE COMINES (59)</span>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 02 — NOTRE HISTOIRE (GENÈSE & RACINES SANS JARGON)
           ========================================================================= */}
        <section className="w-full border-y border-[#E4E4E0] bg-[#FBFBFA] py-20 sm:py-28">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Heading & Anchor */}
              <div className="lg:col-span-5 space-y-5">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
                  02 // L&apos;ORIGINE DU PROJET
                </span>
                
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212] leading-tight">
                  D&apos;une bobine de fil à des compagnons de bureau.
                </h2>

                <p className="text-sm sm:text-base text-[#666663] leading-relaxed">
                  L&apos;impression 3D souffre souvent d&apos;une image froide : des prototypes industriels austères, du plastique brut ou des gadgets sans âme importés par conteneurs.
                </p>

                <div className="p-5 rounded-xl bg-white border border-[#E4E4E0] space-y-2 mt-6">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#FF5500] tracking-wider block">
                    D&apos;OÙ VIENT LE NOM SPOOLIO ?
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    La <em>spool</em>, c&apos;est la bobine de filament. Le fil continu de matière biosourcée qui se déroule dans la buse pour devenir volume, texture tactile et silhouette attachante.
                  </p>
                </div>
              </div>

              {/* Right Column: Editorial Narration */}
              <div className="lg:col-span-7 space-y-6 text-[#27272A] text-base sm:text-lg leading-relaxed">
                <p>
                  Installé à <strong>Comines</strong>, dans le Nord de la France, notre atelier est né d&apos;une envie toute simple : transformer la fabrication additive en un médium d&apos;expression chaleureux, tactile, coloré et profondément bienveillant.
                </p>

                <p>
                  Nous créons des objets physiques que l&apos;on aime toucher des doigts, faire claquer entre deux réunions pour relâcher la tension, poser fièrement sur son bureau comme une petite œuvre pop, ou glisser dans sa poche pour la journée.
                </p>

                <p className="text-base text-[#52525B]">
                  Ici, il n&apos;y a ni levée de fonds spectaculaire, ni storytelling calibré pour des investisseurs. Spoolio est une aventure artisanale et familiale, menée avec la patience de ceux qui passent des heures à tester des tolérances au dixième de millimètre pour qu&apos;un clic procure exactement la sensation recherchée.
                </p>

                {/* Key Numbers / Atelier Truths */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E8E8E4] font-mono">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#18181B] block">5</span>
                    <span className="text-[11px] text-[#71717A] uppercase mt-1 block">Machines dédiées</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#FF5500] block">0.16<span className="text-base">mm</span></span>
                    <span className="text-[11px] text-[#71717A] uppercase mt-1 block">Hauteur de couche</span>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#18181B] block">100%</span>
                    <span className="text-[11px] text-[#71717A] uppercase mt-1 block">Testé à la main</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 03 — LES HUMAINS (L'ÉQUIPE AUTHENTIQUE SANS INVENTIONS)
           ========================================================================= */}
        <section className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 py-20 sm:py-28">
          
          <div className="max-w-2xl mb-12 sm:mb-16 space-y-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
              03 // L&apos;ÉQUIPE
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212]">
              Ceux qui font tourner les bobines.
            </h2>
            <p className="text-sm sm:text-base text-[#666663] leading-relaxed">
              Trois paires d&apos;yeux, trois tempéraments complémentaires et un regard intransigeant sur chaque pièce qui quitte l&apos;atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            
            {/* VIVIEN */}
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#D0D0CA] transition-colors shadow-xs">
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="relative w-20 h-20 rounded-2xl bg-[#F6F5F2] border border-[#E4E4E0] overflow-hidden p-1">
                    <Image
                      src="/images/vivien-avatar.png"
                      alt="Vivien Bocquelet - Fondateur Spoolio"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 px-2.5 py-1 rounded-full uppercase">
                    FONDATEUR
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">Vivien</h3>
                  <span className="font-mono text-xs text-[#71717A] block mt-0.5">
                    Design, idées &amp; expérimentations
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                  C&apos;est lui qui imagine les volumes, ajuste les slicers, règle les températures et teste les mécaniques. Passionné d&apos;objets tactiles, de pop culture et d&apos;ergonomie matérielle, il prépare chaque modèle avec une exigence maniaque de finition.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0EFEA] font-mono text-[10px] text-[#71717A] flex items-center justify-between">
                <span>RÔLE // CONCEPTION &amp; ATELIER</span>
                <span className="text-[#18181B] font-bold">COMINES</span>
              </div>
            </div>

            {/* STÉPHANIE */}
            <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#D0D0CA] transition-colors shadow-xs">
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  {/* Photo Frame / Dedicated Editorial Location */}
                  <div className="relative w-20 h-20 rounded-2xl bg-[#F4F4F0] border border-[#E4E4E0] flex flex-col items-center justify-center p-2 text-center text-[#71717A]">
                    <Layers className="w-6 h-6 text-[#18181B] mb-1" />
                    <span className="font-mono text-[8px] leading-tight uppercase text-[#888888]">LOGISTIQUE ATELIER</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#0055FF] bg-[#0055FF]/10 border border-[#0055FF]/20 px-2.5 py-1 rounded-full uppercase">
                    PRODUCTION
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">Stéphanie</h3>
                  <span className="font-mono text-xs text-[#71717A] block mt-0.5">
                    Fabrication &amp; organisation de l&apos;atelier
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                  Consultante en digitalisation des entreprises, elle apporte le cadre, la méthode et le regard stratégique. C&apos;est elle qui veille à ce que l&apos;atelier tourne comme une horloge, que les commandes partent sans accroc et que les idées folles se transforment en projets viables.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0EFEA] font-mono text-[10px] text-[#71717A] flex items-center justify-between">
                <span>RÔLE // STRATÉGIE &amp; FLUX</span>
                <span className="text-[#18181B] font-bold">ORGANISATION</span>
              </div>
            </div>

            {/* WILLIAM */}
            <div className="bg-[#FFFDF9] border border-[#F2E7DC] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#E8D4C2] transition-colors shadow-xs">
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  {/* Dedicated Kid Tester Location */}
                  <div className="relative w-20 h-20 rounded-2xl bg-[#FFF5EB] border border-[#FAD9BC] flex flex-col items-center justify-center p-2 text-center text-[#FF5500]">
                    <span className="text-2xl">🧒</span>
                    <span className="font-mono text-[8px] font-bold mt-1 text-[#FF5500]">6 ANS</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 px-2.5 py-1 rounded-full uppercase">
                    QUALITÉ FUN
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#18181B]">William</h3>
                  <span className="font-mono text-xs text-[#FF5500] font-bold block mt-0.5">
                    Contrôle qualité officieux &amp; Taxe de testeur
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                  Notre expert à domicile. Si un fidget n&apos;est pas amusant en 30 secondes ou ne résiste pas à ses crash-tests impromptus, le projet est immédiatement recalé. Évidemment, chaque nouvelle série imprimée se voit prélevée de sa rigoureuse et contractuelle <em>taxe de testeur</em>.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F2E7DC] font-mono text-[10px] text-[#92400E] flex items-center justify-between">
                <span>STATUT // ARBITRE EN CHEF</span>
                <span className="text-[#FF5500] font-bold">CRASH-TEST 100%</span>
              </div>
            </div>

          </div>

        </section>


        {/* =========================================================================
            SECTION 04 — L'ATELIER (5 MACHINES COMME DES PERSONNAGES)
           ========================================================================= */}
        <section className="w-full bg-[#F6F5F2] border-y border-[#E4E4E0] py-20 sm:py-28">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            
            <div className="max-w-2xl mb-12 sm:mb-16 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
                04 // LE PARC MACHINES
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212] leading-tight">
                Un petit atelier.<br />
                Cinq machines.<br />
                Beaucoup d&apos;idées.
              </h2>
              <p className="text-sm sm:text-base text-[#666663] leading-relaxed">
                Nos imprimantes 3D ne sont pas de simples boîtes métalliques silencieuses. Elles ont chacune leur tempérament, leurs réglages de prédilection et leur identité d&apos;atelier.
              </p>
            </div>

            {/* The 5 Machines Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* BERTHE */}
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 space-y-4 hover:border-[#D0D0CA] transition-colors">
                <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <h3 className="font-mono text-base font-bold text-[#18181B]">Berthe</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                    BAMBU LAB H2S
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF5500] uppercase font-mono block">
                    La doyenne infatigable
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Robuste et imperturbable. Elle encaisse les grands volumes, les pièces d&apos;envergure et les impressions de 12 heures d&apos;affilée avec une constance géométrique exemplaire.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-[#888888]">
                  SPÉCIALITÉ // GRANDS VOLUMES &amp; COQUES
                </div>
              </div>

              {/* CLAUDINE */}
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 space-y-4 hover:border-[#D0D0CA] transition-colors">
                <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <h3 className="font-mono text-base font-bold text-[#18181B]">Claudine</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                    BAMBU LAB A1 MINI
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF5500] uppercase font-mono block">
                    La virtuose du millimètre
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Dévouée aux touches de clickers, aux gravures microscopiques et aux tenons délicats. Sa tête ultra légère lui permet des accélérations franches sans jamais sacrifier la finesse.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-[#888888]">
                  SPÉCIALITÉ // KEYCAPS &amp; MICRO-GRAVURES
                </div>
              </div>

              {/* GODELAINE */}
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 space-y-4 hover:border-[#D0D0CA] transition-colors">
                <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <h3 className="font-mono text-base font-bold text-[#18181B]">Godelaine</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                    BAMBU LAB A1
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF5500] uppercase font-mono block">
                    L&apos;experte polychrome
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Polyvalente et rapide. C&apos;est elle qui jongle entre les bobines de couleurs contrastées pour donner vie à nos créations bicolores, art toys pop et mascottes joyeuses.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-[#888888]">
                  SPÉCIALITÉ // MULTI-COULEURS &amp; CADENCE
                </div>
              </div>

              {/* URSULE */}
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 space-y-4 hover:border-[#D0D0CA] transition-colors">
                <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <h3 className="font-mono text-base font-bold text-[#18181B]">Ursule</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#71717A] bg-[#F4F4F0] px-2 py-0.5 rounded">
                    BAMBU LAB P1S
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF5500] uppercase font-mono block">
                    La sprinteuse en caisson fermé
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Enfermée dans son habitacle à température stabilisée, elle est sollicitée dès qu&apos;une tolérance mécanique stricte est requise. Elle déteste les courants d&apos;air et adore la régularité.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-[#888888]">
                  SPÉCIALITÉ // TOLÉRANCES SERRÉES &amp; RIGIDITÉ
                </div>
              </div>

              {/* PHILOMÈNE */}
              <div className="bg-white border border-[#E4E4E0] rounded-2xl p-6 space-y-4 hover:border-[#D0D0CA] transition-colors md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <h3 className="font-mono text-base font-bold text-[#18181B]">Philomène</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/20 font-bold px-2 py-0.5 rounded">
                    BAMBU LAB H2C // FLEURON
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF5500] uppercase font-mono block">
                    Le fleuron haute précision
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    La dernière arrivée à l&apos;atelier de Comines. Conçue pour les prototypes ambitieux, les séries limitées et les finitions mates texturées qui demandent une gestion thermique irréprochable.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-[#888888]">
                  SPÉCIALITÉ // DROPS LIMITÉS &amp; PIÈCES D&apos;EXCEPTION
                </div>
              </div>

            </div>

            {/* Atelier Process Specs Footer */}
            <div className="mt-8 p-6 rounded-2xl bg-white border border-[#E4E4E0] grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div className="flex items-start gap-3">
                <Flame className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">BUSE À 215°C</span>
                  <p className="text-[11px] text-[#71717A] mt-0.5">Fusion optimale du polymère végétal sans carbonisation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">PLATEAUX PEI DORÉS</span>
                  <p className="text-[11px] text-[#71717A] mt-0.5">Texture granuleuse satinée apportée sur la base de chaque pièce.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hammer className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#18181B] block">FINITION ARTISANALE</span>
                  <p className="text-[11px] text-[#71717A] mt-0.5">Ébavurage manuel, assemblage hotswap et vérification unitaire.</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 05 — NOTRE APPROCHE (LA MATIÈRE SANS GRAND DISCOURS)
           ========================================================================= */}
        <section className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 py-20 sm:py-28">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
                05 // DÉMARCHE &amp; MATIÈRE
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212] leading-tight">
                La matière, sans grand discours.
              </h2>
              <p className="text-sm sm:text-base text-[#666663] leading-relaxed">
                Nous refusons le greenwashing et les promesses démesurées. Nous préférons une fabrication sensée, transparente et honnête.
              </p>

              <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#E8E8E4] space-y-2 mt-6">
                <span className="font-mono text-[10px] font-bold uppercase text-[#18181B] block">
                  CE QUE NOUS NE DIRONS JAMAIS :
                </span>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Pas de &ldquo;zéro pollution&rdquo;, pas de &ldquo;sauveurs de planète&rdquo;. Nous utilisons des matières d&apos;origine végétale renouvelable, nous limitons les déchets au strict minimum et nous créons des objets robustes que les gens gardent.
                </p>
              </div>
            </div>

            {/* Right 4 Pillars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-2.5 shadow-2xs">
                <span className="font-mono text-[10px] font-bold text-[#FF5500] uppercase tracking-wider block">
                  01 // PLA BIOSOURCÉ
                </span>
                <h3 className="text-base font-bold text-[#18181B]">Origine végétale</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Nos filaments en Acide Polylactique (PLA) sont issus de ressources végétales renouvelables comme l&apos;amidon de maïs ou la canne à sucre. Pas d&apos;odeurs nocives, un toucher doux et une grande résistance mécanique.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-2.5 shadow-2xs">
                <span className="font-mono text-[10px] font-bold text-[#FF5500] uppercase tracking-wider block">
                  02 // FLUX TENDU
                </span>
                <h3 className="text-base font-bold text-[#18181B]">Production à la demande</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Pas d&apos;entrepôt débordant d&apos;invendus destinés au rebut. Chaque objet imprimé répond à une commande ou à un drop en série limitée. Nous ne transformons que la matière strictement nécessaire.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-2.5 shadow-2xs">
                <span className="font-mono text-[10px] font-bold text-[#FF5500] uppercase tracking-wider block">
                  03 // EMBALLAGE SOBRE
                </span>
                <h3 className="text-base font-bold text-[#18181B]">Pochettes kraft d&apos;atelier</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Nous expédions nos créations dans des pochettes et boîtes kraft rigides, réutilisables ou recyclables. Pas de suremballage plastique superflu : un conditionnement d&apos;atelier propre et soigné.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E4E4E0] space-y-2.5 shadow-2xs">
                <span className="font-mono text-[10px] font-bold text-[#FF5500] uppercase tracking-wider block">
                  04 // DURABILITÉ RÉELLE
                </span>
                <h3 className="text-base font-bold text-[#18181B]">Des objets qu&apos;on garde</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Notre démarche la plus sincère : concevoir des objets attachants, réparables (switches hotswap interchangeables) et solides. Un objet dont on ne se lasse pas ne finit jamais à la poubelle.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =========================================================================
            SECTION 06 — NOS CRÉATIONS (PORTFOLIO D'ATELIER PAR FAMILLES)
           ========================================================================= */}
        <section className="w-full bg-[#FBFBFA] border-y border-[#E4E4E0] py-20 sm:py-28">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
              <div className="space-y-3 max-w-xl">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
                  06 // LES FAMILLES D&apos;OBJETS
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212]">
                  L&apos;univers Spoolio.
                </h2>
                <p className="text-sm sm:text-base text-[#666663] leading-relaxed">
                  Quatre horizons créatifs pensés pour occuper les mains, déstresser l&apos;esprit et apporter une note singulière sur un bureau.
                </p>
              </div>

              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#18181B] hover:text-[#FF5500] transition-colors uppercase tracking-wider pb-1 border-b border-[#18181B] hover:border-[#FF5500] shrink-0 self-start sm:self-end"
              >
                <span>VOIR TOUTES LES CRÉATIONS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Portfolio Chapters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Clickers */}
              <div className="group bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden hover:border-[#D0D0CA] transition-all shadow-xs flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-[#F4F4F0] overflow-hidden">
                  <Image
                    src="/images/clicker_gallery_1.jpg"
                    alt="Clicker mécanique tactile Spoolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute top-3 left-3 font-mono text-[9px] uppercase font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                    HOTSWAP HARDWARE
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-[#18181B]">Clickers Mécaniques Sur-Mesure</h3>
                    <span className="font-mono text-xs font-bold text-[#FF5500]">01 // HARDWARE</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    De vrais switches de claviers mécaniques haut de gamme encapsulés dans des boîtiers ergonomiques de poche. Le compagnon anti-stress ultime pour réunions et sessions de code.
                  </p>
                </div>
              </div>

              {/* Art Toys & Créatures */}
              <div className="group bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden hover:border-[#D0D0CA] transition-all shadow-xs flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-[#F4F4F0] overflow-hidden">
                  <Image
                    src="/images/marcel_octopus.jpg"
                    alt="Marcel l'octopode articulé Spoolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute top-3 left-3 font-mono text-[9px] uppercase font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                    PRINT-IN-PLACE
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-[#18181B]">Art Toys &amp; Créatures Articulées</h3>
                    <span className="font-mono text-xs font-bold text-[#FF5500]">02 // POP TOYS</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Marcel la pieuvre aux tentacules souples, dragons cristaux et mascottes vivantes. Imprimés directement assemblés en une seule passe sans aucune colle ni vis.
                  </p>
                </div>
              </div>

              {/* Accessoires de Bureau */}
              <div className="group bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden hover:border-[#D0D0CA] transition-all shadow-xs flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-[#F4F4F0] overflow-hidden">
                  <Image
                    src="/images/keyboard_support.jpg"
                    alt="Support et accessoires de bureau Spoolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute top-3 left-3 font-mono text-[9px] uppercase font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                    SETUP &amp; DESK
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-[#18181B]">Accessoires de Bureau Contemporains</h3>
                    <span className="font-mono text-xs font-bold text-[#FF5500]">03 // DESKWARE</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Supports smartphones, reposes-claviers, vide-poches géométriques et passes-câbles pensés pour structurer votre espace de travail avec du caractère et des lignes épurées.
                  </p>
                </div>
              </div>

              {/* Fidgets & Curiosités */}
              <div className="group bg-white border border-[#E4E4E0] rounded-2xl overflow-hidden hover:border-[#D0D0CA] transition-all shadow-xs flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-[#F4F4F0] overflow-hidden">
                  <Image
                    src="/images/clicker_gallery_3.jpg"
                    alt="Fidgets et curiosités sensorielles Spoolio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute top-3 left-3 font-mono text-[9px] uppercase font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                    TACTILE &amp; SENSORIEL
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-[#18181B]">Curiosités Pop &amp; Fidgets Sensoriels</h3>
                    <span className="font-mono text-xs font-bold text-[#FF5500]">04 // TACTILE</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Bagues rotatives, capsules magnétiques, cubes texturés et pièces de manipulation conçus pour canaliser l&apos;énergie mentale et stimuler la concentration.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION 07 — CONCLUSION (PASSAGE À L'ACTION & COORDONNÉES)
           ========================================================================= */}
        <section className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 py-24 sm:py-32">
          
          <div className="bg-white border border-[#E4E4E0] rounded-3xl p-8 sm:p-14 lg:p-16 text-center space-y-8 shadow-sm">
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500] block">
                07 // LA SUITE
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121212]">
                Assez parlé de nous.
              </h2>
              
              <p className="text-lg sm:text-xl text-[#52525B] font-normal">
                On te montre ce qu&apos;on fabrique ?
              </p>
            </div>

            {/* CTAs TE Style */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/boutique"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#18181B] hover:bg-[#FF5500] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>DÉCOUVRIR LES COLLECTIONS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/createur-cliqueur"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F6F5F2] hover:bg-[#EDECE7] text-[#18181B] border border-[#E4E4E0] font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>COMPOSER MON CLICKER</span>
                <span className="text-[#FF5500]">⌨️</span>
              </Link>
            </div>

            {/* Legal & Workshop Coordinates */}
            <div className="pt-10 mt-10 border-t border-[#F0EFEA] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#71717A]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Atelier Spoolio • 59560 Comines, France</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <a href={`mailto:${BUSINESS_CONFIG.email}`} className="text-[#18181B] hover:text-[#FF5500] transition-colors underline">
                  {BUSINESS_CONFIG.email}
                </a>
                <span>•</span>
                <Link href="/contact" className="hover:text-[#18181B] transition-colors">
                  Contact Atelier
                </Link>
                <span>•</span>
                <Link href="/mentions-legales" className="hover:text-[#18181B] transition-colors">
                  Mentions Légales
                </Link>
              </div>
            </div>

          </div>

        </section>

      </main>

      <Footer isDark={false} />
    </div>
  );
}
