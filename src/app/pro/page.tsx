"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-zinc-950 transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <span className="text-zinc-950 font-bold">Espace Professionnels</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center py-12 md:py-16 border-b border-zinc-200/80 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700 mb-4">
            <span>🏭</span>
            <span>Fabrication Locale &amp; Sur-Mesure à Comines (59)</span>
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 font-righteous leading-tight mb-6">
            Spoolio pour les{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-500 to-[#ff4f00]">
              professionnels
            </span>
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-sans">
            Spoolio accompagne les professionnels, associations et créateurs dans la conception et la fabrication d&apos;objets personnalisés, 3D sur-mesure et petites séries. Une production locale et responsable en PLA biosourcé.
          </p>
          <div className="mt-8 flex justify-center select-none font-sans">
            <a
              href="#contact-form"
              className="px-8 py-4 text-sm sm:text-base font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-full transition-all shadow-md shadow-[#ff4f00]/25 active:scale-95 font-outfit"
            >
              Parler de mon projet &rarr;
            </a>
          </div>
        </section>

        {/* Target Clients Grid */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-righteous text-zinc-950 text-center mb-12">
            À qui s&apos;adresse l&apos;offre Pro ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
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
                className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 hover:border-zinc-300 hover:shadow-md transition-all shadow-xs"
              >
                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-tight font-outfit">
                  {client.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans">
                  {client.desc}
                </p>
                <div className="mt-auto pt-4 border-t border-zinc-100">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1 font-mono">Applications :</span>
                  <span className="text-xs sm:text-sm text-[#ff4f00] font-semibold block">{client.examples}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services & Capabilities */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-righteous text-zinc-950 text-center mb-12">
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
                className="bg-white border border-zinc-200/90 rounded-2xl p-6 flex flex-col gap-3 hover:border-zinc-300 hover:shadow-xs transition-all shadow-2xs"
              >
                <span className="text-3xl select-none">{service.icon}</span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-950 uppercase tracking-wider font-outfit">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Case Study (Cyaness) */}
        <section className="mb-20 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center shadow-xs">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700">
              Partenariat Artisan Pro
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 leading-tight font-righteous">
              🧼 Cyaness &amp; Spoolio : Des porte-savons sur-mesure écologiques
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans">
              Cynthia, fondatrice de la savonnerie artisanale <strong>Cyaness</strong>, a fait appel à Spoolio pour concevoir des porte-savons entièrement personnalisés en PLA biosourcé de Comines, adaptés à ses formats de savons et floqués de sa marque. Une solution qui a séduit ses clients et valorisé ses emballages !
            </p>
            <a
              href="https://cyaness.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold text-[#ff4f00] hover:text-[#e04500] transition-colors pt-2"
            >
              Découvrir le site de Cyaness &raquo;
            </a>
          </div>
          <div className="w-full md:w-2/5 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-6 text-sm sm:text-base text-zinc-800 font-sans italic relative leading-relaxed shadow-xs">
            <span className="text-4xl text-amber-400 absolute -top-4 -left-2 opacity-50 select-none font-serif">“</span>
            <p className="relative z-10 text-zinc-800 font-medium">
              Très belle initiative écologique grâce à l&apos;utilisation de maïs de grande qualité. Nous adorons l&apos;aspect personnalisable de nos porte-savons et de nos futures boîtes de transport, un vrai plus pour nos clients ! Un projet porteur de sens.
            </p>
            <span className="block text-xs font-bold text-amber-900 uppercase tracking-widest not-italic mt-4">
              Cynthia — Savonnerie Cyaness
            </span>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="max-w-[700px] mx-auto bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-12 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-center text-zinc-950 font-righteous mb-3">
            Discuter de votre projet
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-sans text-center mb-8 leading-relaxed">
            Racontez-nous vos besoins en personnalisation, en sur-mesure ou en prototypage. Nous vous répondrons avec une étude de faisabilité et un devis personnalisé.
          </p>

          {successMessage ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-sm sm:text-base font-sans flex flex-col gap-4">
              <span className="text-3xl">🎉</span>
              <p className="font-bold leading-relaxed">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="mt-2 text-xs text-emerald-700 hover:text-emerald-950 transition-colors font-bold uppercase tracking-wider underline cursor-pointer"
              >
                Envoyer une autre demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Nom &amp; Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Nom de l&apos;entreprise / Structure
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Club, Fleuriste, Association..."
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Secteur / Profil *
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors appearance-none cursor-pointer text-zinc-900 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  >
                    <option value="association">Association / Club Sportif</option>
                    <option value="fleuriste">Fleuriste / Créateur floral</option>
                    <option value="artisan">Artisan / Commerce local</option>
                    <option value="entreprise">Entreprise / CSE / Bureau</option>
                    <option value="autre">Autre profil</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Quantité estimée (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="ex: 10, 50, 100..."
                    className="h-12 text-sm border border-zinc-200 bg-zinc-50 rounded-xl px-4 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-700">
                  Décrivez votre projet (besoin, délais, dimensions...) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Décrivez ici ce que vous souhaitez fabriquer..."
                  className="border border-zinc-200 bg-zinc-50 text-sm rounded-xl p-4 outline-none transition-colors resize-y leading-relaxed font-sans text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                />
              </div>

              {error && (
                <div className="text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl font-sans">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] disabled:opacity-50 text-white text-sm sm:text-base font-bold rounded-full transition-all shadow-md shadow-[#ff4f00]/25 mt-3 cursor-pointer font-outfit active:scale-[0.99]"
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

      <Footer />
    </div>
  );
}
