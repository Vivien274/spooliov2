"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getItemProductUrl, parseItemName } from "@/lib/orderUtils";
import OrderItemOptionsViewer from "@/components/OrderItemOptionsViewer";

interface OrderDetail {
  id: string;
  status: string;
  shippingMethod: string;
  relayDetails: {
    id: string;
    name: string;
    address: string;
  } | null;
  items: {
    name: string;
    quantity: number;
    price: string;
    slug?: string;
  }[];
  total: number;
  shippingCost: number;
  createdAt: string;
}

const MACHINES = ["Berthe", "Philomène", "Ursule", "Godelaine", "Claudine"];

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  const getMachineForOrder = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return MACHINES[sum % MACHINES.length];
  };

  const machineName = order ? getMachineForOrder(order.id) : "";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Clean ID prefix if user inputs 'sim_' or 'SP-'
      let cleanId = orderId.trim();
      if (cleanId.toLowerCase().startsWith("sim_")) {
        cleanId = cleanId.slice(4);
      }
      
      const res = await fetch(`/api/suivi?id=${cleanId}&email=${email.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Commande introuvable.");
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Convert raw status keys to human strings & step indexes
  const getStatusStep = (status: string) => {
    switch (status) {
      case "attente_impression":
        return 1;
      case "impression":
        return 2;
      case "emballe":
        return 3;
      case "expedie":
        return 4;
      default:
        return 1;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "attente_impression":
        return "En attente de fabrication";
      case "impression":
        return "Impression 3D en cours 🤖";
      case "emballe":
        return "Emballé à l'atelier 📦";
      case "expedie":
        return "Expédié / Prêt au retrait 🚚";
      default:
        return "Statut inconnu";
    }
  };

  const activeStep = order ? getStatusStep(order.status) : 1;

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 pt-10 pb-16 flex flex-col justify-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-center text-white font-antonio mb-8 mt-6 sm:mt-10">
          Suivre ma commande
        </h1>

        {!order ? (
          /* SEARCH FORM */
          <div className="max-w-[450px] w-full mx-auto bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8 shadow-2xl">
            <p className="text-xs text-gray-400 font-sans leading-relaxed mb-6 text-center">
              Saisissez le numéro de votre commande (ex: SP-12345) et votre adresse email de facturation pour suivre son impression en temps réel.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Numéro de commande
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="SP-XXXXX"
                  className="h-11 bg-black border border-[#222225] rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="h-11 bg-black border border-[#222225] rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#ff4f00] transition-colors"
                />
              </div>

              {error && (
                <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg font-sans">
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
                  "Rechercher ma commande"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ORDER DETAILS & TIMELINE */
          <div className="flex flex-col gap-6 font-sans">
            {/* Header info card */}
            <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">Commande</span>
                <h2 className="text-xl font-black text-white">{order.id}</h2>
                <span className="text-xs text-gray-400 font-sans block mt-1">
                  Reçue le {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">État actuel</span>
                <span className="text-sm font-black text-emerald-400 tracking-wide uppercase">
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 md:p-8 flex flex-col gap-8">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">Avancement de la fabrication</h3>
              
              <div className="relative flex flex-col sm:flex-row justify-between gap-8 sm:gap-4 select-none">
                {/* Connecting Line background */}
                <div className="absolute left-[15px] sm:left-0 sm:top-[18px] right-0 bottom-0 sm:bottom-auto w-[2px] sm:w-full h-full sm:h-[2px] bg-[#1f1f23] z-0" />
                {/* Active progress bar overlay */}
                <div 
                  className="absolute left-[15px] sm:left-0 sm:top-[18px] w-[2px] sm:h-[2px] bg-emerald-400 z-0 transition-all duration-500"
                  style={{
                    height: typeof window !== 'undefined' && window.innerWidth < 640 ? `${((activeStep - 1) / 3) * 100}%` : '2px',
                    width: typeof window !== 'undefined' && window.innerWidth >= 640 ? `${((activeStep - 1) / 3) * 100}%` : '2px'
                  }}
                />

                {[
                  { step: 1, label: "Payé", desc: "Paiement validé" },
                  { step: 2, label: "Impression 3D", desc: "Berthe & Ursule impriment" },
                  { step: 3, label: "Emballé", desc: "Colis prêt avec amour" },
                  { step: 4, label: "Livré", desc: order.shippingMethod === "pickup" ? "Prêt au retrait" : "En cours de livraison" },
                ].map((s) => {
                  const isDone = activeStep >= s.step;
                  const isCurrent = activeStep === s.step;
                  return (
                    <div key={s.step} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-2 z-10 flex-1 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border transition-all ${
                        isDone 
                          ? "bg-emerald-400 border-emerald-400 text-black shadow-lg shadow-emerald-400/20" 
                          : "bg-spoolio-bg border-spoolio-border text-gray-500"
                      } ${isCurrent ? "ring-4 ring-emerald-400/20 animate-pulse scale-105" : ""}`}>
                        {isDone && s.step < activeStep ? "✓" : s.step}
                      </div>
                      <div>
                        <span className={`text-sm font-extrabold block ${isDone ? "text-white" : "text-gray-500"}`}>
                          {s.label}
                        </span>
                        <span className="text-xs text-gray-400 font-sans block mt-0.5 leading-snug max-w-[140px]">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive 3D Printer Animation (Visible only when status is 'impression') */}
              {order.status === "impression" && (
                <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-[#ff4f00]/25 my-4 gap-4 animate-reveal select-none">
                  {/* 3D Printer Animation Frame Container */}
                  <div className="relative w-48 h-36 border border-white/10 rounded-xl overflow-hidden bg-black/40 flex flex-col justify-end p-2 z-0 no-invert shadow-inner">
                    {/* Grid design background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                    
                    {/* Printer Frame structure */}
                    <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20" />
                    <div className="absolute top-2 left-6 bottom-2 w-0.5 bg-white/10" />
                    <div className="absolute top-2 right-6 bottom-2 w-0.5 bg-white/10" />
                    
                    {/* Vertical Lead screw */}
                    <div className="absolute top-2 left-12 bottom-2 w-0.5 bg-white/5 border-l border-dashed border-white/25" />
                    
                    {/* Printer Bed (heated plate) */}
                    <div className="w-full h-2 bg-[#ff4f00]/20 border-t border-[#ff4f00]/40 rounded-sm relative z-0 flex items-center justify-center shadow-lg shadow-[#ff4f00]/10">
                      <span className="w-8 h-0.5 bg-[#ff4f00]/80 blur-[2px] animate-pulse" />
                    </div>
                    
                    {/* Moving print nozzle/gantry */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-white/20 flex items-center justify-center animate-printer-gantry z-10">
                      {/* Nozzle Block */}
                      <div className="w-6 h-6 bg-gray-800 border border-white/20 rounded-md relative flex flex-col items-center justify-start pt-1 animate-printer-nozzle shadow-md">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping opacity-75" />
                        {/* Nozzle Tip */}
                        <div className="absolute bottom-[-3px] w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                      </div>
                    </div>
                    
                    {/* Filament Line */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] bg-[#ff4f00]/50 bottom-1/2 z-0" />
                    
                    {/* Spoolio Logo watermark inside container */}
                    <span className="absolute top-4 right-8 text-[8px] font-black text-white/5 uppercase tracking-widest pointer-events-none">Spoolio V2</span>
                  </div>
                  <div className="text-center font-sans">
                    <p className="text-sm text-white font-extrabold flex items-center gap-1.5 justify-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4f00] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4f00]"></span>
                      </span>
                      <span>🤖 {machineName} s'active sur votre commande !</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 leading-normal">Fabrication active par dépôt de filament PLA biosourcé à 215°C.</p>
                  </div>
                </div>
              )}

              {/* Statut Explanatory Text Box */}
              <div className="p-4.5 rounded-2xl bg-black/40 border border-white/5 text-sm text-gray-300 font-sans leading-relaxed mt-2 select-none">
                {order.status === "attente_impression" && (
                  <p>Votre commande a été reçue et validée. Elle est placée dans la file d'attente d'impression. Dès qu'une buse se libère, la fabrication commencera.</p>
                )}
                {order.status === "impression" && (
                  <p>🛠️ <strong className="text-white">L'atelier s'active !</strong> Nos imprimantes 3D de précision (Berthe, Philomène, Ursule, Godelaine ou Claudine) façonnent actuellement vos objets couche par couche. Température de buse moyenne : 215°C.</p>
                )}
                {order.status === "emballe" && (
                  <p>📦 <strong className="text-white">Fini d'imprimer !</strong> Votre commande a passé le contrôle qualité. Nous l'emballons soigneusement dans un carton éco-conçu avec une surprise exclusive imprimée en 3D à l'intérieur.</p>
                )}
                {order.status === "expedie" && (
                  <p>🚚 {order.shippingMethod === "pickup" 
                    ? <span>✨ <strong className="text-white">Disponible !</strong> Votre commande est prête. Vous pouvez venir la récupérer directement à notre atelier de Comines dès aujourd'hui.</span> 
                    : <span>✨ <strong className="text-white">Expédié !</strong> Votre colis a été remis au transporteur via Boxtal ({order.shippingMethod === "relay" ? "Mondial Relay" : "Colissimo Domicile"}). Vous recevrez un e-mail de suivi contenant les informations de transport incessamment.</span>
                  }</p>
                )}
              </div>
            </div>

            {/* Items Recap Grid */}
            <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Récapitulatif des objets</h3>
              <div className="flex flex-col gap-3 font-sans">
                {order.items.map((item, idx) => {
                  const itemUrl = getItemProductUrl(item);
                  const { mainName, options } = parseItemName(item.name);
                  return (
                    <div key={idx} className="flex flex-col py-2.5 border-b border-white/5 last:border-0 last:pb-0 gap-1 font-sans">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {itemUrl ? (
                            <Link
                              href={itemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-white hover:text-[#ff4f00] transition-colors inline-flex items-center gap-1.5 group"
                              title="Ouvrir la fiche produit sur le site"
                            >
                              <span>{mainName}</span>
                              <span className="text-[10px] text-gray-400 group-hover:text-[#ff4f00] transition-colors">↗</span>
                            </Link>
                          ) : (
                            <span className="font-bold text-white">{mainName}</span>
                          )}
                          <span className="text-[10px] text-gray-500 font-sans">x{item.quantity}</span>
                        </div>
                        <span className="font-extrabold text-gray-300">{(parseFloat(item.price) * item.quantity).toFixed(2)}€</span>
                      </div>
                      {options.length > 0 && (
                        <OrderItemOptionsViewer options={options} />
                      )}
                    </div>
                  );
                })}
                
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4 mt-2">
                  <span>Frais d'envoi ({order.shippingMethod === "pickup" ? "Retrait" : (order.shippingMethod === "relay" ? "Relais" : "Domicile")})</span>
                  <span>{order.shippingCost === 0 ? "Offert" : `${order.shippingCost.toFixed(2)}€`}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-white mt-1">
                  <span>Total payé</span>
                  <span className="text-base font-black text-white">{order.total.toFixed(2)}€</span>
                </div>
              </div>

              {order.relayDetails && (
                <div className="mt-4 pt-4 border-t border-white/5 text-xs font-sans">
                  <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Point Relais sélectionné</span>
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">🏪</span>
                    <div>
                      <span className="font-bold text-emerald-400 block">{order.relayDetails.name}</span>
                      <span className="text-[10px] text-gray-400 block">{order.relayDetails.address}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setOrder(null)}
              className="mt-4 text-xs font-bold text-gray-500 hover:text-white transition-colors text-center self-center cursor-pointer"
            >
              &larr; Rechercher une autre commande
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
