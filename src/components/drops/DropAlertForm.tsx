"use client";

import { useState } from "react";
import { Bell, Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

interface DropAlertFormProps {
  dropSlug: string;
  dropTitle?: string;
  className?: string;
  variant?: "light" | "dark";
}

export default function DropAlertForm({
  dropSlug,
  dropTitle,
  className = "",
  variant = "light",
}: DropAlertFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Merci d'indiquer une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          tag: "drop",
          tags: ["drop", `drop-${dropSlug}`],
          dropSlug,
          dropTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSubmitted(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Impossible de valider l'inscription. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        isDark
          ? "bg-black/40 border border-white/15 text-white"
          : "bg-[#FAF9F6] border border-[#E4E4E0] text-[#121212]"
      } p-4 sm:p-5 ${className}`}
    >
      {submitted ? (
        <div className="flex items-center gap-3 py-1 animate-fadeIn">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
              C&apos;est noté ! Tu es sur la liste d&apos;attente 🎉
            </p>
            <p className={`text-[11px] sm:text-xs ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
              Tu recevras un email dès que la date de ce drop sera officiellement dévoilée.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Alerte de sortie en avant-première
              </span>
            </div>
            <span className={`text-[10px] font-mono ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              0 spam · Désinscription en 1 clic
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
            Reçois l&apos;annonce de la date et le lien secret du drop <strong>1h avant l&apos;ouverture officielle</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-neutral-400" : "text-neutral-400"
                } pointer-events-none`}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.com"
                disabled={loading}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-sans transition-all outline-none ${
                  isDark
                    ? "bg-white/10 border-white/20 text-white placeholder:text-neutral-400 focus:border-[#FF5500] focus:bg-white/15"
                    : "bg-white border-[#E4E4E0] text-neutral-900 placeholder:text-neutral-400 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/15"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] active:scale-98 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>M&apos;avertir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-500 animate-fadeIn">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

