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
            <span>📜</span>
            <span>Conditions Générales</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-antonio text-zinc-950 mb-4">
            Conditions Générales de Vente
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-white border border-zinc-200/90 text-zinc-700 space-y-6 text-xs sm:text-sm leading-relaxed animate-reveal delay-100 font-sans shadow-2xs">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les transactions commerciales effectuées sur la boutique en ligne <strong>www.spoolio.fr</strong> par des clients particuliers ou professionnels avec l'entreprise individuelle Bocquelet.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Article 1 - Objet et acceptation
          </h2>
          <p>
            Toute commande passée sur la boutique en ligne implique l'acceptation entière et sans réserve des présentes CGV. Spoolio se réserve le droit de modifier ses CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de validation de la commande par le client.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Article 2 - Produits et tarification
          </h2>
          <p>
            Les produits proposés sont des objets de décoration et des accessoires imprimés en 3D à partir de plastique végétal (PLA - amidon de maïs). Les prix sont indiqués en Euros (€) et s'entendent toutes taxes comprises (TTC), hors frais de livraison. Spoolio se réserve le droit de modifier ses tarifs à tout moment, mais les produits seront facturés sur la base des prix enregistrés lors de la passation de la commande.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Article 3 - Commande et paiement
          </h2>
          <p>
            Le client valide sa commande en effectuant son paiement par carte bancaire (via Stripe) ou par PayPal. Les informations bancaires du client sont chiffrées et sécurisées par des tiers de confiance et ne sont jamais stockées sur nos serveurs. Une fois le paiement reçu, une confirmation de commande est envoyée au client par e-mail.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Article 4 - Fabrication et livraison
          </h2>
          <p>
            Les objets Spoolio sont fabriqués à la demande (impression 3D couche par couche). Les délais habituels de traitement et d'expédition varient de 3 à 7 jours ouvrés selon le volume de commande. La livraison s'effectue en France et en Belgique via Mondial Relay, Colissimo ou lettre suivie à l'adresse indiquée par le client lors du paiement.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
            Article 5 - Droit de rétractation et retours
          </h2>
          <p>
            Conformément à l'article L. 221-18 du Code de la consommation, le client dispose d'un délai de 14 jours calendaires à compter de la réception de ses produits pour exercer son droit de rétractation, sans justification. Les objets doivent être retournés dans leur état d'origine. Les produits personnalisés (ex: prénoms sur mesure) ne sont ni repris, ni échangés. Les frais d'expédition de retour sont à la charge exclusive du client.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-zinc-950 uppercase font-antonio border-b border-zinc-100 pb-2 tracking-wide">
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
