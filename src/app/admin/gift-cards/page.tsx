"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  DollarSign,
  User,
  Mail,
  Lock,
} from "lucide-react";
import {
  getGiftCardsAdminAction,
  toggleGiftCardStatusAdminAction,
  createManualGiftCardAdminAction,
} from "@/app/actions/giftCardActions";

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // Modal State for manual gift card creation
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [formAmount, setFormAmount] = useState<string>("25");
  const [formBuyerEmail, setFormBuyerEmail] = useState<string>("admin@spoolio.fr");
  const [formRecipientName, setFormRecipientName] = useState<string>("");
  const [formRecipientEmail, setFormRecipientEmail] = useState<string>("");
  const [formMessage, setFormMessage] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const res = await getGiftCardsAdminAction();
    if (res.success) {
      setGiftCards(res.giftCards || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await toggleGiftCardStatusAdminAction(id, !currentStatus);
    if (res.success) {
      setGiftCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setModalError("Montant invalide.");
      return;
    }

    setModalLoading(true);
    const res = await createManualGiftCardAdminAction({
      amount,
      buyerEmail: formBuyerEmail,
      recipientName: formRecipientName || undefined,
      recipientEmail: formRecipientEmail || undefined,
      customMessage: formMessage || undefined,
    });

    if (res.success) {
      setShowCreateModal(false);
      setFormAmount("25");
      setFormRecipientName("");
      setFormRecipientEmail("");
      setFormMessage("");
      fetchCards();
    } else {
      setModalError(res.error || "Erreur lors de la création.");
    }
    setModalLoading(false);
  };

  const filteredCards = giftCards.filter((card) => {
    const q = search.toLowerCase();
    return (
      card.code.toLowerCase().includes(q) ||
      (card.buyerEmail || "").toLowerCase().includes(q) ||
      (card.recipientName || "").toLowerCase().includes(q) ||
      (card.recipientEmail || "").toLowerCase().includes(q)
    );
  });

  const totalIssued = giftCards.reduce((acc, c) => acc + (c.initialAmount || 0), 0);
  const totalRemaining = giftCards.reduce((acc, c) => acc + (c.remainingAmount || 0), 0);
  const activeCount = giftCards.filter((c) => c.isActive && c.isPaid).length;

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#0a0a0e] min-h-screen text-white font-sans selection:bg-[#ff4f00] selection:text-black">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff4f00] uppercase tracking-widest mb-1">
            <Gift className="w-4 h-4" />
            <span>GESTION COMMERCIALE &amp; FIDÉLITÉ</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white font-antonio">
            Cartes Cadeaux Spoolio 3D
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-xl bg-[#ff4f00] hover:bg-[#ff4f00]/90 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#ff4f00]/25 cursor-pointer no-invert"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une Carte Cadeau</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            TOTAL ÉMIS
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {totalIssued.toFixed(2)} €
          </div>
          <span className="text-xs text-gray-400 block">{giftCards.length} cartes générées</span>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            SOLDE EN CIRCULATION
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalRemaining.toFixed(2)} €
          </div>
          <span className="text-xs text-gray-400 block">Disponible pour futurs achats</span>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            CARTES ACTIVES &amp; PAYÉES
          </span>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {activeCount}
          </div>
          <span className="text-xs text-gray-400 block">Prêtes à l'emploi</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Rechercher par code, email, destinataire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#ff4f00]"
        />
      </div>

      {/* Cards Table */}
      <div className="bg-[#0f0f16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-white/10">
                <th className="p-4">Code Unique</th>
                <th className="p-4">Acheteur / Destinataire</th>
                <th className="p-4">Montant Initial</th>
                <th className="p-4">Solde Restant</th>
                <th className="p-4">Statut Paiement</th>
                <th className="p-4">Expiration</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Chargement des cartes cadeaux...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Aucune carte cadeau trouvée.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-black text-white tracking-wider">
                      {card.code}
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-gray-200">{card.buyerEmail}</div>
                      {card.recipientName && (
                        <div className="text-[10px] text-gray-400">
                          Offert à : <span className="text-white">{card.recipientName}</span>
                          {card.recipientEmail ? ` (${card.recipientEmail})` : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-300">
                      {card.initialAmount.toFixed(2)} €
                    </td>
                    <td className="p-4 font-mono font-black text-emerald-400">
                      {card.remainingAmount.toFixed(2)} €
                    </td>
                    <td className="p-4">
                      {card.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Payée / Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">
                      {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString("fr-FR") : "Jamais"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(card.id, card.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          card.isActive
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {card.isActive ? "Désactiver" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f16] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white font-antonio flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#ff4f00]" />
                <span>Créer une Carte Cadeau Manuelle</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateManual} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-gray-300">Montant (€) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/15 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-[#ff4f00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">Email de l'Acheteur / Émetteur *</label>
                <input
                  type="email"
                  required
                  value={formBuyerEmail}
                  onChange={(e) => setFormBuyerEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#ff4f00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Nom Destinataire</label>
                  <input
                    type="text"
                    value={formRecipientName}
                    onChange={(e) => setFormRecipientName(e.target.value)}
                    className="w-full h-10 px-3 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">Email Destinataire</label>
                  <input
                    type="email"
                    value={formRecipientEmail}
                    onChange={(e) => setFormRecipientEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">Message personnalisé</label>
                <textarea
                  rows={2}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full p-3 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#ff4f00] resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 h-11 rounded-xl bg-[#ff4f00] hover:bg-[#ff4f00]/90 text-white font-black uppercase tracking-wider shadow-lg shadow-[#ff4f00]/25 disabled:opacity-50"
                >
                  {modalLoading ? "Création..." : "Générer la Carte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
