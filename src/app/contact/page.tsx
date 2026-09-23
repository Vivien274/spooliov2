"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("general");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: subject === "order" ? "Ma commande" : subject === "custom" ? "Projet personnalisé" : "Question générale",
          message
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccessMessage(data.message);
      // Reset form
      setName("");
      setEmail("");
      setMessage("");
      setSubject("general");
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
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-12 lg:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-zinc-950 transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-zinc-300 font-bold">/</span>
          <span className="text-zinc-950 font-bold">Contact</span>
        </nav>

        {/* Page Title & Intro */}
        <section className="text-center py-8 mb-12 border-b border-zinc-200/80">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs font-semibold text-orange-700 mb-4">
            <span>👋</span>
            <span>Une question ? Un projet spécial ?</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 font-righteous leading-tight mb-4">
            Contactez{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-500 to-[#ff4f00]">
              l&apos;Atelier
            </span>
          </h1>
          <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans">
            Que ce soit pour une question sur une commande, une demande d&apos;impression 3D personnalisée ou juste pour nous saluer, notre équipe vous répond avec grand plaisir !
          </p>
        </section>

        {/* Contact Info & Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Info Cards (1/3 width) */}
          <div className="md:col-span-1 flex flex-col gap-4 font-sans">
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col gap-2 shadow-xs">
              <span className="text-lg">📧</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">E-mail de support</span>
              <a
                href="mailto:contact@spoolio.fr"
                className="text-xs text-zinc-950 hover:text-[#ff4f00] font-bold transition-colors"
              >
                contact@spoolio.fr
              </a>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col gap-2 shadow-xs">
              <span className="text-lg">📍</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Notre atelier</span>
              <span className="text-xs text-zinc-900 font-bold leading-normal">
                Comines (59560)<br />
                Nord, France 🇫🇷
              </span>
            </div>

            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col gap-2 shadow-xs">
              <span className="text-lg">⏰</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Horaires de réponse</span>
              <span className="text-xs text-zinc-900 font-bold leading-normal">
                Du Lundi au Vendredi<br />
                9h00 &rarr; 17h00
              </span>
            </div>
          </div>

          {/* Column 2: Form (2/3 width) */}
          <div className="md:col-span-2 bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
            {successMessage ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-xs font-sans flex flex-col gap-3">
                <span className="text-2xl">🎉</span>
                <p className="font-bold leading-relaxed">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="mt-2 text-[11px] text-emerald-700 hover:text-emerald-950 transition-colors font-bold uppercase tracking-wider underline cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Votre adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@exemple.com"
                    className="h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Sujet de votre message
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 outline-none transition-colors appearance-none cursor-pointer text-zinc-900 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  >
                    <option value="general">Question générale / Renseignement</option>
                    <option value="order">Ma commande / Suivi de colis</option>
                    <option value="custom">Demande d&apos;impression 3D personnalisée</option>
                    <option value="bug">Signaler un bug sur le site</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Votre message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="border border-zinc-200 bg-zinc-50 rounded-xl p-3 outline-none transition-colors resize-y leading-relaxed font-sans text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10"
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-sans">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center bg-[#ff4f00] hover:bg-[#e04500] disabled:opacity-50 text-white text-sm font-bold rounded-full transition-all shadow-md shadow-[#ff4f00]/20 mt-2 cursor-pointer font-outfit"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Envoyer le message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
