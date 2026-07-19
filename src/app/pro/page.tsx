"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function ProPage() {
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [clientType, setClientType] = useState<string>("association");
  const [quantity, setQuantity] = useState<string>("");
  const [projectDesc, setProjectDesc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/contact-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          clientType,
          quantity,
          projectDesc
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccessMessage(data.message);
      // Reset form
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setQuantity("");
      setProjectDesc("");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black">Espace Professionnels</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center py-12 border-b border-spoolio-border/40 mb-16">
          <span className="text-xs text-blue-400 font-black uppercase tracking-widest block mb-3 font-sans">
            Fabrication Locale &amp; Sur-Mesure
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white font-antonio leading-none mb-6">
            Spoolio pour les professionnels
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed font-sans">
            Spoolio accompagne les professionnels dans la conception et la fabrication d'objets personnalisés, 3D sur-mesure et petites séries. Une production locale et responsable en PLA biosourcé.
          </p>
          <div className="mt-8 flex justify-center select-none font-sans">
            <a
              href="#contact-form"
              className="px-6 py-3 text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-xl transition-all shadow-lg active:scale-95"
            >
              Parler de mon projet &rarr;
            </a>
          </div>
        </section>

        {/* Target Clients Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-black uppercase tracking-tight font-antonio text-white text-center mb-10">
            À qui s'adresse l'offre Pro ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {[
              {
                title: "🏆 Clubs Sportifs & Associations",
                desc: "Valorisez vos événements, fédérez vos membres ou offrez des récompenses uniques. Nous créons des goodies de club personnalisés à votre logo, des porte-clés et des badges de fidélité originaux en petite ou moyenne série.",
                examples: "Porte-clés logotés, jetons de caddie personnalisés, médailles écologiques."
              },
              {
                title: "🌸 Fleuristes & Décorateurs",
                desc: "Présentez vos créations de manière esthétique et durable. Nous fabriquons des supports d'étiquettes de prix designs, des pinces pour plantes, des pots de fleurs auto-irrigants et des accessoires de décoration sur-mesure.",
                examples: "Piquets de prix gravés, supports de fioles, cache-pots design."
              },
              {
                title: "🧼 Artisans, Créateurs & Commerces",
                desc: "Donnez de la visibilité à vos produits sur les comptoirs. Nous concevons des porte-savons ergonomiques logotés (en partenariat avec des savonneries comme Cyaness), des présentoirs de comptoir et des enseignes publicitaires.",
                examples: "Enseignes de comptoir, porte-savons de marque, supports de cartes de visite."
              },
              {
                title: "💼 Entreprises & CSE",
                desc: "Faites le choix de cadeaux d'affaires éco-responsables qui se démarquent des goodies en plastique importés. Offrez à vos collaborateurs ou partenaires des objets personnalisés utiles et fabriqués localement en France.",
                examples: "Supports de téléphone de bureau, organiseurs personnalisés, badges nominatifs."
              }
            ].map((client, idx) => (
              <div
                key={idx}
                className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8 flex flex-col gap-4 hover:border-white/10 transition-colors"
              >
                <h3 className="text-base font-extrabold text-white leading-tight">
                  {client.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {client.desc}
                </p>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Applications :</span>
                  <span className="text-[10px] text-blue-400 font-bold block">{client.examples}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services & Capabilities */}
        <section className="mb-20">
          <h2 className="text-2xl font-black uppercase tracking-tight font-antonio text-white text-center mb-10">
            Nos Savoir-faire &amp; Prestations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {[
              {
                icon: "✏️",
                title: "Objets Personnalisés",
                desc: "Des objets adaptés à votre identité : intégration de votre logo, de votre texte ou de vos couleurs spécifiques pour un rendu unique."
              },
              {
                icon: "📐",
                title: "Produits Sur-Mesure",
                desc: "Un besoin ou un usage particulier ? Nous concevons ensemble des objets uniques pensés pour répondre à une problématique concrète."
              },
              {
                icon: "📦",
                title: "Petites Séries",
                desc: "Idéal pour tester un produit, équiper une boutique ou lancer une collection. Aucun minimum industriel requis."
              },
              {
                icon: "🛠️",
                title: "Prototypage Validation",
                desc: "Avant de lancer la fabrication, nous testons et ajustons les dimensions et l'usage pour un produit 100% fonctionnel."
              },
              {
                icon: "🌱",
                title: "Matière Biosourcée",
                desc: "Toutes nos créations pro sont imprimées en PLA à base d'amidon de maïs recyclé et biosourcé, alliant design et écologie."
              },
              {
                icon: "🇫🇷",
                title: "Atelier Local",
                desc: "Conçu et fabriqué directement dans notre atelier du Nord à Comines, garantissant réactivité et circuits courts."
              }
            ].map((service, idx) => (
              <div
                key={idx}
                className="bg-spoolio-card/40 border border-spoolio-border rounded-2xl p-5 flex flex-col gap-2.5"
              >
                <span className="text-2xl select-none">{service.icon}</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {service.title}
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Case Study (Cyaness) */}
        <section className="mb-20 bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <span className="text-[9px] text-[#ff4f00] font-black uppercase tracking-widest block mb-2 font-sans">
              Partenariat Artisan Pro
            </span>
            <h3 className="text-xl font-extrabold text-white leading-tight font-sans mb-4">
              🧼 Cyaness &amp; Spoolio : Des porte-savons sur-mesure écologiques
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans mb-4">
              Cynthia, fondatrice de la savonnerie artisanale **Cyaness**, a fait appel à Spoolio pour concevoir des porte-savons entièrement personnalisés en PLA biosourcé de Comines, adaptés à ses formats de savons et floqués de sa marque. Une solution qui a séduit ses clients et valorisé ses emballages !
            </p>
            <a
              href="https://cyaness.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-400 hover:text-white transition-colors"
            >
              Découvrir le site de Cyaness &raquo;
            </a>
          </div>
          <div className="w-full md:w-1/3 bg-[#2F3CD9] border border-blue-500/20 rounded-2xl p-5 text-xs text-white font-sans italic relative leading-relaxed no-invert">
            <span className="text-3xl text-white absolute -top-3 -left-2 opacity-35 select-none font-serif">“</span>
            <p className="relative z-10 text-white font-medium">
              Très belle initiative écologique grâce à l'utilisation de maïs de grande qualité. Nous adorons l'aspect personnalisable de nos porte-savons et de nos futures boîtes de transport, un vrai plus pour nos clients ! Un projet porteur de sens.
            </p>
            <span className="block text-[9px] font-black text-blue-200 uppercase tracking-widest not-italic mt-3">
              Cynthia — Savonnerie Cyaness
            </span>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="max-w-[600px] mx-auto bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-center text-white font-antonio mb-2">
            Discuter de votre projet
          </h2>
          <p className="text-xs text-gray-400 font-sans text-center mb-6 leading-relaxed">
            Racontez-nous vos besoins en personnalisation, en sur-mesure ou en prototypage. Nous vous répondrons avec une étude de faisabilité et un devis personnalisé.
          </p>

          {successMessage ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center text-xs font-sans flex flex-col gap-3">
              <span className="text-2xl">🎉</span>
              <p className="font-bold leading-relaxed">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="mt-2 text-[10px] text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-wider underline cursor-pointer"
              >
                Envoyer une autre demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Nom &amp; Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Nom de l'entreprise / Structure
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Club, Fleuriste, Association..."
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Secteur / Profil *
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="h-10 border rounded-xl px-3 outline-none transition-colors appearance-none cursor-pointer review-input"
                  >
                    <option value="association">Association / Club Sportif</option>
                    <option value="fleuriste">Fleuriste / Créateur floral</option>
                    <option value="artisan">Artisan / Commerce local</option>
                    <option value="entreprise">Entreprise / CSE / Bureau</option>
                    <option value="autre">Autre profil</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Quantité estimée (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="ex: 10, 50, 100..."
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Décrivez votre projet (besoin, délais, dimensions...) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Décrivez ici ce que vous souhaitez fabriquer..."
                  className="border rounded-xl p-3 outline-none transition-colors resize-y leading-relaxed font-sans review-input"
                />
              </div>

              {error && (
                <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-sans">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center bg-white hover:bg-gray-200 disabled:bg-white/40 text-black text-xs font-bold rounded-xl transition-all shadow-md mt-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Envoyer ma demande de projet"
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="w-full border-t border-[#1f1f23] bg-spoolio-bg py-8 text-xs text-gray-500">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#ff4f00] flex items-center justify-center text-white font-extrabold text-[10px]">
              S
            </div>
            <span className="font-bold text-gray-300">Spoolio</span>
            <span>&copy; {new Date().getFullYear()} - Tous droits réservés.</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#ff4f00] transition-colors">Mentions Légales</Link>
            <Link href="#" className="hover:text-[#ff4f00] transition-colors">CGV</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
