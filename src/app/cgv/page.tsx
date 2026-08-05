import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  alternates: {
    canonical: "https://spoolio.fr/cgv",
  },
  title: "Conditions Générales de Vente (CGV) | Spoolio",
  description: "Consultez les Conditions Générales de Vente (CGV) de Spoolio 3D.",
};

export default function CGVPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.15)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full" />

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] px-6 py-12 relative z-10 flex-grow">
        <div className="animate-reveal">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow mb-6 text-center">
            Conditions Générales de Vente
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border text-gray-300 space-y-6 text-xs leading-relaxed animate-reveal delay-100 font-sans">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les transactions commerciales effectuées sur la boutique en ligne <strong>www.spoolio.fr</strong> par des clients particuliers ou professionnels avec l'entreprise individuelle Bocquelet.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 1 - Objet et acceptation
          </h2>
          <p>
            Toute commande passée sur la boutique en ligne implique l'acceptation entière et sans réserve des présentes CGV. Spoolio se réserve le droit de modifier ses CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de validation de la commande par le client.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 2 - Produits et tarification
          </h2>
          <p>
            Les produits proposés sont des objets de décoration et des accessoires imprimés en 3D à partir de plastique végétal (PLA - amidon de maïs). Les prix sont indiqués en Euros (€) et s'entendent toutes taxes comprises (TTC), hors frais de livraison. Spoolio se réserve le droit de modifier ses tarifs à tout moment, mais les produits seront facturés sur la base des prix enregistrés lors de la passation de la commande.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 3 - Commande et paiement
          </h2>
          <p>
            Le client valide sa commande en effectuant son paiement par carte bancaire (via Stripe) ou par PayPal. Les informations bancaires du client sont chiffrées et sécurisées par des tiers de confiance et ne sont jamais stockées sur nos serveurs. Une fois le paiement reçu, une confirmation de commande est envoyée au client par e-mail.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 4 - Fabrication et livraison
          </h2>
          <p>
            Les objets Spoolio sont fabriqués à la demande (impression 3D couche par couche). Les délais habituels de traitement et d'expédition varient de 3 à 7 jours ouvrés selon le volume de commande. La livraison s'effectue en France et en Belgique via Mondial Relay, Colissimo ou lettre suivie à l'adresse indiquée par le client lors du paiement.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 5 - Droit de rétractation et retours
          </h2>
          <p>
            Conformément à l'article L. 221-18 du Code de la consommation, le client dispose d'un délai de 14 jours calendaires à compter de la réception de ses produits pour exercer son droit de rétractation, sans justification. Les objets doivent être retournés dans leur état d'origine. Les produits personnalisés (ex: prénoms sur mesure) ne sont ni repris, ni échangés. Les frais d'expédition de retour sont à la charge exclusive du client.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-spoolio-border pb-2 tracking-wide">
            Article 6 - Service client et litiges
          </h2>
          <p>
            Pour toute réclamation, demande de retour ou question sur ton colis, notre service client est disponible à l'adresse email suivante : <strong>contact@spoolio.fr</strong>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
