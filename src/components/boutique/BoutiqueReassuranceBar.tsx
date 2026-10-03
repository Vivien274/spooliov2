"use client";

import { Truck, MapPin, Sprout, Zap } from "lucide-react";

export default function BoutiqueReassuranceBar() {
  const items = [
    {
      icon: <Truck className="w-4 h-4 text-orange-500 shrink-0" />,
      title: "Livraison offerte",
      desc: "dès 40€ d'achats",
    },
    {
      icon: <MapPin className="w-4 h-4 text-blue-500 shrink-0" />,
      title: "Atelier à Comines",
      desc: "Made in Nord (59)",
    },
    {
      icon: <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />,
      title: "PLA biosourcé",
      desc: "Amidon de maïs sans pétrole",
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-500 shrink-0" />,
      title: "Zéro surstock",
      desc: "Imprimé à la demande",
    },
  ];

  return (
    <section
      aria-label="Engagements de l'atelier Spoolio"
      className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-zinc-100/90 border border-zinc-200/90 shadow-2xs font-sans"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-2 py-1 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-zinc-500 truncate leading-tight font-medium">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
