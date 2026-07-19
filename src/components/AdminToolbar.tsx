"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface MappedProduct {
  id: number;
  name: string;
  slug: string;
}

export default function AdminToolbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  // Check if we are in admin mode (checking localStorage)
  useEffect(() => {
    try {
      const adminFlag = localStorage.getItem("is_spoolio_admin") === "true";
      const hiddenFlag = sessionStorage.getItem("hide_spoolio_admin_bar") === "true";
      setIsAdmin(adminFlag);
      setIsHidden(hiddenFlag);
    } catch (e) {}
  }, [pathname]);

  // If path is a product page, fetch the product to get its ID for editing
  useEffect(() => {
    if (!isAdmin || isHidden) return;

    const match = pathname.match(/^\/product\/([^/]+)$/);
    if (match) {
      const slug = match[1];
      setLoadingProduct(true);
      fetch(`/api/products/${slug}?t=${Date.now()}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data: MappedProduct) => {
          setProductId(data.id);
          setProductName(data.name);
        })
        .catch(() => {
          setProductId(null);
          setProductName(null);
        })
        .finally(() => {
          setLoadingProduct(false);
        });
    } else {
      setProductId(null);
      setProductName(null);
    }
  }, [pathname, isAdmin, isHidden]);

  // If we are currently browsing the admin section, do not display the toolbar
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // If not admin, or bar has been hidden by user, do not render
  if (!isAdmin || isHidden) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      localStorage.removeItem("is_spoolio_admin");
      setIsAdmin(false);
      window.location.reload();
    } catch (e) {}
  };

  const handleHide = () => {
    try {
      sessionStorage.setItem("hide_spoolio_admin_bar", "true");
      setIsHidden(true);
    } catch (e) {}
  };

  return (
    <>
      {/* Global CSS injection to offset body content by toolbar height */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html {
            scroll-padding-top: 36px;
          }
          body {
            margin-top: 36px !important;
          }
        `
      }} />

      <div className="fixed top-0 left-0 right-0 h-9 bg-[#111113] border-b border-[#222225]/80 flex items-center justify-between px-4 text-[11px] font-medium text-white/90 z-[9999] select-none no-invert">
        {/* Left Side: Logo & Main links */}
        <div className="flex items-center gap-5">
          <Link href="/admin" className="flex items-center gap-2 text-white hover:text-[#2F3CD9] transition-colors group">
            <svg className="w-3.5 h-3.5 text-[#2F3CD9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-bold tracking-wider uppercase text-[10px]">Spoolio Admin</span>
          </Link>

          <div className="h-3 w-px bg-white/10" />

          {/* Contextual Link */}
          {productId ? (
            <Link 
              href={`/admin/products/${productId}`} 
              className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition-all"
            >
              <svg className="w-3 h-3 text-[#f7eb12]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modifier ce produit <strong className="text-white">({productName})</strong></span>
            </Link>
          ) : pathname.match(/^\/product\//) && loadingProduct ? (
            <span className="text-white/40 flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-white/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement des options d'édition...
            </span>
          ) : (
            <Link href="/admin" className="text-white/70 hover:text-white transition-colors">
              Tableau de bord
            </Link>
          )}

          <Link href="/admin/products/new" className="text-white/70 hover:text-white transition-colors hidden sm:inline">
            + Nouveau Produit
          </Link>
        </div>

        {/* Right Side: Options & Logout */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleHide}
            className="text-white/40 hover:text-white/70 transition-colors"
            title="Masquer la barre pour cette session"
          >
            Masquer
          </button>
          
          <div className="h-3 w-px bg-white/10" />

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all font-semibold uppercase text-[9px] tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Quitter
          </button>
        </div>
      </div>
    </>
  );
}
