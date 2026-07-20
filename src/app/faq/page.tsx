import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FAQ | Vos questions sur Spoolio 3D",
  description: "Retrouvez les réponses aux questions les plus fréquentes à propos des objets imprimés en 3D, livraisons, paiements et retours.",
};

export default function FAQPage() {
  const faqSections = [
    {
      title: "Les articles & Impression 3D 🛠️",
      items: [
        {
          q: "Je vois des lignes sur mes articles, c'est normal ?",
          a: "Les objets que vous trouverez sur Spoolio sont imprimés en 3D avec la technologie 'FDM'. Avec cette technologie, l'imprimante chauffe un filament de plastique (PLA) et le dépose sur le plateau, couche par couche. Les lignes que vous voyez sont les différentes couches d'impression, et c'est donc tout à fait normal. Chez Spoolio, on essaie de trouver le meilleur compromis réglage / temps d'impression, pour offrir une bonne qualité de produit sans pour autant prendre 10 jours pour un axolot :)"
        },
        {
          q: "Mon objet est sale, comment je peux le nettoyer ?",
          a: "Le plastique utilisé est du PLA (acide polylactique) et est, comme toute matière, un peu salissante. Pour le nettoyer, vous pouvez utiliser de l'eau froide et du savon (liquide vaisselle, gel douche, peu importe). Attention : le PLA devient malléable à partir de 40°C, privilégiez donc une eau froide, plutôt que la bouilloire. De même, ne placez surtout pas les objets au lave-vaisselle."
        },
        {
          q: "Quels types de produits proposez-vous ?",
          a: "Nous proposons une gamme variée de produits imprimés en 3D, allant des animaux articulés aux décorations murales, en passant par des pochettes surprises et des accessoires fun."
        },
        {
          q: "Puis-je personnaliser les produits ?",
          a: "Oui ! Certains de nos produits, comme les prénoms en 3D ou les porte-clés, sont personnalisables. Indiquez vos préférences lors de la commande."
        }
      ]
    },
    {
      title: "Commandes & Livraison 📦",
      items: [
        {
          q: "Où puis-je commander vos produits ?",
          a: "Tous nos produits sont disponibles sur notre boutique en ligne Spoolio.fr."
        },
        {
          q: "Quels sont les délais de livraison ?",
          a: "Les délais varient entre 3 et 7 jours ouvrés selon votre localisation. Si vous avez choisi un produit personnalisé, cela peut prendre un peu plus de temps."
        },
        {
          q: "Livrez-vous à l’international ?",
          a: "Actuellement, nous livrons en France et en Belgique afin de conserver des tarifs de livraison raisonnables. Contactez-nous si vous êtes hors de ces zones pour voir ce que nous pouvons faire."
        },
        {
          q: "Combien coûtent les frais de livraison ?",
          a: "Les frais de livraison dépendent du poids et de la destination de votre commande. Consultez notre page dédiée ou l'étape panier pour plus de détails. Nous cherchons constamment les meilleurs rapports qualité-prix pour vous expédier vos produits."
        }
      ]
    },
    {
      title: "Paiements 💳",
      items: [
        {
          q: "Quels modes de paiement acceptez-vous ?",
          a: "Nous acceptons les paiements sécurisés par carte bancaire (Visa, Mastercard, etc.) et PayPal."
        },
        {
          q: "Mes informations de paiement sont-elles sécurisées ?",
          a: "Oui, toutes les transactions sur notre site sont sécurisées grâce à un système de cryptage SSL et à un système de paiement qui intègre les dernières normes de sécurité (Stripe / PayPal)."
        }
      ]
    },
    {
      title: "Retours & Garanties 🔄",
      items: [
        {
          q: "Puis-je retourner un produit ?",
          a: "Oui, vous pouvez retourner un produit non personnalisé sous 14 jours après réception, à condition qu’il soit dans son état d’origine. Les frais de retour sont à votre charge."
        },
        {
          q: "Que faire si mon produit est défectueux ?",
          a: "Contactez-nous dans les 7 jours suivant la réception avec une photo du défaut, et nous trouverons une solution (remplacement ou remboursement)."
        }
      ]
    },
    {
      title: "Spécificités & Sécurité 🎒",
      items: [
        {
          q: "Les produits sont-ils adaptés aux enfants ?",
          a: "La plupart de nos produits sont conçus pour être manipulés par des enfants à partir de 5 ans. Cependant, certains articles contiennent de petites pièces et ne conviennent pas aux tout-petits. Pour obtenir la norme CE qui nous permettrait de vendre les objets comme des JOUETS pour enfant, nous devrions faire passer des tests en laboratoire pour chaque objet. Vu le coût que cela représente, nous privilégions la responsabilité de chacun. Nos objets sont vérifiés et testés par nos soins, mais ne sont pas conseillés aux enfants de moins de 14 ans sans surveillance. Vérifiez les recommandations spécifiques sur chaque fiche produit."
        },
        {
          q: "Vos produits sont-ils éco-responsables ?",
          a: "Absolument ! Nos produits sont imprimés avec du PLA, qui est un plastique biodégradable à base de ressources renouvelables comme l’amidon de maïs. C'est une fabrication française réalisée couche par couche dans notre atelier à Comines (59)."
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.15)', filter: 'blur(100px)' }} />
        <div className="absolute top-[40%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] px-6 py-12 relative z-10 flex-grow">
        {/* Title Header */}
        <div className="text-center mb-12 animate-reveal">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Trouve ici toutes les réponses à tes questions à propos de Spoolio. S'il en manque, écris-nous sur notre page de contact !
          </p>
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-10 animate-reveal delay-100">
          {faqSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h2 className="text-lg font-bold tracking-wider text-[#ff4f00] uppercase font-antonio border-b border-spoolio-border pb-2">
                {section.title}
              </h2>
              
              <div className="flex flex-col gap-3">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="p-5 rounded-2xl bg-spoolio-card border border-spoolio-border hover:border-gray-700 transition-colors duration-300"
                  >
                    <h3 className="text-[15px] font-bold text-white mb-2.5">
                      {item.q}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
