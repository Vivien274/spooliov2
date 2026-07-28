"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminTheme } from "../AdminThemeContext";

interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl?: string | null;
  status: "publish" | "draft" | string;
  date: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export default function AdminBlogPage() {
  const { cls, theme } = useAdminTheme();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");

  // View state: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editorTab, setEditorTab] = useState<"content" | "media" | "seo" | "preview">("content");
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "html">("wysiwyg");

  // Editing state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImageUrl: "",
    status: "publish",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inContentFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching admin blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateEditor = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "<p class=\"wp-block-paragraph\">Écrivez votre article ici...</p>",
      featuredImageUrl: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
      status: "publish",
      metaTitle: "",
      metaDescription: "",
      keywords: "fidgets, impression 3D, concentration",
    });
    setEditorTab("content");
    setViewMode("editor");
  };

  const openEditEditor = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImageUrl: post.featuredImageUrl || "",
      status: post.status || "publish",
      metaTitle: post.metaTitle || post.title || "",
      metaDescription: post.metaDescription || post.excerpt || "",
      keywords: post.keywords || "",
    });
    setEditorTab("content");
    setViewMode("editor");
  };

  const handleTitleChange = (val: string) => {
    const isNew = !editingPost;
    setFormData((prev) => {
      const autoSlug = isNew && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : prev.slug;
      const autoMetaTitle = isNew && !prev.metaTitle ? val : prev.metaTitle;
      return { ...prev, title: val, slug: autoSlug, metaTitle: autoMetaTitle };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert("Veuillez saisir un titre pour l'article.");
      return;
    }

    setSaving(true);
    try {
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : "/api/admin/blog";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingPost ? "Article mis à jour !" : "Article créé avec succès !");
        setViewMode("list");
        fetchPosts();
      } else {
        alert(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (err: any) {
      alert("Erreur de connexion : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string, title: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer l'article "${title}" ?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Article supprimé");
        fetchPosts();
      } else {
        alert(data.error || "Erreur de suppression");
      }
    } catch (err: any) {
      alert("Erreur de connexion");
    } finally {
      setDeletingId(null);
    }
  };

  // Featured Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      const uploadedUrl = data.url || data.imageUrl;
      if (data.success && uploadedUrl) {
        setFormData((prev) => ({ ...prev, featuredImageUrl: uploadedUrl }));
        showToast("Image téléchargée avec succès !");
      } else {
        alert(data.error || "Échec du téléchargement");
      }
    } catch (err: any) {
      alert("Erreur lors de l'envoi de l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  // In-content Image Upload handler
  const handleInContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      const uploadedUrl = data.url || data.imageUrl;
      if (data.success && uploadedUrl) {
        const imgTag = `\n<img src="${uploadedUrl}" alt="${file.name}" class="rounded-2xl max-w-full h-auto my-6 border border-white/10" />\n`;
        setFormData((prev) => ({ ...prev, content: prev.content + imgTag }));
        showToast("Image insérée dans l'article !");
      } else {
        alert(data.error || "Échec du téléchargement");
      }
    } catch (err: any) {
      alert("Erreur d'envoi");
    } finally {
      setUploadingImage(false);
    }
  };

  // Insert HTML blocks
  const insertBlock = (type: string) => {
    let block = "";
    if (type === "h2") block = '\n<h2 class="wp-block-heading">Nouveau Titre de Section</h2>\n';
    if (type === "h3") block = '\n<h3 class="wp-block-heading">Sous-titre explicatif</h3>\n';
    if (type === "p") block = '\n<p class="wp-block-paragraph">Votre paragraphe de texte ici...</p>\n';
    if (type === "quote") block = '\n<blockquote class="border-l-4 border-[#ff4f00] pl-4 italic text-gray-300 my-4">Citation marquante à mettre en valeur</blockquote>\n';
    if (type === "callout") block = '\n<div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl text-blue-300 my-4">💡 <strong>Conseil Spoolio :</strong> Votre astuce ici</div>\n';
    if (type === "list") block = '\n<ul class="wp-block-list">\n  <li>Premier point important</li>\n  <li>Deuxième point explicatif</li>\n</ul>\n';

    setFormData((prev) => ({ ...prev, content: prev.content + block }));
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "Publiés") return matchesSearch && p.status === "publish";
    if (statusFilter === "Brouillons") return matchesSearch && p.status === "draft";
    return matchesSearch;
  });

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-emerald-600 text-white text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={inContentFileInputRef}
        onChange={handleInContentImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* =========================================================================
          VIEW 1: ARTICLES LIST VIEW
         ========================================================================= */}
      {viewMode === "list" && (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className={`text-3xl font-black uppercase tracking-tight ${cls.textMain}`}>Articles de l'Atelier</h1>
              <p className={`text-sm ${cls.textMuted} mt-1`}>
                {posts.length} articles · {posts.filter((a) => a.status === "publish").length} publiés · {posts.filter((a) => a.status === "draft").length} brouillons
              </p>
            </div>
            <button
              onClick={openCreateEditor}
              className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/25 border border-emerald-400/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Rédiger un article
            </button>
          </div>

          {/* Controls Bar: Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["Tous", "Publiés", "Brouillons"].map((filter) => {
                const isSelected = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ff4f00] text-white shadow-md shadow-[#ff4f00]/30"
                        : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:text-white`
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre ou slug..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold ${cls.cardBg} border ${cls.border} ${cls.textMain} placeholder-gray-500 focus:outline-none focus:border-[#ff4f00] transition-colors`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500 font-bold uppercase tracking-wider animate-pulse">
              Chargement des articles de l'Atelier...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={`py-16 text-center text-sm ${cls.textMuted} ${cls.cardBg} border ${cls.border} rounded-3xl`}>
              Aucun article ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`group ${cls.cardBg} border ${cls.border} hover:border-[#ff4f00]/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-sm`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {post.featuredImageUrl ? (
                        <Image
                          src={post.featuredImageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-white/5 text-gray-600">
                          📖
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            post.status === "publish"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {post.status === "publish" ? "● Publié" : "○ Brouillon"}
                        </span>
                        <span className={`text-xs ${cls.textFaint}`}>
                          {new Date(post.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className={`text-base font-extrabold ${cls.textMain} truncate`}>
                        {post.title}
                      </h3>
                      <p className={`text-xs ${cls.textFaint} font-mono truncate mt-0.5`}>
                        /blog/{post.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                      title="Voir sur le site"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Voir</span>
                    </Link>

                    <button
                      onClick={() => openEditEditor(post)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 border border-blue-500/30 transition-all cursor-pointer text-xs font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Éditer</span>
                    </button>

                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-colors cursor-pointer text-xs font-bold disabled:opacity-50"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: FULL-SCREEN DEDICATED ARTICLE EDITOR (FULL SPACE & FLEXIBILITY)
         ========================================================================= */}
      {viewMode === "editor" && (
        <div className="w-full space-y-6 pb-20">
          {/* Top Sticky Editor Bar */}
          <div className="sticky top-0 z-40 bg-[#131316]/95 backdrop-blur-xl border-b border-white/10 py-3.5 px-4 sm:px-8 flex items-center justify-between gap-4 -mx-4 sm:-mx-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("list")}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                ← Retour à la liste
              </button>

              <div className="hidden sm:block text-xs font-bold text-gray-400">
                {editingPost ? `Édition : ${editingPost.title}` : "Nouvel article de blog"}
              </div>
            </div>

            {/* Editor Action buttons */}
            <div className="flex items-center gap-3">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-[#ff4f00]"
              >
                <option value="publish">● Publié</option>
                <option value="draft">○ Brouillon</option>
              </select>

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4f00] to-[#e04500] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Enregistrer l'article 💾"}
              </button>
            </div>
          </div>

          {/* Title & Slug Header Inputs */}
          <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 space-y-4 shadow-md`}>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#ff4f00]">
                Titre de l'article *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="ex: Pourquoi le Fidget est indispensable en réunion..."
                className={`w-full px-5 py-3.5 rounded-2xl text-xl font-extrabold ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00] transition-colors`}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  URL / Slug de l'article
                </label>
                <div className="flex items-center gap-1 text-xs font-mono text-gray-400 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <span className="text-gray-500">spoolio.fr/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="mon-article-blog"
                    className="bg-transparent text-white font-bold focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editor Tab Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-1">
            {[
              { id: "content", label: "✍️ Contenu & Rédaction", badge: "WYSIWYG" },
              { id: "media", label: "🖼️ Image à la une & Médias", badge: formData.featuredImageUrl ? "1 Image" : "Vide" },
              { id: "seo", label: "🎯 SEO & Référencement Google", badge: "Google SERP" },
              { id: "preview", label: "👁️ Aperçu en direct", badge: "Aperçu Publique" },
            ].map((tab) => {
              const isSelected = editorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`px-5 py-3 rounded-t-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                    isSelected
                      ? "bg-[#ff4f00] text-white border-[#ff4f00] shadow-lg shadow-[#ff4f00]/20"
                      : `${cls.cardBg} border-white/10 text-gray-400 hover:text-white`
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${isSelected ? "bg-black/30 text-white" : "bg-white/10 text-gray-400"}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              TAB 1: ✍️ CONTENT & WYSIWYG EDITOR
             ========================================================================= */}
          {editorTab === "content" && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className={`${cls.cardBg} border ${cls.border} rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md`}>
                {/* Visual HTML block inserters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Insérer bloc :</span>
                  
                  <button
                    type="button"
                    onClick={() => insertBlock("h2")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all border border-white/10 cursor-pointer"
                  >
                    H2 Titre
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock("h3")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all border border-white/10 cursor-pointer"
                  >
                    H3 Sous-titre
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock("p")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all border border-white/10 cursor-pointer"
                  >
                    ¶ Paragraphe
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock("quote")}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-extrabold transition-all border border-purple-500/30 cursor-pointer"
                  >
                    💬 Citation
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock("callout")}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-extrabold transition-all border border-blue-500/30 cursor-pointer"
                  >
                    💡 Conseil Spoolio
                  </button>

                  <button
                    type="button"
                    onClick={() => insertBlock("list")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all border border-white/10 cursor-pointer"
                  >
                    • Liste à puces
                  </button>

                  {/* Image upload in content button */}
                  <button
                    type="button"
                    onClick={() => inContentFileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-extrabold transition-all border border-emerald-500/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🖼️ Insérer Image</span>
                  </button>
                </div>

                {/* Editor Mode Toggle: Visual vs Code */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditorMode("wysiwyg")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      editorMode === "wysiwyg" ? "bg-[#ff4f00] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Éditeur Visuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("html")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      editorMode === "html" ? "bg-[#ff4f00] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Code HTML
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Code/WYSIWYG Workspace (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {editorMode === "wysiwyg" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                        Zone de Rédaction Visuelle (Largeur maximale)
                      </label>
                      <textarea
                        rows={16}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Rédigez votre article en toute liberté..."
                        className={`w-full p-6 rounded-3xl text-sm font-sans leading-relaxed ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00] shadow-inner transition-colors`}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                        Code Source HTML Bruts
                      </label>
                      <textarea
                        rows={16}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className={`w-full p-6 rounded-3xl text-xs font-mono leading-relaxed bg-[#0b0b0f] text-emerald-400 border border-emerald-500/30 focus:outline-none focus:border-emerald-400 shadow-inner`}
                      />
                    </div>
                  )}

                  {/* Article Excerpt */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Extrait / Résumé court (Affiché sur la carte du blog)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Bref extrait d'introduction pour susciter la curiosité..."
                      className={`w-full p-4 rounded-2xl text-xs font-medium ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00]`}
                    />
                  </div>
                </div>

                {/* Right Side Instant Render Box (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-5 space-y-3 sticky top-20`}>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#ff4f00]">
                      ⚡ Rendus en direct
                    </h4>
                    <p className="text-xs text-gray-400">
                      Aperçu visuel immédiat des styles appliqués sur votre article.
                    </p>
                    <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 prose prose-invert max-w-none text-xs leading-relaxed max-h-[500px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: formData.content || "<p class='text-gray-500'>Commencez à écrire pour voir le rendu...</p>" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: 🖼️ FEATURED IMAGE & MEDIA UPLOADER
             ========================================================================= */}
          {editorTab === "media" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-8 space-y-6 shadow-lg`}>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                    Image à la Une de l'Article
                  </h3>
                  <p className="text-xs text-gray-400">
                    Cette image est affichée en haut de votre article et sur les cartes du blog.
                  </p>
                </div>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-[#ff4f00] bg-white/5 hover:bg-[#ff4f00]/5 p-8 rounded-3xl text-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#ff4f00]/20 text-[#ff4f00] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📤
                  </div>
                  <h4 className="text-sm font-extrabold text-white mb-1">
                    {uploadingImage ? "Téléchargement en cours..." : "Cliquez pour télécharger une image"}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Format recommandé : WEBP, PNG, JPG (1200x800 px)
                  </p>
                </div>

                {/* Live Featured Image Preview */}
                {formData.featuredImageUrl && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        ✓ Image active
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featuredImageUrl: "" })}
                        className="text-xs text-red-400 hover:text-red-300 font-bold"
                      >
                        Supprimer l'image
                      </button>
                    </div>

                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/20 bg-neutral-900">
                      <Image
                        src={formData.featuredImageUrl}
                        alt="Aperçu image à la une"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* URL Input Fallback */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">
                        Ou modifiez l'URL directement :
                      </label>
                      <input
                        type="text"
                        value={formData.featuredImageUrl}
                        onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-mono bg-black/40 text-white border border-white/10 focus:outline-none focus:border-[#ff4f00]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: 🎯 SEO & GOOGLE REFERENCEMENT CARD
             ========================================================================= */}
          {editorTab === "seo" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Google SERP Live Snippet Card */}
              <div className="bg-[#18191c] border border-white/15 rounded-3xl p-6 space-y-3 shadow-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  <span>🔍 Aperçu des résultats sur Google (SERP)</span>
                </div>

                <div className="bg-white p-5 rounded-2xl text-left space-y-1 select-none font-sans">
                  <div className="text-xs text-[#202124] flex items-center gap-1.5 truncate">
                    <span className="w-4 h-4 rounded-full bg-[#ff4f00] text-white flex items-center justify-center font-black text-[9px]">S</span>
                    <span className="font-bold">spoolio.fr</span>
                    <span className="text-gray-400">› blog › {formData.slug || "titre-article"}</span>
                  </div>
                  <h3 className="text-lg font-medium text-[#1a0dab] hover:underline truncate cursor-pointer">
                    {formData.metaTitle || formData.title || "Titre de l'article sur Google"}
                  </h3>
                  <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                    {formData.metaDescription || formData.excerpt || "Description d'extrait d'article affichée sous le titre dans les résultats de recherche Google..."}
                  </p>
                </div>
              </div>

              {/* SEO Meta Fields */}
              <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-6 space-y-5 shadow-md`}>
                <h3 className="text-base font-black uppercase tracking-tight text-white border-b border-white/10 pb-3">
                  Optimisation SEO
                </h3>

                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                      Méta-titre SEO (Balise Title)
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${formData.metaTitle.length > 60 ? "text-amber-400" : "text-gray-400"}`}>
                      {formData.metaTitle.length} / 60 car.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Titre optimisé pour les moteurs de recherche..."
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                      Méta-description SEO
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${formData.metaDescription.length > 160 ? "text-amber-400" : "text-gray-400"}`}>
                      {formData.metaDescription.length} / 160 car.
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Résumé accrocheur qui pousse au clic sur Google..."
                    className={`w-full p-4 rounded-xl text-xs font-medium ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00]`}
                  />
                </div>

                {/* Keywords / Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                    Mots-clés SEO & Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="fidget, tdah, concentration, bureau, spinnner, france"
                    className={`w-full px-4 py-3 rounded-xl text-xs font-mono ${cls.cardBg} border ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#ff4f00]`}
                  />
                  {formData.keywords && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {formData.keywords.split(",").map((k, idx) => (
                        <span key={idx} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                          #{k.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: 👁️ FULL LIVE PUBLIC ARTICLE PREVIEW
             ========================================================================= */}
          {editorTab === "preview" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#0b0b0f] border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl text-left">
                {/* Header Meta */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-extrabold text-[#ff4f00]">
                    <span>📖 L'ATELIER SPOOLIO</span>
                    <span>•</span>
                    <span className="text-gray-400">
                      {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] leading-tight">
                    {formData.title || "Titre de l'article"}
                  </h1>

                  {formData.excerpt && (
                    <p className="text-base text-gray-300 italic leading-relaxed border-l-2 border-[#ff4f00] pl-4">
                      {formData.excerpt}
                    </p>
                  )}
                </div>

                {/* Featured Image */}
                {formData.featuredImageUrl && (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                    <Image
                      src={formData.featuredImageUrl}
                      alt={formData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Article Body */}
                <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed space-y-4 pt-4 border-t border-white/10">
                  <div dangerouslySetInnerHTML={{ __html: formData.content || "<p>Contenu de l'article...</p>" }} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
