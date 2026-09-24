"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Home, Sparkles, Compass, HelpCircle } from "lucide-react";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-zinc-900 font-sans flex flex-col justify-between selection:bg-[#ff4f00] selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[840px] w-full mx-auto px-6 pt-28 lg:pt-32 pb-16 flex flex-col items-center justify-center text-center gap-7 relative z-10">
        
        {/* Ambient Subtle Warm Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#ff4f00]/6 filter blur-[90px] pointer-events-none z-0" />

        {/* 3D Spaghetti Failure Animation Frame (Ultra-Detailed Atelier Style) */}
        <div className="relative w-full max-w-[460px] h-[330px] sm:h-[360px] bg-gradient-to-b from-white via-zinc-50/80 to-zinc-100/90 border border-zinc-200/90 rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col justify-between p-4 sm:p-5 z-10 no-invert select-none">
          {/* Subtle grid pattern for build volume backdrop */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Top Status Bar: Live Camera / AI Detection Header */}
          <div className="relative z-20 flex items-center justify-between w-full px-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono font-black text-red-600 uppercase tracking-wider shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              Erreur 404 • Spaghetti Détecté
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Atelier Cam #01
            </span>
          </div>

          {/* High-Fidelity Vector 3D Printer SVG */}
          <div className="relative w-full h-[250px] sm:h-[280px] my-auto">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 270"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Aluminum Extrusion Metallic Gradient */}
                <linearGradient id="metal-profile" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e2229" />
                  <stop offset="25%" stopColor="#374151" />
                  <stop offset="50%" stopColor="#4b5563" />
                  <stop offset="75%" stopColor="#374151" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>

                {/* Horizontal Rail Gradient */}
                <linearGradient id="metal-horiz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4b5563" />
                  <stop offset="30%" stopColor="#374151" />
                  <stop offset="70%" stopColor="#1f242d" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>

                {/* Chrome Lead Screw Gradient */}
                <linearGradient id="lead-screw" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="35%" stopColor="#f1f5f9" />
                  <stop offset="65%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Gold Textured PEI Plate */}
                <linearGradient id="pei-gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                {/* Wound Orange Filament Spool */}
                <radialGradient id="spool-coils" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffa366" />
                  <stop offset="45%" stopColor="#ff4f00" />
                  <stop offset="85%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#9a3412" />
                </radialGradient>

                {/* Chamber Overhead LED Cone */}
                <linearGradient id="chamber-light" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>

                {/* Toolhead LED Downward Spotlight */}
                <radialGradient id="nozzle-spotlight" cx="50%" cy="20%" r="80%">
                  <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#ffedd5" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.0" />
                </radialGradient>

                {/* Vibrant Glow Filter for Spaghetti */}
                <filter id="spaghetti-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#ff4f00" floodOpacity="0.45" />
                </filter>

                {/* Subtle Component Shadow */}
                <filter id="part-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Floor Contact Shadow */}
              <ellipse cx="200" cy="254" rx="165" ry="6" fill="#000000" fillOpacity="0.1" />

              {/* ============================================================ */}
              {/* 1. OVERHEAD CHAMBER LIGHT BEAM                               */}
              {/* ============================================================ */}
              <polygon points="76,44 324,44 350,215 50,215" fill="url(#chamber-light)" />

              {/* ============================================================ */}
              {/* 2. CHASSIS & VERTICAL GANTRY FRAME                           */}
              {/* ============================================================ */}
              
              {/* Bottom machine base frame */}
              <rect x="42" y="218" width="316" height="24" rx="5" fill="#18181b" stroke="#27272a" strokeWidth="1" filter="url(#part-shadow)" />
              <rect x="46" y="222" width="308" height="2" fill="#3f3f46" />
              {/* Base front bevel accent */}
              <line x1="44" y1="238" x2="356" y2="238" stroke="#09090b" strokeWidth="1.5" />
              
              {/* Anti-vibration Rubber Feet */}
              <rect x="56" y="242" width="28" height="6" rx="2" fill="#09090b" />
              <rect x="316" y="242" width="28" height="6" rx="2" fill="#09090b" />

              {/* Vertical Z-axis aluminum profiles (2040 V-slot) */}
              <rect x="58" y="32" width="18" height="186" rx="2" fill="url(#metal-profile)" />
              <rect x="66" y="32" width="2" height="186" fill="#09090b" /> {/* V-slot groove */}
              <rect x="324" y="32" width="18" height="186" rx="2" fill="url(#metal-profile)" />
              <rect x="332" y="32" width="2" height="186" fill="#09090b" />

              {/* Z-axis threaded metallic lead screws & couplers */}
              {/* Bottom couplers */}
              <rect x="80" y="206" width="9" height="12" rx="1.5" fill="#52525b" stroke="#27272a" strokeWidth="0.8" />
              <rect x="311" y="206" width="9" height="12" rx="1.5" fill="#52525b" stroke="#27272a" strokeWidth="0.8" />
              {/* Threaded rods */}
              <rect x="82.5" y="44" width="4" height="162" rx="1" fill="url(#lead-screw)" opacity="0.9" />
              <rect x="313.5" y="44" width="4" height="162" rx="1" fill="url(#lead-screw)" opacity="0.9" />

              {/* Top horizontal crossbeam (2020 profile) */}
              <rect x="50" y="28" width="300" height="16" rx="3" fill="url(#metal-horiz)" stroke="#27272a" strokeWidth="1" />
              <rect x="54" y="35" width="292" height="2" fill="#09090b" />
              {/* Corner gusset brackets with hex socket screws */}
              <path d="M 58,44 L 74,44 L 58,60 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
              <circle cx="63" cy="49" r="1.5" fill="#71717a" />
              <path d="M 342,44 L 326,44 L 342,60 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
              <circle cx="337" cy="49" r="1.5" fill="#71717a" />
              
              {/* Top Bar Branding */}
              <text x="200" y="39" textAnchor="middle" fill="#9ca3af" fontSize="6" fontFamily="monospace" fontWeight="900" letterSpacing="2.5">
                SPOOLIO CORE PRO • ACTIVE LEVELED
              </text>
              {/* Integrated LED chamber light bar */}
              <rect x="85" y="44" width="230" height="2" fill="#ffffff" opacity="0.9" />

              {/* ============================================================ */}
              {/* 3. FILAMENT SPOOL & FEED SYSTEM (TOP LEFT)                   */}
              {/* ============================================================ */}
              <g id="filament-spool-assembly" transform="translate(130, 4)">
                {/* Metal spool mounting arm */}
                <path d="M 15,24 L 25,24 L 25,12 L 40,12" stroke="#374151" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Spool outer clear smoked rim */}
                <circle cx="48" cy="10" r="19" fill="#18181b" stroke="#52525b" strokeWidth="1.2" opacity="0.9" />
                {/* Outer flange cutouts */}
                <circle cx="48" cy="10" r="16.5" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="6 3" />
                
                {/* Vibrant Wound Filament Coils */}
                <circle cx="48" cy="10" r="15" fill="url(#spool-coils)" />
                {/* Concentric layer ridges */}
                <circle cx="48" cy="10" r="13" fill="none" stroke="#ff7a3d" strokeWidth="1" opacity="0.8" />
                <circle cx="48" cy="10" r="10" fill="none" stroke="#ff9457" strokeWidth="1" opacity="0.8" />
                <circle cx="48" cy="10" r="7" fill="none" stroke="#ffa875" strokeWidth="0.8" opacity="0.8" />

                {/* Spool Core Hub */}
                <circle cx="48" cy="10" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
                <circle cx="48" cy="10" r="3" fill="#ffffff" />
                <circle cx="48" cy="10" r="1.2" fill="#ff4f00" />

                {/* Blue Pneumatic Push-Fit Coupler on filament runout sensor */}
                <rect x="68" y="16" width="6" height="5" rx="1" fill="#3b82f6" />
                <rect x="66" y="18" width="2" height="3" fill="#1d4ed8" />

                {/* Curving Translucent PTFE Bowden Guide Tube into Toolhead */}
                <path
                  d="M 72,18 C 96,16 112,42 90,88"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* Bright Orange Filament inside the Bowden tube */}
                <path
                  d="M 70,18 C 95,16 111,42 90,88"
                  fill="none"
                  stroke="#ff4f00"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </g>

              {/* ============================================================ */}
              {/* 4. HORIZONTAL X-AXIS GANTRY & TIMING BELT                    */}
              {/* ============================================================ */}
              <g id="x-axis-gantry">
                {/* Horizontal 2020 extrusion */}
                <rect x="56" y="104" width="288" height="12" rx="2" fill="url(#metal-horiz)" stroke="#27272a" strokeWidth="0.8" />
                <rect x="74" y="109" width="252" height="2" fill="#09090b" /> {/* Belt groove */}
                
                {/* Toothed GT2 Timing Belt */}
                <line x1="75" y1="109.5" x2="325" y2="109.5" stroke="#18181b" strokeWidth="2.5" strokeDasharray="1.5 1" />
                
                {/* Left Gantry Stepper Motor (NEMA 17 with cooling fins) */}
                <rect x="52" y="97" width="20" height="25" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                <rect x="54" y="101" width="16" height="2" fill="#27272a" />
                <rect x="54" y="106" width="16" height="2" fill="#27272a" />
                <rect x="54" y="111" width="16" height="2" fill="#27272a" />
                <rect x="54" y="116" width="16" height="2" fill="#27272a" />

                {/* Right X-belt Idler Tensioner Bearing */}
                <rect x="328" y="98" width="18" height="23" rx="2.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                <circle cx="337" cy="109.5" r="4.5" fill="#52525b" stroke="#27272a" strokeWidth="1" />
                <circle cx="337" cy="109.5" r="2" fill="#cbd5e1" />
              </g>

              {/* ============================================================ */}
              {/* 5. HEATED PRINT BED & TEXTURED PEI SPRING STEEL SHEET        */}
              {/* ============================================================ */}
              
              {/* Bed Y-axis Carriage Plate */}
              <rect x="72" y="200" width="256" height="6" rx="2" fill="#27272a" stroke="#18181b" strokeWidth="0.8" />
              
              {/* 4 Red Anodized Aluminum Leveling Handwheels */}
              <rect x="94" y="203" width="16" height="6" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
              <line x1="97" y1="204" x2="97" y2="208" stroke="#f87171" strokeWidth="1" />
              <line x1="102" y1="204" x2="102" y2="208" stroke="#f87171" strokeWidth="1" />
              <line x1="107" y1="204" x2="107" y2="208" stroke="#f87171" strokeWidth="1" />

              <rect x="290" y="203" width="16" height="6" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
              <line x1="293" y1="204" x2="293" y2="208" stroke="#f87171" strokeWidth="1" />
              <line x1="298" y1="204" x2="298" y2="208" stroke="#f87171" strokeWidth="1" />
              <line x1="303" y1="204" x2="303" y2="208" stroke="#f87171" strokeWidth="1" />

              {/* Heated Aluminum Sub-plate */}
              <rect x="76" y="196" width="248" height="5" rx="1.5" fill="#18181b" />

              {/* Gold Textured PEI Spring Steel Sheet */}
              <rect x="80" y="190" width="240" height="8" rx="3.5" fill="url(#pei-gold)" stroke="#b45309" strokeWidth="1" filter="url(#part-shadow)" />
              {/* PEI surface subtle grid markings */}
              <path
                d="M 110,191 L 110,197 M 140,191 L 140,197 M 170,191 L 170,197 M 200,191 L 200,197 M 230,191 L 230,197 M 260,191 L 260,197 M 290,191 L 290,197"
                stroke="#78350f"
                strokeWidth="0.8"
                strokeDasharray="1 1"
                opacity="0.8"
              />
              {/* Front Bed Pull-Tab */}
              <rect x="178" y="197" width="44" height="4.5" rx="2" fill="#ff4f00" stroke="#ea580c" strokeWidth="0.5" />
              <text x="200" y="200.5" textAnchor="middle" fill="#ffffff" fontSize="3.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.8">
                SPOOLIO PEI
              </text>

              {/* ============================================================ */}
              {/* 6. THE FAILED PRINT: HALF-PRINTED 3D BENCHY + SPAGHETTI EXPLOSION */}
              {/* ============================================================ */}
              
              {/* Printed Miniature 3DBenchy on the PEI Bed */}
              <g id="printed-benchy" transform="translate(162, 160)">
                {/* 1. Sliced Hull of the Boat */}
                <path
                  d="M 12,30 L 16,14 L 62,14 L 72,30 Z"
                  fill="#ff4f00"
                  stroke="#c2410c"
                  strokeWidth="1.2"
                />
                {/* 3D Print Layer Lines */}
                <line x1="13.5" y1="26" x2="69" y2="26" stroke="#ff7a3d" strokeWidth="0.9" />
                <line x1="14.5" y1="22" x2="66" y2="22" stroke="#ff7a3d" strokeWidth="0.9" />
                <line x1="15.2" y1="18" x2="64" y2="18" stroke="#ff7a3d" strokeWidth="0.9" />
                
                {/* Bow deck & stern cabin base */}
                <rect x="17" y="11" width="18" height="3" rx="0.5" fill="#ff5e13" />
                
                {/* Half-Built Cabin with Exposed Gyroid / Triangle Infill (Where print failed!) */}
                <rect x="36" y="6" width="22" height="8" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
                {/* Exposed Infill lattice pattern */}
                <path
                  d="M 38,14 L 42,6 L 46,14 L 50,6 L 54,14"
                  stroke="#ffa366"
                  strokeWidth="1"
                  fill="none"
                />
                
                {/* Fallen Smokestack (tilted on the print bed) */}
                <g transform="translate(68, 22) rotate(42)">
                  <rect x="0" y="0" width="6" height="10" rx="1.5" fill="#ff4f00" stroke="#c2410c" strokeWidth="0.8" />
                  <ellipse cx="3" cy="1" rx="2.5" ry="1" fill="#ea580c" />
                </g>
              </g>

              {/* THE CHAOTIC SPAGHETTI MONSTER (Rich Tangled Layers of Curled Filament) */}
              <g id="spaghetti-layers" filter="url(#spaghetti-glow)">
                {/* Background Shadow Spaghetti Loops */}
                <path
                  d="M 160,188 C 135,178 120,150 142,136 C 164,122 138,98 168,118 C 198,138 185,102 212,126 C 239,150 258,178 244,188"
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                
                {/* Mid-dense spaghetti nests */}
                <path
                  d="M 152,190 C 130,175 125,140 148,128 C 171,116 190,148 174,132 C 158,116 182,96 202,118 C 222,140 232,174 238,190"
                  fill="none"
                  stroke="#ff4f00"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 168,172 C 140,160 146,122 172,138 C 198,154 176,108 196,128 C 216,148 244,152 222,184 C 200,216 180,182 154,188"
                  fill="none"
                  stroke="#ff5e13"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Loopy spring coils overflowing past the edge of the PEI bed */}
                <path
                  d="M 148,190 C 132,195 118,186 124,176 C 130,166 148,162 142,150 C 136,138 120,132 132,120 C 144,108 166,124 154,136"
                  fill="none"
                  stroke="#ff7a3d"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 232,188 C 248,193 262,180 254,168 C 246,156 228,162 238,144 C 248,126 218,120 228,104"
                  fill="none"
                  stroke="#ff6a20"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                
                {/* Loose loop spilling over the front chassis */}
                <path
                  d="M 185,188 C 170,205 158,212 175,222 C 192,232 208,214 195,198"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Bright foreground curly highlights */}
                <path
                  d="M 174,182 C 152,166 158,138 184,144 C 210,150 220,122 198,138 C 176,154 156,138 188,126 C 220,114 236,158 204,184"
                  fill="none"
                  stroke="#ffa366"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>

              {/* ============================================================ */}
              {/* 7. THE ANIMATED HIGH-TECH TOOLHEAD (EXTRUDER)                */}
              {/* ============================================================ */}
              
              <g className="animate-printer-nozzle" style={{ transformOrigin: "200px 105px" }}>
                {/* Toolhead LED Worklight spotlight cone shining down */}
                <polygon points="194,158 206,158 245,195 155,195" fill="url(#nozzle-spotlight)" />

                {/* Carriage Plate with Dual V-Wheels */}
                <rect x="178" y="96" width="44" height="26" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1" />
                <circle cx="185" cy="102" r="3.5" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
                <circle cx="215" cy="102" r="3.5" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
                
                {/* Main Toolhead Sleek Body (Stealth Shroud) */}
                <rect x="176" y="108" width="48" height="38" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" filter="url(#part-shadow)" />
                
                {/* Orange Spoolio Accent Stripe */}
                <rect x="176" y="112" width="4" height="28" fill="#ff4f00" />
                
                {/* Circular Cooling Fan Shroud with Hex Pattern */}
                <circle cx="202" cy="126" r="10" fill="#09090b" stroke="#27272a" strokeWidth="1.2" />
                <circle cx="202" cy="126" r="4" fill="#ff4f00" />
                <path d="M 196,122 L 208,130 M 208,122 L 196,130 M 202,118 L 202,134" stroke="#52525b" strokeWidth="1" />

                {/* Error Status Blinking Warning Light */}
                <circle cx="186" cy="116" r="2.2" fill="#ef4444" className="animate-ping" />
                <circle cx="186" cy="116" r="2.2" fill="#ef4444" />
                <circle cx="186" cy="116" r="0.8" fill="#ffffff" />

                {/* Hotend Aluminum Cooling Heatsink Fins */}
                <g transform="translate(193, 146)">
                  <rect x="0" y="0" width="14" height="2" rx="0.5" fill="#94a3b8" />
                  <rect x="1" y="2.5" width="12" height="1.8" rx="0.5" fill="#64748b" />
                  <rect x="0" y="4.8" width="14" height="2" rx="0.5" fill="#94a3b8" />
                  
                  {/* Silicone Heater Block Sock (Orange) */}
                  <rect x="1" y="7.2" width="12" height="6.5" rx="1.5" fill="#ff4f00" stroke="#ea580c" strokeWidth="0.5" />
                  
                  {/* Golden Brass 0.4mm Nozzle Tip */}
                  <path d="M 5,13.7 L 9,13.7 L 7,17.5 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.6" />
                </g>
                
                {/* Molten filament thread trailing straight out of the nozzle into the spaghetti */}
                <path
                  d="M 200,164 C 196,170 206,176 198,182 C 192,188 198,192 192,196"
                  fill="none"
                  stroke="#ff4f00"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </g>

              {/* ============================================================ */}
              {/* 8. HIGH-RES COLOR TOUCHSCREEN DISPLAY ON FRONT BASE          */}
              {/* ============================================================ */}
              
              <g id="touchscreen-panel" transform="translate(254, 204)" filter="url(#part-shadow)">
                {/* Angled Touchscreen Bezel */}
                <rect x="0" y="0" width="94" height="34" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.2" />
                {/* Glossy Screen Glass */}
                <rect x="3" y="3" width="88" height="28" rx="2.5" fill="#0c131d" />
                
                {/* Status Bar */}
                <rect x="3" y="3" width="88" height="7" rx="2" fill="#1e293b" />
                <circle cx="7" cy="6.5" r="1.5" fill="#ef4444" className="animate-pulse" />
                <text x="11" y="8" fill="#f87171" fontSize="4" fontFamily="monospace" fontWeight="900" letterSpacing="0.5">
                  STOP : ERREUR COUCHE
                </text>
                
                {/* Error Big Text */}
                <text x="6" y="16.5" fill="#ef4444" fontSize="6.5" fontFamily="monospace" fontWeight="900">
                  404: FAIL
                </text>

                {/* Progress Bar (stuck at 40.4%) */}
                <rect x="6" y="19" width="82" height="3" rx="1.5" fill="#1e293b" />
                <rect x="6" y="19" width="33" height="3" rx="1.5" fill="#ef4444" />
                <text x="44" y="21.5" fill="#94a3b8" fontSize="3.5" fontFamily="monospace" fontWeight="bold">
                  40.4%
                </text>

                {/* Temperature Telemetry Info */}
                <text x="6" y="27" fill="#38bdf8" fontSize="3.8" fontFamily="monospace" fontWeight="bold">
                  B: 215°C
                </text>
                <text x="32" y="27" fill="#fb923c" fontSize="3.8" fontFamily="monospace" fontWeight="bold">
                  P: 60°C
                </text>
                <text x="56" y="27" fill="#4ade80" fontSize="3.8" fontFamily="monospace" fontWeight="bold">
                  F: 100%
                </text>
              </g>

            </svg>
          </div>

          {/* Bottom Machine Info Banner */}
          <div className="relative z-20 flex items-center justify-between px-2 pt-1 border-t border-zinc-200/60">
            <span className="text-[11px] font-mono font-bold text-zinc-500">
              État : <span className="text-[#ff4f00] font-black">Spaghetti (100%)</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-zinc-400">
              Buse 0.4mm • PLA Biosourcé
            </span>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3 max-w-lg relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-antonio text-zinc-900 leading-tight">
            Impression Échouée ! 🍝
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
            Le filament a fait un nœud et s&apos;est transformé en spaghettis 3D au lieu d&apos;imprimer cette page. Pas de panique, nos imprimantes sont prêtes à relancer le plateau !
          </p>
        </div>

        {/* Search & Navigation Action Box */}
        <div className="w-full max-w-lg bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.05)] relative z-10 flex flex-col gap-4 font-sans">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que cherchiez-vous ? (ex: octopus, clicker, fidget...)"
                className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4f00] focus:bg-white focus:ring-2 focus:ring-[#ff4f00]/15 transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              Rechercher
            </button>
          </form>

          {/* Primary Home Button */}
          <Link
            href="/"
            className="w-full h-11 bg-[#ff4f00] hover:bg-[#e04500] text-white font-bold text-xs tracking-wider rounded-xl uppercase transition-all duration-200 shadow-md shadow-[#ff4f00]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          {/* Quick Helpful Navigation Chips */}
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Raccourcis :</span>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#ff4f00]" />
              <span>Boutique</span>
            </Link>
            <Link
              href="/createur-cliqueur"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <span>Créateur Clicker</span>
            </Link>
            <Link
              href="/boussole-sensorielle"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <Compass className="w-3 h-3 text-indigo-500" />
              <span>Boussole</span>
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] font-semibold transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-zinc-400" />
              <span>Aide</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
