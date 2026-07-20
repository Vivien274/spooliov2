"use client";

import Link from "next/link";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`w-full border-t border-[#1f1f23] bg-spoolio-bg py-8 text-xs text-gray-500 relative z-10 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand copyright - No orange "S" logo as requested */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-300">Spoolio</span>
          <span>&copy; {new Date().getFullYear()} - Tous droits réservés.</span>
        </div>
        
        {/* Legal and Support Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          <Link href="/a-propos" className="hover:text-[#ff4f00] transition-colors">À Propos</Link>
          <Link href="/pro" className="hover:text-[#ff4f00] transition-colors">Espace Pro</Link>
          <Link href="/contact" className="hover:text-[#ff4f00] transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-[#ff4f00] transition-colors">FAQ / Questions</Link>
          <Link href="/cookies" className="hover:text-[#ff4f00] transition-colors">Cookies & Confidentialité</Link>
          <Link href="/mentions-legales" className="hover:text-[#ff4f00] transition-colors">Mentions Légales</Link>
          <Link href="/cgv" className="hover:text-[#ff4f00] transition-colors">CGV</Link>
          <Link href="/retours" className="hover:text-[#ff4f00] transition-colors">Retours</Link>
          <Link href="/admin" className="hover:text-[#ff4f00] transition-colors">Admin 🔑</Link>
        </div>
      </div>
    </footer>
  );
}
