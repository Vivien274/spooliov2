"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "./AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

function parseItemName(fullName: string) {
  if (!fullName) return { mainName: "Article", options: [] };
  const match = fullName.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  if (!match) return { mainName: fullName, options: [] };
  const mainName = match[1].trim();
  const optionsRaw = match[2];
  const options = optionsRaw 
    ? optionsRaw.split(",").map(o => o.trim()).filter(Boolean)
    : [];
  return { mainName, options };
}

interface AdminOrder {
  id: string;
  stripeSession?: string;
  email: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
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

export default function AdminDashboard() {
  const { theme, cls } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"dashboard" | "stats" | "printers">("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);
  const [donationTiersCount, setDonationTiersCount] = useState<number | null>(null);

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
      title: "Configuration des Dons",
      description: "Gérer les différents paliers d'entraide (Café, Buse, Plateau PEI...) affichés aux clients sur la boutique.",
      href: "/admin/don",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "#0d9488",
      stats: [
        { label: "Paliers actifs", value: donationTiersCount === null ? "..." : donationTiersCount.toString() },
        { label: "Don libre", value: "Actif" },
      ],
      cta: "Gérer les dons",
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
    {
      title: "SEO Pages Principales 🎯",
      description: "Optimiser les métadonnées Google (Title, Description, OpenGraph) pour l'accueil, la boutique, la tombola...",
      href: "/admin/seo",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "#10b981",
      stats: [
        { label: "Pages gérées", value: "9" },
        { label: "Aperçu SERP", value: "En direct" },
      ],
      cta: "Gérer le SEO",
    },
  ];

  const handleExportBoxtalCSV = () => {
    const shippableOrders = orders.filter(o => o.shippingMethod !== "pickup");
    if (shippableOrders.length === 0) {
      alert("Aucune commande à expédier à exporter.");
      return;
    }

    const headers = [
      "reference",
      "dest_name",
      "dest_address",
      "dest_address2",
      "dest_zipcode",
      "dest_city",
      "dest_country",
      "dest_email",
      "dest_phone",
      "weight",
      "value"
    ];

    const rows = shippableOrders.map(o => {
      const lines = (o.shippingAddress || "").split("\n").map(l => l.trim()).filter(Boolean);
      let name = o.customerName || "";
      let address1 = "";
      let address2 = "";
      let zipcode = "";
      let city = "";
      let country = "FR";

      if (lines.length > 0) {
        if (lines[0].toLowerCase().includes(name.split(" ")[0].toLowerCase()) || lines[0].toLowerCase().includes(name.split(" ").slice(-1)[0].toLowerCase())) {
          name = lines[0];
          address1 = lines[1] || "";
          const zipCityRow = lines.find(l => /^\d{5}/.test(l)) || lines[2] || "";
          const zipMatch = zipCityRow.match(/^(\d{5})/);
          if (zipMatch) {
            zipcode = zipMatch[1];
            city = zipCityRow.replace(zipcode, "").trim();
          } else {
            city = zipCityRow;
          }
          const remainingLines = lines.slice(2).filter(l => l !== zipCityRow && !/^(FR|BELGIQUE|BELGIUM|FRANCE)$/i.test(l));
          address2 = remainingLines.join(", ");
        } else {
          address1 = lines[0] || "";
          const zipCityRow = lines.find(l => /^\d{5}/.test(l)) || lines[1] || "";
          const zipMatch = zipCityRow.match(/^(\d{5})/);
          if (zipMatch) {
            zipcode = zipMatch[1];
            city = zipCityRow.replace(zipcode, "").trim();
          } else {
            city = zipCityRow;
          }
          const remainingLines = lines.slice(1).filter(l => l !== zipCityRow && !/^(FR|BELGIQUE|BELGIUM|FRANCE)$/i.test(l));
          address2 = remainingLines.join(", ");
        }

        const countryLine = lines.find(l => /^(FR|BELGIQUE|BELGIUM|FRANCE|BE)$/i.test(l));
        if (countryLine) {
          country = /^(BELGIQUE|BELGIUM|BE)$/i.test(countryLine) ? "BE" : "FR";
        }
      }

      return [
        o.id,
        name,
        address1,
        address2,
        zipcode,
        city,
        country,
        o.email,
        o.customerPhone || "",
        "0.25",
        o.total.toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.map(val => {
        const cleaned = String(val || "").replace(/"/g, '""').replace(/;/g, ',');
        return `"${cleaned}"`;
      }).join(";"))
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `spoolio_commandes_boxtal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visits statistics states
  const [visitsStats, setVisitsStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // 3D Printers states
  const [printers, setPrinters] = useState<any[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState<boolean>(true);

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

  // Load visits statistics
  const fetchVisitsStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/visits-stats");
      if (res.ok) {
        const data = await res.json();
        setVisitsStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load visits stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load printers list
  const fetchPrinters = async () => {
    try {
      const res = await fetch("/api/admin/printers");
      if (res.ok) {
        const data = await res.json();
        setPrinters(data);
      }
    } catch (e) {
      console.error("Failed to load printers:", e);
    } finally {
      setLoadingPrinters(false);
    }
  };

  const fetchDonationTiersCount = async () => {
    try {
      const res = await fetch("/api/don/tiers");
      if (res.ok) {
        const data = await res.json();
        setDonationTiersCount(data?.length || 0);
      }
    } catch (e) {
      console.error("Failed to load donation tiers count:", e);
    }
  };

  const handleUpdatePrinterStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/printers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        const updated = await res.json();
        setPrinters(prev => prev.map(p => p.id === id ? updated : p));
      }
    } catch (e) {
      console.error("Failed to update printer status:", e);
    }
  };

  // Theme stats state
  const [themeStats, setThemeStats] = useState<{ lightThemeToggles: number; darkThemeToggles: number; lastToggleAt?: string } | null>(null);

  const fetchThemeStats = async () => {
    try {
      const res = await fetch("/api/analytics/theme");
      if (res.ok) {
        const data = await res.json();
        setThemeStats(data);
      }
    } catch (e) {
      console.error("Failed to load theme stats:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchVisitsStats();
    fetchPrinters();
    fetchDonationTiersCount();
    fetchThemeStats();
  }, []);

  const [requestReviewLoading, setRequestReviewLoading] = useState<string | null>(null);

  const handleRequestReview = async (order: AdminOrder) => {
    if (!confirm(`Envoyer un e-mail de relance d'avis client (Google + Site) à ${order.customerName || "ce client"} (${order.email}) ?`)) {
      return;
    }

    setRequestReviewLoading(order.id);
    try {
      const res = await fetch("/api/admin/orders/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          targetEmail: order.email,
          customerName: order.customerName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, reviewRequestedAt: data.reviewRequestedAt } as any : o));
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de l'envoi de la relance pour avis."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de la relance d'avis.");
    } finally {
      setRequestReviewLoading(null);
    }
  };

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
    <div className="w-full max-w-[1850px] mx-auto space-y-8 font-sans px-3 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Espace Admin</h1>
          <p className={`text-sm ${cls.textMuted} mt-1 font-sans`}>Gérez les commandes, personnalisez le Hero d'accueil et pilotez l'atelier.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className={`flex ${theme === "dark" ? "bg-black/40" : "bg-gray-200/60"} border ${cls.border} rounded-2xl p-1 shrink-0 flex-wrap gap-1`}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-white text-black shadow-md admin-tab-active" : `text-gray-400 hover:text-white`
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "stats" ? "bg-white text-black shadow-md admin-tab-active" : `text-gray-400 hover:text-white`
            }`}
          >
            Visites & Analytics
          </button>
          <button
            onClick={() => setActiveTab("printers")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "printers" ? "bg-white text-black shadow-md admin-tab-active" : `text-gray-400 hover:text-white`
            }`}
          >
            État de l'Atelier 🤖
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
                <span className={`text-2xl font-black ${cls.textMain}`}>{kpi.value}</span>
                <span className={`text-[11px] ${cls.textFaint}`}>{kpi.delta}</span>
              </div>
            ))}
          </div>

          {/* 4 Main Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className={`grid gap-2 ${mod.stats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {mod.stats.map((s) => (
                    <div key={s.label} className={`${cls.inputBg} rounded-xl p-3 flex flex-col gap-0.5 border ${cls.border} transition-colors duration-300`}>
                      <span className={`text-lg font-black ${cls.textMain}`}>{s.value}</span>
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
              <div className="flex gap-2">
                <button
                  onClick={handleExportBoxtalCSV}
                  className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer transition-all font-bold"
                >
                  Exporter pour Boxtal 📤
                </button>
                <button
                  onClick={fetchOrders}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
                >
                  Rafraîchir
                </button>
              </div>
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
                        <td className="py-4 px-4 max-w-[220px]">
                          <span className={`block font-bold ${cls.textMain}`}>{o.customerName || "—"}</span>
                          <span className={`block text-[10px] ${cls.textFaint}`}>{o.email}</span>
                          {o.customerPhone && (
                            <span className={`block text-[10px] text-gray-400 mt-0.5 font-mono select-all`}>📞 {o.customerPhone}</span>
                          )}
                          {o.shippingAddress && (
                            <span 
                              className={`block text-[9px] text-gray-400 mt-1 bg-white/[0.03] border border-white/5 rounded-lg p-1.5 select-all whitespace-pre-line leading-relaxed max-w-[200px] font-sans`}
                              title="Adresse de livraison"
                            >
                              📍 {o.shippingAddress}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 min-w-[220px]">
                          <div className="space-y-1.5">
                            {(o.items || []).slice(0, 3).map((item, idx) => {
                              const { mainName, options } = parseItemName(item.name);
                              const isDonation = mainName.toLowerCase().includes("don de soutien");
                              const isTombola = mainName.toLowerCase().includes("tombola") || mainName.toLowerCase().includes("ticket");
                              
                              return (
                                <div key={idx} className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center justify-center font-mono font-black text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${
                                      isDonation 
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                        : isTombola
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        : "bg-[#ff4f00]/15 text-[#ff4f00] border border-[#ff4f00]/25"
                                    }`}>
                                      x{item.quantity}
                                    </span>
                                    <span className="font-bold text-gray-100 text-xs truncate max-w-[180px]" title={mainName}>
                                      {isDonation && "❤️ "}
                                      {isTombola && "🎟️ "}
                                      {mainName}
                                    </span>
                                  </div>
                                  {options.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pl-6">
                                      {options.map((opt, optIdx) => (
                                        <span key={optIdx} className="text-[9px] font-mono bg-white/[0.06] border border-white/10 text-gray-300 px-1.5 py-0.2 rounded-md">
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {o.items && o.items.length > 3 && (
                              <div className="text-[#ff4f00] font-bold text-[10px] mt-1 pl-1">
                                + {o.items.length - 3} autre(s)...
                              </div>
                            )}
                          </div>
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
                          {o.shippingMethod !== "pickup" && (
                            <div className="flex gap-2 mt-1 select-none">
                              <a
                                href={`https://dashboard.stripe.com/search?query=${o.stripeSession}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-[#ff4f00] hover:text-[#ff6a22] transition-colors font-bold uppercase"
                              >
                                Stripe 💳
                              </a>
                              <span className="text-gray-700 text-[9px] select-none">|</span>
                              <a
                                href="https://www.boxtal.com/fr/fr/espace-client/envois/a-preparer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-blue-400 hover:text-blue-300 transition-colors font-bold uppercase"
                              >
                                Boxtal 📦
                              </a>
                            </div>
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
                          <div className="flex justify-end gap-1.5 items-center">
                            <button
                              onClick={() => handleRequestReview(o)}
                              disabled={requestReviewLoading === o.id}
                              className={`px-2 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border ${
                                (o as any).reviewRequestedAt
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                              }`}
                              title={(o as any).reviewRequestedAt ? "Relance d'avis déjà envoyée le " + new Date((o as any).reviewRequestedAt).toLocaleDateString("fr-FR") : "Envoyer un e-mail de relance d'avis client (Google + Site)"}
                            >
                              {requestReviewLoading === o.id
                                ? "Envoi..."
                                : (o as any).reviewRequestedAt
                                ? "Avis Relancé ✓"
                                : "Relancer Avis ⭐️"}
                            </button>
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
      ) : activeTab === "stats" ? (
        <div className="space-y-6">
          {/* Header & Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-0.5`}>
                <span className="text-[#ff4f00]">Analytics & Trafic Studio</span>
              </nav>
              <h3 className={`text-2xl font-black ${cls.textMain} uppercase tracking-tight font-antonio`}>Performance & Fréquentation</h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>Mesurez l'activité en temps réel, l'engagement et l'attractivité des produits.</p>
            </div>
            <button
              onClick={fetchVisitsStats}
              disabled={loadingStats}
              className={`text-xs px-4 py-2 rounded-xl border border-white/10 ${cls.inputBg} hover:bg-white/10 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 font-bold shadow-md`}
            >
              <span>🔄</span>
              <span>{loadingStats ? "Mise à jour..." : "Actualiser les données"}</span>
            </button>
          </div>

          {loadingStats ? (
            <div className="py-16 text-center text-xs text-gray-400 font-bold uppercase tracking-widest font-sans flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#ff4f00] border-t-transparent rounded-full animate-spin" />
              <span>Chargement du Studio Analytics...</span>
            </div>
          ) : !visitsStats ? (
            <div className="py-16 text-center text-xs text-gray-500 font-sans">
              Aucune donnée de visites disponible pour le moment.
            </div>
          ) : (
            <>
              {/* Analytics KPIs Row with Glowing Accents */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* KPI 1: Visites Totales */}
                <div className={`${cls.cardBg} border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/60 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400">Visites Totales</span>
                    <span className="text-sm">🌐</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {visitsStats.totalVisits}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Pages consultées au total</span>
                  </div>
                </div>

                {/* KPI 2: Visites Aujourd'hui */}
                <div className={`${cls.cardBg} border border-[#ff4f00]/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#ff4f00]/60 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#ff4f00]">Aujourd'hui</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Direct
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {visitsStats.todayVisits}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Pages vus ce jour</span>
                  </div>
                </div>

                {/* KPI 3: Visiteurs Uniques (Jour) */}
                <div className={`${cls.cardBg} border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-500/60 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">Uniques (Jour)</span>
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {visitsStats.uniqueToday}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Clients distincts (24h)</span>
                  </div>
                </div>

                {/* KPI 4: Visiteurs Uniques (Semaine) */}
                <div className={`${cls.cardBg} border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-purple-500/60 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400">Uniques (7j)</span>
                    <span className="text-sm">📊</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {visitsStats.uniqueWeek}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Audience hebdomadaire</span>
                  </div>
                </div>

                {/* KPI 5: Mode Clair */}
                <div className={`${cls.cardBg} border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/60 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">Thème Clair ☀️</span>
                    <span className="text-sm">✨</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {themeStats ? themeStats.lightThemeToggles : 0}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Basculements mode jour</span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Graph on Left, Top Products & Pages on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left (8 cols): Interactive Bar Graph */}
                <div className={`lg:col-span-8 ${cls.cardBg} border ${cls.border} rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[400px]`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#ff4f00] tracking-wider">Évolution 7 Derniers Jours</span>
                      <h4 className="text-xl font-black text-white font-antonio uppercase tracking-tight">Trafic & Consultation Quotidienne</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-[#ff4f00]" />
                        Pages Vues par Jour
                      </span>
                    </div>
                  </div>

                  {/* SVG Reference Grid & Bar Chart */}
                  <div className="flex-1 flex items-end justify-between gap-3 sm:gap-4 h-56 mt-6 pt-6 border-b border-white/10 pb-3 relative z-0">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0 pb-6">
                      <div className="border-b border-dashed border-white/40 w-full" />
                      <div className="border-b border-dashed border-white/30 w-full" />
                      <div className="border-b border-dashed border-white/20 w-full" />
                    </div>

                    {visitsStats.dailyStats.map((day: any) => {
                      const maxVal = Math.max(...visitsStats.dailyStats.map((d: any) => d.count), 1);
                      const percent = Math.min(100, Math.max(8, (day.count / maxVal) * 100));

                      return (
                        <div key={day.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                          {/* Value Tag Above Bar */}
                          <span className="text-[11px] font-black font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg shadow-md group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all cursor-pointer">
                            {day.count}
                          </span>
                          
                          {/* Vibrant Gradient Bar */}
                          <div className="w-full max-w-[50px] bg-white/5 rounded-t-xl overflow-hidden flex items-end h-full p-0.5">
                            <div 
                              className="w-full bg-gradient-to-t from-[#ff4f00] via-[#ff6600] to-[#ff9900] rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-[0_0_20px_rgba(255,79,0,0.35)]"
                              style={{ height: `${percent}%` }}
                            />
                          </div>

                          {/* Day Label */}
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center group-hover:text-white transition-colors">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>💡 Astuce : Survoler les barres pour faire défiler le nombre exact de pages lues.</span>
                    <span className="font-mono text-[10px] text-gray-500">Mise à jour en temps réel</span>
                  </div>
                </div>

                {/* Right (4 cols): Top Products & Top Pages */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Top Products Card */}
                  <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex-1 shadow-lg flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔥</span>
                          <h4 className="text-sm font-black text-white font-antonio uppercase tracking-wider">Top Produits Consultés</h4>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {visitsStats.topProducts.length} Fiches
                        </span>
                      </div>
                      
                      {visitsStats.topProducts.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500 font-medium">
                          Aucune vue produit enregistrée pour le moment.
                        </div>
                      ) : (
                        <div className="space-y-3.5 font-sans">
                          {visitsStats.topProducts.slice(0, 5).map((p: any, idx: number) => {
                            const maxCount = Math.max(...visitsStats.topProducts.map((pr: any) => pr.count), 1);
                            const barWidth = (p.count / maxCount) * 100;
                            return (
                              <div key={p.url || idx} className="space-y-1.5 group">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 truncate max-w-[190px]">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                      idx === 0 ? "bg-amber-500 text-black" :
                                      idx === 1 ? "bg-gray-300 text-black" :
                                      idx === 2 ? "bg-amber-700 text-white" :
                                      "bg-white/10 text-gray-400"
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-white group-hover:text-[#ff4f00] transition-colors truncate">{p.name}</span>
                                  </div>
                                  <span className="text-amber-400 font-extrabold font-mono text-[11px] shrink-0">{p.count} vues</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-[#ff4f00] rounded-full transition-all duration-500" 
                                    style={{ width: `${barWidth}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Pages Card */}
                  <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex-1 shadow-lg`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📄</span>
                        <h4 className="text-sm font-black text-white font-antonio uppercase tracking-wider">Pages Les Plus Visitées</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        URLs
                      </span>
                    </div>

                    <div className="space-y-2.5 font-sans">
                      {visitsStats.topPages.slice(0, 6).map((p: any) => {
                        const pageLabel = p.url === "" || p.url === "/" ? "/ (Accueil)" : p.url;
                        const percentage = visitsStats.totalVisits > 0 
                          ? Math.round((p.count / visitsStats.totalVisits) * 100) 
                          : 0;

                        return (
                          <div key={p.url} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                            <span className="font-mono text-[11px] text-gray-300 group-hover:text-white truncate max-w-[190px]">
                              {pageLabel}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-gray-500 font-mono">{percentage}%</span>
                              <span className="font-black text-white font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded-md">
                                {p.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeTab === "printers" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Gestion des Imprimantes 3D</h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>Configurez en temps réel le statut opérationnel des machines de l'atelier.</p>
            </div>
            <button
              onClick={fetchPrinters}
              disabled={loadingPrinters}
              className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
            >
              {loadingPrinters ? "Chargement..." : "Rafraîchir"}
            </button>
          </div>

          {loadingPrinters ? (
            <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
              Chargement des imprimantes...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {printers.map((p: any) => {
                const statusColors: any = {
                  "Active": { border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
                  "En veille": { border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400/50" },
                  "En panne": { border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500 animate-ping" }
                };
                const colors = statusColors[p.status] || { border: "border-gray-500/30", text: "text-gray-400", dot: "bg-gray-400" };

                return (
                  <div key={p.id} className={`${cls.cardBg} border ${colors.border} rounded-2xl p-5 flex flex-col justify-between h-[210px] font-sans transition-colors duration-300`}>
                    <div>
                      <span className={`text-[10px] ${cls.textFaint} uppercase tracking-widest font-bold`}>Machine 3D</span>
                      <h4 className={`text-lg font-black ${cls.textMain} mt-0.5`}>{p.name}</h4>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>{p.status}</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleUpdatePrinterStatus(p.id, "Active")}
                          className={`w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors ${
                            p.status === "Active" ? "bg-white text-black border-white" : `bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 ${cls.textMain}`
                          }`}
                        >
                          Activer
                        </button>
                        <button
                          onClick={() => handleUpdatePrinterStatus(p.id, "En veille")}
                          className={`w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors ${
                            p.status === "En veille" ? "bg-white text-black border-white" : `bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 ${cls.textMain}`
                          }`}
                        >
                          En veille
                        </button>
                        <button
                          onClick={() => handleUpdatePrinterStatus(p.id, "En panne")}
                          className={`w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors ${
                            p.status === "En panne" ? "bg-white text-black border-white" : `bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 ${cls.textMain}`
                          }`}
                        >
                          En panne ⚠️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
