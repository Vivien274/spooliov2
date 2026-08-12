"use client";

import React, { useState, useEffect, useTransition } from "react";
import confetti from "canvas-confetti";
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
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import { supabase } from "@/lib/supabaseClient";
import {
  TombolaTicketItem,
  getTombolaTicketsAction,
  updateTicketAdminAction,
  quickPhysicalSaleAction,
  drawWinnerAction,
  resetTombolaTicketsAction,
} from "@/app/actions/tombolaActions";

export default function AdminTombolaPage() {
  const { cls } = useAdminTheme();

  // State
  const [tickets, setTickets] = useState<TombolaTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

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

  // Load tickets on mount & setup Supabase Realtime
  const refreshTickets = async () => {
    try {
      const data = await getTombolaTicketsAction();
      setTickets(data);
    } catch (err: any) {
      console.error("Error refreshing tombola tickets:", err);
    } finally {
      setLoading(false);
    }
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
  const totalTickets = 50;
  const pricePerTicket = 2.0;
  const paidTickets = tickets.filter((t) => t.status === "paid");
  const reservedTickets = tickets.filter((t) => t.status === "reserved");
  const availableTickets = tickets.filter((t) => t.status === "available");

  const totalCollected = paidTickets.length * pricePerTicket;
  const remainingCount = availableTickets.length;
  const fillRate = Math.round(((paidTickets.length + reservedTickets.length) / totalTickets) * 100);

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
    // Pick first available ticket by default
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

    // Get server draw winner result
    const res = await drawWinnerAction();
    if (!res.success || !res.winner) {
      setIsDrawing(false);
      alert(res.error || "Erreur lors du tirage au sort.");
      return;
    }

    const paidNumbers = paidTickets.map((t) => t.ticket_number);
    let iterations = 0;
    const maxIterations = 35; // Total cycles for roulette
    const intervalTime = 80; // Speed in ms

    const timer = setInterval(() => {
      iterations++;
      const randomIdx = Math.floor(Math.random() * paidNumbers.length);
      setRouletteNumber(paidNumbers[randomIdx]);

      if (iterations >= maxIterations) {
        clearInterval(timer);
        setRouletteNumber(res.winner.ticket_number);
        setIsDrawing(false);
        setWinnerModalData(res.winner);

        // Fire Confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FF5500", "#FF8800", "#FFFFFF", "#FFD700"],
        });
      }
    }, intervalTime);
  };

  // Reset entire Tombola
  const handleResetTombola = () => {
    if (!confirm("Attention: Voulez-vous vraiment réinitialiser les 50 cases au statut disponible ?")) {
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
                Gestion en temps réel de la tombola (50 cases à 2€) & Tirage au sort
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
            Vente physique sur stand
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
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <p className="text-[11px] text-[#FF5500] font-mono">{paidTickets.length} cases payées</p>
          </div>
        </div>

        {/* Stat 2: Remaining Tickets */}
        <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-5 shadow-xl flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Cases restantes</p>
            <h3 className="text-2xl font-black text-white">{remainingCount} / 50</h3>
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

      {/* Main Interactive Grid Section */}
      <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Grille Interactive Admin (50 Cases)
              <span className="text-xs font-mono text-neutral-400">Clique sur une case pour gérer</span>
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-white/10 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" /> Disponible ({availableTickets.length})
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
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 auto-rows-fr">
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
                <span className="text-base sm:text-lg font-black">{t.ticket_number}</span>

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
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleResetTombola}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser toutes les 50 cases
          </button>
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
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
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
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
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
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white"
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
