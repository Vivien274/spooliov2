"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Package,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Palette,
  Sparkles,
  ArrowRight,
  Search,
  Check,
  Layers,
  UploadCloud,
  Film,
  ImageIcon,
  FileVideo,
} from "lucide-react";
import { Drop, DropTheme } from "@/lib/drops";

// Convert client-side any image (PNG, JPG, HEIC, etc.) to optimized WebP format
async function processImageToWebP(file: File): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const targetFilename = `${baseName}.webp`;

  return new Promise((resolve) => {
    // If it's not a standard web-renderable image, or if canvas fails, return original
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1920;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ blob: file, filename: file.name });
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, filename: targetFilename });
            } else {
              resolve({ blob: file, filename: file.name });
            }
          },
          "image/webp",
          0.88
        );
      };
      img.onerror = () => resolve({ blob: file, filename: file.name });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ blob: file, filename: file.name });
    reader.readAsDataURL(file);
  });
}

interface ProductSummary {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  inStock: boolean;
}

const THEME_PRESETS: { name: string; icon: string; theme: DropTheme }[] = [
  {
    name: "Spooky Halloween 🎃",
    icon: "🎃",
    theme: {
      bgColor: "linear-gradient(135deg, #180b2b 0%, #0d0617 100%)",
      textColor: "#ffffff",
      subtitleColor: "#d8b4fe",
      accentColor: "#ff5500",
      badgeBgColor: "rgba(255, 85, 0, 0.2)",
      badgeTextColor: "#ff9a62",
      cardBgColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(216, 180, 254, 0.2)",
      titleFont: "var(--font-permanent-marker)",
      buttonBgColor: "#ff5500",
      buttonTextColor: "#ffffff",
    },
  },
  {
    name: "Festival Summer ☀️",
    icon: "☀️",
    theme: {
      bgColor: "linear-gradient(135deg, #04243a 0%, #021422 100%)",
      textColor: "#ffffff",
      subtitleColor: "#7dd3fc",
      accentColor: "#38bdf8",
      badgeBgColor: "rgba(56, 189, 248, 0.2)",
      badgeTextColor: "#7dd3fc",
      cardBgColor: "rgba(255, 255, 255, 0.07)",
      borderColor: "rgba(56, 189, 248, 0.25)",
      titleFont: "var(--font-righteous)",
      buttonBgColor: "#0284c7",
      buttonTextColor: "#ffffff",
    },
  },
  {
    name: "Cyber Violet ⚡",
    icon: "⚡",
    theme: {
      bgColor: "linear-gradient(135deg, #18112e 0%, #0d081b 100%)",
      textColor: "#ffffff",
      subtitleColor: "#c4b5fd",
      accentColor: "#a855f7",
      badgeBgColor: "rgba(168, 85, 247, 0.2)",
      badgeTextColor: "#d8b4fe",
      cardBgColor: "rgba(255, 255, 255, 0.07)",
      borderColor: "rgba(168, 85, 247, 0.25)",
      titleFont: "var(--font-antonio)",
      buttonBgColor: "#9333ea",
      buttonTextColor: "#ffffff",
    },
  },
  {
    name: "Spoolio Orange Signature 🎨",
    icon: "🔥",
    theme: {
      bgColor: "#ffffff",
      textColor: "#09090b",
      subtitleColor: "#52525b",
      accentColor: "#ff4f00",
      badgeBgColor: "rgba(255, 79, 0, 0.12)",
      badgeTextColor: "#ff4f00",
      cardBgColor: "#f4f4f5",
      borderColor: "rgba(228, 228, 231, 0.9)",
      titleFont: "var(--font-antonio)",
      buttonBgColor: "#ff4f00",
      buttonTextColor: "#ffffff",
    },
  },
  {
    name: "Minimalist Black 🖤",
    icon: "🖤",
    theme: {
      bgColor: "#09090b",
      textColor: "#ffffff",
      subtitleColor: "#a1a1aa",
      accentColor: "#f4f4f5",
      badgeBgColor: "rgba(255, 255, 255, 0.15)",
      badgeTextColor: "#ffffff",
      cardBgColor: "rgba(255, 255, 255, 0.06)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      titleFont: "var(--font-outfit)",
      buttonBgColor: "#ffffff",
      buttonTextColor: "#09090b",
    },
  },
];

const FONT_OPTIONS = [
  { label: "Antonio (Athletic / Condensé)", value: "var(--font-antonio)" },
  { label: "Permanent Marker (Grunge / Street / Graffiti)", value: "var(--font-permanent-marker)" },
  { label: "Righteous (Rétro Cyber / Futuriste)", value: "var(--font-righteous)" },
  { label: "DynaPuff (Bulle / Playful / 3D Toy)", value: "var(--font-dynapuff)" },
  { label: "Outfit (Moderne & Épuré)", value: "var(--font-outfit)" },
  { label: "Plus Jakarta Sans (Lisible & Neutre)", value: "var(--font-plus-jakarta)" },
];

export default function AdminDropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "ended">("all");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit / Create Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDropId, setEditingDropId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields: Two-part drop title (DROP 1 + Nom du Drop)
  const [dropNumber, setDropNumber] = useState("DROP 4");
  const [dropName, setDropName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [quote, setQuote] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">("upcoming");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [badge, setBadge] = useState("Drop • Série Limitée");
  const [editionSize, setEditionSize] = useState<number | "">(40);
  const [bannerImage, setBannerImage] = useState("/images/produits/monstre-skateur-fait-main.jpg");
  const [bannerVideo, setBannerVideo] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [theme, setTheme] = useState<DropTheme>({ ...THEME_PRESETS[0].theme });

  // Upload States
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string | null>(null);
  const [showManualImage, setShowManualImage] = useState(false);
  const [showManualVideo, setShowManualVideo] = useState(false);

  // Product picker filter
  const [productSearch, setProductSearch] = useState("");

  const fetchDropsAndProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drops");
      if (res.ok) {
        const data = await res.json();
        setDrops(data.drops || []);
        setProducts(data.products || []);
      } else {
        setStatusMessage({ type: "error", text: "Impossible de charger les données des drops." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropsAndProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ("dataTransfer" in e && e.dataTransfer?.files?.[0]) {
      file = e.dataTransfer.files[0];
    } else if ("target" in e && (e.target as HTMLInputElement).files?.[0]) {
      file = (e.target as HTMLInputElement).files![0];
    }
    if (!file) return;

    setImageUploading(true);
    setImageUploadStatus("Conversion WebP haute qualité...");
    try {
      const { blob, filename } = await processImageToWebP(file);
      setImageUploadStatus("Téléversement sur le serveur...");
      const formData = new FormData();
      formData.append("file", blob, filename);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setBannerImage(data.url);
        setImageUploadStatus("Image convertie en WebP et enregistrée !");
        setTimeout(() => setImageUploadStatus(null), 3500);
      } else {
        throw new Error(data.error || "Échec du téléversement de l'image");
      }
    } catch (err: any) {
      setImageUploadStatus(`Erreur : ${err.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ("dataTransfer" in e && e.dataTransfer?.files?.[0]) {
      file = e.dataTransfer.files[0];
    } else if ("target" in e && (e.target as HTMLInputElement).files?.[0]) {
      file = (e.target as HTMLInputElement).files![0];
    }
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setVideoUploadStatus("Erreur : La vidéo dépasse la limite de 50 Mo.");
      return;
    }

    setVideoUploading(true);
    setVideoUploadStatus("Téléversement et transcodage MP4 H.264 web optimisé...");
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setBannerVideo(data.url);
        setVideoUploadStatus("Vidéo encodée en streaming MP4 et enregistrée !");
        setTimeout(() => setVideoUploadStatus(null), 3500);
      } else {
        throw new Error(data.error || "Échec du téléversement de la vidéo");
      }
    } catch (err: any) {
      setVideoUploadStatus(`Erreur : ${err.message}`);
    } finally {
      setVideoUploading(false);
    }
  };

  const resetForm = () => {
    setEditingDropId(null);
    const nextNum = drops.length + 1;
    setDropNumber(`DROP ${nextNum}`);
    setDropName("");
    setTitle("");
    setSlug("");
    setTagline("");
    setQuote("");
    setDescription("");
    setStatus("upcoming");
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    nextWeek.setMinutes(0, 0, 0);
    setStartDate(nextWeek.toISOString().slice(0, 16));
    setEndDate("");
    setBadge("Drop • Série Limitée");
    setEditionSize(40);
    setBannerImage("/images/produits/monstre-skateur-fait-main.jpg");
    setBannerVideo("");
    setSelectedProductIds([]);
    setTheme({ ...THEME_PRESETS[0].theme });
    setImageUploadStatus(null);
    setVideoUploadStatus(null);
    setShowManualImage(false);
    setShowManualVideo(false);
    setIsFormOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (drop: Drop) => {
    setEditingDropId(drop.id);
    const dNum = drop.dropNumber || (drop.title?.startsWith("DROP") ? drop.title.split(" — ")[0] : "DROP");
    const dName = drop.dropName || (drop.title?.includes(" — ") ? drop.title.split(" — ").slice(1).join(" — ") : drop.title);
    setDropNumber(dNum);
    setDropName(dName);
    setTitle(drop.title);
    setSlug(drop.slug);
    setTagline(drop.tagline || "");
    setQuote(drop.quote || "");
    setDescription(drop.description || "");
    setStatus(drop.status);
    setStartDate(drop.startDate ? new Date(drop.startDate).toISOString().slice(0, 16) : "");
    setEndDate(drop.endDate ? new Date(drop.endDate).toISOString().slice(0, 16) : "");
    setBadge(drop.badge || "Drop • Série Limitée");
    setEditionSize(drop.editionSize || "");
    setBannerImage(drop.bannerImage || "");
    setBannerVideo(drop.bannerVideo || "");
    setSelectedProductIds(drop.productIds || []);
    setTheme(drop.theme || { ...THEME_PRESETS[0].theme });
    setImageUploadStatus(null);
    setVideoUploadStatus(null);
    setShowManualImage(false);
    setShowManualVideo(false);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const fullTitle = dropNumber && dropName ? `${dropNumber.trim()} — ${dropName.trim()}` : (dropName.trim() || dropNumber.trim());

    const payload: Partial<Drop> = {
      id: editingDropId || `drop-${Date.now()}`,
      slug: slug.trim() || undefined,
      dropNumber: dropNumber.trim() || undefined,
      dropName: dropName.trim() || undefined,
      title: fullTitle,
      tagline: tagline.trim(),
      quote: quote.trim() || undefined,
      description: description.trim(),
      status,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      badge: badge.trim(),
      editionSize: editionSize ? Number(editionSize) : undefined,
      bannerImage: bannerImage.trim(),
      bannerVideo: bannerVideo.trim() || undefined,
      productIds: selectedProductIds,
      theme,
    };

    try {
      const res = await fetch("/api/admin/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDrops(data.drops);
        setStatusMessage({ type: "success", text: data.message || "Drop enregistré avec succès !" });
        resetForm();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Erreur lors de l'enregistrement." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Erreur réseau." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (drop: Drop) => {
    const nextStatus = drop.status === "upcoming" ? "live" : drop.status === "live" ? "ended" : "upcoming";
    try {
      const res = await fetch("/api/admin/drops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: drop.id, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDrops(data.drops);
        setStatusMessage({ type: "success", text: `Statut du drop "${drop.title}" changé en "${nextStatus}".` });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Erreur lors de la mise à jour." });
    }
  };

  const handleDeleteDrop = async (drop: Drop) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le drop "${drop.title}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/drops?id=${drop.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDrops(data.drops);
        setStatusMessage({ type: "success", text: "Drop supprimé avec succès." });
        if (editingDropId === drop.id) resetForm();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Erreur lors de la suppression." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Erreur réseau." });
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const filteredDrops = drops.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/20 text-[#ff4f00] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Gestion des Séries Limitées</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
            Drops &amp; Éditions Éphémères ⚡
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Planifiez vos lancements, associez vos produits et personnalisez l'univers visuel (couleurs, polices, compte à rebours).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/drops"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all shadow-2xs"
          >
            <Eye className="w-4 h-4 text-zinc-500" />
            <span>Page Publique</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>

          {!isFormOpen && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#ff4f00]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Drop</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Section (Create or Edit) */}
      {isFormOpen && (
        <div className="rounded-3xl bg-white border border-zinc-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h2 className="text-xl font-black text-zinc-950 uppercase font-[family-name:var(--font-antonio)]">
                {editingDropId ? "Modifier le Drop" : "Créer un Nouveau Drop"}
              </h2>
              <p className="text-xs text-zinc-500">
                Configurez le contenu, les produits et l'identité visuelle du drop.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveDrop} className="space-y-8">
            
            {/* Grid 2 Columns: General Info & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
                  1. Informations Générales
                </h3>

                {/* Two-part Drop Title: DROP 1 + Nom du Drop */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Numéro / Préfixe <span className="text-[#ff4f00]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dropNumber}
                      onChange={(e) => setDropNumber(e.target.value)}
                      placeholder="Ex: DROP 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono font-bold focus:outline-none focus:border-[#ff4f00]"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Police fixe mono/technique</p>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nom du Drop <span className="text-[#ff4f00]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dropName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDropName(val);
                        if (!editingDropId) {
                          setSlug(
                            val
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }
                      }}
                      placeholder="Ex: Spooky Workshop 🎃"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold focus:outline-none focus:border-[#ff4f00]"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Ce texte prend la police personnalisée choisie ci-dessous</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Slug URL (identifiant web)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-zinc-100 border border-r-0 border-zinc-200 rounded-l-xl text-xs text-zinc-500 font-mono">
                      /drops/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="spooky-workshop"
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-zinc-200 text-sm font-mono focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Drop #04 • Série Limitée"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tirage Atelier (pcs)
                    </label>
                    <input
                      type="number"
                      value={editionSize}
                      onChange={(e) => setEditionSize(e.target.value ? Number(e.target.value) : "")}
                      placeholder="40"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Sous-titre / Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Série exclusive imprimée dans nos filaments d'exception."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                {/* Banner Image: Real Upload with Auto-WebP Conversion */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-700">
                      Image de Couverture / Bannière (Convertie en WebP) <span className="text-[#ff4f00]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualImage(!showManualImage)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                    >
                      {showManualImage ? "Masquer URL" : "URL manuelle"}
                    </button>
                  </div>

                  {/* Real File Dropzone */}
                  <div className="relative border-2 border-dashed border-zinc-200 hover:border-[#ff4f00]/60 rounded-2xl p-4 bg-zinc-50/70 hover:bg-orange-50/20 transition-all text-center group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      {imageUploading ? (
                        <RefreshCw className="w-6 h-6 text-[#ff4f00] animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-[#ff4f00] group-hover:scale-110 transition-transform" />
                      )}
                      <div className="text-xs font-bold text-zinc-800">
                        {imageUploading ? "Conversion & Téléversement en cours..." : "Glisser-déposer ou cliquer pour importer une image"}
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        PNG, JPG, HEIC, WEBP • Conversion automatique au format <strong>WebP ultra-optimisé</strong>
                      </p>
                    </div>
                  </div>

                  {imageUploadStatus && (
                    <div className="text-[11px] font-mono text-[#ff4f00] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{imageUploadStatus}</span>
                    </div>
                  )}

                  {bannerImage && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-100 border border-zinc-200">
                      <img src={bannerImage} alt="Aperçu" className="w-12 h-10 object-cover rounded-lg shrink-0 border border-zinc-300" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-mono text-zinc-700 truncate">{bannerImage}</p>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Image active (optimisée)</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {showManualImage && (
                    <input
                      type="text"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="/images/produits/... ou https://..."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#ff4f00]"
                    />
                  )}
                </div>

                {/* Banner Video: Real Upload with Auto-MP4 Web Optimization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-700">
                      Vidéo Teaser / Miniature (Optimisée en MP4 streaming)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualVideo(!showManualVideo)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                    >
                      {showManualVideo ? "Masquer URL" : "URL manuelle"}
                    </button>
                  </div>

                  {/* Real Video Dropzone */}
                  <div className="relative border-2 border-dashed border-zinc-200 hover:border-[#ff4f00]/60 rounded-2xl p-4 bg-zinc-50/70 hover:bg-orange-50/20 transition-all text-center group cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={videoUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      {videoUploading ? (
                        <RefreshCw className="w-6 h-6 text-[#ff4f00] animate-spin" />
                      ) : (
                        <Film className="w-6 h-6 text-[#ff4f00] group-hover:scale-110 transition-transform" />
                      )}
                      <div className="text-xs font-bold text-zinc-800">
                        {videoUploading ? "Encodage & Optimisation MP4 streaming..." : "Glisser-déposer ou cliquer pour téléverser une vidéo"}
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        MP4, MOV, WEBM (jusqu'à 50 Mo) • Convertie automatiquement en <strong>MP4 H.264 streaming rapide</strong>
                      </p>
                    </div>
                  </div>

                  {videoUploadStatus && (
                    <div className="text-[11px] font-mono text-[#ff4f00] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{videoUploadStatus}</span>
                    </div>
                  )}

                  {bannerVideo && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 border border-zinc-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <video src={bannerVideo} muted loop playsInline className="w-12 h-10 object-cover rounded-lg shrink-0 border border-zinc-300" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono text-zinc-700 truncate">{bannerVideo}</p>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Vidéo streaming active</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBannerVideo("")}
                        className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 cursor-pointer"
                        title="Supprimer la vidéo"
                      >
                        Retirer
                      </button>
                    </div>
                  )}

                  {showManualVideo && (
                    <input
                      type="text"
                      value={bannerVideo}
                      onChange={(e) => setBannerVideo(e.target.value)}
                      placeholder="https://.../video.mp4 ou /videos/mon-drop.mp4"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#ff4f00]"
                    />
                  )}
                </div>
              </div>

              {/* Timing & Story */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
                  2. Statut &amp; Histoire
                </h3>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Statut Actuel du Drop
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold bg-white focus:outline-none focus:border-[#ff4f00]"
                  >
                    <option value="upcoming">⏳ À Venir (Compte à rebours actif)</option>
                    <option value="live">🟢 En Direct (Vente ouverte maintenant)</option>
                    <option value="ended">📦 Archivé / Sold Out</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Date &amp; Heure de Lancement
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Date de Clôture (optionnel)
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center justify-between">
                    <span>Citation d'Atelier (Pull Quote mise en avant, optionnel)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Encadrée de guillemets géants</span>
                  </label>
                  <input
                    type="text"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Ex: Chaque pièce est tirée en une seule salve dans nos filaments d'exception..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Histoire &amp; Description du Drop
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Racontez la genèse de cette série, les filaments utilisés, le tirage numéroté..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>
              </div>

            </div>

            {/* Product Selector Section */}
            <div className="space-y-4 pt-6 border-t border-zinc-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)]">
                    3. Produits inclus dans ce Drop ({selectedProductIds.length} sélectionné{selectedProductIds.length > 1 ? "s" : ""})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Cochez les créations de la boutique qui apparaîtront sur la fiche de ce drop.
                  </p>
                </div>

                {/* Search input for products */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filtrer les produits..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>
              </div>

              {/* Scrollable Products Grid */}
              <div className="max-h-64 overflow-y-auto p-3 rounded-2xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProductSelection(p.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                        isSelected
                          ? "bg-orange-50/80 border-[#ff4f00] shadow-xs"
                          : "bg-white border-zinc-200/80 hover:border-zinc-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0 relative">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-400 m-auto" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>{p.price}</span>
                          <span>•</span>
                          <span className="truncate">{p.category}</span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#ff4f00] border-[#ff4f00] text-white"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Identity & Theme Customizer */}
            <div className="space-y-6 pt-6 border-t border-zinc-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-tight font-[family-name:var(--font-antonio)] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#ff4f00]" />
                    <span>4. Identité Visuelle &amp; Thème du Drop</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Appliquez un preset en 1 clic ou personnalisez finement les couleurs et polices.
                  </p>
                </div>

                {/* Presets Row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mr-1">
                    Presets :
                  </span>
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setTheme({ ...preset.theme })}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Customization Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                
                {/* Title Font */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center justify-between">
                    <span>Police du « Nom du Drop » (Identity Typography)</span>
                    <span className="text-[10px] text-[#ff4f00] font-mono">Le préfixe reste fixe</span>
                  </label>
                  <select
                    value={theme.titleFont || "var(--font-antonio)"}
                    onChange={(e) => setTheme({ ...theme, titleFont: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm font-bold bg-white focus:outline-none focus:border-[#ff4f00]"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Background color / gradient */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Fond du bloc (Couleur HEX ou Dégradé CSS)
                  </label>
                  <input
                    type="text"
                    value={theme.bgColor || "#ffffff"}
                    onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                    placeholder="linear-gradient(...) ou #180b2b"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#ff4f00]"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Couleur Titre / Texte
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.textColor && theme.textColor.startsWith("#") ? theme.textColor : "#ffffff"}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.textColor || "#ffffff"}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Subtitle Color */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Couleur Sous-titre
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.subtitleColor && theme.subtitleColor.startsWith("#") ? theme.subtitleColor : "#d8b4fe"}
                      onChange={(e) => setTheme({ ...theme, subtitleColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.subtitleColor || "#d8b4fe"}
                      onChange={(e) => setTheme({ ...theme, subtitleColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Couleur d'Accent (Boutons, timer)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accentColor && theme.accentColor.startsWith("#") ? theme.accentColor : "#ff4f00"}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          accentColor: e.target.value,
                          buttonBgColor: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.accentColor || "#ff4f00"}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Couleur de Bordure
                  </label>
                  <input
                    type="text"
                    value={theme.borderColor || "rgba(228, 228, 231, 0.9)"}
                    onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono"
                  />
                </div>

              </div>

              {/* Live Preview of the Drop Block */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aperçu en Direct (Disposition Inversée : Contenus à gauche, Image à droite)</span>
                </span>

                <div
                  className="rounded-3xl border shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all p-2"
                  style={{
                    background: theme.bgColor || "#ffffff",
                    borderColor: theme.borderColor || "rgba(228, 228, 231, 0.9)",
                  }}
                >
                  {/* Left Column Preview (Contenu à gauche) */}
                  <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block"
                        style={{
                          backgroundColor: theme.badgeBgColor || "rgba(255, 79, 0, 0.2)",
                          color: theme.badgeTextColor || theme.accentColor || "#ff4f00",
                        }}
                      >
                        {badge || "Drop • Série Limitée"}
                      </span>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-mono font-black uppercase tracking-widest text-[#ff4f00]">
                          {dropNumber || "DROP 1"}
                        </span>
                        <h3
                          className="text-xl sm:text-2xl font-black uppercase leading-tight"
                          style={{
                            fontFamily: theme.titleFont || "var(--font-antonio)",
                            color: theme.textColor || "#09090b",
                          }}
                        >
                          {dropName || "Nom du Drop d'Atelier"}
                        </h3>
                      </div>

                      <p
                        className="text-xs font-medium leading-relaxed"
                        style={{ color: theme.subtitleColor || "#52525b" }}
                      >
                        {tagline || "Sous-titre et descriptif du drop en quelques mots."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div
                        className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow"
                        style={{
                          backgroundColor: theme.buttonBgColor || theme.accentColor || "#ff4f00",
                          color: theme.buttonTextColor || "#ffffff",
                        }}
                      >
                        Découvrir les Produits
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: theme.subtitleColor || "#71717a" }}
                      >
                        {selectedProductIds.length} création(s)
                      </span>
                    </div>
                  </div>

                  {/* Right Column Preview (Image ou Vidéo à droite) */}
                  <div className="lg:col-span-5 relative aspect-16/10 rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center">
                    {bannerVideo ? (
                      <video
                        src={bannerVideo}
                        poster={bannerImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : bannerImage ? (
                      <img src={bannerImage} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-zinc-500" />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-white uppercase flex items-center gap-1">
                      {bannerVideo && <span>🎥</span>}
                      <span>{status === "live" ? "En Direct" : status === "upcoming" ? "À Venir" : "Archivé"}</span>
                    </div>
                    {editionSize && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur text-[10px] font-mono font-bold text-white">
                        {editionSize} pcs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#e04500] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ff4f00]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingDropId ? "Mettre à jour le Drop" : "Enregistrer le Drop"}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Drops List Section */}
      <div className="space-y-4">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold w-fit">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "all" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Tous ({drops.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "upcoming" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              À Venir ({drops.filter((d) => d.status === "upcoming").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("live")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "live" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              En Direct ({drops.filter((d) => d.status === "live").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ended")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "ended" ? "bg-white text-zinc-950 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Archivés ({drops.filter((d) => d.status === "ended").length})
            </button>
          </div>

          <span className="text-xs text-zinc-500 font-mono">
            {filteredDrops.length} drop{filteredDrops.length > 1 ? "s" : ""} affiché{filteredDrops.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Drops Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDrops.map((drop) => {
            const isUpcoming = drop.status === "upcoming";
            const isLive = drop.status === "live";

            return (
              <div
                key={drop.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left info with preview */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-16 rounded-xl bg-zinc-900 overflow-hidden shrink-0 relative border border-zinc-200">
                    {drop.bannerVideo ? (
                      <video
                        src={drop.bannerVideo}
                        poster={drop.bannerImage}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={drop.bannerImage}
                        alt={drop.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {drop.bannerVideo && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5">
                        <span>▶</span>
                        <span>Vidéo</span>
                      </span>
                    )}
                    {drop.editionSize && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-mono text-white font-bold">
                        {drop.editionSize}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff4f00]">
                        {drop.badge}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        /drops/{drop.slug}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 truncate">
                      {drop.dropNumber && (
                        <span className="text-xs font-mono font-black uppercase text-[#ff4f00] shrink-0">
                          {drop.dropNumber}
                        </span>
                      )}
                      <h3
                        className="text-base font-bold text-zinc-950 truncate"
                        style={{ fontFamily: drop.theme?.titleFont || "var(--font-antonio)" }}
                      >
                        {drop.dropName || drop.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {new Date(drop.startDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        {drop.productIds.length} produit{drop.productIds.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(drop)}
                    title="Cliquer pour faire défiler le statut (À venir -> En direct -> Archivé)"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-2xs ${
                      isLive
                        ? "bg-emerald-500 text-white"
                        : isUpcoming
                        ? "bg-[#ff4f00] text-white"
                        : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                    }`}
                  >
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    <span>{isLive ? "En Direct" : isUpcoming ? "À Venir" : "Archivé"}</span>
                  </button>

                  {/* Public link */}
                  <Link
                    href={`/drops/${drop.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                    title="Voir la page publique du drop"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(drop)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Modifier</span>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDrop(drop)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer ce drop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}

          {filteredDrops.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white border border-zinc-200 space-y-3">
              <Package className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">Aucun drop trouvé</p>
              <p className="text-xs text-zinc-400">
                Créez votre premier drop en cliquant sur "+ Nouveau Drop".
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
