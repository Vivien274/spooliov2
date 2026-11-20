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
    title: "Ventes",
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
        subItems: [
          { label: "Toutes les commandes", href: "/admin/orders" },
          { label: "Créneaux Retrait", href: "/admin/pickup" },
          { label: "Paniers Abandonnés", href: "/admin/abandoned" },
          { label: "Finances & Livraison", href: "/admin/shipping" },
        ],
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
    title: "Catalogue",
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
          { label: "Packs & Coffrets", href: "/admin/packs" },
          { label: "Palette Couleurs", href: "/admin/colors" },
          { label: "Attributs", href: "/admin/products/attributes" },
          { label: "Taxonomie V2.1", href: "/admin/taxonomy" },
        ],
      },
      {
        label: "Collections & Éditions",
        href: "/admin/drops",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        ),
        subItems: [
          { label: "Drops Exclusifs", href: "/admin/drops" },
          { label: "Le Bazar", href: "/admin/bazar" },
          { label: "Pièces Uniques", href: "/admin/pieces-uniques" },
          { label: "Studio Clickers", href: "/admin/clickers" },
          { label: "Calendrier de l'Avent", href: "/admin/calendrier-avent" },
        ],
      },
    ],
  },
  {
    title: "Marketing & Site",
    items: [
      {
        label: "Promos & Fidélité",
        href: "/admin/promos",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        subItems: [
          { label: "Codes Promo", href: "/admin/promos" },
          { label: "Cartes de Fidélité", href: "/admin/loyalty" },
          { label: "Badges NFC", href: "/admin/badges" },
          { label: "Paliers de Dons", href: "/admin/don" },
        ],
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
        label: "Site & Contenu",
        href: "/admin/hero",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        subItems: [
          { label: "Design Accueil", href: "/admin/hero" },
          { label: "Bandeau Haut de Page", href: "/admin/announcement" },
          { label: "Pages Sur-Mesure", href: "/admin/pages" },
          { label: "Hub de Liens", href: "/admin/liens" },
          { label: "Blog", href: "/admin/blog" },
          { label: "SEO Pages", href: "/admin/seo" },
        ],
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
    // Only skip individual item editor routes that have dedicated URL IDs
    if (
      pathname.startsWith("/admin/pieces-uniques/") ||
      (pathname.startsWith("/admin/products/") &&
        pathname !== "/admin/products/categories" &&
        pathname !== "/admin/products/attributes")
    ) {
      return;
    }

    let title = "Dashboard";
    if (pathname === "/admin") {
      title = "Dashboard";
    } else if (pathname === "/admin/drops") {
      title = "Drops";
    } else if (pathname === "/admin/products/categories") {
      title = "Produits - Catégories";
    } else if (pathname === "/admin/products/attributes") {
      title = "Produits - Attributs";
    } else if (pathname === "/admin/products") {
      title = "Produits";
    } else if (pathname === "/admin/pieces-uniques") {
      title = "Pièces Uniques";
    } else if (pathname.includes("/admin/bazar")) {
      title = "Le Bazar";
    } else if (pathname.includes("/admin/clickers")) {
      title = "Studio Clickers";
    } else if (pathname.includes("/admin/colors")) {
      title = "Palette Couleurs";
    } else if (pathname.includes("/admin/shipping")) {
      title = "Finances & Livraison";
    } else if (pathname.includes("/admin/reviews")) {
      title = "Avis Clients";
    } else if (pathname.includes("/admin/hero")) {
      title = "Design Accueil";
    } else if (pathname.includes("/admin/announcement")) {
      title = "Bandeau Annonce";
    } else if (pathname.includes("/admin/pickup")) {
      title = "Créneaux Retrait";
    } else if (pathname.includes("/admin/badges")) {
      title = "Badges NFC";
    } else if (pathname.includes("/admin/don")) {
      title = "Paliers de Dons";
    } else if (pathname.includes("/admin/abandoned")) {
      title = "Paniers Abandonnés";
    } else if (pathname.includes("/admin/loyalty")) {
      title = "Cartes de Fidélité";
    } else if (pathname.includes("/admin/tombola")) {
      title = "Tombolas";
    } else if (pathname.includes("/admin/loterie")) {
      title = "Roue de la Loterie";
    } else if (pathname.includes("/admin/calendrier-avent")) {
      title = "Calendrier de l'Avent";
    } else if (pathname.includes("/admin/gift-cards")) {
      title = "Cartes Cadeaux";
    } else if (pathname.includes("/admin/liens")) {
      title = "Hub de Liens";
    } else if (pathname.includes("/admin/seo")) {
      title = "SEO Pages";
    } else if (pathname.includes("/admin/login")) {
      title = "Connexion Admin";
    } else {
      const seg = pathname.split("/").filter(Boolean).pop() || "Admin";
      title = seg.charAt(0).toUpperCase() + seg.slice(1);
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
    <div className={`min-h-screen ${cls.pageBg} ${cls.textMain} flex font-sans relative select-none`}>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar (Gris anthracite, textes & pictos blancs) */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen ${isCollapsed ? "w-20" : "w-64"} shrink-0 bg-[#27272A] text-white border-r border-white/10 flex flex-col transition-all duration-300 max-h-screen keep-white ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo & Toggle Row */}
        <div className={`h-16 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-5"} border-b border-white/15 shrink-0`}>
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Spoolio"
                width={95}
                height={28}
                className="h-7 w-auto object-contain no-invert"
              />
              <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white !text-white bg-white/20 border border-white/25 px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </Link>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-xl transition-all cursor-pointer hover:bg-white/15 text-white/85 hover:text-white !text-white"
            title={isCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 text-white ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: "#ffffff" }}
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
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-white/65 pb-1 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const matchesSub = Boolean(item.subItems?.some((sub) => pathname.startsWith(sub.href)));
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href) || matchesSub;

                let badgeValue = item.badge;
                if (item.label === "Commandes" && newOrdersCount > 0) {
                  badgeValue = String(newOrdersCount);
                } else if (item.label === "Avis Clients" && pendingReviewsCount > 0) {
                  badgeValue = String(pendingReviewsCount);
                }

                const isParentActive = isActive && Boolean(item.subItems?.length);

                return (
                  <div key={item.href} className="flex flex-col gap-1">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"} rounded-xl text-xs transition-all duration-200 group text-white !text-white ${
                        isActive
                          ? "bg-white/20 border border-white/25 text-white font-extrabold shadow-sm"
                          : "text-white/90 hover:text-white hover:bg-white/10 font-medium"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                      )}

                      <span className="flex items-center gap-3 text-white !text-white" style={{ color: "#ffffff" }}>
                        <span className="text-base transition-transform group-hover:scale-110 text-white !text-white" style={{ color: "#ffffff" }}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className={isActive ? "text-white !text-white font-black tracking-wide" : "text-white/95 !text-white"}>
                            {item.label}
                          </span>
                        )}
                      </span>

                      {badgeValue && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white !text-white ${
                            typeof badgeValue === "string" && !isNaN(Number(badgeValue))
                              ? "bg-[#FF5500]"
                              : "bg-white/20 border border-white/25"
                          } ${isCollapsed ? "absolute top-1 right-1" : ""}`}
                        >
                          {badgeValue}
                        </span>
                      )}
                    </Link>

                    {item.subItems && isParentActive && !isCollapsed && (
                      <div className="flex flex-col gap-1 pl-6 pr-2 py-1 border-l-2 ml-4 border-white/30">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`text-[11px] py-1.5 px-2.5 rounded-lg transition-all text-white !text-white ${
                                isSubActive
                                  ? "font-black bg-white/20 shadow-xs translate-x-0.5"
                                  : "text-white/80 hover:text-white hover:bg-white/10"
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
        <div className="p-3 border-t border-white/15 flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer w-full text-white/90 hover:text-white hover:bg-white/10 !text-white"
            style={{ color: "#ffffff" }}
          >
            {theme === "dark" ? (
              <>
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ffffff" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
                {!isCollapsed && <span>Thème clair</span>}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ffffff" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {!isCollapsed && <span>Thème sombre</span>}
              </>
            )}
          </button>

          <Link
            href="/"
            title="Voir le site public"
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2"} text-xs rounded-xl transition-colors text-white/90 hover:text-white hover:bg-white/10 !text-white`}
            style={{ color: "#ffffff" }}
          >
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ffffff" }}>
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
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2"} text-xs rounded-xl transition-colors cursor-pointer w-full text-white/95 hover:bg-red-500/30 hover:text-white !text-white font-semibold`}
            style={{ color: "#ffffff" }}
          >
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#ffffff" }}>
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
              className={`p-2 rounded-xl md:hidden cursor-pointer transition-colors ${
                theme === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-zinc-100 text-zinc-900"
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h10" />
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
