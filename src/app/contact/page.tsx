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
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-700 font-bold">/</span>
          <span className="text-white font-black">Contact</span>
        </nav>

        {/* Page Title & Intro */}
        <section className="text-center py-8 mb-12 border-b border-spoolio-border/40">
          <span className="text-xs text-[#2F3CD9] font-black uppercase tracking-widest block mb-3 font-sans">
            Une question ? Une idée ?
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white font-antonio leading-none mb-6">
            Contactez l'Atelier
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed font-sans">
            Que ce soit pour une question sur une commande, une demande d'impression 3D personnalisée ou juste pour nous saluer, notre équipe vous répond avec grand plaisir !
          </p>
        </section>

        {/* Contact Info & Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Info Cards (1/3 width) */}
          <div className="md:col-span-1 flex flex-col gap-4 font-sans">
            <div className="bg-spoolio-card border border-spoolio-border rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-lg">📧</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">E-mail de support</span>
              <a
                href="mailto:contact@spoolio.fr"
                className="text-xs text-white hover:text-[#ff4f00] font-bold transition-colors"
              >
                contact@spoolio.fr
              </a>
            </div>

            <div className="bg-spoolio-card border border-spoolio-border rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-lg">📍</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Notre atelier</span>
              <span className="text-xs text-white font-bold leading-normal">
                Comines (59560)<br />
                Nord, France 🇫🇷
              </span>
            </div>

            <div className="bg-spoolio-card border border-spoolio-border rounded-2xl p-5 flex flex-col gap-2">
              <span className="text-lg">⏰</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Horaires de réponse</span>
              <span className="text-xs text-white font-bold leading-normal">
                Du Lundi au Vendredi<br />
                9h00 &rarr; 17h00
              </span>
            </div>
          </div>

          {/* Column 2: Form (2/3 width) */}
          <div className="md:col-span-2 bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8">
            {successMessage ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center text-xs font-sans flex flex-col gap-3">
                <span className="text-2xl">🎉</span>
                <p className="font-bold leading-relaxed">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="mt-2 text-[10px] text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-wider underline cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Votre nom *
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
                    Votre adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@exemple.com"
                    className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Sujet de votre message
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-10 border rounded-xl px-3 outline-none transition-colors appearance-none cursor-pointer review-input"
                  >
                    <option value="general">Question générale / Renseignement</option>
                    <option value="order">Ma commande / Suivi de colis</option>
                    <option value="custom">Demande d'impression 3D personnalisée</option>
                    <option value="bug">Signaler un bug sur le site</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                    Votre message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Comment pouvons-nous vous aider ?"
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
