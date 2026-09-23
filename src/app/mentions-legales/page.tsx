import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  alternates: {
    canonical: "https://spoolio.fr/mentions-legales",
  },
  title: "Mentions Légales | Spoolio",
  description: "Informations légales concernant l'éditeur du site Spoolio, entreprise individuelle Bocquelet.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full" style={{ backgroundColor: 'rgba(255, 79, 0, 0.05)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', filter: 'blur(120px)' }} />
      </div>

      <Header />

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] px-6 pt-28 lg:pt-32 pb-12 relative z-10 flex-grow">
        <div className="animate-reveal text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700 mb-4">
            <span>⚖️</span>
            <span>Informations Légales</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-antonio text-zinc-950 mb-4">
            Mentions Légales
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 text-zinc-700 space-y-6 text-xs sm:text-sm leading-relaxed animate-reveal delay-100 font-sans shadow-2xs">
          <p>
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique (LCEN), il est précisé aux utilisateurs du site Spoolio l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Edition du site
          </h2>
          <p>
            Le présent site, accessible à l’URL <strong>www.spoolio.fr</strong> (le « Site »), est édité par :
          </p>
          <p>
            <strong>Vivien BOCQUELET</strong>, résidant au 40 rue du Hoccart, 59560 Comines, de nationalité Française, immatriculé à l'entreprise individuelle sous le numéro RCS Lille Métropole 840 388 201.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Hébergement
          </h2>
          <p>
            Le Site est hébergé par la société <strong>o2switch</strong>, dont le siège social est situé : Chemin des Pardiaux, 63000 Clermont-Ferrand (Contact téléphonique ou e-mail : +33 4 44 44 60 40 ou support@o2switch.fr).
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Directeur de publication
          </h2>
          <p>
            Le Directeur de la publication du Site est <strong>Vivien BOCQUELET</strong>.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Nous contacter
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Par téléphone : <strong>+33 6 34 72 55 13</strong></li>
            <li>Par e-mail : <strong>contact@spoolio.fr</strong></li>
            <li>Par courrier postal : <strong>40 rue du Hoccart, 59560 Comines</strong></li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Propriété intellectuelle
          </h2>
          <p>
            Tous les textes, marques, graphismes, logos, photographies, illustrations et images reproduits sur ce site sont protégés par le droit d'auteur. Toute reproduction, représentation, modification ou adaptation totale ou partielle de ces éléments, sans accord écrit préalable de l'éditeur du site, est interdite et constitutive de contrefaçon.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
