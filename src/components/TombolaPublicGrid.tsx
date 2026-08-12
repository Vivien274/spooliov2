"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Ticket, Sparkles, CheckCircle2, User, Mail, Phone, Clock, AlertCircle, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { TombolaTicketItem, reserveTicketAction, getTombolaTicketsAction } from "@/app/actions/tombolaActions";

interface TombolaPublicGridProps {
  initialTickets?: TombolaTicketItem[];
}

export default function TombolaPublicGrid({ initialTickets = [] }: TombolaPublicGridProps) {
  const [tickets, setTickets] = useState<TombolaTicketItem[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load tickets on mount & subscribe to Supabase Realtime
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTombolaTicketsAction();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets:", err);
      }
    };

    if (!initialTickets || initialTickets.length === 0) {
      fetchTickets();
    }

    // Subscribe to Postgres changes via Supabase Realtime
    const channel = supabase
      .channel("tombola_realtime_public")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tombola_tickets",
        },
        (payload) => {
          console.log("Realtime ticket update payload:", payload);
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialTickets]);

  const handleCaseClick = (ticket: TombolaTicketItem) => {
    if (ticket.status !== "available") return;
    setSelectedTicket(ticket.ticket_number);
    setFormError(null);
    setSuccessMessage(null);
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setIsModalOpen(true);
  };

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!buyerName.trim()) {
      setFormError("Veuillez renseigner votre nom complet.");
      return;
    }

    setFormError(null);

    startTransition(async () => {
      const res = await reserveTicketAction({
        ticketNumber: selectedTicket,
        buyerName,
        buyerEmail,
        buyerPhone,
      });

      if (res.success) {
        setSuccessMessage(`Félicitations ! La case N°${selectedTicket} a été réservée.`);
        // Optimistic local update
        setTickets((prev) =>
          prev.map((t) =>
            t.ticket_number === selectedTicket
              ? {
                  ...t,
                  status: "reserved",
                  buyer_name: buyerName,
                  buyer_email: buyerEmail || null,
                  buyer_phone: buyerPhone || null,
                }
              : t
          )
        );

        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage(null);
        }, 2200);
      } else {
        setFormError(res.error || "Erreur lors de la réservation.");
      }
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const paidCount = tickets.filter((t) => t.status === "paid").length;
  const reservedCount = tickets.filter((t) => t.status === "reserved").length;
  const availableCount = tickets.filter((t) => t.status === "available").length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Legend & Summary Bento Card */}
      <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500]">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              Statut de la Tombola
              <span className="text-xs bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 px-2 py-0.5 rounded-full font-mono">
                {availableCount} / 50 disponibles
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Clique sur une case disponible pour valider ta participation à 2€
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#1E1E1E] border border-white/20 inline-block shadow" />
            <span className="text-neutral-300">Disponible ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/20 border border-amber-500/50 inline-block shadow" />
            <span className="text-amber-400">Réservée ({reservedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FF5500] border border-[#FF5500] inline-block shadow" />
            <span className="text-white">Prise ({paidCount})</span>
          </div>
        </div>
      </div>

      {/* Grid of 50 Tickets */}
      <div className="bg-[#0F0F0F]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4 auto-rows-fr">
          {tickets.map((t) => {
            const isAvailable = t.status === "available";
            const isReserved = t.status === "reserved";
            const isPaid = t.status === "paid";

            return (
              <button
                key={t.ticket_number}
                onClick={() => handleCaseClick(t)}
                disabled={!isAvailable}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-300 group overflow-hidden border ${
                  isAvailable
                    ? "bg-[#181818] hover:bg-[#FF5500]/20 border-white/10 hover:border-[#FF5500] text-white hover:scale-105 cursor-pointer shadow-lg hover:shadow-[#FF5500]/20"
                    : isReserved
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-300 cursor-not-allowed opacity-90"
                    : "bg-[#141414] border-white/5 text-neutral-500 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Visual Status Indicator Background */}
                {isPaid && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF5500]/20 to-transparent opacity-80" />
                )}

                <span
                  className={`text-base sm:text-lg font-black tracking-tight relative z-10 ${
                    isAvailable
                      ? "group-hover:text-[#FF5500]"
                      : isPaid
                      ? "text-neutral-400 line-through decoration-[#FF5500]/60 decoration-2"
                      : "text-amber-400"
                  }`}
                >
                  {t.ticket_number}
                </span>

                {/* Display Initials or Label if Reserved or Paid */}
                {isPaid && (
                  <span className="text-[10px] font-mono text-neutral-300 font-semibold truncate max-w-[85%] mt-0.5 relative z-10 px-1 rounded bg-black/40">
                    {getInitials(t.buyer_name) || "VENDU"}
                  </span>
                )}

                {isReserved && (
                  <span className="text-[9px] font-mono text-amber-300 uppercase tracking-tighter relative z-10 mt-0.5">
                    Réservé
                  </span>
                )}

                {isAvailable && (
                  <span className="text-[10px] text-neutral-500 group-hover:text-[#FF5500] transition-colors mt-0.5 font-normal">
                    2€
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservation Modal */}
      {isModalOpen && selectedTicket !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] font-black text-lg">
                  #{selectedTicket}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Réservation de la case #{selectedTicket}</h3>
                  <p className="text-xs text-neutral-400">Tombola Spoolio • 2,00 € la case</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Feedback */}
            {successMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-emerald-200">{successMessage}</h4>
                <p className="text-xs text-emerald-400/80">
                  Ta réservation a bien été prise en compte. Merci pour ta participation !
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReservation} className="space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#FF5500]" />
                    Nom / Prénom <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alex Dupont"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
                    Adresse Email (Optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="alex@exemple.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
                    Numéro de Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5500] text-sm transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#FF6600] hover:to-[#FF8800] text-white font-bold text-sm shadow-lg shadow-[#FF5500]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Confirmer la Réservation (2,00 €)
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-neutral-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Règlement sur place sur le stand Spoolio
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
