"use client";

import { useAdminTheme } from "../AdminThemeContext";

const articles = [
  { title: "Le PLA biosourcé : qu'est-ce que c'est vraiment ?", slug: "pla-biosource-explication", category: "Matériaux", status: "publish", date: "15 juillet 2026" },
  { title: "Comment choisir son fidget ? Le guide Spoolio", slug: "guide-choix-fidget", category: "Guide", status: "publish", date: "10 juillet 2026" },
  { title: "Impression 3D locale : pourquoi c'est mieux", slug: "impression-3d-locale", category: "L'atelier", status: "publish", date: "2 juillet 2026" },
  { title: "5 idées de cadeaux insolites imprimés en 3D", slug: "cadeaux-insolites-3d", category: "Inspiration", status: "draft", date: "Brouillon" },
  { title: "Comment programmer sa puce NFC ?", slug: "programmer-puce-nfc", category: "Tutoriel", status: "draft", date: "Brouillon" },
];

const categoryColors: Record<string, string> = {
  "Matériaux": "#059669",
  "Guide": "#2F3CD9",
  "L'atelier": "#f59e0b",
  "Inspiration": "#8b5cf6",
  "Tutoriel": "#0ea5e9",
};

const filters = ["Tous", "Publiés", "Brouillons", "Matériaux", "Guide", "L'atelier", "Inspiration", "Tutoriel"];

export default function AdminBlogPage() {
  const { cls, theme } = useAdminTheme();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Articles de blog</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            {articles.length} articles · {articles.filter(a => a.status === "publish").length} publiés · {articles.filter(a => a.status === "draft").length} brouillons
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer"
          style={{ background: "#059669", boxShadow: "0 8px 24px #05996930" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              i === 0
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : `${cls.cardBg} ${cls.border} ${cls.textMuted} ${theme === "dark" ? "hover:text-white hover:border-white/10" : "hover:text-gray-900 hover:border-gray-300"}`
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Articles list */}
      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <div
            key={a.slug}
            className={`group ${cls.cardBg} border ${cls.border} ${theme === "dark" ? "hover:border-white/10" : "hover:border-gray-300"} rounded-2xl px-6 py-4 flex items-center justify-between gap-4 transition-colors`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: categoryColors[a.category] ?? "#888" }} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${cls.textMain} truncate`}>{a.title}</p>
                <p className={`text-xs ${cls.textFaint} mt-0.5`}>/{a.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  background: `${categoryColors[a.category] ?? "#888"}18`,
                  color: categoryColors[a.category] ?? "#888",
                  border: `1px solid ${categoryColors[a.category] ?? "#888"}30`,
                }}
              >
                {a.category}
              </span>
              <span className={`text-xs ${cls.textFaint} w-28 text-right`}>{a.date}</span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                a.status === "publish"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-gray-400/10 text-gray-400 border border-gray-400/20"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${a.status === "publish" ? "bg-emerald-400" : "bg-gray-400"}`} />
                {a.status === "publish" ? "Publié" : "Brouillon"}
              </span>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className={`flex items-center gap-1.5 text-[11px] font-bold ${cls.textMain} ${theme === "dark" ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"} px-3 py-1.5 rounded-lg transition-colors cursor-pointer`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
                <button className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
