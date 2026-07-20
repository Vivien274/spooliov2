import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cookies et Confidentialité | Spoolio",
  description: "Consultez notre politique de cookies et de protection de la vie privée (RGPD).",
};

export default function CookiesPage() {
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
            Politique de Cookies & RGPD
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border text-gray-300 space-y-6 text-xs leading-relaxed animate-reveal delay-100 font-sans">
          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            1. L'utilisation de cookies
          </h2>
          <p>
            Notre site internet Spoolio utilise des cookies. Un cookie est un petit fichier qui est envoyé avec les pages de ce site Web et/ou les applications Flash et qui est stocké par ton navigateur sur le disque dur de ton ordinateur, téléphone portable, montre connectée ou tablette. Les informations qui y sont stockées peuvent être retournées à nos serveurs lors d'une visite ultérieure.
          </p>
          <p>
            L'utilisation de cookies est d'une grande importance pour le bon fonctionnement de notre site web. Grâce à la contribution (anonyme) des visiteurs, nous pouvons améliorer l'utilisation du site internet et le rendre plus convivial.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            2. Consentement
          </h2>
          <p>
            Ton consentement est requis pour l'utilisation de certains cookies. Nous le recueillons au moyen d'une bannière informative présente lors de ta première visite sur le site.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            3. Le type de cookies utilisés et leurs objectifs
          </h2>
          <p>
            Nous utilisons les cookies suivants :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Cookies fonctionnels :</strong> Ils nous permettent d'améliorer le fonctionnement du site internet et de le rendre plus convivial pour le visiteur (par exemple, mémoriser tes préférences d'affichage ou le contenu de ton panier).
            </li>
            <li>
              <strong>Cookies de mesure d'audience (anonymes) :</strong> Ils nous permettent de comprendre le parcours des visiteurs (nombre de visites, pages consultées, temps passé) afin d'optimiser l'ergonomie générale du site.
            </li>
            <li>
              <strong>Cookies tiers (Réseaux sociaux / Stripe / PayPal) :</strong> Stripe et PayPal déposent des cookies de sécurité et de prévention des fraudes pour assurer la validité de tes paiements. Les boutons de partage des réseaux sociaux peuvent également déposer des cookies analytiques.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            4. Tes droits à l'égard de tes données personnelles
          </h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), tu disposes d'un droit d'accès, de rectification, de limitation et de suppression de tes données personnelles collectées lors de tes commandes ou de ta navigation.
          </p>
          <p>
            Tu peux exercer ces droits en nous envoyant un e-mail simple à l'adresse suivante : <strong>contact@spoolio.fr</strong>.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            5. Blocage et suppression des cookies
          </h2>
          <p>
            Tu peux facilement bloquer et supprimer toi-même les cookies à tout moment via les paramètres de ton navigateur Internet (Chrome, Firefox, Safari, Edge, etc.). Note cependant que le refus des cookies techniques indispensables peut altérer le bon fonctionnement de la boutique (par exemple, la persistance de ton panier d'achat).
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
