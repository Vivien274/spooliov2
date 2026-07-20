"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "./AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface AdminOrder {
  id: string;
  email: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: string;
  }[];
  total: number;
  shippingCost: number;
  shippingMethod: string;
  status: string;
  relayDetails: {
    id: string;
    name: string;
    address: string;
  } | null;
  createdAt: string;
}

const modules = [
  {
    title: "Gestion des produits",
    description: "Créer, modifier et supprimer des produits. Gérer les variations, prix, photos et données SEO.",
    href: "/admin/products",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: ADMIN_BLUE,
    stats: [
      { label: "Produits actifs", value: "207" },
      { label: "Catégories", value: "20" },
      { label: "En promo", value: "Oui" },
    ],
    cta: "Gérer les produits",
  },
  {
    title: "Gestion des pages",
    description: "Modifier le contenu des pages statiques du site : À propos, Contact, Mentions légales…",
    href: "/admin/pages",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "#7c3aed",
    stats: [
      { label: "Pages publiées", value: "31" },
      { label: "Brouillons", value: "0" },
      { label: "Dernière màj", value: "Aujourd'hui" },
    ],
    cta: "Gérer les pages",
  },
  {
    title: "Articles de blog",
    description: "Rédiger et publier des articles. Filtrer par catégorie, tag ou statut de publication.",
    href: "/admin/blog",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: "#059669",
    stats: [
      { label: "Articles publiés", value: "7" },
      { label: "Brouillons", value: "0" },
      { label: "Commentaires", value: "0" },
    ],
    cta: "Gérer le blog",
  },
  {
    title: "Commandes clients",
    description: "Suivre les commandes, modifier le statut de livraison (attente impression, expédié...) et voir les relais Mondial Relay.",
    href: "/admin/orders",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: "#e11d48",
    stats: [
      { label: "Suivi des ventes", value: "Actif" },
      { label: "Stripe", value: "Connecté" },
    ],
    cta: "Voir les commandes",
  },
  {
    title: "Modération des avis",
    description: "Valider les avis des acheteurs ou supprimer les spams pour les afficher sur la boutique.",
    href: "/admin/reviews",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: "#d97706",
    stats: [
      { label: "Avis modérés", value: "En direct" },
      { label: "Contrôle spam", value: "Actif" },
    ],
    cta: "Modérer les avis",
  },
];

export default function AdminDashboard() {
  const { cls, theme } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"dashboard" | "hero">("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);

  // Hero settings state
  const [heroConfig, setHeroConfig] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    imageUrl: ""
  });
  const [loadingHero, setLoadingHero] = useState<boolean>(false);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  // Load orders list
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load admin orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load Hero configuration
  const fetchHeroConfig = async () => {
    setLoadingHero(true);
    setHeroError(null);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        setHeroConfig(data.config || {
          title: "La Capsule été",
          subtitle: "Elle est sortie, elle est tout belle !",
          buttonText: "VOIR LA CAPSULE",
          buttonLink: "/boutique",
          imageUrl: "/images/hero_background.jpg"
        });
      }
    } catch (e: any) {
      setHeroError("Erreur de connexion à l'API Hero.");
    } finally {
      setLoadingHero(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchHeroConfig();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setStatusChangeLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        // Reload orders
        await fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue.");
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    setHeroSuccess(null);
    setHeroError(null);

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroConfig)
      });
      const data = await res.json();

      if (res.ok) {
        setHeroSuccess("Configuration Hero mise à jour avec succès !");
      } else {
        setHeroError(data.error || "Erreur de sauvegarde.");
      }
    } catch (err: any) {
      setHeroError("Impossible d'enregistrer.");
    } finally {
      setSavingHero(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "attente_impression":
        return "Attente Impression";
      case "impression":
        return "Impression en cours 🤖";
      case "emballe":
        return "Emballé 📦";
      case "expedie":
        return "Expédié 🚚";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Espace Admin</h1>
          <p className={`text-sm ${cls.textMuted} mt-1 font-sans`}>Gérez les commandes, personnalisez le Hero d'accueil et pilotez l'atelier.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className={`flex bg-black/40 border ${cls.border} rounded-2xl p-1 shrink-0`}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "hero" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Personnalisation Accueil
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* KPI bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Produits totaux", value: "207", delta: "Catalogue MySQL" },
              { label: "Commandes reçues", value: orders.length.toString(), delta: "Enregistrées en base" },
              { label: "Retrait Atelier", value: orders.filter(o => o.shippingMethod === "pickup").length.toString(), delta: "À Comines" },
              { label: "Points Relais / Colissimo", value: orders.filter(o => o.shippingMethod !== "pickup").length.toString(), delta: "Via Boxtal/Stripe" },
            ].map((kpi) => (
              <div key={kpi.label} className={`${cls.cardBg} border ${cls.border} rounded-2xl p-4 flex flex-col gap-1 transition-colors duration-300`}>
                <span className={`text-[11px] ${cls.textFaint} uppercase tracking-widest font-semibold`}>{kpi.label}</span>
                <span className={`text-2xl font-black ${cls.textMain} font-antonio`}>{kpi.value}</span>
                <span className={`text-[11px] ${cls.textFaint}`}>{kpi.delta}</span>
              </div>
            ))}
          </div>

          {/* 3 Main Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <div key={mod.href} className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex flex-col gap-5 transition-colors duration-300 hover:border-white/10`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${mod.color}18`, color: mod.color }}>
                    {mod.icon}
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${cls.textMain} font-antonio uppercase tracking-wide leading-tight`}>{mod.title}</h2>
                    <p className={`text-xs ${cls.textMuted} mt-1 leading-relaxed`}>{mod.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {mod.stats.map((s) => (
                    <div key={s.label} className={`${cls.inputBg} rounded-xl p-3 flex flex-col gap-0.5 border ${cls.border} transition-colors duration-300`}>
                      <span className={`text-lg font-black ${cls.textMain} font-antonio`}>{s.value}</span>
                      <span className={`text-[10px] ${cls.textFaint} leading-tight`}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={mod.href}
                  className="mt-auto w-full py-2.5 rounded-xl text-center text-xs font-bold tracking-wider uppercase transition-all border"
                  style={{ background: `${mod.color}15`, borderColor: `${mod.color}30`, color: mod.color }}
                >
                  {mod.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* Orders Manager Table Section */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Gestion des Commandes</h3>
                <p className={`text-xs ${cls.textMuted} mt-0.5`}>Mettez à jour le statut des impressions 3D et des livraisons en temps réel.</p>
              </div>
              <button
                onClick={fetchOrders}
                className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
              >
                Rafraîchir
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
                Chargement des commandes...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 font-sans">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className={`border-b ${cls.border} text-gray-500 font-bold uppercase tracking-wider text-[10px]`}>
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Mode Livraison</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 pl-4 text-right">Actions rapides</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${cls.divider}`}>
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pr-4 font-mono font-bold text-gray-300 select-all shrink-0">
                          {o.id}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`block font-bold ${cls.textMain}`}>{o.customerName || "—"}</span>
                          <span className={`block text-[10px] ${cls.textFaint}`}>{o.email}</span>
                        </td>
                        <td className="py-4 px-4 max-w-[200px]">
                          {(o.items || []).map((item, idx) => (
                            <div key={idx} className={`text-gray-300 truncate`} title={item.name}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`block font-bold ${cls.textMain}`}>
                            {o.shippingMethod === "pickup" ? "Retrait Atelier" : (o.shippingMethod === "relay" ? "Point Relais" : "Colissimo Domicile")}
                          </span>
                          {o.relayDetails && (
                            <span className={`block text-[10px] ${cls.textFaint} truncate max-w-[150px]`} title={o.relayDetails.name}>
                              {o.relayDetails.name}
                            </span>
                          )}
                        </td>
                        <td className={`py-4 px-4 font-bold ${cls.textMain}`}>
                          {o.total.toFixed(2)}€
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            o.status === "attente_impression" ? "bg-orange-500/10 text-orange-400" :
                            o.status === "impression" ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                            o.status === "emballe" ? "bg-purple-500/10 text-purple-400" :
                            "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {getStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {o.status === "attente_impression" && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, "impression")}
                                disabled={statusChangeLoading === o.id}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Lancer Impression 🛠️
                              </button>
                            )}
                            {o.status === "impression" && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, "emballe")}
                                disabled={statusChangeLoading === o.id}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Emballer 📦
                              </button>
                            )}
                            {o.status === "emballe" && (
                              <button
                                onClick={() => handleUpdateStatus(o.id, "expedie")}
                                disabled={statusChangeLoading === o.id}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                {o.shippingMethod === "pickup" ? "Prêt au Retrait ✓" : "Expédier 🚚"}
                              </button>
                            )}
                            {o.status === "expedie" && (
                              <span className={`text-[10px] ${cls.textFaint} italic`}>Clôturée</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Hero Settings Customizer Panel */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Form */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 md:p-8 space-y-6 transition-colors duration-300`}>
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Réglages Hero</h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>Personnalisez la bannière principale en haut de votre page d'accueil.</p>
            </div>

            {loadingHero ? (
              <div className="py-12 text-center text-xs text-gray-500 uppercase tracking-widest font-bold font-sans">
                Chargement des réglages...
              </div>
            ) : (
              <form onSubmit={handleSaveHero} className="space-y-4 text-xs font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Titre Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroConfig.title}
                    onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                    placeholder="Ex: La Capsule été"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Sous-titre / Description
                  </label>
                  <input
                    type="text"
                    value={heroConfig.subtitle}
                    onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                    placeholder="Ex: Elle est sortie, elle est tout belle !"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Texte du Bouton *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroConfig.buttonText}
                      onChange={(e) => setHeroConfig({ ...heroConfig, buttonText: e.target.value })}
                      placeholder="Ex: VOIR LA CAPSULE"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                      Lien du Bouton *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroConfig.buttonLink}
                      onChange={(e) => setHeroConfig({ ...heroConfig, buttonLink: e.target.value })}
                      placeholder="Ex: /boutique"
                      className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    URL Image de Fond *
                  </label>
                  <input
                    type="text"
                    required
                    value={heroConfig.imageUrl}
                    onChange={(e) => setHeroConfig({ ...heroConfig, imageUrl: e.target.value })}
                    placeholder="Ex: /images/hero_background.jpg"
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                  />
                  <span className={`text-[10px] ${cls.textFaint} mt-1 leading-normal`}>
                    Indiquez le chemin d'une image locale (ex: <code>/images/hero_background.jpg</code>) ou l'adresse absolue d'une image en ligne (ex: <code>https://...</code>).
                  </span>
                </div>

                {heroSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                    ✓ {heroSuccess}
                  </div>
                )}

                {heroError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                    ⚠️ {heroError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingHero}
                  className="w-full h-11 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  style={{ background: ADMIN_BLUE, boxShadow: "0 8px 24px rgba(47, 60, 217, 0.25)" }}
                >
                  {savingHero ? "Sauvegarde..." : "Enregistrer la configuration"}
                </button>
              </form>
            )}
          </div>

          {/* Right Live Preview Box */}
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textFaint}`}>Prévisualisation en direct (Mode Sombre)</h4>
            <div className="relative overflow-hidden rounded-3xl border border-spoolio-border bg-[#0d0d11] aspect-[1.8/1] w-full p-6 flex flex-col items-center justify-center text-center shadow-2xl">
              {/* Dynamic Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-300 no-invert"
                style={{ 
                  backgroundImage: `url('${heroConfig.imageUrl || "/images/hero_background.jpg"}')`
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 z-0" />

              {/* Banner content */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 md:gap-3 max-w-sm">
                <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-tight text-white font-antonio leading-none">
                  {heroConfig.title || "Titre du Hero"}
                </h1>
                <p className="text-[10px] md:text-xs text-gray-200 leading-normal">
                  {heroConfig.subtitle || "Description du hero"}
                </p>
                <button className="mt-2 px-5 py-2 bg-[#ff4f00] text-white font-bold text-[8px] md:text-[10px] tracking-wider rounded-full uppercase cursor-default select-none shadow-md">
                  {heroConfig.buttonText || "Bouton"}
                </button>
              </div>
            </div>
            
            {/* Note */}
            <div className="p-4 rounded-2xl bg-black/10 border border-white/5 text-[10px] text-gray-400 leading-relaxed font-sans flex gap-2">
              <span className="text-yellow-500 text-sm">💡</span>
              <p>
                <strong>Conseil de design :</strong> Utilisez une image de fond sombre ou peu saturée pour que vos titres blancs restent parfaitement lisibles sans dénaturer l'esthétique du site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
