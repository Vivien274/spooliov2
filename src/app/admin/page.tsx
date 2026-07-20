"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "./AdminThemeContext";

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
  const [activeTab, setActiveTab] = useState<"dashboard" | "stats" | "hero" | "pickup" | "carts">("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);

  // Abandoned carts states
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [loadingCarts, setLoadingCarts] = useState<boolean>(false);
  const [recoverySending, setRecoverySending] = useState<Record<string, boolean>>({});
  const [recoverySuccess, setRecoverySuccess] = useState<Record<string, boolean>>({});

  const fetchAbandonedCarts = async () => {
    setLoadingCarts(true);
    try {
      const res = await fetch("/api/admin/abandoned-carts");
      if (res.ok) {
        const data = await res.json();
        setAbandonedCarts(data.carts || []);
      }
    } catch (e) {
      console.error("Failed to fetch abandoned carts:", e);
    } finally {
      setLoadingCarts(false);
    }
  };

  const handleSendRecoveryEmail = async (sessionId: string) => {
    setRecoverySending(prev => ({ ...prev, [sessionId]: true }));
    try {
      const res = await fetch("/api/admin/abandoned-carts/send-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setRecoverySuccess(prev => ({ ...prev, [sessionId]: true }));
        alert("E-mail de relance envoyé avec succès !");
      } else {
        const err = await res.json();
        alert(err.error || "L'envoi a échoué.");
      }
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setRecoverySending(prev => ({ ...prev, [sessionId]: false }));
    }
  };

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

  // Hero settings state
  const [heroConfig, setHeroConfig] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    imageUrl: "",
    imagePosition: "center center"
  });
  const [loadingHero, setLoadingHero] = useState<boolean>(false);
  const [savingHero, setSavingHero] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  // Click & Collect slots settings states
  const [pickupSlots, setPickupSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [savingSlots, setSavingSlots] = useState<boolean>(false);
  const [newSlotText, setNewSlotText] = useState<string>("");
  const [slotsSuccess, setSlotsSuccess] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setHeroError(null);
    setHeroSuccess(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setHeroConfig(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setHeroSuccess("Image téléversée avec succès !");
      } else {
        setHeroError(data.error || "Erreur de téléversement.");
      }
    } catch (err) {
      setHeroError("Impossible d'uploader l'image.");
    } finally {
      setUploading(false);
    }
  };

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
          imageUrl: "/images/hero_background.jpg",
          imagePosition: "center center"
        });
      }
    } catch (e: any) {
      setHeroError("Erreur de connexion à l'API Hero.");
    } finally {
      setLoadingHero(false);
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

  // Load Click & Collect slots list
  const fetchPickupSlots = async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch("/api/pickup-slots");
      if (res.ok) {
        const data = await res.json();
        setPickupSlots(data.slots || []);
      }
    } catch (e: any) {
      setSlotsError("Impossible de charger les créneaux.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSavePickupSlots = async (updatedSlots: string[]) => {
    setSavingSlots(true);
    setSlotsError(null);
    setSlotsSuccess(null);
    try {
      const res = await fetch("/api/pickup-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: updatedSlots })
      });
      if (res.ok) {
        setSlotsSuccess("Créneaux enregistrés avec succès !");
      } else {
        const data = await res.json();
        setSlotsError(data.error || "Erreur de sauvegarde.");
      }
    } catch (e) {
      setSlotsError("Erreur réseau.");
    } finally {
      setSavingSlots(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlotText.trim()) return;
    const updated = [...pickupSlots, newSlotText.trim()];
    setPickupSlots(updated);
    setNewSlotText("");
    handleSavePickupSlots(updated);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = pickupSlots.filter((_, i) => i !== index);
    setPickupSlots(updated);
    handleSavePickupSlots(updated);
  };

  useEffect(() => {
    fetchOrders();
    fetchHeroConfig();
    fetchVisitsStats();
    fetchPickupSlots();
  }, []);

  useEffect(() => {
    if (activeTab === "carts") {
      fetchAbandonedCarts();
    }
  }, [activeTab]);

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
        <div className={`flex bg-black/40 border ${cls.border} rounded-2xl p-1 shrink-0 flex-wrap gap-1`}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "stats" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Visites & Analytics
          </button>
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "hero" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Personnalisation Accueil
          </button>
          <button
            onClick={() => setActiveTab("pickup")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "pickup" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Créneaux Retrait 📅
          </button>
          <button
            onClick={() => setActiveTab("carts")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === "carts" ? "bg-white text-black shadow-md" : `text-gray-400 hover:text-white`
            }`}
          >
            Paniers Abandonnés 🛒
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
      ) : activeTab === "stats" ? (
        <div className="space-y-6">
          {/* Header & Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Analyses des Visites</h3>
              <p className={`text-xs ${cls.textMuted} mt-0.5`}>Consultez l'activité et le trafic de votre boutique en temps réel.</p>
            </div>
            <button
              onClick={fetchVisitsStats}
              disabled={loadingStats}
              className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
            >
              {loadingStats ? "Chargement..." : "Rafraîchir"}
            </button>
          </div>

          {loadingStats ? (
            <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans">
              Chargement des statistiques...
            </div>
          ) : !visitsStats ? (
            <div className="py-12 text-center text-xs text-gray-500 font-sans">
              Aucune donnée de visites disponible.
            </div>
          ) : (
            <>
              {/* Analytics KPIs Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Visites totales", value: visitsStats.totalVisits.toString(), desc: "De tous les temps" },
                  { label: "Visites aujourd'hui", value: visitsStats.todayVisits.toString(), desc: "Pages consultées" },
                  { label: "Visiteurs uniques (Jour)", value: visitsStats.uniqueToday.toString(), desc: "IPs anonymisées" },
                  { label: "Visiteurs uniques (Semaine)", value: visitsStats.uniqueWeek.toString(), desc: "Tendance 7 jours" },
                ].map((kpi) => (
                  <div key={kpi.label} className={`${cls.cardBg} border ${cls.border} rounded-2xl p-4 flex flex-col gap-1 transition-colors duration-300`}>
                    <span className={`text-[11px] ${cls.textFaint} uppercase tracking-widest font-semibold`}>{kpi.label}</span>
                    <span className={`text-2xl font-black ${cls.textMain} font-antonio`}>{kpi.value}</span>
                    <span className={`text-[10px] ${cls.textFaint}`}>{kpi.desc}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Interactive Daily Activity Chart */}
                <div className={`lg:col-span-2 ${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex flex-col justify-between h-[360px]`}>
                  <div>
                    <h4 className={`text-xs font-bold ${cls.textMain} uppercase tracking-widest font-antonio mb-1`}>Trafic hebdomadaire</h4>
                    <p className={`text-[10px] ${cls.textFaint}`}>Nombre de pages visitées par jour sur les 7 derniers jours.</p>
                  </div>

                  {/* SVG Line / Bar Chart */}
                  <div className="flex-1 flex items-end justify-between gap-2 h-44 mt-6 pt-4 border-b border-white/5 pb-2 relative z-0">
                    {visitsStats.dailyStats.map((day: any) => {
                      // Calculate height based on maximum value in range
                      const maxVal = Math.max(...visitsStats.dailyStats.map((d: any) => d.count), 1);
                      const percent = (day.count / maxVal) * 100;
                      return (
                        <div key={day.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          {/* Tooltip on hover */}
                          <span className="opacity-0 group-hover:opacity-100 bg-[#ff4f00] text-black text-[9px] font-black px-1.5 py-0.5 rounded-md transition-opacity absolute mb-14 translate-y-[-10px] shadow-lg select-none z-50">
                            {day.count}
                          </span>
                          
                          {/* Bar Graphic */}
                          <div 
                            className="w-full bg-gradient-to-t from-[#ff4f00]/30 to-[#ff4f00] rounded-t-lg transition-all duration-500 hover:scale-[1.03] shadow-[0_0_15px_rgba(255,79,0,0.15)]"
                            style={{ height: `${percent}%`, minHeight: day.count > 0 ? "4px" : "1px" }}
                          />

                          {/* Day details */}
                          <span className={`text-[9px] ${cls.textFaint} uppercase tracking-wider text-center`}>
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Stack: Top Pages & Top Products */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Top Products */}
                  <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex-1`}>
                    <h4 className={`text-xs font-bold ${cls.textMain} uppercase tracking-widest font-antonio mb-3`}>Top Produits</h4>
                    
                    {visitsStats.topProducts.length === 0 ? (
                      <p className={`text-xs ${cls.textFaint} text-center py-6`}>Aucune visite produit pour le moment.</p>
                    ) : (
                      <div className="space-y-3 font-sans">
                        {visitsStats.topProducts.map((p: any) => {
                          const maxCount = Math.max(...visitsStats.topProducts.map((pr: any) => pr.count), 1);
                          const barWidth = (p.count / maxCount) * 100;
                          return (
                            <div key={p.url} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className={`${cls.textMain} truncate max-w-[150px]`}>{p.name}</span>
                                <span className="text-[#ff4f00] font-black">{p.count}</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ff4f00] rounded-full" style={{ width: `${barWidth}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Top Pages */}
                  <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 flex-1`}>
                    <h4 className={`text-xs font-bold ${cls.textMain} uppercase tracking-widest font-antonio mb-3`}>Top Pages</h4>
                    <div className="space-y-2 font-sans">
                      {visitsStats.topPages.map((p: any) => (
                        <div key={p.url} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                          <span className={`font-mono text-[10px] ${cls.textFaint} truncate max-w-[170px]`}>{p.url === "" || p.url === "/" ? "/ (Accueil)" : p.url}</span>
                          <span className={`${cls.textMain} font-extrabold`}>{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeTab === "hero" ? (
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
                    Image de Fond *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={heroConfig.imageUrl}
                      onChange={(e) => setHeroConfig({ ...heroConfig, imageUrl: e.target.value })}
                      placeholder="Ex: /images/hero_background.jpg"
                      className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
                    />
                    <label className="h-10 px-4 bg-[#2F3CD9] hover:bg-[#202db0] disabled:bg-[#2F3CD9]/40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {uploading ? "..." : "Uploader"}
                    </label>
                  </div>
                  <span className={`text-[10px] ${cls.textFaint} mt-0.5 leading-normal`}>
                    Sélectionnez une image sur votre ordinateur ou indiquez une URL absolue.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[9px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                    Positionnement de l'image *
                  </label>
                  <select
                    value={heroConfig.imagePosition || "center center"}
                    onChange={(e) => setHeroConfig({ ...heroConfig, imagePosition: e.target.value })}
                    className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] cursor-pointer`}
                  >
                    <option value="center center">Centré (Milieu)</option>
                    <option value="top center">Haut Centré</option>
                    <option value="bottom center">Bas Centré</option>
                    <option value="center left">Milieu Gauche</option>
                    <option value="center right">Milieu Droite</option>
                    <option value="top left">Haut Gauche</option>
                    <option value="top right">Haut Droite</option>
                    <option value="bottom left">Bas Gauche</option>
                    <option value="bottom right">Bas Droite</option>
                  </select>
                  <span className={`text-[10px] ${cls.textFaint} mt-0.5 leading-normal`}>
                    Définit la zone d'ancrage de l'image de fond (utile si l'image est recadrée).
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
                className="absolute inset-0 bg-cover transition-all duration-300 no-invert"
                style={{ 
                  backgroundImage: `url('${heroConfig.imageUrl || "/images/hero_background.jpg"}')`,
                  backgroundPosition: heroConfig.imagePosition || "center center"
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
      ) : null}

      {activeTab === "pickup" && (
        <div className={`p-8 rounded-[32px] border ${cls.border} ${cls.cardBg} shadow-2xl space-y-6 font-sans no-invert`}>
          <div>
            <h3 className={`text-xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des créneaux Click & Collect</h3>
            <p className={`text-xs ${cls.textMuted} mt-1`}>
              Définissez la liste des créneaux horaires que vous proposez pour le retrait des commandes à l'Atelier. Les clients devront obligatoirement choisir parmi ces options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>Ajouter un nouveau créneau</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSlotText}
                  onChange={(e) => setNewSlotText(e.target.value)}
                  placeholder="Ex: Samedi 25 Juillet - 14h à 16h"
                  className={`flex-1 h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] text-xs`}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSlot()}
                />
                <button
                  onClick={handleAddSlot}
                  className="h-10 px-4 bg-[#2F3CD9] hover:bg-[#202db0] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Ajouter ➕
                </button>
              </div>

              {slotsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                  ✓ {slotsSuccess}
                </div>
              )}
              {slotsError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                  ⚠️ {slotsError}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${cls.textMain}`}>Créneaux actuellement proposés</h4>
              
              {loadingSlots ? (
                <div className={`text-xs ${cls.textMuted} italic animate-pulse`}>Chargement des créneaux...</div>
              ) : pickupSlots.length === 0 ? (
                <div className={`text-xs ${cls.textMuted} italic`}>Aucun créneau configuré. Les créneaux par défaut seront appliqués.</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {pickupSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border ${cls.border} ${cls.inputBg} text-xs`}
                    >
                      <span className={`font-bold ${cls.textMain}`}>{slot}</span>
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        className="text-red-400 hover:text-red-600 font-bold hover:scale-105 transition-all cursor-pointer p-1 text-base leading-none"
                        title="Supprimer ce créneau"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "carts" && (
        <div className={`p-8 rounded-[32px] border ${cls.border} ${cls.cardBg} shadow-2xl space-y-6 font-sans no-invert`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Relance de paniers abandonnés 🛒</h3>
              <p className={`text-xs ${cls.textMuted} mt-1`}>
                Consultez la liste des clients ayant initié un paiement Stripe sans le finaliser, et envoyez-leur un e-mail de relance personnalisé.
              </p>
            </div>
            <button
              onClick={fetchAbandonedCarts}
              disabled={loadingCarts}
              className={`text-xs px-3 py-1.5 rounded-lg border ${cls.border} ${cls.inputBg} hover:text-white cursor-pointer transition-colors`}
            >
              {loadingCarts ? "Chargement..." : "Rafraîchir 🔄"}
            </button>
          </div>

          {loadingCarts ? (
            <div className={`text-xs ${cls.textMuted} italic animate-pulse py-12 text-center`}>
              Chargement des paniers abandonnés depuis Stripe...
            </div>
          ) : abandonedCarts.length === 0 ? (
            <div className={`text-xs ${cls.textMuted} italic py-12 text-center`}>
              Aucun panier abandonné détecté sur les dernières 48 heures.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className={`border-b ${cls.border} text-gray-500 font-bold uppercase tracking-wider text-[10px]`}>
                    <th className="py-3 px-4">Date d'abandon</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Articles laissés</th>
                    <th className="py-3 px-4">Total potentiel</th>
                    <th className="py-3 pr-4 text-right">Relance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${cls.divider}`}>
                  {abandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(cart.created).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`block font-bold ${cls.textMain}`}>{cart.customerName || "Acheteur anonyme"}</span>
                        <span className={`block text-[10px] ${cls.textFaint} select-all`}>{cart.email}</span>
                      </td>
                      <td className="py-4 px-4">
                        {(cart.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="text-gray-300">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </td>
                      <td className={`py-4 px-4 font-bold ${cls.textMain}`}>
                        {cart.total.toFixed(2)}€
                      </td>
                      <td className="py-4 pr-4 text-right">
                        {recoverySuccess[cart.id] ? (
                          <span className="text-emerald-400 text-[11px] font-bold">✉️ Relancé ✓</span>
                        ) : (
                          <button
                            onClick={() => handleSendRecoveryEmail(cart.id)}
                            disabled={recoverySending[cart.id]}
                            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            {recoverySending[cart.id] ? "Envoi..." : "Relancer par e-mail ✉️"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
