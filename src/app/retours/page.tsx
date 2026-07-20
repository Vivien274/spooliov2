"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RetoursPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    orderId: "",
    message: ""
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact/retraction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          orderId: "",
          message: ""
        });
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.15)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full no-invert" />

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] px-6 py-12 relative z-10 flex-grow no-invert">
        <div className="animate-reveal">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow mb-6 text-center">
            Retours & Rétractation
          </h1>
        </div>

        {/* Policy Content */}
        <div className="mt-8 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border text-gray-300 space-y-6 text-xs leading-relaxed animate-reveal delay-100 font-sans">
          <p className="text-sm font-semibold text-gray-200">
            La présente politique de retour et de rétractation a pour objet de définir les conditions dans lesquelles vous pouvez exercer votre droit de rétractation auprès de Spoolio, conformément aux dispositions du Code de la consommation français et de la réglementation européenne en vigueur.
          </p>

          <h2 className="text-base font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            1. Droit de rétractation : Délai et Conditions
          </h2>
          <p>
            Conformément à l’article L. 221-18 du Code de la consommation, vous disposez d’un délai de <strong>quatorze (14) jours calendaires</strong> pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
          </p>
          <p>
            Le délai de 14 jours court à compter du lendemain de la réception de votre commande. Si le délai expire un samedi, un dimanche ou un jour férié ou chômé, il est prorogé jusqu'au premier jour ouvrable suivant.
          </p>

          <h2 className="text-base font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            2. Exceptions strictes au droit de rétractation (Exclusions)
          </h2>
          <p>
            En application de l’article L. 221-28 du Code de la consommation, le droit de rétractation ne peut pas être exercé pour les contrats suivants :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Produits ouverts ou endommagés :</strong> Pour des raisons évidentes de protection de l'état des produits, aucun retour, échange ou remboursement ne sera accepté pour les objets cassés, modifiés ou sortis de leur sachet d'emballage d'origine. Les objets doivent être renvoyés parfaitement intacts.
            </li>
            <li>
              <strong>Biens nettement personnalisés :</strong> Toutes les commandes faisant l’objet d’une personnalisation sur-mesure (options de couleurs spécifiques demandées hors-catalogue, gravures de prénoms ou créations uniques) sont explicitement exclues du droit de rétractation dès lors que le processus de fabrication additive (impression 3D) a débuté.
            </li>
          </ul>

          <h2 className="text-base font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            3. Procédure de rétractation en ligne (En quelques clics)
          </h2>
          <p>
            Pour faciliter vos démarches, Spoolio met à votre disposition un outil de rétractation simple et rapide, accessible directement en ligne en remplissant le formulaire ci-dessous. Dès validation du formulaire, un accusé de réception vous sera immédiatement envoyé par e-mail pour confirmer la prise en compte de votre demande.
          </p>
          <p>
            Vous devez ensuite renvoyer les produits intacts au plus tard dans les quatorze (14) jours suivant la communication de votre décision de vous rétracter.
          </p>

          <h2 className="text-base font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            4. Modalités de renvoi et Frais de retour
          </h2>
          <p>
            <strong>Frais de retour :</strong> Sauf mention contraire ou erreur de notre part lors de la préparation de la commande, les frais de port liés au retour des marchandises restent à la charge exclusive du client.
          </p>
          <p>
            <strong>Responsabilité :</strong> Le produit doit être correctement protégé et emballé pour le transport. Le client est responsable de l'état du produit jusqu'à son arrivée à notre atelier. Nous vous conseillons d'utiliser un mode de transport avec suivi (type Colissimo ou lettre suivie).
          </p>

          <h2 className="text-base font-bold text-white uppercase font-antonio border-b border-[#1f1f23] pb-2 tracking-wide">
            5. Remboursement intégral
          </h2>
          <p>
            Dès réception et vérification de la parfaite intégrité des produits retournés (marchandise non ouverte, emballage d'origine intact, pièces d'articulés non cassées), Spoolio procédera au remboursement de la totalité des sommes versées lors de la commande initiale, y compris les frais de livraison standard d'origine.
          </p>
          <p>
            <strong>Délai et moyen de paiement :</strong> Le remboursement sera effectué dans un délai maximal de quatorze (14) jours à compter de la date à laquelle nous sommes informés de votre décision. Nous pouvons différer le remboursement jusqu'à récupération effective des biens. Le remboursement s’effectue en utilisant le même moyen de paiement que celui utilisé lors de la commande initiale (Stripe ou Paypal).
          </p>
        </div>

        {/* Retraction Online Form Widget */}
        <div className="mt-12 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border space-y-6 animate-reveal delay-200">
          <div>
            <h2 className="text-xl font-black font-antonio uppercase tracking-tight text-white">
              Demande de rétractation en ligne
            </h2>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-sans">
              Vous avez changé d'avis ? Conformément à nos conditions générales de vente, vous disposez d'un délai de 14 jours après la réception de votre commande pour exercer votre droit de rétractation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[10px] text-gray-400 leading-relaxed font-sans space-y-2">
            <span className="font-bold text-white uppercase block tracking-wider">Avant de remplir ce formulaire, veuillez vous assurer que votre demande respecte les critères suivants :</span>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Produits intacts :</strong> Pour des raisons évidentes de protection, les objets ne doivent pas avoir été endommagés, modifiés ou sortis de leur sachet d'emballage d'origine.</li>
              <li><strong>Biens personnalisés :</strong> Les commandes réalisées sur-mesure pour vos événements (mariages, anniversaires...) ne peuvent pas faire l'objet d'une rétractation dès lors que leur fabrication a débuté.</li>
            </ul>
            <p className="text-[9px] text-gray-500 pt-1 leading-normal">
              Pour valider votre demande en quelques clics, merci de compléter les informations ci-dessous. Dès réception, un accusé de réception vous sera immédiatement envoyé par e-mail et vous disposerez de 14 jours pour nous renvoyer vos produits (frais de retour à la charge du client).
            </p>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 animate-reveal font-sans">
              <span className="text-2xl">✓</span>
              <h3 className="font-bold text-white text-sm">Demande envoyée avec succès</h3>
              <p className="text-[11px] text-gray-400 leading-normal max-w-sm mx-auto">
                Un e-mail d'accusé de réception vient de vous être envoyé. Vous disposez de 14 jours pour expédier vos produits intacts à notre atelier.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-gray-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Votre prénom"
                    className="h-10 bg-black border border-[#222225] rounded-xl px-3 outline-none focus:border-[#ff4f00] transition-colors text-white"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Votre nom"
                    className="h-10 bg-black border border-[#222225] rounded-xl px-3 outline-none focus:border-[#ff4f00] transition-colors text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@exemple.com"
                  className="h-10 bg-black border border-[#222225] rounded-xl px-3 outline-none focus:border-[#ff4f00] transition-colors text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Numéro de commande (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="Ex: SP-12345"
                  className="h-10 bg-black border border-[#222225] rounded-xl px-3 outline-none focus:border-[#ff4f00] transition-colors text-white uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Commentaire ou message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Précisez ici les articles que vous souhaitez retourner..."
                  rows={4}
                  className="bg-black border border-[#222225] rounded-xl p-3 outline-none focus:border-[#ff4f00] transition-colors text-white resize-y min-h-[80px]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] leading-normal">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#ff4f00] hover:bg-[#e04500] disabled:bg-[#ff4f00]/50 text-white font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:cursor-wait shadow-lg shadow-[#ff4f00]/25"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
