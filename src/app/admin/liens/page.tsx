"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import LinkHubClient, { LinkItem, HubProfile } from "@/components/LinkHubClient";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Sparkles, Check, ExternalLink, Save, Pencil, X } from "lucide-react";

export default function AdminLinksPage() {
  const { cls } = useAdminTheme();

  // State
  const [profile, setProfile] = useState<HubProfile>({
    title: "Spoolio 🌀",
    subtitle: "Impression 3D & Objets Fidgets Sensoriels TDAH 🇫🇷",
    avatar: "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png",
    verifiedBadge: true,
    socials: {
      tiktok: "https://www.tiktok.com/@spoolio_3d",
      instagram: "https://www.instagram.com/spoolio.fr",
      email: "contact@spoolio.fr"
    }
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [activeTab, setActiveTab] = useState<"links" | "profile">("links");
  const [isClient, setIsClient] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // New Link Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("🔗");
  const [newBadge, setNewBadge] = useState("");
  const [newStyle, setNewStyle] = useState<"normal" | "glow" | "pulse" | "highlight">("normal");

  useEffect(() => {
    setIsClient(true);
    fetch("/api/admin/links")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.profile) setProfile(data.profile);
          if (Array.isArray(data.links)) setLinks(data.links);
        }
      })
      .catch((e) => console.error("Error loading admin links:", e));
  }, []);

  // Save Config to Server
  const handleSaveConfig = async () => {
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, links }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving admin links:", err);
    }
  };

  // Add new link
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle,
      url: newUrl,
      icon: newIcon || "🔗",
      badge: newBadge,
      style: newStyle,
      isPublished: true,
      order: links.length + 1,
      clicks: 0,
    };

    const updated = [...links, newLink];
    setLinks(updated);

    // Reset form
    setNewTitle("");
    setNewSubtitle("");
    setNewUrl("");
    setNewIcon("🔗");
    setNewBadge("");
    setNewStyle("normal");
  };

  // Delete link
  const handleDeleteLink = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce lien ?")) return;
    setLinks(links.filter((l) => l.id !== id));
  };

  // Toggle publish
  const handleTogglePublish = (id: string) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, isPublished: !l.isPublished } : l))
    );
  };

  // Move link up/down
  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Reassign order indices
    const reordered = newLinks.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLinks(reordered);
  };

  if (!isClient) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <h1 className={`text-2xl font-black ${cls.textMain} tracking-tight uppercase`}>
              Gestion du Hub de Liens
            </h1>
            <span className="bg-[#ff4f00]/20 text-[#ff4f00] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#ff4f00]/30">
              Linktree Spoolio
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Personnalise tes liens, ton profil et suis le nombre de clics en direct.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/liens"
            target="_blank"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            <span>👁️ Voir la page publique /liens</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ff4f00]/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>

      {/* Toast Save Success */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Hub de Liens mis à jour avec succès et synchronisé sur la page /liens !</span>
        </div>
      )}

      {/* EDITING TABS & FORMS */}
      <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "links"
                  ? "bg-white text-black font-extrabold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🔗 Liste des Liens ({links.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-black font-extrabold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              👤 Profil &amp; Réseaux
            </button>
          </div>

          {/* TAB 1: LINKS MANAGEMENT */}
          {activeTab === "links" && (
            <div className="space-y-6">
              
              {/* Add New Link Card */}
              <form onSubmit={handleAddLink} className={`p-5 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-extrabold ${cls.textMain} uppercase tracking-wider flex items-center gap-2`}>
                    <Plus className="w-4 h-4 text-[#ff4f00]" />
                    <span>Ajouter un nouveau lien</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">Titre du Lien *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: ⌨️ Créateur de Clicker 3D"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">URL de destination *</label>
                    <input
                      type="url"
                      required
                      placeholder="Ex: https://www.spoolio.fr/createur-cliqueur"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">Sous-titre / Description</label>
                    <input
                      type="text"
                      placeholder="Ex: Personnalise ton clicker 3D"
                      value={newSubtitle}
                      onChange={(e) => setNewSubtitle(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">Badge (Optionnel)</label>
                    <input
                      type="text"
                      placeholder="Ex: 🔥 BEST-SELLER"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">Style Visuel</label>
                    <select
                      value={newStyle}
                      onChange={(e: any) => setNewStyle(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                    >
                      <option value="normal">Normal (Noir Mat)</option>
                      <option value="glow">Néon Glow Orange</option>
                      <option value="pulse">Violet Pulsant</option>
                      <option value="highlight">Ambre Mis en avant</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter le lien</span>
                  </button>
                </div>
              </form>


              {/* Links List Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>LIENS ACTIFS ({links.length})</span>
                  <span>Réordonner &amp; Éditer</span>
                </div>

                {links.map((link, idx) => {
                  const isEditing = editingLinkId === link.id;

                  if (isEditing) {
                    return (
                      <div
                        key={link.id}
                        className={`p-5 rounded-2xl border-2 border-[#ff4f00] bg-neutral-900/90 space-y-4 shadow-xl animate-fadeIn`}
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#ff4f00] flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            <span>Édition du lien : {link.title}</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setEditingLinkId(null)}
                            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400 font-mono block mb-1">Titre du Lien *</label>
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => {
                                const updated = links.map((l) => l.id === link.id ? { ...l, title: e.target.value } : l);
                                setLinks(updated);
                              }}
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-gray-400 font-mono block mb-1">URL de destination *</label>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const updated = links.map((l) => l.id === link.id ? { ...l, url: e.target.value } : l);
                                setLinks(updated);
                              }}
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-400 font-mono block mb-1">Sous-titre / Description</label>
                            <input
                              type="text"
                              value={link.subtitle || ""}
                              onChange={(e) => {
                                const updated = links.map((l) => l.id === link.id ? { ...l, subtitle: e.target.value } : l);
                                setLinks(updated);
                              }}
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-gray-400 font-mono block mb-1">Badge (Optionnel)</label>
                            <input
                              type="text"
                              value={link.badge || ""}
                              onChange={(e) => {
                                const updated = links.map((l) => l.id === link.id ? { ...l, badge: e.target.value } : l);
                                setLinks(updated);
                              }}
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-gray-400 font-mono block mb-1">Style Visuel</label>
                            <select
                              value={link.style || "normal"}
                              onChange={(e: any) => {
                                const updated = links.map((l) => l.id === link.id ? { ...l, style: e.target.value } : l);
                                setLinks(updated);
                              }}
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                            >
                              <option value="normal">Normal (Noir Mat)</option>
                              <option value="glow">Néon Glow Orange</option>
                              <option value="pulse">Violet Pulsant</option>
                              <option value="highlight">Ambre Mis en avant</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingLinkId(null)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Terminer l'édition</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={link.id}
                      className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} flex items-center justify-between gap-3 transition-all ${
                        !link.isPublished ? "opacity-50 grayscale" : ""
                      }`}
                    >
                      {/* Left Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-base shrink-0">
                          {link.icon || "🔗"}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${cls.textMain} truncate`}>
                              {link.title}
                            </span>
                            {link.badge && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">
                            {link.url}
                          </p>
                        </div>
                      </div>

                      {/* Right Actions & Clicks readout */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Click Counter */}
                        <span className="text-[11px] font-mono text-gray-400 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                          👁️ {link.clicks || 0} clics
                        </span>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveLink(idx, "up")}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-gray-300 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === links.length - 1}
                            onClick={() => handleMoveLink(idx, "down")}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-gray-300 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingLinkId(link.id)}
                          className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center cursor-pointer"
                          title="Éditer ce lien"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(link.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                            link.isPublished ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-500"
                          }`}
                          title={link.isPublished ? "Lien visible (Publié)" : "Lien masqué"}
                        >
                          {link.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center cursor-pointer"
                          title="Supprimer le lien"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: PROFILE & SOCIALS MANAGEMENT */}
          {activeTab === "profile" && (
            <div className={`p-6 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-5 shadow-sm`}>
              <h3 className={`text-xs font-extrabold ${cls.textMain} uppercase tracking-wider`}>
                Personnalisation du Profil &amp; Réseaux
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-mono block mb-1">Titre principal</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-mono block mb-1">Sous-titre / Bio</label>
                  <textarea
                    rows={2}
                    value={profile.subtitle}
                    onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-mono block mb-1">URL Photo Avatar</label>
                  <input
                    type="text"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div className="pt-3 border-t border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300">Réseaux Sociaux (Pied de page)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">TikTok</label>
                      <input
                        type="url"
                        value={profile.socials?.tiktok || ""}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, tiktok: e.target.value } })}
                        placeholder="https://tiktok.com/@spoolio_3d"
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Instagram</label>
                      <input
                        type="url"
                        value={profile.socials?.instagram || ""}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, instagram: e.target.value } })}
                        placeholder="https://instagram.com/spoolio.fr"
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Facebook</label>
                      <input
                        type="url"
                        value={profile.socials?.facebook || ""}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, facebook: e.target.value } })}
                        placeholder="https://facebook.com/spoolio.fr"
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">YouTube</label>
                      <input
                        type="url"
                        value={profile.socials?.youtube || ""}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, youtube: e.target.value } })}
                        placeholder="https://youtube.com/@spoolio3d"
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Email Contact</label>
                      <input
                        type="email"
                        value={profile.socials?.email || ""}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, email: e.target.value } })}
                        placeholder="contact@spoolio.fr"
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

      </div>

    </div>
  );
}
