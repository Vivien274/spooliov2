"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Mot de passe incorrect.");
      }

      // Successful login: redirect to dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 selection:bg-[#ff4f00] selection:text-black font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(47,60,217,0.08)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#131316]/80 border border-[#222225] rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-md flex flex-col items-center">
        {/* Spoolio Admin Header Logo */}
        <div className="flex flex-col items-center gap-3 mb-8 select-none">
          <Image
            src="/images/logo.png"
            alt="Spoolio Logo"
            width={130}
            height={38}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white bg-[#2F3CD9] px-3 py-1 rounded-full shadow-lg shadow-[#2F3CD9]/25">
            Administration
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2 text-center">
          Accès Restreint
        </h2>
        <p className="text-gray-400 text-xs text-center leading-relaxed mb-6 font-sans">
          Veuillez saisir le mot de passe administrateur pour accéder aux outils de gestion de la boutique Spoolio.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Password Input Area */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
              Mot de passe admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-12 pl-4 pr-12 text-sm font-semibold bg-[#1a1a1f] border border-[#2d2d34] rounded-xl text-white placeholder-gray-600 outline-none focus:border-[#2F3CD9]/60 transition-all font-sans"
              />
              {/* Show/Hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer text-xs"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse font-sans">
              <span className="text-sm shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center text-sm font-bold text-white bg-[#2F3CD9] hover:bg-[#2530c0] disabled:bg-[#2F3CD9]/50 rounded-xl transition-all shadow-lg shadow-[#2F3CD9]/20 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 cursor-pointer disabled:cursor-not-allowed text-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition-colors font-sans flex items-center gap-1"
        >
          &larr; Retour au site public
        </Link>
      </div>
    </div>
  );
}
