"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";
import { LinkItem, HubProfile, HubEvent } from "@/components/LinkHubClient";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  ExternalLink,
  Save,
  Pencil,
  X,
  Calendar,
  MapPin,
  Link2,
  ShieldCheck,
} from "lucide-react";

export default function AdminLinksPage() {
  const { cls } = useAdminTheme();

  // State
  const [profile, setProfile] = useState<HubProfile>({
    title: "Spoolio.fr",
    subtitle: "Impression 3D & Objets Fidgets Sensoriels TDAH 🇫🇷",
    avatar: "https://ugc.production.linktr.ee/fdb01a4c-7a6f-4109-92fc-331e44f5bb26_Frame-294.png",
    verifiedBadge: true,
    socials: {
      tiktok: "https://www.tiktok.com/@spoolio.fr",
      instagram: "https://www.instagram.com/spoolio.fr",
      email: "contact@spoolio.fr",
    },
  });

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"links" | "events" | "profile">("links");
  const [isClient, setIsClient] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // New Link Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("link");
  const [newBadge, setNewBadge] = useState("");
  const [newStyle, setNewStyle] = useState<"normal" | "glow" | "pulse" | "highlight">("normal");

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLinkUrl, setNewEventLinkUrl] = useState("");
  const [newEventLinkLabel, setNewEventLinkLabel] = useState("");
  const [newEventBadge, setNewEventBadge] = useState("");

  useEffect(() => {
    setIsClient(true);
    fetch("/api/admin/links")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.profile) setProfile(data.profile);
          if (Array.isArray(data.links)) setLinks(data.links);
          if (Array.isArray(data.events)) setEvents(data.events);
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
        body: JSON.stringify({ profile, links, events }),
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

  // ===================== LINKS HANDLERS =====================
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle,
      url: newUrl,
      icon: newIcon || "link",
      badge: newBadge,
      style: newStyle,
      isPublished: true,
      order: links.length + 1,
      clicks: 0,
    };

    setLinks([...links, newLink]);

    setNewTitle("");
    setNewSubtitle("");
    setNewUrl("");
    setNewIcon("link");
    setNewBadge("");
    setNewStyle("normal");
  };

  const handleDeleteLink = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce lien ?")) return;
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleTogglePublish = (id: string) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, isPublished: !l.isPublished } : l))
    );
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    const reordered = newLinks.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLinks(reordered);
  };

  // ===================== EVENTS HANDLERS =====================
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventLocation) return;

    const newEvent: HubEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      location: newEventLocation,
      description: newEventDescription,
      linkUrl: newEventLinkUrl,
      linkLabel: newEventLinkLabel || "En savoir plus",
      badge: newEventBadge,
      isPublished: true,
      order: events.length + 1,
    };

    setEvents([...events, newEvent]);

    setNewEventTitle("");
    setNewEventDate("");
    setNewEventLocation("");
    setNewEventDescription("");
    setNewEventLinkUrl("");
    setNewEventLinkLabel("");
    setNewEventBadge("");
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;
    setEvents(events.filter((ev) => ev.id !== id));
  };

  const handleTogglePublishEvent = (id: string) => {
    setEvents(
      events.map((ev) => (ev.id === id ? { ...ev, isPublished: !ev.isPublished } : ev))
    );
  };

  const handleMoveEvent = (index: number, direction: "up" | "down") => {
    const newEvents = [...events];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newEvents.length) return;

    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIndex];
    newEvents[targetIndex] = temp;

    const reordered = newEvents.map((item, idx) => ({ ...item, order: idx + 1 }));
    setEvents(reordered);
  };

  if (!isClient) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#ff4f00]" />
            <h1 className={`text-2xl font-black ${cls.textMain} tracking-tight uppercase`}>
              Gestion du Hub de Liens &amp; Événements
            </h1>
            <span className="bg-[#ff4f00]/20 text-[#ff4f00] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#ff4f00]/30">
              Spoolio /liens
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Gérez vos liens, vos marchés à venir et vos informations de profil en direct.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/liens"
            target="_blank"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir la page publique /liens</span>
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
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "links"
                ? "bg-white text-black font-extrabold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Liens ({links.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "events"
                ? "bg-[#ff4f00] text-white font-extrabold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Marchés &amp; Événements ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-white text-black font-extrabold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Profil &amp; Réseaux</span>
          </button>
        </div>

        {/* ==================== TAB 1: LINKS MANAGEMENT ==================== */}
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
                    placeholder="Ex: BEST-SELLER"
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
                    <option value="highlight">Mis en avant (Orange)</option>
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
                      className="p-5 rounded-2xl border-2 border-[#ff4f00] bg-neutral-900/90 space-y-4 shadow-xl"
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
                              const updated = links.map((l) => (l.id === link.id ? { ...l, title: e.target.value } : l));
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
                              const updated = links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l));
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
                              const updated = links.map((l) => (l.id === link.id ? { ...l, subtitle: e.target.value } : l));
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
                              const updated = links.map((l) => (l.id === link.id ? { ...l, badge: e.target.value } : l));
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
                              const updated = links.map((l) => (l.id === link.id ? { ...l, style: e.target.value } : l));
                              setLinks(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                          >
                            <option value="normal">Normal (Noir Mat)</option>
                            <option value="glow">Néon Glow Orange</option>
                            <option value="pulse">Violet Pulsant</option>
                            <option value="highlight">Mis en avant (Orange)</option>
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
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs shrink-0 text-[#ff4f00]">
                        <Link2 className="w-4 h-4" />
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
                        <p className="text-[11px] text-gray-400 truncate">{link.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-gray-400 bg-black/30 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-neutral-400" />
                        <span>{link.clicks || 0} clics</span>
                      </span>

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

                      <button
                        type="button"
                        onClick={() => setEditingLinkId(link.id)}
                        className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center cursor-pointer"
                        title="Éditer ce lien"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(link.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          link.isPublished
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-800 text-gray-500"
                        }`}
                        title={link.isPublished ? "Lien visible (Publié)" : "Lien masqué"}
                      >
                        {link.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

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

        {/* ==================== TAB 2: EVENTS & MARCHÉS ==================== */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Add New Event Form */}
            <form onSubmit={handleAddEvent} className={`p-5 rounded-3xl ${cls.cardBg} border ${cls.border} space-y-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-extrabold ${cls.textMain} uppercase tracking-wider flex items-center gap-2`}>
                  <Calendar className="w-4 h-4 text-[#ff4f00]" />
                  <span>Ajouter un marché ou un événement</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Nom du Marché / Événement *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marché des Créateurs & Artisans"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Date / Période *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Samedi 28 & Dimanche 29 Septembre"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Lieu / Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comines (59) - Grand Place"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Badge (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: STAND SUR PLACE ou CE WEEK-END"
                    value={newEventBadge}
                    onChange={(e) => setNewEventBadge(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-mono block mb-1">Description / Précisions</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Venez tester nos clickers 3D en direct et découvrir nos fidgets sensoriels !"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Lien Web (Optionnel : Google Maps, événement Facebook...)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newEventLinkUrl}
                    onChange={(e) => setNewEventLinkUrl(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 font-mono block mb-1">Libellé du Bouton (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Voir le lieu & horaires"
                    value={newEventLinkLabel}
                    onChange={(e) => setNewEventLinkLabel(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter l'événement</span>
                </button>
              </div>
            </form>

            {/* Events List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>ÉVÉNEMENTS &amp; MARCHÉS CONFIGURÉS ({events.length})</span>
                <span>Réordonner &amp; Éditer</span>
              </div>

              {events.length === 0 && (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${cls.border} text-gray-500 text-xs`}>
                  Aucun événement ou marché configuré pour le moment. Ajoutez votre premier marché ci-dessus !
                </div>
              )}

              {events.map((ev, idx) => {
                const isEditing = editingEventId === ev.id;

                if (isEditing) {
                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl border-2 border-[#ff4f00] bg-neutral-900/90 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#ff4f00] flex items-center gap-2">
                          <Pencil className="w-4 h-4" />
                          <span>Édition de l'événement : {ev.title}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingEventId(null)}
                          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Titre *</label>
                          <input
                            type="text"
                            value={ev.title}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, title: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Date *</label>
                          <input
                            type="text"
                            value={ev.date}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, date: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Lieu *</label>
                          <input
                            type="text"
                            value={ev.location}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, location: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Badge</label>
                          <input
                            type="text"
                            value={ev.badge || ""}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, badge: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-400 font-mono block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={ev.description || ""}
                          onChange={(e) => {
                            const updated = events.map((item) => (item.id === ev.id ? { ...item, description: e.target.value } : item));
                            setEvents(updated);
                          }}
                          className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Lien Web</label>
                          <input
                            type="url"
                            value={ev.linkUrl || ""}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, linkUrl: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-400 font-mono block mb-1">Libellé du bouton</label>
                          <input
                            type="text"
                            value={ev.linkLabel || ""}
                            onChange={(e) => {
                              const updated = events.map((item) => (item.id === ev.id ? { ...item, linkLabel: e.target.value } : item));
                              setEvents(updated);
                            }}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${cls.border} ${cls.inputBg}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingEventId(null)}
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
                    key={ev.id}
                    className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} flex items-center justify-between gap-3 transition-all ${
                      !ev.isPublished ? "opacity-50 grayscale" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-[#ff4f00]/15 border border-[#ff4f00]/30 text-[#ff4f00] flex items-center justify-center text-base shrink-0">
                        <Calendar className="w-4 h-4" />
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${cls.textMain} truncate`}>
                            {ev.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#ff4f00] bg-[#ff4f00]/10 border border-[#ff4f00]/20 px-2 py-0.5 rounded-full">
                            {ev.date}
                          </span>
                          {ev.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                              {ev.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span>{ev.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveEvent(idx, "up")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-gray-300 flex items-center justify-center cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === events.length - 1}
                          onClick={() => handleMoveEvent(idx, "down")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-gray-300 flex items-center justify-center cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingEventId(ev.id)}
                        className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center cursor-pointer"
                        title="Éditer cet événement"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePublishEvent(ev.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          ev.isPublished
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-800 text-gray-500"
                        }`}
                        title={ev.isPublished ? "Événement visible sur /liens" : "Événement masqué"}
                      >
                        {ev.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center cursor-pointer"
                        title="Supprimer l'événement"
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

        {/* ==================== TAB 3: PROFILE & SOCIALS MANAGEMENT ==================== */}
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
                <h4 className="text-xs font-bold text-gray-300">Réseaux Sociaux (Affichés sous le profil)</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">TikTok</label>
                    <input
                      type="url"
                      value={profile.socials?.tiktok || ""}
                      onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, tiktok: e.target.value } })}
                      placeholder="https://tiktok.com/@spoolio.fr"
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
                      placeholder="https://youtube.com/@spoolio"
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
