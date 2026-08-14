"use client";

import React, { useState, useEffect, useTransition } from "react";
import confetti from "canvas-confetti";
import Image from "next/image";
import {
  Ticket,
  Trophy,
  Euro,
  Users,
  Percent,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  User,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
  Power,
  Calendar,
  Gift,
  Upload,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import { supabase } from "@/lib/supabaseClient";
import {
  TombolaTicketItem,
  TombolaConfigItem,
  getTombolaTicketsAction,
  getTombolaConfigAction,
  updateTombolaStatusAction,
  updateTombolaConfigAction,
  updateTicketAdminAction,
  quickPhysicalSaleAction,
  drawWinnerAction,
  resetTombolaTicketsAction,
} from "@/app/actions/tombolaActions";

const SAMPLE_IMAGES = [
  "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
  "/images/alien_capsule.jpg",
  "/images/pochette-kraft.jpg",
  "/images/figma_keychains.jpg",
  "/images/hero_background.jpg",
];

export default function AdminTombolaPage() {
  const { cls } = useAdminTheme();

  // State
  const [tickets, setTickets] = useState<TombolaTicketItem[]>([]);
  const [tombolaConfig, setTombolaConfig] = useState<TombolaConfigItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // Config Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formImage, setFormImage] = useState<string>("");
  const [formEstimatedValue, setFormEstimatedValue] = useState<number>(20.0);
  const [formEndDate, setFormEndDate] = useState<string>("");
  const [formTicketPrice, setFormTicketPrice] = useState<number>(2.0);
  const [formTotalCases, setFormTotalCases] = useState<number>(50);

  // Ticket detail / edit modal
  const [selectedTicket, setSelectedTicket] = useState<TombolaTicketItem | null>(null);
  const [editBuyerName, setEditBuyerName] = useState<string>("");
  const [editBuyerEmail, setEditBuyerEmail] = useState<string>("");
  const [editBuyerPhone, setEditBuyerPhone] = useState<string>("");
  const [editStatus, setEditStatus] = useState<"available" | "reserved" | "paid">("available");

  // Quick physical sale modal
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState<boolean>(false);
  const [quickTicketNumber, setQuickTicketNumber] = useState<number | null>(null);
  const [quickName, setQuickName] = useState<string>("");
  const [quickPhone, setQuickPhone] = useState<string>("");

  // Raffle draw state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rouletteNumber, setRouletteNumber] = useState<number | null>(null);
  const [winnerModalData, setWinnerModalData] = useState<{
    ticket_number: number;
    buyer_name: string;
    buyer_email?: string | null;
    buyer_phone?: string | null;
  } | null>(null);

  // Error & Info Feedback
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load tickets and config on mount & setup Supabase Realtime
  const refreshTickets = async () => {
    try {
      const [ticketsData, configData] = await Promise.all([
        getTombolaTicketsAction(),
        getTombolaConfigAction(),
      ]);
      setTickets(ticketsData);
      setTombolaConfig(configData);

      // Hydrate form states
      if (configData) {
        setFormTitle(configData.title || "");
        setFormDescription(configData.description || "");
        setFormImage(configData.image || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp");
        setFormEstimatedValue(configData.estimatedValue ?? 20.0);
        setFormEndDate(configData.endDate || "");
        setFormTicketPrice(configData.ticketPrice ?? 2.0);
        setFormTotalCases(configData.totalCases ?? 50);
      }
    } catch (err: any) {
      console.error("Error refreshing tombola data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (newActiveState: boolean) => {
    startTransition(async () => {
      const newStatus = newActiveState ? "active" : "inactive";
      // Optimistic update
      setTombolaConfig((prev) => (prev ? { ...prev, status: newStatus } : null));

      const res = await updateTombolaStatusAction(newStatus);
      if (res.success) {
        setActionSuccess(
          newActiveState
            ? "La tombola est maintenant active et visible en ligne !"
            : "La tombola a été désactivée. La page publique indique qu'aucune tombola n'est en cours et la bulle flottante est masquée."
        );
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(res.error || "Erreur lors du changement de statut.");
        refreshTickets();
      }
    });
  };

  // Save Tombola Lot and general configuration
  const handleSaveLotConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setActionError("Le nom du lot est obligatoire.");
      return;
    }

    startTransition(async () => {
      const res = await updateTombolaConfigAction({
        title: formTitle.trim(),
        description: formDescription.trim(),
        image: formImage.trim() || "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
        estimatedValue: Number(formEstimatedValue) || 20.0,
        endDate: formEndDate.trim(),
        ticketPrice: Number(formTicketPrice) || 2.0,
        totalCases: Number(formTotalCases) || 50,
      });

      if (res.success && res.config) {
        setTombolaConfig(res.config);
        setActionSuccess("Configuration du lot et de la tombola enregistrée avec succès !");
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(res.error || "Erreur lors de la sauvegarde de la configuration.");
      }
    });
  };

  // Image Upload with Canvas WebP compression
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
          setFormImage(webpDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    refreshTickets();

    // Supabase Realtime subscription
    const channel = supabase
      .channel("tombola_realtime_admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tombola_tickets",
        },
        () => {
          refreshTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute Statistics
  const totalCasesCount = tombolaConfig?.totalCases || 50;
  const currentTicketPrice = tombolaConfig?.ticketPrice || 2.0;
  const paidTickets = tickets.filter((t) => t.status === "paid");
  const reservedTickets = tickets.filter((t) => t.status === "reserved");
  const availableTickets = tickets.filter((t) => t.status === "available");

  const totalCollected = paidTickets.length * currentTicketPrice;
  const remainingCount = availableTickets.length;
  const fillRate = Math.round(((paidTickets.length + reservedTickets.length) / totalCasesCount) * 100);

  // Open ticket drawer / modal
  const handleOpenTicketModal = (ticket: TombolaTicketItem) => {
    setSelectedTicket(ticket);
    setEditBuyerName(ticket.buyer_name || "");
    setEditBuyerEmail(ticket.buyer_email || "");
    setEditBuyerPhone(ticket.buyer_phone || "");
    setEditStatus(ticket.status);
    setActionError(null);
  };

  // Submit single ticket edit
  const handleSaveTicket = () => {
    if (!selectedTicket) return;

    startTransition(async () => {
      const res = await updateTicketAdminAction({
        ticketNumber: selectedTicket.ticket_number,
        status: editStatus,
        buyerName: editBuyerName,
        buyerEmail: editBuyerEmail,
        buyerPhone: editBuyerPhone,
      });

      if (res.success) {
        setActionSuccess(`Case N°${selectedTicket.ticket_number} mise à jour avec succès !`);
        setSelectedTicket(null);
        refreshTickets();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(res.error || "Erreur lors de la sauvegarde.");
      }
    });
  };

  // Quick Action: Mark as Paid directly
  const handleMarkAsPaid = (ticketNumber: number) => {
    startTransition(async () => {
      const res = await updateTicketAdminAction({
        ticketNumber,
        status: "paid",
      });
      if (res.success) {
        refreshTickets();
      }
    });
  };

  // Quick Action: Release Ticket
  const handleReleaseTicket = (ticketNumber: number) => {
    startTransition(async () => {
      const res = await updateTicketAdminAction({
        ticketNumber,
        status: "available",
      });
      if (res.success) {
        setSelectedTicket(null);
        refreshTickets();
      }
    });
  };

  // Open Quick Stand Sale modal
  const handleOpenQuickSale = () => {
    const firstAvail = availableTickets[0]?.ticket_number || null;
    setQuickTicketNumber(firstAvail);
    setQuickName("");
    setQuickPhone("");
    setActionError(null);
    setIsQuickSaleOpen(true);
  };

  // Submit Quick Stand Sale
  const handleSubmitQuickSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTicketNumber) {
      setActionError("Aucune case disponible sélectionnée.");
      return;
    }

    startTransition(async () => {
      const res = await quickPhysicalSaleAction({
        ticketNumber: quickTicketNumber,
        buyerName: quickName.trim() || `Stand #${quickTicketNumber}`,
        buyerPhone: quickPhone.trim() || undefined,
      });

      if (res.success) {
        setIsQuickSaleOpen(false);
        setActionSuccess(`Case N°${quickTicketNumber} vendue avec succès !`);
        refreshTickets();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(res.error || "Erreur lors de la vente.");
      }
    });
  };

  // Trigger Raffle Draw Animation
  const handleTriggerDraw = async () => {
    if (paidTickets.length === 0) {
      alert("Aucune case au statut 'Payé' disponible pour le tirage au sort !");
      return;
    }

    setIsDrawing(true);
    setWinnerModalData(null);

    const res = await drawWinnerAction();
    if (!res.success || !res.winner) {
      setIsDrawing(false);
      alert(res.error || "Erreur lors du tirage au sort.");
      return;
    }

    const paidNumbers = paidTickets.map((t) => t.ticket_number);
    let iterations = 0;
    const maxIterations = 35;
    const intervalTime = 80;

    const timer = setInterval(() => {
      iterations++;
      const randomIdx = Math.floor(Math.random() * paidNumbers.length);
      setRouletteNumber(paidNumbers[randomIdx]);

      if (iterations >= maxIterations) {
        clearInterval(timer);
        setRouletteNumber(res.winner.ticket_number);
        setIsDrawing(false);
        setWinnerModalData(res.winner);

        // Update config with winner
        updateTombolaConfigAction({
          status: "drawn",
          winnerTicket: res.winner.ticket_number,
          winnerDrawnAt: new Date().toLocaleString("fr-FR"),
        });

        // Fire Confetti!
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FF5500", "#FF8800", "#FFFFFF", "#FFD700"],
        });
      }
    }, intervalTime);
  };

  // Reset entire Tombola
  const handleResetTombola = () => {
    if (!confirm("Attention: Voulez-vous vraiment réinitialiser toutes les cases au statut disponible ?")) {
      return;
    }

    startTransition(async () => {
      const res = await resetTombolaTicketsAction();
      if (res.success) {
        refreshTickets();
        setActionSuccess("Toutes les cases ont été réinitialisées.");
        setTimeout(() => setActionSuccess(null), 3000);
      }
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isTombolaActive = tombolaConfig?.status === "active";

  return (
    <div className={`min-h-screen ${cls.pageBg} p-4 sm:p-6 lg:p-8 text-white space-y-8 font-sans`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500]">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Tombola Spoolio <span className="text-[#FF5500]">Manager</span>
              </h1>
              <p className="text-xs text-neutral-400">
                Configuration du lot, activation/désactivation & gestion en direct des cases
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshTickets}
            className="px-3.5 py-2.5 rounded-xl bg-[#1A1A22] border border-white/10 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          <button
            onClick={handleOpenQuickSale}
            disabled={availableTickets.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white text-xs font-bold shadow-lg shadow-[#FF5500]/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            Vente physique stand
          </button>

          <button
            onClick={handleTriggerDraw}
            disabled={paidTickets.length === 0 || isDrawing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Trophy className={`w-4 h-4 ${isDrawing ? "animate-bounce" : ""}`} />
            {isDrawing ? "Tirage en cours..." : "TIRAGE AU SORT"}
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tombola Status Toggle Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-xl ${
          isTombolaActive
            ? "bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/20"
            : "bg-neutral-900/80 border-amber-500/30 shadow-black/40"
        } flex flex-wrap items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
              isTombolaActive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                : "bg-neutral-800 text-neutral-400 border border-white/10"
            }`}
          >
            <Power className={`w-6 h-6 ${isTombolaActive ? "text-emerald-400" : "text-neutral-400"}`} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold text-white">Statut de la Tombola Spoolio</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                  isTombolaActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTombolaActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {isTombolaActive ? "Active (En ligne)" : "Désactivée (Hors ligne)"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              {isTombolaActive
                ? "La tombola est ouverte au public sur /tombola et la bannière flottante est affichée aux visiteurs."
                : "La tombola est désactivée. La page publique /tombola informe qu'aucune tombola n'est en cours et la bannière flottante est masquée sur tout le site."}
            </p>
          </div>
        </div>

        {/* Interactive Switcher Button */}
        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10">
          <span className={`text-xs font-bold ${isTombolaActive ? "text-emerald-400" : "text-neutral-400"}`}>
            {isTombolaActive ? "Tombola Active" : "Tombola Désactivée"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isTombolaActive}
            disabled={isPending}
            onClick={() => handleToggleStatus(!isTombolaActive)}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF5500] disabled:opacity-50 ${
              isTombolaActive ? "bg-emerald-500" : "bg-neutral-700"
            }`}
            title={isTombolaActive ? "Désactiver la tombola" : "Activer la tombola"}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center font-bold text-xs ${
                isTombolaActive
                  ? "translate-x-7 text-emerald-600"
                  : "translate-x-0 text-neutral-600"
              }`}
            >
              {isTombolaActive ? "✓" : "✕"}
            </span>
          </button>
        </div>
      </div>

      {/* Top Key Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Collected */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total récolté</p>
            <h3 className="text-2xl font-black text-white">{totalCollected.toFixed(2)} €</h3>
            <p className="text-[11px] text-[#FF5500] font-mono">{paidTickets.length} cases payées ({currentTicketPrice.toFixed(2)}€/case)</p>
          </div>
        </div>

        {/* Stat 2: Remaining Tickets */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Cases restantes</p>
            <h3 className="text-2xl font-black text-white">{remainingCount} / {totalCasesCount}</h3>
            <p className="text-[11px] text-blue-400 font-mono">Disponibles immédiatement</p>
          </div>
        </div>

        {/* Stat 3: Fill Rate */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Taux de remplissage</p>
            <h3 className="text-2xl font-black text-white">{fillRate}%</h3>
            <p className="text-[11px] text-amber-400 font-mono">{reservedTickets.length} réservations en attente</p>
          </div>
        </div>

        {/* Stat 4: Raffle Status */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Participants validés</p>
            <h3 className="text-2xl font-black text-white">{paidTickets.length}</h3>
            <p className="text-[11px] text-emerald-400 font-mono">Prêts pour le tirage</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Lot Config (Left) + Interactive Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols): Lot Configuration Form */}
        <form
          onSubmit={handleSaveLotConfig}
          className={`lg:col-span-5 ${cls.cardBg} border ${cls.border} rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5`}
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FF5500]" />
              Configuration du Lot & Paramètres
            </h2>
            <p className="text-xs text-neutral-400">
              Définis le lot à gagner, l&apos;image, la date du tirage et les tarifs.
            </p>
          </div>

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <span>Nom du Lot / Titre de la Tombola</span>
              <span className="text-[#FF5500]">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm font-semibold"
              placeholder="ex: TOMBOLA SPOOLIO 🎁 - Pack Fidgets"
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase">
              Description du lot
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm"
              placeholder="Description détaillée du lot à gagner affichée aux participants..."
            />
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center justify-between">
              <span>Photo du Lot</span>
              {formImage.startsWith("data:image/webp") && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ⚡ WebP Compressé
                </span>
              )}
            </label>

            {/* Image Preview & Upload Button */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/15 bg-black shrink-0">
                {formImage ? (
                  <Image
                    src={formImage}
                    alt="Aperçu lot"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <label className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-[#FF5500] rounded-2xl text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 group">
                <Upload className="w-4 h-4 group-hover:scale-110 text-[#FF5500] transition-transform" />
                <span>Téléverser (WebP auto)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct URL input */}
            <input
              type="text"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="Ou URL de l'image (ex: /images/lot.webp)"
              className="w-full px-3 py-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-[#FF5500]"
            />

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] text-neutral-500 uppercase font-mono mr-1">Presets :</span>
              {SAMPLE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormImage(img)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer relative shrink-0 ${
                    formImage === img ? "border-[#FF5500] ring-1 ring-[#FF5500]" : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="Preset" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing, Cases & End Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Valeur estimée */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase">
                Valeur du lot (€)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formEstimatedValue}
                onChange={(e) => setFormEstimatedValue(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            {/* Prix de la case */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase">
                Prix / Case (€)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formTicketPrice}
                onChange={(e) => setFormTicketPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>

          {/* Date limite / Tirage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Date & Heure du Tirage
            </label>
            <input
              type="text"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
              placeholder="ex: 15 Août à 17h30 ou 2026-08-15"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm"
            />
          </div>

          {/* Total Cases */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase">
              Nombre de cases sur la grille
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[40, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormTotalCases(num)}
                  className={`py-2 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                    formTotalCases === num
                      ? "bg-[#FF5500] border-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20"
                      : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  {num} cases
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Enregistrer les détails du lot
            </button>
          </div>
        </form>

        {/* Right Column (7 cols): Interactive 50-Case Grid & Buyers list */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Interactive Grid */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Grille Interactive ({tickets.length} Cases)
                  <span className="text-xs font-mono text-neutral-400">Clique sur une case pour gérer</span>
                </h3>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-white/10 text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" /> Libre ({availableTickets.length})
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Réservée ({reservedTickets.length})
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] inline-block" /> Payée ({paidTickets.length})
                </span>
              </div>
            </div>

            {/* Roulette Display during raffle draw */}
            {isDrawing && rouletteNumber !== null && (
              <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#FF5500]/20 to-yellow-500/20 border border-amber-500/40 text-center space-y-3 animate-pulse">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                  🎰 Tirage en cours... Suspense !
                </span>
                <div className="text-6xl font-black text-amber-400 font-mono tracking-wider">
                  Case #{rouletteNumber}
                </div>
              </div>
            )}

            {/* Grid Display */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 sm:gap-3 auto-rows-fr">
              {tickets.map((t) => {
                const isPaid = t.status === "paid";
                const isReserved = t.status === "reserved";
                const isAvailable = t.status === "available";

                return (
                  <button
                    key={t.ticket_number}
                    onClick={() => handleOpenTicketModal(t)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-300 group overflow-hidden border cursor-pointer ${
                      isPaid
                        ? "bg-[#FF5500]/20 border-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20 hover:scale-105"
                        : isReserved
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-300 hover:scale-105"
                        : "bg-[#181818] border-white/10 text-neutral-300 hover:border-white/30 hover:bg-white/5 hover:scale-105"
                    }`}
                  >
                    <span className="text-base font-black">{t.ticket_number}</span>

                    {isPaid && (
                      <span className="text-[10px] font-mono text-white font-bold truncate max-w-[85%] px-1 rounded bg-[#FF5500]/60">
                        {getInitials(t.buyer_name) || "PAYÉ"}
                      </span>
                    )}

                    {isReserved && (
                      <span className="text-[9px] font-mono text-amber-300 truncate max-w-[85%] px-1">
                        {getInitials(t.buyer_name) || "RÉSERVÉ"}
                      </span>
                    )}

                    {isAvailable && (
                      <span className="text-[10px] text-neutral-500 group-hover:text-white">Libre</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reset All Footer Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Tarif : {currentTicketPrice.toFixed(2)}€ / case
              </span>
              <button
                onClick={handleResetTombola}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser toutes les {tickets.length} cases
              </button>
            </div>
          </div>

          {/* Reserved & Paid Buyers Table */}
          {(paidTickets.length > 0 || reservedTickets.length > 0) && (
            <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 shadow-2xl space-y-4`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF5500]" />
                  Liste des Acheteurs & Réservations ({paidTickets.length + reservedTickets.length})
                </h3>
              </div>

              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Case</th>
                      <th className="py-2.5 px-3">Acheteur</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {tickets
                      .filter((t) => t.status === "paid" || t.status === "reserved")
                      .map((t) => (
                        <tr key={t.ticket_number} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-2 px-3 font-mono font-black text-amber-400">
                            #{t.ticket_number}
                          </td>
                          <td className="py-2 px-3 font-bold text-white">
                            {t.buyer_name || <span className="text-neutral-500 italic">Anonyme</span>}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {t.buyer_phone || t.buyer_email || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                t.status === "paid"
                                  ? "bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {t.status === "paid" ? "Payé (2€)" : "Réservé"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {t.status === "reserved" && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(t.ticket_number)}
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Valider Payé
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenTicketModal(t)}
                                className="text-[10px] font-bold text-neutral-300 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Éditer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Edit Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] font-black text-xl">
                  #{selectedTicket.ticket_number}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Gestion de la Case #{selectedTicket.ticket_number}</h3>
                  <p className="text-xs text-neutral-400">Modifier le statut ou les coordonnées client</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Statut selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Statut de la case</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus("available")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editStatus === "available"
                        ? "bg-neutral-800 border-white/40 text-white shadow"
                        : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("reserved")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editStatus === "reserved"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow"
                        : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Réservé
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("paid")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editStatus === "paid"
                        ? "bg-[#FF5500] border-[#FF5500] text-white shadow"
                        : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Payé
                  </button>
                </div>
              </div>

              {/* Buyer info fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#FF5500]" /> Nom du Client
                </label>
                <input
                  type="text"
                  placeholder="Nom & Prénom"
                  value={editBuyerName}
                  onChange={(e) => setEditBuyerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FF5500]" /> Email
                </label>
                <input
                  type="email"
                  placeholder="client@exemple.com"
                  value={editBuyerEmail}
                  onChange={(e) => setEditBuyerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF5500]" /> Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={editBuyerPhone}
                  onChange={(e) => setEditBuyerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleReleaseTicket(selectedTicket.ticket_number)}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Libérer la case
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveTicket}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] text-white text-xs font-bold shadow-lg shadow-[#FF5500]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Physical Stand Sale Modal */}
      {isQuickSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/30 text-[#FF5500]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Vente physique sur stand</h3>
                  <p className="text-xs text-neutral-400">Assignation directe + Statut "Payé" (2€)</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickSaleOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuickSale} className="space-y-4">
              {actionError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Numéro de case disponible</label>
                <select
                  value={quickTicketNumber || ""}
                  onChange={(e) => setQuickTicketNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF5500]"
                >
                  {availableTickets.map((t) => (
                    <option key={t.ticket_number} value={t.ticket_number}>
                      Case #{t.ticket_number} (Disponible)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#FF5500]" /> Nom du Client (ou prénom)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Paul"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF5500]" /> Téléphone (Optionnel)
                </label>
                <input
                  type="tel"
                  placeholder="06 00 00 00 00"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Valider la Vente (Statut Payé - 2€)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Winner Raffle Result Modal */}
      {winnerModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1A1A22] to-[#101014] border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center space-y-6">
            <button
              onClick={() => setWinnerModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                🎉 GAGNANT DE LA TOMBOLA 🎉
              </span>
              <h2 className="text-4xl font-black text-white">Case #{winnerModalData.ticket_number}</h2>
              <p className="text-xl font-bold text-amber-300">{winnerModalData.buyer_name}</p>
            </div>

            {/* Winner contact info */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Acheteur :</span>
                <span className="font-semibold text-white">{winnerModalData.buyer_name}</span>
              </div>
              {winnerModalData.buyer_email && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Email :</span>
                  <span className="font-mono text-neutral-200">{winnerModalData.buyer_email}</span>
                </div>
              )}
              {winnerModalData.buyer_phone && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Téléphone :</span>
                  <span className="font-mono text-neutral-200">{winnerModalData.buyer_phone}</span>
                </div>
              )}
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {winnerModalData.buyer_phone ? (
                <a
                  href={`sms:${winnerModalData.buyer_phone}?body=${encodeURIComponent(
                    `Félicitations ! Vous avez gagné la Tombola Spoolio avec la case #${winnerModalData.ticket_number} !`
                  )}`}
                  className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Phone className="w-4 h-4" />
                  Envoyer SMS
                </a>
              ) : (
                <button
                  disabled
                  className="py-3 px-4 rounded-xl bg-neutral-800 text-neutral-500 text-xs font-bold"
                >
                  Pas de Tel
                </button>
              )}

              {winnerModalData.buyer_email ? (
                <a
                  href={`mailto:${winnerModalData.buyer_email}?subject=${encodeURIComponent(
                    "Gagnant Tombola Spoolio 🎁"
                  )}&body=${encodeURIComponent(
                    `Bonjour ${winnerModalData.buyer_name},\n\nBravo ! Votre numéro #${winnerModalData.ticket_number} a été tiré au sort pour la Tombola Spoolio !`
                  )}`}
                  className="py-3 px-4 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5500]/20"
                >
                  <Mail className="w-4 h-4" />
                  Envoyer Email
                </a>
              ) : (
                <button
                  disabled
                  className="py-3 px-4 rounded-xl bg-neutral-800 text-neutral-500 text-xs font-bold"
                >
                  Pas d&apos;Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
