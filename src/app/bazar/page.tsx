"use client";

import React from "react";
import Link from "next/link";
import { BazarAdminDashboard } from "@/components/bazar/admin/BazarAdminDashboard";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";

export default function StandaloneBazarAdminPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121212] flex flex-col font-sans">
      {/* Top Standalone Header Bar */}
      <header className="bg-white border-b border-[#E4E4E0] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-spoolio-eyes.png"
              alt="Spoolio"
              className="h-6 w-auto"
            />
            <span className="font-extrabold text-[#121212] text-sm tracking-tight font-righteous">
              SPOOLIO MANAGER
            </span>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">
            Le Bazar
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Persistance Serveur & Base de Données</span>
          </div>

          <Link
            href="/le-bazar"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121212] text-white hover:bg-neutral-800 text-xs font-bold transition-all shadow-xs"
          >
            <span>Boutique Publique</span>
            <ExternalLink className="w-3 h-3 text-[#FF5500]" />
          </Link>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1">
        <BazarAdminDashboard />
      </main>
    </div>
  );
}

