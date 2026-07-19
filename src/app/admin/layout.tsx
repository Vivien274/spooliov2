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
}

const navItems: NavItem[] = [
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
    label: "Produits",
    href: "/admin/products",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
    label: "Avis",
    href: "/admin/reviews",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Pages",
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
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme, cls } = useAdminTheme();
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);

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
        // Orders count
        const resOrders = await fetch("/api/admin/orders");
        if (resOrders.ok) {
          const data = await resOrders.json();
          const count = (data.orders || []).filter((o: any) => o.status === "attente_impression").length;
          setNewOrdersCount(count);
        }

        // Reviews count
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
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${cls.pageBg} ${cls.textMain} flex font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`w-64 shrink-0 ${cls.sidebarBg} border-r ${cls.border} flex flex-col transition-colors duration-300`}>
        {/* Logo */}
        <div className={`h-16 flex items-center gap-3 px-5 border-b ${cls.border}`}>
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
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            
            let badgeValue = item.badge;
            if (item.label === "Commandes" && newOrdersCount > 0) {
              badgeValue = String(newOrdersCount);
            } else if (item.label === "Avis" && pendingReviewsCount > 0) {
              badgeValue = String(pendingReviewsCount);
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#2F3CD9]/10 border border-[#2F3CD9]/20"
                    : `${cls.textMuted} hover:${cls.textMain} ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"}`
                }`}
                style={isActive ? { color: ADMIN_BLUE } : {}}
              >
                <span className="flex items-center gap-3">
                  <span style={isActive ? { color: ADMIN_BLUE } : {}}>{item.icon}</span>
                  {item.label}
                </span>
                {badgeValue && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className={`p-4 border-t ${cls.border} flex flex-col gap-1`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer w-full ${cls.textMuted} ${theme === "dark" ? "hover:text-white hover:bg-white/5" : "hover:text-gray-900 hover:bg-gray-100"}`}
          >
            {theme === "dark" ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
                Thème clair
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Thème sombre
              </>
            )}
          </button>
          <Link
            href="/"
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-colors ${cls.textMuted} ${theme === "dark" ? "hover:text-white hover:bg-white/5" : "hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voir le site
          </Link>
          <button
            onClick={async () => {
              try {
                await fetch("/api/admin/logout", { method: "POST" });
                localStorage.removeItem("is_spoolio_admin");
                window.location.href = "/admin/login";
              } catch (e) {}
            }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer w-full text-red-500 hover:bg-red-500/10 font-semibold"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${cls.pageBg} transition-colors duration-300`}>
        {/* Top bar */}
        <header className={`h-16 ${cls.sidebarBg} border-b ${cls.border} flex items-center justify-between px-6 shrink-0 transition-colors duration-300`}>
          <div className={`text-sm ${cls.textMuted} font-medium`}>
            <span className={cls.textFaint}>admin.spoolio.fr</span>
            <span className={`${cls.textFaint} mx-2`}>/</span>
            <span className={`${cls.textMain} capitalize font-semibold`}>
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.split("/").filter(Boolean).slice(1).join(" / ")}
            </span>
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

            <div className={`flex items-center gap-2 text-xs ${cls.textMuted} ${cls.statusBg} rounded-full px-3 py-1.5 border`}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs"
              style={{ background: ADMIN_BLUE }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
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
