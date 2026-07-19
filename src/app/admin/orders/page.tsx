"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string | null;
  email: string;
  items: OrderItem[];
  shippingMethod: string;
  relayDetails: { name: string; address?: string; city?: string; zip?: string } | null;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { cls, theme } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        const err = await res.json();
        setError(err.error || "Impossible de charger les commandes.");
      }
    } catch (e) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
        // Update local state
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        const data = await res.json();
        alert(data.error || "Erreur de mise à jour.");
      }
    } catch (e) {
      alert("Erreur de connexion.");
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "attente_impression":
        return "Attente Impression";
      case "impression":
        return "Impression en cours";
      case "emballe":
        return "Emballé / Prêt";
      case "expedie":
        return "Expédié / Clôturé";
      default:
        return status;
    }
  };

  // Filters
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const searchString = `${o.customerName || ""} ${o.email} ${o.id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <nav className={`text-[10px] uppercase font-bold tracking-wider ${cls.textFaint} mb-1`}>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="mx-2">&rarr;</span>
            <span>Commandes</span>
          </nav>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Gestion des commandes</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            {orders.length} commandes au total · {orders.filter(o => o.status === "attente_impression").length} nouvelles à imprimer
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className={`text-xs px-4 py-2 border ${cls.border} ${cls.inputBg} rounded-xl hover:text-white cursor-pointer transition-colors`}
        >
          Rafraîchir les commandes 🔄
        </button>
      </div>

      {/* Search & Status Tabs Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <svg className={`w-4 h-4 ${cls.textMuted} absolute left-3 top-1/2 -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, email ou numéro..."
            className={`w-full ${cls.cardBg} border ${cls.border} rounded-xl pl-9 pr-4 py-2.5 text-sm ${cls.textMain} placeholder-gray-500 focus:outline-none transition-colors`}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {[
            { id: "all", label: "Toutes" },
            { id: "attente_impression", label: "À imprimer 🛠️" },
            { id: "impression", label: "En impression ⏳" },
            { id: "emballe", label: "Emballées 📦" },
            { id: "expedie", label: "Clôturées ✓" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-white text-black border-white"
                  : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:text-white`
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden transition-colors`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest font-sans animate-pulse">
            Chargement de l'historique des commandes...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-400 font-sans">
            ⚠️ {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-sans">
            Aucune commande ne correspond aux critères sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  {["ID", "Date", "Client", "Articles", "Expédition / Relais", "Total", "Statut", "Action"].map((h) => (
                    <th key={h} className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className={`group ${cls.hoverRow} transition-colors text-xs`}>
                    <td className="px-5 pl-6 py-4 font-mono font-bold text-gray-300 select-all shrink-0">
                      {o.id}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`block font-bold ${cls.textMain}`}>{o.customerName || "—"}</span>
                      <span className={`block text-[10px] ${cls.textFaint}`}>{o.email}</span>
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      {(o.items || []).map((item, idx) => (
                        <div key={idx} className={`text-gray-300 truncate`} title={item.name}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <span className={`block font-semibold ${cls.textMain}`}>
                        {o.shippingMethod === "pickup" ? "Retrait Atelier" : (o.shippingMethod === "relay" ? "Mondial Relay" : "Colissimo Domicile")}
                      </span>
                      {o.relayDetails && (
                        <span className={`block text-[10px] ${cls.textFaint} truncate`} title={`${o.relayDetails.name} - ${o.relayDetails.address}`}>
                          {o.relayDetails.name} ({o.relayDetails.zip})
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 font-bold ${cls.textMain} whitespace-nowrap`}>
                      {o.total.toFixed(2)}€
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        o.status === "attente_impression" ? "bg-orange-500/10 text-orange-400" :
                        o.status === "impression" ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                        o.status === "emballe" ? "bg-purple-500/10 text-purple-400" :
                        "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-5 pr-6 py-4">
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
    </div>
  );
}
