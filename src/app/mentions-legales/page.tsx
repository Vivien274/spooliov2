import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions Légales | Spoolio",
  description: "Informations légales concernant l'éditeur du site Spoolio, entreprise individuelle Bocquelet.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.15)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] px-6 py-12 relative z-10 flex-grow">
        <div className="animate-reveal">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow mb-6 text-center">
            Mentions Légales
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border text-gray-300 space-y-6 text-xs leading-relaxed animate-reveal delay-100 font-sans">
          <p>
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique (LCEN), il est précisé aux utilisateurs du site Spoolio l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Edition du site
          </h2>
          <p>
            Le présent site, accessible à l’URL <strong>www.spoolio.fr</strong> (le « Site »), est édité par :
          </p>
          <p>
            <strong>Vivien BOCQUELET</strong>, résidant au 40 rue du Hoccart, 59560 Comines, de nationalité Française, immatriculé à l'entreprise individuelle sous le numéro RCS Lille Métropole 840 388 201.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Hébergement
          </h2>
          <p>
            Le Site est hébergé par la société <strong>o2switch</strong>, dont le siège social est situé : Chemin des Pardiaux, 63000 Clermont-Ferrand (Contact téléphonique ou e-mail : +33 4 44 44 60 40 ou support@o2switch.fr).
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Directeur de publication
          </h2>
          <p>
            Le Directeur de la publication du Site est <strong>Vivien BOCQUELET</strong>.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Nous contacter
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Par téléphone : <strong>+33 6 34 72 55 13</strong></li>
            <li>Par e-mail : <strong>contact@spoolio.fr</strong></li>
            <li>Par courrier postal : <strong>40 rue du Hoccart, 59560 Comines</strong></li>
          </ul>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
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
