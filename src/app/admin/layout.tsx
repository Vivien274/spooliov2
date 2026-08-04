"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AdminThemeProvider, useAdminTheme } from "./AdminThemeContext";

const ADMIN_BLUE = "#2F3CD9";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: { label: string; href: string }[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Ventes & Boutique",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        label: "Commandes",
        href: "/admin/orders",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
      {
        label: "Paniers Abandonnés",
        href: "/admin/abandoned",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        label: "Créneaux Retrait",
        href: "/admin/pickup",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Catalogue Produits",
    items: [
      {
        label: "Produits",
        href: "/admin/products",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        subItems: [
          { label: "Tous les produits", href: "/admin/products" },
          { label: "Ajouter un produit", href: "/admin/products/new" },
          { label: "Catégories", href: "/admin/products/categories" },
          { label: "Attributs", href: "/admin/products/attributes" },
          { label: "Palette Couleurs 🎨", href: "/admin/colors" },
        ],
      },
      {
        label: "Palette Couleurs 🎨",
        href: "/admin/colors",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 9.707l5-5a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414l-5 5a1 1 0 01-.707.293H10a1 1 0 01-1-1v-.586a1 1 0 01.293-.707z" />
          </svg>
        ),
      },

      {
        label: "Studio Clickers ⌨️",
        href: "/admin/clickers",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        ),
      },
      {
        label: "Avis Clients",
        href: "/admin/reviews",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Marketing & Fidélité",
    items: [
      {
        label: "Cartes de Fidélité",
        href: "/admin/loyalty",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        label: "Tombolas",
        href: "/admin/tombola",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        ),
      },
      {
        label: "Paliers de Dons",
        href: "/admin/don",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "Hub de Liens",
        href: "/admin/liens",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        ),
      },
      {
        label: "SEO Pages 🎯",
        href: "/admin/seo",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Contenu & Apparence",
    items: [
      {
        label: "Design Accueil",
        href: "/admin/hero",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 9.707l5-5a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414l-5 5a1 1 0 01-.707.293H10a1 1 0 01-1-1v-.586a1 1 0 01.293-.707z" />
          </svg>
        ),
      },
      {
        label: "Pages Sur-Mesure",
        href: "/admin/pages",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: "Blog",
        href: "/admin/blog",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
      },
    ],
  },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme, cls } = useAdminTheme();
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);

  // Collapsible sidebar states
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Load saved collapsed preference on mount & handle auto-collapse on small screens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("spoolio_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      } else if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      }
    } catch (e) {}

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("spoolio_admin_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    let title = "ADMIN · Spoolio";
    if (pathname === "/admin") {
      title = "ADMIN · Dashboard — Spoolio 3D";
    } else if (pathname.includes("/admin/products/new")) {
      title = "ADMIN · Nouveau Produit — Spoolio 3D";
    } else if (pathname.includes("/admin/products/categories")) {
      title = "ADMIN · Catégories Produits — Spoolio 3D";
    } else if (pathname.includes("/admin/products/attributes")) {
      title = "ADMIN · Attributs Produits — Spoolio 3D";
    } else if (pathname.includes("/admin/clickers")) {
      title = "ADMIN · Studio Clickers — Spoolio 3D";
    } else if (pathname.includes("/admin/products")) {
      title = "ADMIN · Produits — Spoolio 3D";
    } else if (pathname.includes("/admin/orders")) {
      title = "ADMIN · Commandes — Spoolio 3D";
    } else if (pathname.includes("/admin/reviews")) {
      title = "ADMIN · Avis Clients — Spoolio 3D";
    } else if (pathname.includes("/admin/pages")) {
      title = "ADMIN · Gestion Pages — Spoolio 3D";
    } else if (pathname.includes("/admin/blog")) {
      title = "ADMIN · Articles Blog — Spoolio 3D";
    } else if (pathname.includes("/admin/hero")) {
      title = "ADMIN · Design Accueil — Spoolio 3D";
    } else if (pathname.includes("/admin/pickup")) {
      title = "ADMIN · Créneaux Retrait — Spoolio 3D";
    } else if (pathname.includes("/admin/don")) {
      title = "ADMIN · Paliers de Dons — Spoolio 3D";
    } else if (pathname.includes("/admin/abandoned")) {
      title = "ADMIN · Paniers Abandonnés — Spoolio 3D";
    } else if (pathname.includes("/admin/loyalty")) {
      title = "ADMIN · Cartes de Fidélité — Spoolio 3D";
    } else if (pathname.includes("/admin/tombola")) {
      title = "ADMIN · Tombolas — Spoolio 3D";
    } else if (pathname.includes("/admin/login")) {
      title = "ADMIN · Connexion — Spoolio 3D";
    } else {
      const seg = pathname.split("/").filter(Boolean).pop() || "Admin";
      const readable = seg.charAt(0).toUpperCase() + seg.slice(1);
      title = `ADMIN · ${readable} — Spoolio 3D`;
    }
    document.title = title;
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    try {
      localStorage.setItem("is_spoolio_admin", "true");
    } catch (e) {}
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const fetchCounts = async () => {
      try {
        const resOrders = await fetch("/api/admin/orders");
        if (resOrders.ok) {
          const data = await resOrders.json();
          const count = (data.orders || []).filter((o: any) => o.status === "attente_impression").length;
          setNewOrdersCount(count);
        }

        const resReviews = await fetch("/api/admin/reviews");
        if (resReviews.ok) {
          const data = await resReviews.json();
          const count = (data.reviews || []).filter((r: any) => !r.approved).length;
          setPendingReviewsCount(count);
        }
      } catch (e) {
        console.error("Failed to fetch dynamic badges counts:", e);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${cls.pageBg} ${cls.textMain} flex font-sans transition-colors duration-300 relative select-none`}>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-[1000] h-screen ${isCollapsed ? "w-20" : "w-64"} shrink-0 ${cls.sidebarBg} border-r ${cls.border} flex flex-col transition-all duration-300 max-h-screen ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo & Toggle Row */}
        <div className={`h-16 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-5"} border-b ${cls.border} shrink-0`}>
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Spoolio"
                width={95}
                height={28}
                className={`h-7 w-auto object-contain ${theme === "light" ? "invert" : ""}`}
              />
              <span
                className="text-[9px] font-black tracking-[0.25em] uppercase text-white px-2 py-0.5 rounded-full"
                style={{ background: ADMIN_BLUE }}
              >
                ADMIN
              </span>
            </Link>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              theme === "dark" ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-black"
            }`}
            title={isCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {navSections.map((section, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {section.title && !isCollapsed && (
                <div className={`px-3 text-[10px] font-extrabold uppercase tracking-widest ${theme === "dark" ? "text-neutral-500" : "text-gray-400"} pb-1 select-none`}>
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                let badgeValue = item.badge;
                if (item.label === "Commandes" && newOrdersCount > 0) {
                  badgeValue = String(newOrdersCount);
                } else if (item.label === "Avis Clients" && pendingReviewsCount > 0) {
                  badgeValue = String(pendingReviewsCount);
                }

                const activeColor = theme === "dark" ? "#ffffff" : ADMIN_BLUE;
                const isParentActive = pathname.startsWith(item.href) && item.href !== "/admin";

                return (
                  <div key={item.href} className="flex flex-col gap-1">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"} rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? "bg-[#2F3CD9]/15 border border-[#2F3CD9]/30"
                          : `${cls.textMuted} hover:${cls.textMain} ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"}`
                      }`}
                      style={isActive ? { color: activeColor } : {}}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base" style={isActive ? { color: activeColor } : {}}>{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                      </span>
                      {badgeValue && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse ${isCollapsed ? "absolute top-1 right-1" : ""}`}>
                          {badgeValue}
                        </span>
                      )}
                    </Link>

                    {item.subItems && isParentActive && !isCollapsed && (
                      <div className={`flex flex-col gap-1 pl-8 pr-2 py-1 border-l ml-4 ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`text-[11px] py-1 px-2 rounded-lg transition-all ${
                                isSubActive
                                  ? `font-bold ${theme === "dark" ? "text-white bg-white/10" : "text-black bg-gray-200"}`
                                  : `${cls.textMuted} hover:${theme === "dark" ? "text-white" : "text-black"}`
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={`p-3 border-t ${cls.border} flex flex-col gap-1`}>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2"} text-xs font-semibold rounded-xl transition-all cursor-pointer w-full ${cls.textMuted} ${theme === "dark" ? "hover:text-white hover:bg-white/5" : "hover:text-gray-900 hover:bg-gray-100"}`}
          >
            {theme === "dark" ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
                {!isCollapsed && <span>Thème clair</span>}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {!isCollapsed && <span>Thème sombre</span>}
              </>
            )}
          </button>

          <Link
            href="/"
            title="Voir le site public"
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2"} text-xs rounded-xl transition-colors ${cls.textMuted} ${theme === "dark" ? "hover:text-white hover:bg-white/5" : "hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isCollapsed && <span>Voir le site</span>}
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("/api/admin/logout", { method: "POST" });
                localStorage.removeItem("is_spoolio_admin");
                window.location.href = "/admin/login";
              } catch (e) {}
            }}
            title="Déconnexion"
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2"} text-xs rounded-xl transition-colors cursor-pointer w-full text-red-500 hover:bg-red-500/10 font-semibold`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${cls.pageBg} transition-colors duration-300`}>
        {/* Top bar */}
        <header className={`h-16 ${cls.sidebarBg} border-b ${cls.border} flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            {/* Mobile Burger Toggle Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`p-2 rounded-xl border md:hidden cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-black"
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Breadcrumb Path */}
            <div className={`text-xs sm:text-sm ${cls.textMuted} font-medium truncate`}>
              <span className={cls.textFaint}>admin.spoolio.fr</span>
              <span className={`${cls.textFaint} mx-1.5`}>/</span>
              <span className={`${cls.textMain} capitalize font-bold`}>
                {pathname === "/admin"
                  ? "Dashboard"
                  : pathname.split("/").filter(Boolean).slice(1).join(" / ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
              }`}
              title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className={`hidden sm:flex items-center gap-2 text-xs ${cls.textMuted} ${cls.statusBg} rounded-full px-3 py-1.5 border`}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
              style={{ background: ADMIN_BLUE }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
