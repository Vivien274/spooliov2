"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import { getItemProductUrl, parseItemName, printOrderPackingSlip } from "@/lib/orderUtils";
import OrderItemOptionsViewer from "@/components/OrderItemOptionsViewer";

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
  archived?: boolean;
  createdAt: string;
  pickupSlotRequested?: string | null;
  pickupSlotConfirmed?: string | null;
  pickupStatus?: string | null;
}

function getTombolaOrderDetails(order: Order) {
  if (!order.items || order.items.length === 0) return null;

  const isAllTombola = order.items.every((item) => {
    const lower = (item.name || "").toLowerCase();
    return lower.includes("tombola") || lower.includes("ticket");
  });

  if (!isAllTombola) return null;

  let totalTickets = 0;
  const casesSet = new Set<string>();

  order.items.forEach((item) => {
    const qty = item.quantity || 1;
    totalTickets += qty;

    const match = item.name ? item.name.match(/Case\s*#?\s*(\d+)/i) : null;
    if (match) {
      casesSet.add(`#${match[1]}`);
    } else {
      const { options } = parseItemName(item.name);
      options.forEach((opt) => {
        if (opt.toLowerCase().includes("case")) {
          const val = opt.split(":")[1]?.trim() || opt;
          const cleaned = val.replace(/^[^\d]*/, "");
          if (cleaned) casesSet.add(`#${cleaned}`);
        }
      });
    }
  });

  const cases = Array.from(casesSet).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  return {
    totalTickets,
    cases,
  };
}

export default function AdminOrdersPage() {
  const { cls, theme } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proposingSlots, setProposingSlots] = useState<Record<string, string>>({});
  const [pickupLoading, setPickupLoading] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editingAddressInput, setEditingAddressInput] = useState<string>("");
  const [savingAddressLoading, setSavingAddressLoading] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>("");
  const [sendingNoteLoading, setSendingNoteLoading] = useState<boolean>(false);
  const [boxtalLoading, setBoxtalLoading] = useState<string | null>(null);

  const handleGenerateBoxtalShipment = async (orderId: string) => {
    setBoxtalLoading(orderId);
    try {
      const res = await fetch("/api/admin/boxtal/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, weightKg: 0.3 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            trackingNumber: data.trackingNumber,
            status: "expedie",
            archived: true
          } : null);
        }
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de la génération Boxtal."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de la génération Boxtal.");
    } finally {
      setBoxtalLoading(null);
    }
  };

  const handleToggleArchive = async (orderId: string, currentArchived: boolean) => {
    const newArchived = !currentArchived;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, archived: newArchived } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, archived: newArchived } : null);
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, archived: newArchived }),
      });

      if (!res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, archived: currentArchived } : o));
        alert("⚠️ Échec de la mise à jour de l'archivage.");
      }
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, archived: currentArchived } : o));
      alert("Erreur réseau lors de l'archivage.");
    }
  };

  const handleSendOrderNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !noteText.trim()) {
      alert("Veuillez saisir un message pour le client.");
      return;
    }

    setSendingNoteLoading(true);
    try {
      const res = await fetch("/api/admin/orders/send-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          note: noteText.trim(),
          targetEmail: selectedOrder.email
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        setShowNoteModal(false);
        setNoteText("");
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de l'envoi de la note."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de l'envoi de la note.");
    } finally {
      setSendingNoteLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedOrder) return;
    setSavingAddressLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          shippingAddress: editingAddressInput.trim() || null
        })
      });
      if (res.ok) {
        const updatedAddr = editingAddressInput.trim() || null;
        setSelectedOrder(prev => prev ? { ...prev, shippingAddress: updatedAddr } : null);
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, shippingAddress: updatedAddr } : o));
        setEditingAddress(null);
        alert("✅ Adresse de livraison enregistrée avec succès !");
      } else {
        alert("⚠️ Échec de l'enregistrement de l'adresse.");
      }
    } catch (e) {
      alert("Erreur réseau lors de la mise à jour de l'adresse.");
    } finally {
      setSavingAddressLoading(false);
    }
  };

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

  const [requestReviewLoading, setRequestReviewLoading] = useState<string | null>(null);

  const handleRequestReview = async (order: Order) => {
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
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(prev => prev ? { ...prev, reviewRequestedAt: data.reviewRequestedAt } as any : null);
        }
      } else {
        alert(`⚠️ ${data.error || "Erreur lors de l'envoi de la relance pour avis."}`);
      }
    } catch (err) {
      alert("Erreur réseau lors de la relance d'avis.");
    } finally {
      setRequestReviewLoading(null);
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

  const activeOrdersCount = orders.filter((o) => !o.archived).length;
  const archivedOrdersCount = orders.filter((o) => Boolean(o.archived)).length;

  // Filters
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "archived" ? Boolean(o.archived) : !o.archived;
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const searchString = `${o.customerName || ""} ${o.email} ${o.id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesTab && matchesStatus && matchesSearch;
  });

  // Financial Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalShipping = orders.reduce((acc, o) => acc + (o.shippingCost || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const currentMonthRevenue = currentMonthOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  const totalItemsCount = orders.reduce((acc, o) => {
    return acc + (o.items ? o.items.reduce((itemAcc, item) => itemAcc + (item.quantity || 1), 0) : 0);
  }, 0);

  return (
    <div className="w-full max-w-[1850px] mx-auto space-y-6 font-sans px-3 sm:px-6 lg:px-8">
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
            {activeOrdersCount} actives en cours · {archivedOrdersCount} archivées · {orders.filter(o => !o.archived && o.status === "attente_impression").length} nouvelles à imprimer
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

      {/* Financial Overview Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* KPI 1: CA Total */}
        <div className={`${cls.cardBg} border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">CA Total Cumulé</span>
            <span className="text-base">💰</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-antonio text-white tracking-tight">
              {totalRevenue.toFixed(2)}€
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Toutes commandes ({orders.length})</span>
          </div>
        </div>

        {/* KPI 2: CA Ce Mois-ci */}
        <div className={`${cls.cardBg} border border-[#ff4f00]/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-[#ff4f00]/50 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#ff4f00]">CA Ce Mois-ci</span>
            <span className="text-base">📅</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-antonio text-white tracking-tight">
              {currentMonthRevenue.toFixed(2)}€
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{currentMonthOrders.length} commande(s) ce mois</span>
          </div>
        </div>

        {/* KPI 3: Panier Moyen */}
        <div className={`${cls.cardBg} border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400">Panier Moyen</span>
            <span className="text-base">📈</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-antonio text-white tracking-tight">
              {avgOrderValue.toFixed(2)}€
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Par commande client</span>
          </div>
        </div>

        {/* KPI 4: Frais d'Envoi Encaissés */}
        <div className={`${cls.cardBg} border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400">Port Encaissé</span>
            <span className="text-base">🚚</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-antonio text-white tracking-tight">
              {totalShipping.toFixed(2)}€
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Livraisons & Relais</span>
          </div>
        </div>

        {/* KPI 5: Total Articles Vendus */}
        <div className={`${cls.cardBg} border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">Articles Vendus</span>
            <span className="text-base">📦</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-antonio text-white tracking-tight">
              {totalItemsCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Créations & Fidgets</span>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs: En cours vs Archivées */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "active"
              ? "bg-[#ff4f00] text-black shadow-lg shadow-[#ff4f00]/20"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <span>📦 Commandes En Cours</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === "active" ? "bg-black/20 text-black" : "bg-white/10 text-gray-300"
          }`}>
            {activeOrdersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "archived"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <span>🗄️ Commandes Archivées</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === "archived" ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"
          }`}>
            {archivedOrdersCount}
          </span>
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
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className={`border-b ${cls.border}`}>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 pl-6 w-[110px]`}>ID</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 w-[110px]`}>Date</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 w-[180px]`}>Client</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 min-w-[280px]`}>Articles</th>
                  <th className={`text-left text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 w-[200px]`}>Livraison / Relais</th>
                  <th className={`text-right text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 w-[110px]`}>Total</th>
                  <th className={`text-center text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 w-[140px]`}>Statut</th>
                  <th className={`text-right text-[10px] font-bold ${cls.textFaint} uppercase tracking-widest px-4 py-3.5 pr-6 w-[220px]`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${cls.divider}`}>
                {filteredOrders.map((o) => {
                  const tombolaInfo = getTombolaOrderDetails(o);

                  return (
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
                        {tombolaInfo ? (
                          <div className="flex flex-col gap-1 py-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                              <span>🎟️</span>
                              <span>{tombolaInfo.totalTickets} ticket{tombolaInfo.totalTickets > 1 ? "s" : ""} Tombola</span>
                              <span className="text-[10px] text-gray-400 font-mono font-normal">
                                ({tombolaInfo.cases.length} case{tombolaInfo.cases.length > 1 ? "s" : ""})
                              </span>
                            </div>
                            {tombolaInfo.cases.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 text-[10px] pt-0.5">
                                <span className="text-gray-400 font-semibold mr-0.5">Cases :</span>
                                {tombolaInfo.cases.map((cNum, cIdx) => (
                                  <span key={cIdx} className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-md">
                                    {cNum}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
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
                                </div>
                              );
                            })}
                            {o.items && o.items.length > 3 && (
                              <div className="text-[#ff4f00] font-bold text-[10px] mt-1 pl-1">
                                + {o.items.length - 3} autre(s) article(s)...
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-5 min-w-[180px] no-invert">
                        {tombolaInfo ? (
                          <span className="block font-semibold text-amber-300/80 text-xs">
                            Billet virtuel 🎟️
                          </span>
                        ) : (
                          <>
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
                          </>
                        )}
                      </td>
                    <td className={`px-4 py-5 font-bold ${cls.textMain} whitespace-nowrap text-right font-mono`}>
                      {o.total.toFixed(2)}€
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        o.status === "attente_impression" ? "bg-orange-500/10 text-orange-400" :
                        o.status === "impression" ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                        o.status === "emballe" ? "bg-purple-500/10 text-purple-400" :
                        "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-4 py-5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRequestReview(o)}
                          disabled={requestReviewLoading === o.id}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            (o as any).reviewRequestedAt
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                          }`}
                          title={(o as any).reviewRequestedAt ? "Relance avis déjà envoyée le " + new Date((o as any).reviewRequestedAt).toLocaleDateString("fr-FR") : "Envoyer un e-mail de relance d'avis client"}
                        >
                          <span>⭐️</span>
                          <span>
                            {requestReviewLoading === o.id
                              ? "Envoi..."
                              : (o as any).reviewRequestedAt
                              ? "Relancé ✓"
                              : "Relancer Avis"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleArchive(o.id, Boolean(o.archived))}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            o.archived
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                              : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                          title={o.archived ? "Désarchiver la commande" : "Archiver la commande"}
                        >
                          {o.archived ? "📥 Désarchiver" : "📦 Archiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            className={`relative w-full max-w-3xl ${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden shadow-2xl animate-fade-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/20 px-2 py-0.5 rounded-md">
                    Détails Commande
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedOrder.status === "attente_impression" ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                    selectedOrder.status === "impression" ? "bg-blue-500/10 text-blue-300 border-blue-500/30" :
                    selectedOrder.status === "emballe" ? "bg-purple-500/10 text-purple-300 border-purple-500/30" :
                    selectedOrder.status === "expedie" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" :
                    "bg-gray-500/10 text-gray-300 border-gray-500/30"
                  }`}>
                    {selectedOrder.status === "attente_impression" ? "⏳ En attente" :
                     selectedOrder.status === "impression" ? "🛠️ Impression" :
                     selectedOrder.status === "emballe" ? "📦 Emballée" :
                     selectedOrder.status === "expedie" ? "🚚 Expédiée" : selectedOrder.status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-antonio text-white tracking-wide">
                  COMMANDE {selectedOrder.id}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printOrderPackingSlip(selectedOrder)}
                  className="px-3.5 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#ff4f00]/85 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                  title="Imprimer le bon de préparation de la commande"
                >
                  <span>🖨️</span>
                  <span>Imprimer Bon de Commande</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Top Sub-banner Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5">
                <div>
                  📅 Passée le <strong className="text-gray-200">{new Date(selectedOrder.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</strong>
                </div>
                <div>
                  📦 Mode : <strong className="text-gray-200">{selectedOrder.shippingMethod === "pickup" ? "Retrait Atelier" : (selectedOrder.shippingMethod === "relay" ? "Mondial Relay" : "Colissimo Domicile")}</strong>
                </div>
              </div>

              {/* CARD 1: CLIENT & LIVRAISON (GROUPED) */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4.5 space-y-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>👤</span>
                  <span>Informations Client & Expédition</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Customer Info */}
                  <div className="space-y-1.5 bg-black/30 border border-white/5 rounded-xl p-3.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-500 block">Contact Client</span>
                    <div className="text-sm font-extrabold text-white">{selectedOrder.customerName || "Client Inconnu"}</div>
                    <div className="text-xs text-gray-300 font-mono select-all flex items-center gap-1.5">
                      <span>✉️</span>
                      <span>{selectedOrder.email}</span>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="text-xs text-gray-300 font-mono select-all flex items-center gap-1.5 pt-0.5">
                        <span>📞</span>
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Shipping Address / Pickup details */}
                  <div className="space-y-1.5 bg-black/30 border border-white/5 rounded-xl p-3.5">
                    {selectedOrder.shippingMethod !== "pickup" ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-500 block">Adresse de Livraison</span>
                          {editingAddress !== selectedOrder.id && (
                            <button
                              onClick={() => {
                                setEditingAddress(selectedOrder.id);
                                setEditingAddressInput(selectedOrder.shippingAddress || "");
                              }}
                              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none"
                            >
                              ✏️ {selectedOrder.shippingAddress ? "Modifier" : "Saisir"}
                            </button>
                          )}
                        </div>

                        {editingAddress === selectedOrder.id ? (
                          <div className="space-y-2 font-sans mt-2">
                            <textarea
                              rows={3}
                              value={editingAddressInput}
                              onChange={(e) => setEditingAddressInput(e.target.value)}
                              placeholder="Ex: Laura De Poppe&#10;15 Rue de l'Aurore&#10;4520 Wanze&#10;Belgique"
                              className="w-full bg-black border border-amber-500/50 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveAddress}
                                disabled={savingAddressLoading}
                                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
                              >
                                {savingAddressLoading ? "Enregistrement..." : "💾 Enregistrer"}
                              </button>
                              <button
                                onClick={() => setEditingAddress(null)}
                                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : selectedOrder.shippingAddress ? (
                          <div className="text-xs text-gray-200 select-all whitespace-pre-line leading-relaxed font-sans">
                            {selectedOrder.shippingAddress}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-1">
                            ⚠️ Adresse non renseignée
                          </div>
                        )}

                        {/* Tracking Number badge */}
                        {selectedOrder.trackingNumber && (
                          <div className="pt-2.5 mt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Suivi Colis :</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-yellow-400 bg-white/5 px-2 py-0.5 rounded select-all">
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
                                Suivre ↗
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-500 block">Retrait Atelier (Click & Collect)</span>
                        <div className="text-xs text-gray-300">
                          Créneau souhaité : <strong className="text-white">{formatPickupSlot(selectedOrder.pickupSlotConfirmed || selectedOrder.pickupSlotRequested)}</strong>
                        </div>
                        <div className="text-xs text-gray-400">
                          Statut : <strong className="text-white">{
                            selectedOrder.pickupStatus === "confirmed" ? "Validé ✓" :
                            selectedOrder.pickupStatus === "proposed" ? "Alternative proposée" :
                            "En attente"
                          }</strong>
                        </div>

                        {selectedOrder.pickupStatus !== "confirmed" && (
                          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                            {selectedOrder.pickupSlotRequested && (
                              <button
                                onClick={() => handleConfirmPickupSlot(selectedOrder.id, selectedOrder.pickupSlotRequested!)}
                                disabled={pickupLoading === selectedOrder.id}
                                className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                {pickupLoading === selectedOrder.id ? "Validation..." : "Valider ✓"}
                              </button>
                            )}
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="datetime-local"
                                value={proposingSlots[selectedOrder.id] || ""}
                                onChange={(e) => setProposingSlots(prev => ({ ...prev, [selectedOrder.id]: e.target.value }))}
                                className="bg-black border border-[#222225] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#005cff] cursor-pointer"
                              />
                              <button
                                onClick={() => handleProposeAlternativeSlot(selectedOrder.id)}
                                disabled={pickupLoading === selectedOrder.id || !proposingSlots[selectedOrder.id]}
                                className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 disabled:bg-white/5 disabled:text-gray-600 font-bold text-xs text-white transition-colors cursor-pointer"
                              >
                                Proposer 📅
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: ARTICLES COMMANDÉS & OPTIONS 3D */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <span>📦</span>
                    <span>Articles Commandés ({selectedOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0})</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 font-mono">
                    {selectedOrder.items?.length || 0} produit(s)
                  </span>
                </div>

                {/* Items Container */}
                {(() => {
                  const modalTombolaInfo = selectedOrder ? getTombolaOrderDetails(selectedOrder) : null;

                  if (modalTombolaInfo) {
                    return (
                      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                            <span className="text-xl">🎟️</span>
                            <span>Ticket{modalTombolaInfo.totalTickets > 1 ? "s" : ""} Tombola Spoolio</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-500/20">
                          <span className="text-xs text-gray-300 font-bold mr-1">Cases choisies :</span>
                          {modalTombolaInfo.cases.map((cNum, cIdx) => (
                            <span key={cIdx} className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                              {cNum}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
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
                            className="bg-black/30 border border-white/5 hover:border-white/15 transition-all rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-sm w-full overflow-hidden"
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                              <div className={`mt-0.5 inline-flex items-center justify-center font-mono font-black text-xs px-2.5 py-1 rounded-xl shrink-0 ${
                                isDonation 
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : isTombola
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-[#ff4f00]/20 text-[#ff4f00] border border-[#ff4f00]/30"
                              }`}>
                                x{item.quantity}
                              </div>

                              <div className="space-y-1.5 min-w-0 flex-1 w-full">
                                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
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

                                {options.length > 0 ? (
                                  <OrderItemOptionsViewer options={options} />
                                ) : (
                                  <div className="text-[11px] text-gray-500 italic">Article standard</div>
                                )}
                              </div>
                            </div>

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
                  );
                })()}

                {/* Total & Shipping Pricing Summary Strip */}
                {(() => {
                  const itemsSubtotal = (selectedOrder.items || []).reduce((acc, item) => {
                    const price = item.price ? parseFloat(String(item.price)) : 0;
                    return acc + price * (item.quantity || 1);
                  }, 0);

                  const expectedTotal = itemsSubtotal + (selectedOrder.shippingCost || 0);
                  const diff = expectedTotal - selectedOrder.total;
                  const hasDiscount = diff > 0.05;

                  return (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 mt-2 space-y-2">
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold border-b border-white/5 pb-2">
                          <span>🎁 Réduction / Code promo / Fidélité appliqué :</span>
                          <span className="font-mono font-bold">-{diff.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 gap-2">
                        <div>
                          Sous-total articles : <strong className="text-gray-200">{itemsSubtotal.toFixed(2)}€</strong> &nbsp;•&nbsp; Livraison : <strong className="text-gray-200">{selectedOrder.shippingCost === 0 ? "Offerte" : `${selectedOrder.shippingCost.toFixed(2)}€`}</strong>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-xs uppercase font-bold text-gray-400">Total Net Payé :</span>
                          <span className="text-lg font-black font-mono text-yellow-400">{selectedOrder.total.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* CARD 3: ACTIONS & WORKFLOW CENTER */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4.5 space-y-3.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2 border-b border-white/5 pb-2">
                  <span>⚡</span>
                  <span>Centre d'Actions & Communication Client</span>
                </div>

                {/* Row 1: Workflow status steps */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-black/30 border border-white/5 rounded-xl p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-300">Étape suivante :</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedOrder.shippingMethod !== "pickup" && selectedOrder.status !== "expedie" && (
                      <button
                        type="button"
                        onClick={() => handleGenerateBoxtalShipment(selectedOrder.id)}
                        disabled={boxtalLoading === selectedOrder.id}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                        title="Générer l'expédition et le numéro de suivi automatique via l'API Boxtal"
                      >
                        <span>📦</span>
                        <span>{boxtalLoading === selectedOrder.id ? "Génération..." : "Expédier via Boxtal API"}</span>
                      </button>
                    )}

                    {selectedOrder.status === "attente_impression" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedOrder.id, "impression")}
                        disabled={statusChangeLoading === selectedOrder.id}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                      >
                        Lancer Impression 🛠️
                      </button>
                    )}
                    {selectedOrder.status === "impression" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedOrder.id, "emballe")}
                        disabled={statusChangeLoading === selectedOrder.id}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                      >
                        Emballer 📦
                      </button>
                    )}
                    {selectedOrder.status === "emballe" && (
                      <button
                        type="button"
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
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                      >
                        {selectedOrder.shippingMethod === "pickup" ? "Prêt au Retrait ✓" : "Expédier Manuellement 🚚"}
                      </button>
                    )}
                    {selectedOrder.status === "expedie" && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30 select-none">
                        Clôturée ✓
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleArchive(selectedOrder.id, Boolean(selectedOrder.archived))}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border flex items-center gap-1.5 ${
                        selectedOrder.archived
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                          : "bg-white/10 text-gray-200 border-white/20 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <span>{selectedOrder.archived ? "📥" : "📦"}</span>
                      <span>{selectedOrder.archived ? "Désarchiver" : "Archiver"}</span>
                    </button>
                  </div>
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
      {/* Send Note Modal Popup */}
      {showNoteModal && selectedOrder && (
        <div
          onClick={() => setShowNoteModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg ${cls.cardBg} border ${cls.border} rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                  Commande {selectedOrder.id}
                </span>
                <h3 className="text-xl font-black font-antonio text-white mt-0.5 uppercase">
                  💬 Envoyer une note au client
                </h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendOrderNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Destinataire</label>
                <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300">
                  <div className="font-bold text-white">{selectedOrder.customerName || "Client"}</div>
                  <div className="text-gray-400">{selectedOrder.email}</div>
                  <div className="text-[10px] text-amber-400/90 mt-1 font-semibold">
                    📩 Une copie de cet e-mail sera également envoyée à l&apos;administrateur.
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">
                  Message / Note pour le client <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Tapez ici le message à transmettre au client par e-mail (ex: Nous avons pris en compte votre précision pour la couleur, votre colis part cet après-midi !)..."
                  className="w-full bg-black/60 border border-amber-500/40 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingNoteLoading || !noteText.trim()}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {sendingNoteLoading ? "Envoi en cours..." : "Envoyer l'e-mail 📧"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

