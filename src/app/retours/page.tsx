import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de retours et remboursements | Spoolio",
  description: "Consultez notre politique de retours sous 14 jours pour vos commandes Spoolio 3D.",
};

export default function RetoursPage() {
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
            Retours & Remboursements
          </h1>
        </div>

        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border text-gray-300 space-y-6 text-xs leading-relaxed animate-reveal delay-100 font-sans">
          <p>
            Chez Spoolio, on veut que tu adores tes fidgets et tes figurines articulées. Si un article ne correspond pas tout à fait à tes attentes, pas de panique, voici la marche à suivre !
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Délai de rétractation (14 jours)
          </h2>
          <p>
            Tu as <strong>14 jours calendaires</strong> après la réception de ton colis pour décider de nous renvoyer un ou plusieurs articles.
          </p>
          <p>
            ⚠️ <strong>Attention :</strong> Ce droit ne s'applique pas aux objets personnalisés (par exemple, un porte-clé avec un prénom sur-mesure ou une couleur spécifique demandée spécialement).
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Conditions de retour
          </h2>
          <p>
            Pour que le retour soit validé et remboursé, l'objet doit être dans son état d'origine, complet (avec toutes ses articulations intactes !) et dans son emballage d'origine. Les articles endommagés par une mauvaise utilisation (comme avoir été laissés sur le tableau de bord d'une voiture en plein soleil à 60°C) ne pourront pas faire l'objet d'un retour.
          </p>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Comment renvoyer mon article ?
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Envoie-nous un e-mail à <strong>hello@spoolio.fr</strong> en indiquant ton numéro de commande et l'objet concerné.
            </li>
            <li>
              Emballe soigneusement l'article pour qu'il ne s'abîme pas durant le voyage.
            </li>
            <li>
              Expédie le colis à l'adresse de notre atelier qui te sera communiquée en réponse. Les frais de port de retour sont à ta charge.
            </li>
          </ol>

          <h2 className="text-lg font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            Remboursements
          </h2>
          <p>
            Dès réception et vérification de l'état de l'objet dans notre atelier, nous procéderons au remboursement de la valeur du produit retourné. Le remboursement sera crédité directement sur le moyen de paiement utilisé lors de la commande (carte bancaire via Stripe ou compte PayPal) sous 5 à 10 jours ouvrés.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
