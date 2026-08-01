"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import { getItemProductUrl, parseItemName } from "@/lib/orderUtils";

const ADMIN_BLUE = "#2F3CD9";

interface OrderItem {
  name: string;
  quantity: number;
  price?: string | number;
  slug?: string;
}


interface Order {
  id: string;
  stripeSession?: string | null;
  customerName: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  trackingNumber?: string | null;
  email: string;
  items: OrderItem[];
  shippingMethod: string;
  relayDetails: { name: string; address?: string; city?: string; zip?: string } | null;
  total: number;
  shippingCost: number;
  status: string;
  createdAt: string;
  pickupSlotRequested?: string | null;
  pickupSlotConfirmed?: string | null;
  pickupStatus?: string | null;
}

export default function AdminOrdersPage() {
  const { cls, theme } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proposingSlots, setProposingSlots] = useState<Record<string, string>>({});
  const [pickupLoading, setPickupLoading] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const handleResendEmail = async (orderId: string, email: string) => {
    setResendingEmail(orderId);
    try {
      const res = await fetch("/api/admin/orders/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, targetEmail: email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message || "Email renvoyé avec succès !"}`);
      } else {
        alert(`⚠️ ${data.error || "Erreur lors du renvoi de l'email."}`);
      }
    } catch (e) {
      alert("Erreur réseau lors de l'envoi.");
    } finally {
      setResendingEmail(null);
    }
  };
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>("");
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>("");
  const [newTombolaCases, setNewTombolaCases] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newTotal, setNewTotal] = useState<string>("6.00");
  const [newSendEmail, setNewSendEmail] = useState<boolean>(true);

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerEmail.trim()) {
      alert("Veuillez saisir l'email du client.");
      return;
    }

    setCreateLoading(true);

    let itemName = newItemName.trim();
    if (!itemName) {
      if (newTombolaCases.trim()) {
        itemName = `Ticket Tombola Spoolio - Cases #${newTombolaCases.trim()}`;
      } else {
        itemName = "Achat Boutique Spoolio";
      }
    }

    const casesCount = newTombolaCases.split(/[\s,;]+/).filter(Boolean).length;
    const quantity = casesCount > 0 ? casesCount : 1;

    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newCustomerName,
          customerEmail: newCustomerEmail,
          customerPhone: newCustomerPhone,
          items: [{ name: itemName, quantity, price: (parseFloat(newTotal) / (quantity || 1)).toFixed(2) }],
          total: parseFloat(newTotal) || 0,
          shippingMethod: "tombola",
          sendEmail: newSendEmail
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        setShowCreateModal(false);
        setNewCustomerName("");
        setNewCustomerEmail("");
        setNewCustomerPhone("");
        setNewTombolaCases("");
        setNewItemName("");
        setNewTotal("6.00");
        fetchOrders();
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de la création."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de la création.");
    } finally {
      setCreateLoading(false);
    }
  };

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setStatusChangeLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus, trackingNumber }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, trackingNumber: trackingNumber || o.trackingNumber } : o));
        setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus, trackingNumber: trackingNumber || prev.trackingNumber } : prev);
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

  const handleConfirmPickupSlot = async (orderId: string, requestedSlot: string) => {
    setPickupLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          pickupSlotConfirmed: requestedSlot,
          pickupStatus: "confirmed"
        }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, pickupSlotConfirmed: requestedSlot, pickupStatus: "confirmed" } : o));
        setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, pickupSlotConfirmed: requestedSlot, pickupStatus: "confirmed" } : prev);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la validation.");
      }
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setPickupLoading(null);
    }
  };

  const handleProposeAlternativeSlot = async (orderId: string) => {
    const alternativeSlot = proposingSlots[orderId];
    if (!alternativeSlot) {
      alert("Veuillez d'abord sélectionner une date/heure alternative.");
      return;
    }
    setPickupLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          pickupSlotConfirmed: alternativeSlot,
          pickupStatus: "proposed"
        }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, pickupSlotConfirmed: alternativeSlot, pickupStatus: "proposed" } : o));
        setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, pickupSlotConfirmed: alternativeSlot, pickupStatus: "proposed" } : prev);
        setProposingSlots(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la proposition.");
      }
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setPickupLoading(null);
    }
  };

  const formatPickupSlot = (slotStr: string | null | undefined) => {
    if (!slotStr) return "Non spécifié";
    const dateParsed = Date.parse(slotStr);
    if (!isNaN(dateParsed) && slotStr.includes("-") && slotStr.split("-").length > 2) {
      return new Date(slotStr).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    }
    return slotStr;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "attente_impression":
        return "À imprimer 🛠️";
      case "impression":
        return "Impression... ⏳";
      case "emballe":
        return "Emballé / Prêt 📦";
      case "expedie":
        return "Expédié / Clôturé ✓";
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
    <div className="max-w-7xl mx-auto space-y-6 font-sans px-4 sm:px-6 lg:px-8">
      {/* Upper header action section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs px-4 py-2 border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded-xl font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Créer une commande</span>
          </button>
          <button
            onClick={handleExportBoxtalCSV}
            className="text-xs px-4 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Exporter pour Boxtal 📤
          </button>
          <button
            onClick={fetchOrders}
            className={`text-xs px-4 py-2 border ${cls.border} ${cls.inputBg} rounded-xl hover:text-white cursor-pointer transition-colors`}
          >
            Rafraîchir 🔄
          </button>
        </div>
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
                  {["ID", "Date", "Client", "Articles", "Livraison / Relais", "Total", "Statut"].map((h) => (
                    <th key={h} className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredOrders.map((o) => (
                  <tr 
                    key={o.id} 
                    onClick={() => setSelectedOrder(o)}
                    className={`group ${cls.hoverRow} transition-colors text-[13px] cursor-pointer`}
                  >
                    <td className="px-5 pl-6 py-5 font-mono font-bold text-gray-300 select-all shrink-0">
                      {o.id}
                    </td>
                    <td className="px-5 py-5 text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-5 min-w-[150px]">
                      <span className={`block font-bold ${cls.textMain}`}>{o.customerName || "—"}</span>
                      <span className={`block text-[10px] ${cls.textFaint}`}>{o.email}</span>
                    </td>
                    <td className="px-5 py-5 min-w-[240px]">
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
                                {getItemProductUrl(item) ? (
                                  <Link
                                    href={getItemProductUrl(item)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-gray-100 hover:text-[#ff4f00] hover:underline text-xs truncate max-w-[220px] inline-flex items-center gap-1 group"
                                    title={`Ouvrir la fiche produit pour ${mainName}`}
                                  >
                                    <span>
                                      {isDonation && "❤️ "}
                                      {isTombola && "🎟️ "}
                                      {mainName}
                                    </span>
                                    <span className="text-[9px] text-gray-400 group-hover:text-[#ff4f00]">↗</span>
                                  </Link>
                                ) : (
                                  <span className="font-bold text-gray-100 text-xs truncate max-w-[220px]" title={mainName}>
                                    {isDonation && "❤️ "}
                                    {isTombola && "🎟️ "}
                                    {mainName}
                                  </span>
                                )}
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
                            + {o.items.length - 3} autre(s) article(s)...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-5 min-w-[180px] no-invert">
                      <span className={`block font-semibold ${cls.textMain}`}>
                        {o.shippingMethod === "pickup" ? "Retrait Atelier 📅" : (o.shippingMethod === "relay" ? "Mondial Relay 📦" : "Colissimo Domicile 🚚")}
                      </span>
                      {o.relayDetails && (
                        <span className={`block text-[10px] ${cls.textFaint}`}>
                          {o.relayDetails.name} ({o.relayDetails.zip})
                        </span>
                      )}
                      {o.shippingMethod === "pickup" && (
                        <div className="mt-1">
                          <span className={`block text-[10px] font-bold ${
                            o.pickupStatus === "confirmed" ? "text-emerald-400" :
                            o.pickupStatus === "proposed" ? "text-yellow-400" :
                            "text-orange-400"
                          }`}>
                            Créneau : {formatPickupSlot(o.pickupSlotConfirmed || o.pickupSlotRequested)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className={`px-5 py-5 font-bold ${cls.textMain} whitespace-nowrap`}>
                      {o.total.toFixed(2)}€
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        o.status === "attente_impression" ? "bg-orange-500/10 text-orange-400" :
                        o.status === "impression" ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                        o.status === "emballe" ? "bg-purple-500/10 text-purple-400" :
                        "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal Popup */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        >
          <div 
            className={`relative w-full max-w-2xl ${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden shadow-2xl animate-fade-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Détails de la commande</span>
                <h3 className="text-xl font-black font-antonio text-white mt-1">
                  COMMANDE {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Client & Metadata Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Informations Client</span>
                  <div className="text-sm font-bold text-white">{selectedOrder.customerName || "—"}</div>
                  <div className="text-xs text-gray-400 select-all">{selectedOrder.email}</div>
                  {selectedOrder.customerPhone && (
                    <div className="text-xs text-gray-400 select-all font-mono">📞 {selectedOrder.customerPhone}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Date de création</span>
                  <div className="text-sm font-bold text-white">
                    {new Date(selectedOrder.createdAt).toLocaleString("fr-FR", {
                      dateStyle: "long",
                      timeStyle: "short"
                    })}
                  </div>
                  <div className="text-xs text-gray-400">Mode : {selectedOrder.shippingMethod === "pickup" ? "Retrait Atelier" : (selectedOrder.shippingMethod === "relay" ? "Mondial Relay" : "Colissimo Domicile")}</div>
                </div>
              </div>

              {/* Delivery Details Block */}
              {selectedOrder.shippingMethod !== "pickup" ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1">Adresse de livraison</span>
                    {selectedOrder.shippingAddress ? (
                      <div className="text-xs text-gray-200 select-all whitespace-pre-line leading-relaxed font-sans bg-black/45 border border-white/5 rounded-xl p-3">
                        {selectedOrder.shippingAddress}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Aucune adresse enregistrée en base de données. Récupérez-la sur Stripe si besoin.</div>
                    )}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.shippingAddress || "");
                        alert("Adresse copiée dans le presse-papier !");
                      }}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none"
                    >
                      📋 Copier l'adresse pour Boxtal
                    </button>
                  )}
                  {selectedOrder.trackingNumber && (
                    <div className="pt-3 border-t border-white/5 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Numéro de suivi transporteur</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-yellow-400 bg-white/5 px-2 py-1 rounded select-all">
                          {selectedOrder.trackingNumber}
                        </span>
                        <a
                          href={selectedOrder.shippingMethod === "relay" 
                            ? `https://www.mondialrelay.fr/suivi-de-colis?numeroColis=${selectedOrder.trackingNumber}`
                            : `https://www.laposte.fr/outils/suivre-un-envoi?code=${selectedOrder.trackingNumber}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#ff4f00] hover:underline"
                        >
                          Suivre le colis &rarr;
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1">Détails du Retrait Atelier (Click & Collect)</span>
                    <div className="text-xs text-gray-300">
                      Créneau souhaité : <strong className="text-white">{formatPickupSlot(selectedOrder.pickupSlotConfirmed || selectedOrder.pickupSlotRequested)}</strong>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Statut du créneau : <strong className="text-white">{
                        selectedOrder.pickupStatus === "confirmed" ? "Validé ✓" :
                        selectedOrder.pickupStatus === "proposed" ? "Alternative proposée" :
                        "En attente de validation"
                      }</strong>
                    </div>
                  </div>
                  
                  {selectedOrder.pickupStatus !== "confirmed" && (
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mt-3 pt-3 border-t border-white/5 select-none" onClick={(e) => e.stopPropagation()}>
                      {selectedOrder.pickupSlotRequested && (
                        <button
                          onClick={() => handleConfirmPickupSlot(selectedOrder.id, selectedOrder.pickupSlotRequested!)}
                          disabled={pickupLoading === selectedOrder.id}
                          className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          {pickupLoading === selectedOrder.id ? "Validation..." : "Valider le créneau ✓"}
                        </button>
                      )}
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="datetime-local"
                          value={proposingSlots[selectedOrder.id] || ""}
                          onChange={(e) => setProposingSlots(prev => ({ ...prev, [selectedOrder.id]: e.target.value }))}
                          className="bg-black border border-[#222225] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#005cff] cursor-pointer text-gray-800 dark:text-white"
                        />
                        <button
                          onClick={() => handleProposeAlternativeSlot(selectedOrder.id)}
                          disabled={pickupLoading === selectedOrder.id || !proposingSlots[selectedOrder.id]}
                          className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 disabled:bg-white/5 disabled:text-gray-600 disabled:border-transparent text-white font-bold text-xs transition-colors cursor-pointer border border-transparent"
                        >
                          Proposer 📅
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Articles commandés ({selectedOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0})
                  </span>
                  <span className="text-xs font-semibold text-gray-500 font-mono">
                    {selectedOrder.items?.length || 0} produit(s) distinct(s)
                  </span>
                </div>
                <div className="space-y-2.5">
                  {(selectedOrder.items || []).map((item, idx) => {
                    const { mainName, options } = parseItemName(item.name);
                    const isDonation = mainName.toLowerCase().includes("don de soutien");
                    const isTombola = mainName.toLowerCase().includes("tombola") || mainName.toLowerCase().includes("ticket");
                    const unitPrice = item.price ? parseFloat(String(item.price)) : null;
                    const totalPrice = unitPrice ? unitPrice * item.quantity : null;

                    return (
                      <div 
                        key={idx} 
                        className="bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          {/* Quantity pill */}
                          <div className={`mt-0.5 inline-flex items-center justify-center font-mono font-black text-xs px-2.5 py-1 rounded-xl shrink-0 ${
                            isDonation 
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : isTombola
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30"
                          }`}>
                            x{item.quantity}
                          </div>

                          {/* Product Details */}
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              {isDonation && "❤️"}
                              {isTombola && "🎟️"}
                              {!isDonation && !isTombola && "📦"}
                              {getItemProductUrl(item) ? (
                                <Link
                                  href={getItemProductUrl(item)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#ff4f00] hover:underline transition-colors inline-flex items-center gap-1 group"
                                  title="Ouvrir la fiche produit sur le site"
                                >
                                  <span>{mainName}</span>
                                  <span className="text-xs text-gray-400 group-hover:text-[#ff4f00]">↗</span>
                                </Link>
                              ) : (
                                <span>{mainName}</span>
                              )}
                            </div>

                            {/* Option badges */}
                            {options.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {options.map((opt, optIdx) => {
                                  const [key, val] = opt.includes(":") ? opt.split(":") : [null, opt];
                                  return (
                                    <span 
                                      key={optIdx} 
                                      className="inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300"
                                    >
                                      {key ? (
                                        <>
                                          <span className="text-gray-400 font-semibold">{key.trim()}:</span>
                                          <span className="text-white font-bold">{val.trim()}</span>
                                        </>
                                      ) : (
                                        <span className="text-gray-200">{opt}</span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-500 italic">Article standard</div>
                            )}
                          </div>
                        </div>

                        {/* Price details */}
                        {totalPrice !== null && (
                          <div className="text-right shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                            <div className="text-sm font-black font-mono text-white">
                              {totalPrice.toFixed(2)}€
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-[10px] text-gray-500 font-mono">
                                ({unitPrice?.toFixed(2)}€ / un.)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                <div className="text-xs text-gray-400">
                  Frais d'envoi : {selectedOrder.shippingCost === 0 ? "Gratuit" : `${selectedOrder.shippingCost.toFixed(2)}€`}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Total payé</span>
                  <span className="text-lg font-black text-yellow-400">{selectedOrder.total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Quick links & Status Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/5">
                {/* Logistics */}
                {selectedOrder.shippingMethod !== "pickup" && (
                  <div className="flex items-center gap-3">
                    {selectedOrder.stripeSession && (
                      <a
                        href={`https://dashboard.stripe.com/search?query=${selectedOrder.stripeSession}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-[#ff4f00]/30 bg-[#ff4f00]/10 text-[#ff4f00] hover:bg-[#ff4f00] hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                      >
                        Stripe 💳
                      </a>
                    )}
                    <a
                      href="https://www.boxtal.com/fr/fr/espace-client/envois/a-preparer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                    >
                      Boxtal 📦
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    const customEmail = prompt("Renvoyer l'email de confirmation à cette adresse :", selectedOrder.email);
                    if (customEmail) handleResendEmail(selectedOrder.id, customEmail.trim());
                  }}
                  disabled={resendingEmail === selectedOrder.id}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  {resendingEmail === selectedOrder.id ? "Envoi..." : "Renvoyer l'email 📧"}
                </button>

                {/* Status action buttons */}
                <div className="flex gap-2 items-center ml-auto" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] uppercase font-bold text-gray-500">Actions :</span>
                  {selectedOrder.status === "attente_impression" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "impression")}
                      disabled={statusChangeLoading === selectedOrder.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Lancer Impression 🛠️
                    </button>
                  )}
                  {selectedOrder.status === "impression" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "emballe")}
                      disabled={statusChangeLoading === selectedOrder.id}
                      className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Emballer 📦
                    </button>
                  )}
                  {selectedOrder.status === "emballe" && (
                    <button
                      onClick={() => {
                        if (selectedOrder.shippingMethod !== "pickup") {
                          const trackNum = prompt("Saisissez le numéro de suivi du colis (Mondial Relay / Colissimo) ou laissez vide :");
                          if (trackNum === null) return;
                          handleUpdateStatus(selectedOrder.id, "expedie", trackNum.trim());
                        } else {
                          handleUpdateStatus(selectedOrder.id, "expedie");
                        }
                      }}
                      disabled={statusChangeLoading === selectedOrder.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      {selectedOrder.shippingMethod === "pickup" ? "Prêt au Retrait ✓" : "Expédier 🚚"}
                    </button>
                  )}
                  {selectedOrder.status === "expedie" && (
                    <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs select-none">
                      Clôturée ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Order Popup Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg ${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">
                  Saisie d&apos;une commande client
                </span>
                <h3 className="text-xl font-black font-antonio text-white mt-0.5 uppercase">
                  ➕ Nouvelle Commande Manuelle
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Nom du client</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">
                  Adresse Email du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="ex: client@gmail.com"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff4f00]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Téléphone (optionnel)</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase">Montant Total Payé (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    placeholder="6.00"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#ff4f00]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5">
                <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
                  <span>🎟️</span> Cases de Tombola (ex: 5, 12, 14)
                </label>
                <input
                  type="text"
                  value={newTombolaCases}
                  onChange={(e) => setNewTombolaCases(e.target.value)}
                  placeholder="5, 12, 14"
                  className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Si vous saisissez des numéros, ces cases seront réservées en grille et l&apos;article sera libellé automatiquement.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={newSendEmail}
                  onChange={(e) => setNewSendEmail(e.target.checked)}
                  className="w-4 h-4 accent-[#ff4f00] rounded cursor-pointer"
                />
                <label htmlFor="sendEmailCheck" className="text-xs font-bold text-gray-300 cursor-pointer">
                  Envoyer immédiatement un e-mail de confirmation au client 📧
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-3 bg-[#ff4f00] hover:bg-[#e04500] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {createLoading ? "Création..." : "Valider & Enregistrer ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
