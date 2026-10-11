"use client";

import { Truck, MapPin, Layers, Sprout } from "lucide-react";

interface BoutiqueReassuranceBarProps {
  freeShippingThreshold?: number;
}

export default function BoutiqueReassuranceBar({
  freeShippingThreshold = 60,
}: BoutiqueReassuranceBarProps) {
  const items = [
    {
      icon: <MapPin className="w-4 h-4 text-[#FF5500] shrink-0" />,
      title: "Atelier à Comines",
      desc: "Fabrication locale dans le Nord (59)",
    },
    {
      icon: <Layers className="w-4 h-4 text-[#18181B] shrink-0" />,
      title: "Production artisanale",
      desc: "Impression 3D précise au 0.16 mm",
    },
    {
      icon: <Sprout className="w-4 h-4 text-[#10B981] shrink-0" />,
      title: "PLA biosourcé",
      desc: "Matière dérivée de ressources végétales",
    },
    {
      icon: <Truck className="w-4 h-4 text-[#0055FF] shrink-0" />,
      title: "Livraison offerte",
      desc: `Dès ${freeShippingThreshold}€ d'achats`,
    },
  ];

  return (
    <section
      aria-label="Engagements de l'atelier Spoolio"
      className="mt-14 mb-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E4E0] font-sans"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F6F5F2] border border-[#E4E4E0] flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#18181B] leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-[#71717A] leading-tight mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
