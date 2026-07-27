"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

export interface TombolaConfig {
  id: string;
  title: string;
  description: string;
  image: string;
  estimatedValue: number;
  endDate: string;
  totalCases: number;
  ticketPrice: number;
  status: "active" | "ended" | "drawn";
  winnerTicket?: number | null;
  winnerDrawnAt?: string | null;
}

const DEFAULT_CONFIG: TombolaConfig = {
  id: "tombola-1",
  title: "Mega Pack Fidget & Impression 3D Spoolio",
  description:
    "Tente ta chance de remporter un lot exclusif composé d'objets fidgets sensoriels TDAH, de figurines 3D de collection et d'un porte-clés NFC Spoolio !",
  image: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  estimatedValue: 85.00,
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  totalCases: 40,
  ticketPrice: 2.00,
  status: "active",
  winnerTicket: null,
  winnerDrawnAt: null,
};

const SAMPLE_IMAGES = [
  "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  "/images/alien_capsule.jpg",
  "/images/pochette-kraft.jpg",
  "/images/figma_keychains.jpg",
  "/images/hero_background.jpg",
];

export default function AdminTombolaPage() {
  const { theme, cls } = useAdminTheme();

  // State
  const [config, setConfig] = useState<TombolaConfig>(DEFAULT_CONFIG);
  const [reservedTickets, setReservedTickets] = useState<number[]>([3, 12, 19, 24, 27, 33, 38]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Raffle draw animation state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawDisplayNumber, setDrawDisplayNumber] = useState<number | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  // Load configuration from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const savedConfig = localStorage.getItem("spoolio_tombola_config");
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
      const savedReserved = localStorage.getItem("spoolio_tombola_reserved");
      if (savedReserved) {
        const parsed = JSON.parse(savedReserved);
        if (Array.isArray(parsed)) {
          setReservedTickets(parsed);
        }
      }
    } catch (e) {
      console.error("Erreur chargement admin tombola:", e);
    }
  }, []);

  // Handle image file upload & dynamic WebP conversion via HTML Canvas
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
          setConfig((prev) => ({
            ...prev,
            image: webpDataUrl,
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("spoolio_tombola_config", JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde tombola config:", err);
    }
  };

  // Perform Raffle Draw (Tirage au sort)
  const handleStartDraw = () => {
    if (reservedTickets.length === 0) {
      alert("Impossible d'effectuer le tirage au sort : aucune case n'a été vendue !");
      return;
    }

    setIsDrawing(true);
    setShowWinnerModal(true);

    // Pick random winning ticket among reserved/sold tickets
    const randomIndex = Math.floor(Math.random() * reservedTickets.length);
    const winningTicket = reservedTickets[randomIndex];

    // Roulette counter animation (cycles fast for 3.5 seconds)
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randomDisplay = reservedTickets[Math.floor(Math.random() * reservedTickets.length)];
      setDrawDisplayNumber(randomDisplay);

      if (counter >= 30) {
        clearInterval(interval);
        setDrawDisplayNumber(winningTicket);
        setIsDrawing(false);

        // Update config status
        const updatedConfig: TombolaConfig = {
          ...config,
          status: "drawn",
          winnerTicket: winningTicket,
          winnerDrawnAt: new Date().toLocaleString("fr-FR"),
        };
        setConfig(updatedConfig);
        try {
          localStorage.setItem("spoolio_tombola_config", JSON.stringify(updatedConfig));
        } catch (e) {}
      }
    }, 100);
  };

  // Reset to new Tombola session
  const handleResetNewTombola = () => {
    if (!confirm("Voulez-vous vraiment réinitialiser la tombola et démarrer une nouvelle session ?")) return;

    const newConfig: TombolaConfig = {
      ...DEFAULT_CONFIG,
      id: `tombola-${Date.now()}`,
      status: "active",
      winnerTicket: null,
      winnerDrawnAt: null,
    };
    setConfig(newConfig);
    setReservedTickets([]);
    try {
      localStorage.setItem("spoolio_tombola_config", JSON.stringify(newConfig));
      localStorage.setItem("spoolio_tombola_reserved", JSON.stringify([]));
    } catch (e) {}
  };

  // Stats calculation
  const totalRevenue = (reservedTickets.length * config.ticketPrice).toFixed(2);
  const fillRate = Math.round((reservedTickets.length / config.totalCases) * 100);

  if (!isClient) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <h1 className={`text-2xl font-black ${cls.textMain} tracking-tight uppercase`}>
              Gestion de la Tombola
            </h1>
            <span className="bg-[#2F3CD9]/20 text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
              Admin V2
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Configure le lot, fixe les tarifs, suis les ventes en temps réel et lance le tirage au sort.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tombola"
            target="_blank"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            <span>👁️ Voir la page publique</span>
          </Link>
          <button
            onClick={handleResetNewTombola}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-xl transition-all border border-red-500/30 cursor-pointer"
          >
            ➕ Nouvelle Tombola
          </button>
        </div>
      </div>

      {/* Toast Save Success */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>✅</span>
          <span>Configuration de la Tombola enregistrée avec succès et synchronisée en direct !</span>
        </div>
      )}

      {/* Winner Banner if Drawn */}
      {config.status === "drawn" && config.winnerTicket !== null && (
        <div className="p-6 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black font-black text-2xl flex items-center justify-center shadow-lg animate-bounce">
              #{config.winnerTicket}
            </div>
            <div>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                🎉 Tirage au sort effectué !
              </span>
              <h3 className="text-lg font-black text-white">
                La case gagnante est la n° {config.winnerTicket} !
              </h3>
              <p className="text-xs text-gray-400">
                Tirage validé le {config.winnerDrawnAt}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWinnerModal(true)}
            className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-xl hover:bg-amber-400 transition-colors shadow-lg cursor-pointer"
          >
            Afficher la modale gagnant 🏆
          </button>
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">Statut tombola</span>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                config.status === "drawn"
                  ? "bg-amber-400"
                  : config.status === "active"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-gray-500"
              }`}
            />
            <span className="text-lg font-black text-white uppercase">
              {config.status === "drawn" ? "Tirage effectué 🏆" : "En cours ⚡"}
            </span>
          </div>
        </div>

        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">Cases Vendues</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">
              {reservedTickets.length} / {config.totalCases}
            </span>
            <span className="text-xs font-extrabold text-[#ff4f00] font-mono">{fillRate}%</span>
          </div>
        </div>

        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">Chiffre d&apos;affaires généré</span>
          <span className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {totalRevenue} €
          </span>
        </div>

        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">Action Tirage</span>
          <button
            type="button"
            onClick={handleStartDraw}
            disabled={reservedTickets.length === 0}
            className={`mt-2 py-2 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              reservedTickets.length > 0
                ? "bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-[#ff4f00]/20"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            🎰 Tirage au sort
          </button>
        </div>
      </div>

      {/* Main Form & Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configurator Form */}
        <form
          onSubmit={handleSaveConfig}
          className="lg:col-span-7 bg-[#18181b] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-gray-800 pb-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>⚙️</span> Configuration du Lot & de la Tombola
            </h2>
            <p className="text-xs text-gray-400">
              Modifiez le nom du lot, la photo, la date limite et les règles de prix.
            </p>
          </div>

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase">
              Nom du Lot / Titre de la tombola
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
              placeholder="ex: Mega Pack Fidget Spoolio"
              required
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase">
              Description du lot
            </label>
            <textarea
              rows={3}
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
              placeholder="Description détaillée du lot à gagner..."
              required
            />
          </div>

          {/* Image selection / URL / File Upload */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Image / Photo du lot
              </label>
              {config.image.startsWith("data:image/webp") && (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ⚡ Image convertie en WebP
                </span>
              )}
            </div>

            {/* Upload Button with WebP Conversion */}
            <div className="flex items-center gap-3">
              <label className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border-2 border-dashed border-gray-700 hover:border-[#ff4f00] rounded-2xl text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 group">
                <span className="text-base group-hover:scale-110 transition-transform">📷</span>
                <span>Téléverser une image (Conversion WebP automatique)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Ou URL directe :</span>
              <input
                type="text"
                value={config.image}
                onChange={(e) => setConfig({ ...config, image: e.target.value })}
                className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff4f00]"
                placeholder="/images/... ou Base64"
                required
              />
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">
                Aperçus rapides :
              </span>
              {SAMPLE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConfig({ ...config, image: img })}
                  className={`relative w-10 h-10 rounded-lg overflow-hidden border shrink-0 transition-transform cursor-pointer ${
                    config.image === img ? "border-[#ff4f00] scale-110" : "border-gray-700 opacity-60"
                  }`}
                >
                  <Image src={img} alt="Aperçu" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Grid of inputs: Value, Price, Cases, End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Valeur estimée du lot (€)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.estimatedValue}
                onChange={(e) => setConfig({ ...config, estimatedValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Prix unitaire d&apos;une case (€)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.ticketPrice}
                onChange={(e) => setConfig({ ...config, ticketPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Nombre de cases dans la grille
              </label>
              <select
                value={config.totalCases}
                onChange={(e) => setConfig({ ...config, totalCases: parseInt(e.target.value) || 40 })}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
              >
                <option value={20}>20 cases</option>
                <option value={40}>40 cases (Standard)</option>
                <option value={50}>50 cases</option>
                <option value={80}>80 cases</option>
                <option value={100}>100 cases</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase">
                Date & Heure de fin du tirage
              </label>
              <input
                type="datetime-local"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff4f00]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#2F3CD9] hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl cursor-pointer"
          >
            💾 Enregistrer les modifications
          </button>
        </form>

        {/* Right: Live Preview & Grid Sold State */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Preview */}
          <div className="bg-[#18181b] border border-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Aperçu en direct du lot public
            </h3>
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-800">
              <Image
                src={config.image || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp"}
                alt={config.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-xl border border-white/10 text-white">
                <span className="text-[9px] text-gray-400 block uppercase font-bold">Valeur</span>
                <span className="text-sm font-black">{config.estimatedValue.toFixed(2)} €</span>
              </div>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">{config.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">{config.description}</p>
            </div>
          </div>

          {/* Reserved Grid Mini-Map */}
          <div className="bg-[#18181b] border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-300 uppercase">
                Grille des cases réservées ({reservedTickets.length} / {config.totalCases})
              </h3>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: config.totalCases }, (_, i) => i + 1).map((num) => {
                const isSold = reservedTickets.includes(num);
                const isWinner = config.winnerTicket === num;

                return (
                  <div
                    key={num}
                    className={`aspect-square rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                      isWinner
                        ? "bg-amber-500 text-black border-amber-400 shadow-lg font-black animate-pulse"
                        : isSold
                        ? "bg-red-950/40 text-red-400 border-red-900/50"
                        : "bg-white/5 text-gray-500 border-gray-800"
                    }`}
                  >
                    #{num}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Winner Draw Modal (Tirage au sort) */}
      {showWinnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#131316] border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#ff4f00]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-4xl">🎰</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-2">
                Tirage au sort Spoolio
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isDrawing ? "Sélection aléatoire du numéro gagnant..." : "Le numéro gagnant a été désigné !"}
              </p>
            </div>

            {/* Counter Animation Box */}
            <div className="py-8 bg-black/60 border border-gray-800 rounded-3xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Numéro Gagnant
              </span>
              <div className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-amber-400 to-emerald-400 animate-pulse">
                {drawDisplayNumber ? `#${drawDisplayNumber}` : "---"}
              </div>
            </div>

            {!isDrawing && config.winnerTicket && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-400 font-bold">
                  🎉 Félicitations au détenteur de la case #{config.winnerTicket} !
                </div>
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full py-3 bg-[#ff4f00] hover:bg-[#e04500] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  Fermer & Valider
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
