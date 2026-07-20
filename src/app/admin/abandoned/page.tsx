"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

export default function AbandonedCartsPage() {
  const { cls, theme } = useAdminTheme();
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

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Dashboard
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Paniers Abandonnés 🛒</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Consultez la liste des clients ayant initié un paiement Stripe sans le finaliser, et relancez-les d'un clic.
          </p>
        </div>
      </div>

      <div className={`p-8 rounded-[32px] border ${cls.border} ${cls.cardBg} shadow-2xl space-y-6 font-sans no-invert`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Relance de paniers abandonnés</h3>
            <p className={`text-xs ${cls.textMuted} mt-1`}>
              Les paniers sont détectés en temps réel via Stripe Checkout. Les relances renvoient un e-mail personnalisé avec les articles du client et un lien de reprise de paiement.
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
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] transition-colors cursor-pointer uppercase tracking-wider border-transparent"
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
    </div>
  );
}
