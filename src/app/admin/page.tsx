"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "./AdminThemeContext";
import { parseItemName } from "@/lib/orderUtils";
import { recommendPackaging } from "@/lib/packagingUtils";
import OrderItemOptionsViewer from "@/components/OrderItemOptionsViewer";

const ADMIN_BLUE = "#2F3CD9";

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
      description: "Créer, modifier et supprimer des produits. Gérer les déclinaisons, prix, photos et données SEO.",
      href: "/admin/products",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: ADMIN_BLUE,
      cta: "Catalogue Produits",
    },
    {
      title: "Commandes clients",
      description: "Historique complet des commandes, états d'impression 3D, étiquettes Boxtal et expéditions.",
      href: "/admin/orders",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: "#e11d48",
      cta: "Toutes les commandes",
    },
    {
      title: "Finances & Livraison",
      description: "Ajuster le seuil de port offert (ex: 60€), les tarifs de livraison relais / domicile et réassurance.",
      href: "/admin/shipping",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
        </svg>
      ),
      color: "#ff4f00",
      cta: "Tarifs & Finances",
    },
    {
      title: "Design Hero Accueil",
      description: "Choisir l'image de fond, le produit mis en avant dans la bulle flottante et les textes du slider.",
      href: "/admin/hero",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "#8b5cf6",
      cta: "Personnaliser Hero",
    },
    {
      title: "Codes Promo & Offres",
      description: "Gérer les codes réduction (pourcentage, fixe ou livraison offerte) et opérations spéciales.",
      href: "/admin/promos",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: "#ec4899",
      cta: "Gérer les promos",
    },
    {
      title: "Modération des avis",
      description: "Valider les avis des acheteurs vérifiés ou modérer les retours sur la boutique.",
      href: "/admin/reviews",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: "#d97706",
      cta: "Modérer les avis",
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
        setVisitsStats(data.stats || data);
      }
    } catch (e) {
      console.error("Failed to load visits stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportAnalyticsCSV = () => {
    if (!visitsStats) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Categorie,Indicateur,Valeur\n";
    csvContent += `Visites,Visites Totales,${visitsStats.totalVisits || 0}\n`;
    csvContent += `Visites,Aujourd'hui,${visitsStats.todayVisits || 0}\n`;
    csvContent += `Visites,En Direct (5min),${visitsStats.liveActiveUsers || 0}\n`;
    csvContent += `Visites,Uniques (Jour),${visitsStats.uniqueToday || 0}\n`;
    csvContent += `Visites,Uniques (7j),${visitsStats.uniqueWeek || 0}\n`;
    csvContent += `Conversion,Taux de conversion (%),${visitsStats.conversionRate || 0}\n`;
    csvContent += `Conversion,Commandes,${visitsStats.funnel?.step3_orders || 0}\n`;

    if (Array.isArray(visitsStats.topPages)) {
      csvContent += "\nTop Pages,URL,Vues\n";
      visitsStats.topPages.forEach((p: any) => {
        csvContent += `Page,"${p.url}",${p.count}\n`;
      });
    }

    if (Array.isArray(visitsStats.topProducts)) {
      csvContent += "\nTop Produits,Nom,Vues\n";
      visitsStats.topProducts.forEach((p: any) => {
        csvContent += `Produit,"${p.name}",${p.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spoolio_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className={`flex ${theme === "dark" ? "bg-black/60" : "bg-gray-200/80"} border ${cls.border} rounded-2xl p-1.5 shrink-0 flex-wrap gap-1.5 shadow-inner`}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-[#2F3CD9] to-[#4351FF] text-white shadow-lg shadow-[#2F3CD9]/35 scale-[1.03]"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === "stats"
                ? "bg-gradient-to-r from-[#2F3CD9] to-[#4351FF] text-white shadow-lg shadow-[#2F3CD9]/35 scale-[1.03]"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Visites & Analytics
          </button>
          <button
            onClick={() => setActiveTab("printers")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === "printers"
                ? "bg-gradient-to-r from-[#2F3CD9] to-[#4351FF] text-white shadow-lg shadow-[#2F3CD9]/35 scale-[1.03]"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            État de l'Atelier 🤖
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* SECTION 1: RÉCAPITULATIF DU TRAFIC & VISITES EN DIRECT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-black ${cls.textMain} font-antonio uppercase tracking-wide flex items-center gap-2`}>
                  <span>📊</span>
                  <span>Récapitulatif du Trafic & Visites</span>
                </h2>
                <p className={`text-xs ${cls.textMuted}`}>Statistiques de fréquentation enregistrées en temps réel.</p>
              </div>
              <button
                onClick={fetchVisitsStats}
                disabled={loadingStats}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/10 ${cls.inputBg} hover:bg-white/10 ${cls.textMain} transition-all flex items-center gap-1.5 cursor-pointer shadow-sm`}
              >
                <span>🔄</span>
                <span>{loadingStats ? "Mise à jour..." : "Actualiser"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* KPI 1: Live Active Users */}
              <div className={`p-4 rounded-2xl ${cls.cardBg} border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">En Direct (5 min)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-3xl font-black font-mono text-white my-1">{visitsStats?.liveActiveUsers || 0}</span>
                <span className="text-[10px] text-emerald-400 font-bold">🟢 Utilisateur(s) connecté(s)</span>
              </div>

              {/* KPI 2: Today Visits */}
              <div className={`p-4 rounded-2xl ${cls.cardBg} border border-white/10 flex flex-col justify-between shadow-lg`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Visites Aujourd'hui</span>
                <span className="text-3xl font-black font-mono text-white my-1">{visitsStats?.todayVisits || 0}</span>
                <span className="text-[10px] text-gray-400">{visitsStats?.uniqueToday || 0} visiteur(s) unique(s)</span>
              </div>

              {/* KPI 3: Week Visits */}
              <div className={`p-4 rounded-2xl ${cls.cardBg} border border-white/10 flex flex-col justify-between shadow-lg`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Visites (7 derniers jours)</span>
                <span className="text-3xl font-black font-mono text-white my-1">{visitsStats?.weekVisits || 0}</span>
                <span className="text-[10px] text-gray-400">{visitsStats?.uniqueWeek || 0} uniques cette semaine</span>
              </div>

              {/* KPI 4: Top Product */}
              <div className={`p-4 rounded-2xl ${cls.cardBg} border border-white/10 flex flex-col justify-between shadow-lg`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Produit #1 Consulté</span>
                <span className="text-sm font-black text-white truncate my-1" title={visitsStats?.topProducts?.[0]?.name || "—"}>
                  {visitsStats?.topProducts?.[0]?.name || "En attente de visites"}
                </span>
                <span className="text-[10px] text-gray-300 font-bold font-mono">
                  {visitsStats?.topProducts?.[0]?.count || 0} vue(s) enregistrée(s)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMANDES À TRAITER (À l'Atelier) */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 transition-colors duration-300 space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-black ${cls.textMain} uppercase tracking-widest font-antonio`}>
                    ⚡ Commandes à Traiter à l'Atelier
                  </h3>
                  {(() => {
                    const pending = orders.filter(o => o.status !== "expedie" && !(o as any).archived);
                    return (
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
                        {pending.length} en attente
                      </span>
                    );
                  })()}
                </div>
                <p className={`text-xs ${cls.textMuted} mt-0.5`}>
                  Commandes actives nécessitant une impression, un emballage ou une remise en main propre (hors clôturées/archivées).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBoxtalCSV}
                  className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-all font-bold"
                >
                  Exporter pour Boxtal 📤
                </button>
                <Link
                  href="/admin/orders"
                  className="text-xs px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-bold"
                >
                  Historique complet →
                </Link>
              </div>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
                Chargement des commandes à traiter...
              </div>
            ) : (() => {
              const pendingOrders = orders.filter(o => o.status !== "expedie" && !(o as any).archived);
              
              if (pendingOrders.length === 0) {
                return (
                  <div className="py-10 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-emerald-400 space-y-1">
                    <span className="text-xl block">🎉</span>
                    <span className="text-xs font-bold uppercase tracking-wider block">Toutes les commandes sont traitées !</span>
                    <span className="text-[11px] text-gray-400 block">Aucune commande en attente d'impression ou d'emballage pour le moment.</span>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className={`border-b ${cls.border} text-gray-500 font-bold uppercase tracking-wider text-[10px]`}>
                        <th className="py-3 pr-4">ID</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Articles</th>
                        <th className="py-3 px-4">Mode / Packaging</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 pl-4 text-right">Action rapide</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${cls.divider}`}>
                      {pendingOrders.map((o) => {
                        const pkg = recommendPackaging(o.items, o.shippingMethod);

                        return (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-4 font-mono font-bold text-gray-300 select-all shrink-0">
                              {o.id}
                            </td>
                            <td className="py-4 px-4 max-w-[200px]">
                              <span className={`block font-bold ${cls.textMain}`}>{o.customerName || "—"}</span>
                              <span className={`block text-[10px] ${cls.textFaint}`}>{o.email}</span>
                            </td>
                            <td className="py-4 px-4 min-w-[220px]">
                              <div className="space-y-1.5">
                                {(o.items || []).slice(0, 3).map((item, idx) => {
                                  const { mainName } = parseItemName(item.name);
                                  return (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center justify-center font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 shrink-0">
                                        x{item.quantity}
                                      </span>
                                      <span className="font-bold text-gray-100 text-xs truncate max-w-[180px]" title={mainName}>
                                        {mainName}
                                      </span>
                                    </div>
                                  );
                                })}
                                {o.items && o.items.length > 3 && (
                                  <div className="text-gray-400 font-bold text-[10px] mt-1 pl-1">
                                    + {o.items.length - 3} autre(s)...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <span className={`block font-bold ${cls.textMain}`}>
                                  {o.shippingMethod === "pickup" ? "Retrait Atelier 📅" : (o.shippingMethod === "relay" ? "Point Relais 📦" : "Colissimo Domicile 🚚")}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.bgClass} ${pkg.borderClass} ${pkg.textClass}`}>
                                  {pkg.badgeTitle}
                                </span>
                              </div>
                            </td>
                            <td className={`py-4 px-4 font-bold ${cls.textMain} font-mono`}>
                              {o.total.toFixed(2)}€
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                o.status === "attente_impression" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                o.status === "impression" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse" :
                                o.status === "emballe" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {getStatusLabel(o.status)}
                              </span>
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <div className="flex justify-end gap-1.5 items-center">
                                {o.status === "attente_impression" && (
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, "impression")}
                                    disabled={statusChangeLoading === o.id}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow"
                                  >
                                    Lancer Impression 🛠️
                                  </button>
                                )}
                                {o.status === "impression" && (
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, "emballe")}
                                    disabled={statusChangeLoading === o.id}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow"
                                  >
                                    Emballer 📦
                                  </button>
                                )}
                                {o.status === "emballe" && (
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, "expedie")}
                                    disabled={statusChangeLoading === o.id}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow"
                                  >
                                    {o.shippingMethod === "pickup" ? "Prêt au Retrait ✓" : "Expédier 🚚"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* SECTION 3: RACCOURCIS MODULES (Monochrome Clean Cards) */}
          <div className="space-y-4">
            <h2 className={`text-lg font-black ${cls.textMain} font-antonio uppercase tracking-wide flex items-center gap-2`}>
              <span>⚙️</span>
              <span>Raccourcis de Gestion Spoolio</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((mod) => (
                <div key={mod.href} className={`${cls.cardBg} border border-white/10 hover:border-white/25 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 shadow-md`}>
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                      {mod.icon}
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${cls.textMain} font-antonio uppercase tracking-wide leading-tight`}>{mod.title}</h3>
                      <p className={`text-xs ${cls.textMuted} mt-1 leading-relaxed`}>{mod.description}</p>
                    </div>
                  </div>

                  <Link
                    href={mod.href}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold font-mono tracking-wider uppercase transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-2"
                  >
                    {mod.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : activeTab === "stats" ? (      <div className="space-y-6">
          {/* Header & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-0.5`}>
                <span className="text-[#ff4f00]">Analytics & Trafic Studio</span>
              </nav>
              <h3 className={`text-2xl font-black ${cls.textMain} uppercase tracking-tight font-antonio`}>Performance & Fréquentation</h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>Mesurez l'activité en temps réel, l'engagement et l'attractivité des produits.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAnalyticsCSV}
                disabled={!visitsStats}
                className="text-xs px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>📥</span>
                <span>Exporter (CSV)</span>
              </button>

              <button
                onClick={fetchVisitsStats}
                disabled={loadingStats}
                className={`text-xs px-4 py-2 rounded-xl border border-white/10 ${cls.inputBg} hover:bg-white/10 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 font-bold shadow-md`}
              >
                <span>🔄</span>
                <span>{loadingStats ? "Mise à jour..." : "Actualiser"}</span>
              </button>
            </div>
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
              {/* AI Smart Insight & Live Banner */}
              {visitsStats.aiInsight && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF5500]/15 via-amber-500/10 to-[#FF5500]/5 border border-[#FF5500]/30 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#FF5500]/20 text-[#FF5500] font-bold text-sm">💡</span>
                      <h4 className="text-sm font-black text-white font-antonio uppercase tracking-wider">
                        {visitsStats.aiInsight.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500]">
                      {visitsStats.aiInsight.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {visitsStats.aiInsight.text}
                  </p>
                </div>
              )}

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

                {/* KPI 5: En Direct (5 min) */}
                <div className={`${cls.cardBg} border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-500/70 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">En Direct</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      5 min
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black font-antonio text-white tracking-tight">
                      {visitsStats.liveActiveUsers || 0}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Clients connectés sur le site</span>
                  </div>
                </div>
              </div>

              {/* Funnel UX & Geo Delivery Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Funnel UX (7 cols) */}
                <div className={`lg:col-span-7 ${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-white font-antonio uppercase tracking-wider flex items-center gap-2">
                        <span>🎯</span> Funnel de Conversion UX
                      </h4>
                      <p className="text-[11px] text-gray-400">Parcours des visiteurs de l'arrivée à la commande</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Taux global: {visitsStats.conversionRate || 0}%
                    </span>
                  </div>

                  <div className="space-y-3 font-sans pt-1">
                    {/* Step 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Étape 1: Visiteurs Uniques (7j)</span>
                        <span className="font-mono text-white">{visitsStats.funnel?.step1_visitors || visitsStats.uniqueWeek}</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-blue-500 rounded-full w-full" />
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Étape 2: Vues Produits</span>
                        <span className="font-mono text-amber-400">{visitsStats.funnel?.step2_productViews || 0} vues</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(10, ((visitsStats.funnel?.step2_productViews || 0) / Math.max(visitsStats.funnel?.step1_visitors || 1, 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Étape 3: Commandes Finalisées</span>
                        <span className="font-mono text-emerald-400">{visitsStats.funnel?.step3_orders || 0} commandes</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(5, (visitsStats.conversionRate || 0) * 5))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geo & Delivery Breakdown (5 cols) */}
                <div className={`lg:col-span-5 ${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-black text-white font-antonio uppercase tracking-wider flex items-center gap-2">
                      <span>📍</span> Villes & Livraisons Top
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Expéditions</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Top Villes de Livraison</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {visitsStats.geoDeliveryStats?.topCities?.length > 0 ? (
                          visitsStats.geoDeliveryStats.topCities.map((c: any) => (
                            <span key={c.name} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white font-semibold flex items-center gap-1.5">
                              <span>🏙️ {c.name}</span>
                              <span className="font-mono text-[10px] text-amber-400">({c.count})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">Aucune adresse enregistrée</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Méthodes Expédition</span>
                      <div className="space-y-1.5 mt-2 font-sans">
                        {visitsStats.geoDeliveryStats?.shippingMethods?.length > 0 ? (
                          visitsStats.geoDeliveryStats.shippingMethods.map((m: any) => (
                            <div key={m.name} className="flex justify-between items-center text-xs">
                              <span className="text-gray-300 font-medium">📦 {m.name}</span>
                              <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{m.count}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">Commandes en cours...</span>
                        )}
                      </div>
                    </div>
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

                  {/* Hourly Peak Slots Widget */}
                  {visitsStats.hourlySlots && visitsStats.hourlySlots.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">⏰</span>
                          <div>
                            <h5 className="text-xs font-black text-white font-antonio uppercase tracking-wider">Heures de Pointe & Pics d'Affluence</h5>
                            <p className="text-[10px] text-gray-400">Distribution des visites par tranche horaire sur les 30 derniers jours.</p>
                          </div>
                        </div>
                        {visitsStats.peakSlot && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/40 flex items-center gap-1.5 self-start sm:self-auto">
                            <span>🔥 Pic d'affluence :</span>
                            <span className="text-white font-bold">{visitsStats.peakSlot.shortLabel}</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {visitsStats.hourlySlots.map((slot: any) => {
                          const totalSlotVisits = visitsStats.hourlySlots.reduce((acc: number, s: any) => acc + (s.count || 0), 0);
                          const percent = totalSlotVisits > 0 ? Math.round((slot.count / totalSlotVisits) * 100) : 0;
                          const isPeak = visitsStats.peakSlot && visitsStats.peakSlot.key === slot.key;

                          return (
                            <div key={slot.key} className={`bg-white/[0.03] border ${isPeak ? 'border-[#ff4f00]/50 bg-[#ff4f00]/5' : 'border-white/10'} rounded-2xl p-3 flex flex-col justify-between space-y-2 transition-all hover:bg-white/5`}>
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className={isPeak ? "text-[#ff4f00]" : "text-gray-300"}>{slot.label}</span>
                                <span className="font-mono text-white text-[11px] font-black">{slot.count}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isPeak ? 'bg-[#ff4f00]' : 'bg-blue-500'}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                                  <span>Trafic</span>
                                  <span className="font-bold text-gray-200">{percent}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
