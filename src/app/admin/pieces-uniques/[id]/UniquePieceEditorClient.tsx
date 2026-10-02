"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/app/admin/AdminThemeContext";
import Link from "next/link";
import Image from "next/image";
import {
  getDefaultUniquePieceData,
  UniquePieceData,
  UniquePieceGalleryItem,
} from "@/lib/uniquePieceDefaults";
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  Star,
  Check,
  RefreshCw,
  Plus,
  Sparkles,
  ExternalLink,
  Layers,
  Film,
  Play,
  Video,
} from "lucide-react";
import { isVideoMedia, isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/mediaUtils";

interface UniquePieceEditorClientProps {
  pieceId: string;
  isNew?: boolean;
}

// Client-side WebP converter & dimension limiter (Images only)
async function processImageToWebP(file: File): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const targetFilename = `${baseName}.webp`;

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.FileReader) {
      return resolve({ blob: file, filename: file.name });
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window.Image || Image)();
      img.onload = () => {
        const MAX_DIM = 2048;
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

// Direct upload helper to /api/admin/upload (Supports images & videos)
async function uploadSingleFile(file: File): Promise<string> {
  const isVid = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name);
  let fileToUpload: File = file;
  if (!isVid) {
    const { blob, filename } = await processImageToWebP(file);
    fileToUpload = new File([blob], filename, { type: blob.type || "image/webp" });
  } else {
    // If video, check file size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(`La vidéo dépasse la taille maximale de 50 Mo (${(file.size / (1024 * 1024)).toFixed(1)} Mo).`);
    }
  }
  const formData = new FormData();
  formData.append("file", fileToUpload);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Erreur upload (${res.status})`);
  }

  const data = await res.json();
  const url = data.url || data.imageUrl;
  if (!url) {
    throw new Error("L'URL du fichier est introuvable.");
  }
  return url;
}

export default function UniquePieceEditorClient({
  pieceId,
  isNew = false,
}: UniquePieceEditorClientProps) {
  const router = useRouter();
  const { cls, theme } = useAdminTheme();

  // Basic Product fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("59.00");
  const [status, setStatus] = useState("publish");
  const [stock, setStock] = useState(1);
  const [image, setImage] = useState("/images/produits/monstre-skateur-fait-main.jpg");

  // Rich Unique Piece layout data
  const [uniqueData, setUniqueData] = useState<UniquePieceData>(getDefaultUniquePieceData(""));

  // Batch Image & Video Upload & Drag-and-Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    current: number;
    currentFileName: string;
    percent: number;
  } | null>(null);
  const [batchUploadSuccessMsg, setBatchUploadSuccessMsg] = useState("");
  const [batchUploadErrorMsg, setBatchUploadErrorMsg] = useState("");
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isHeroVideoUploading, setIsHeroVideoUploading] = useState(false);
  const [isVideoSectionUploading, setIsVideoSectionUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const heroVideoInputRef = useRef<HTMLInputElement>(null);
  const videoSectionInputRef = useRef<HTMLInputElement>(null);
  const replaceItemInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"hero" | "gallery" | "videoSection" | "savoirFaire" | "lore" | "specs" | "ecrin" | "faq">("hero");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load existing product
  useEffect(() => {
    if (isNew) {
      setName("Nouvelle Figurine Peinte à la Main");
      setSlug("nouvelle-figurine-peinte");
      setUniqueData(getDefaultUniquePieceData("Nouvelle Figurine"));
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const res = await fetch(`/api/admin/pieces-uniques?id=${pieceId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.product) {
            const p = json.product;
            setName(p.name || "");
            setSlug(p.slug || "");
            setPrice(p.price || "59.00");
            setStatus(p.status || "publish");
            setStock(typeof p.stock === "number" ? p.stock : 1);
            setImage(p.images?.[0]?.src || p.image || "/images/produits/monstre-skateur-fait-main.jpg");
            const baseDefaults = getDefaultUniquePieceData(p.name || "Pièce Unique");
            if (p.uniquePieceData) {
              setUniqueData({
                ...baseDefaults,
                ...p.uniquePieceData,
                gallery: p.uniquePieceData.gallery || baseDefaults.gallery,
              });
            } else {
              setUniqueData(baseDefaults);
            }
          }
        }
      } catch (err) {
        console.error("Error loading piece data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [pieceId, isNew]);

  // Batch Upload handler for gallery (images & videos)
  const handleBatchUpload = async (filesToUpload: FileList | File[]) => {
    const fileArray = Array.from(filesToUpload).filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type.startsWith("video/") ||
        /\.(png|jpe?g|webp|gif|avif|heic|bmp|mp4|webm|mov|m4v|avi|mkv)$/i.test(f.name)
    );

    if (fileArray.length === 0) {
      setBatchUploadErrorMsg(
        "Aucun fichier valide sélectionné (photos : JPG, PNG, WEBP, AVIF, HEIC ; vidéos : MP4, WEBM, MOV, M4V)."
      );
      return;
    }

    setIsUploadingBatch(true);
    setBatchUploadErrorMsg("");
    setBatchUploadSuccessMsg("");
    setUploadProgress({
      total: fileArray.length,
      current: 0,
      currentFileName: fileArray[0].name,
      percent: 0,
    });

    const newItems: UniquePieceGalleryItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const isVid = file.type.startsWith("video/") || isVideoMedia(file.name);
      setUploadProgress({
        total: fileArray.length,
        current: i + 1,
        currentFileName: file.name,
        percent: Math.round((i / fileArray.length) * 100),
      });

      try {
        const url = await uploadSingleFile(file);
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ")
          .trim();
        const formattedCaption = cleanName
          ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
          : `${isVid ? "Vidéo" : "Vue détaillée"} #${(uniqueData.gallery?.items || []).length + newItems.length + 1}`;

        newItems.push({
          src: url,
          caption: formattedCaption,
          alt: `${name || "Pièce Unique"} - ${formattedCaption}`,
          type: isVid ? "video" : "image",
        });
      } catch (err: any) {
        console.error(`Erreur upload ${file.name}:`, err);
        errors.push(`${file.name} : ${err.message}`);
      }

      setUploadProgress({
        total: fileArray.length,
        current: i + 1,
        currentFileName: file.name,
        percent: Math.round(((i + 1) / fileArray.length) * 100),
      });
    }

    if (newItems.length > 0) {
      setUniqueData((prev) => {
        const curGallery = prev.gallery || getDefaultUniquePieceData(name).gallery;
        return {
          ...prev,
          gallery: {
            ...curGallery,
            items: [...(curGallery.items || []), ...newItems],
          },
        };
      });

      // If current hero image is default placeholder or empty, and first item is an image, use it
      const firstImage = newItems.find((item) => item.type !== "video" && !isVideoMedia(item.src));
      if (firstImage && (!image || image === "/images/produits/monstre-skateur-fait-main.jpg")) {
        setImage(firstImage.src);
      }

      setBatchUploadSuccessMsg(
        `✓ ${newItems.length} média${newItems.length > 1 ? "s" : ""} (photos / vidéos) ajouté${newItems.length > 1 ? "s" : ""} à la galerie avec succès !`
      );
    }

    if (errors.length > 0) {
      setBatchUploadErrorMsg(`${errors.length} fichier(s) ont échoué : ${errors.join(", ")}`);
    }

    setIsUploadingBatch(false);
    setTimeout(() => {
      setUploadProgress(null);
    }, 3000);
  };

  // Upload handler for single Hero photo
  const handleHeroUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif|avif|heic|bmp)$/i.test(file.name)) {
      alert("Le fichier doit être une image.");
      return;
    }
    setIsHeroUploading(true);
    try {
      const url = await uploadSingleFile(file);
      setImage(url);
    } catch (e: any) {
      alert(`Erreur d'upload : ${e.message}`);
    } finally {
      setIsHeroUploading(false);
    }
  };

  // Upload handler for Hero video
  const handleHeroVideoUpload = async (file: File) => {
    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name)) {
      alert("Le fichier doit être une vidéo (MP4, WEBM, MOV).");
      return;
    }
    setIsHeroVideoUploading(true);
    try {
      const url = await uploadSingleFile(file);
      setUniqueData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          video: url,
        },
      }));
    } catch (e: any) {
      alert(`Erreur d'upload vidéo : ${e.message}`);
    } finally {
      setIsHeroVideoUploading(false);
    }
  };

  // Upload handler for Section Video
  const handleVideoSectionUpload = async (file: File) => {
    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name)) {
      alert("Le fichier doit être une vidéo (MP4, WEBM, MOV).");
      return;
    }
    setIsVideoSectionUploading(true);
    try {
      const url = await uploadSingleFile(file);
      setUniqueData((prev) => ({
        ...prev,
        videoSection: {
          ...(prev.videoSection || {}),
          enabled: true,
          videoUrl: url,
        },
      }));
    } catch (e: any) {
      alert(`Erreur d'upload vidéo : ${e.message}`);
    } finally {
      setIsVideoSectionUploading(false);
    }
  };

  // Replace single gallery item
  const handleReplaceItem = async (pIdx: number, file: File) => {
    try {
      const url = await uploadSingleFile(file);
      setUniqueData((prev) => {
        const curGallery = prev.gallery || getDefaultUniquePieceData(name).gallery;
        const items = [...(curGallery.items || [])];
        if (items[pIdx]) {
          items[pIdx] = { ...items[pIdx], src: url };
        }
        return {
          ...prev,
          gallery: { ...curGallery, items },
        };
      });
    } catch (e: any) {
      alert(`Erreur lors du remplacement de l'image : ${e.message}`);
    } finally {
      setReplacingIndex(null);
    }
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/pieces-uniques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isNew ? "new" : pieceId,
          name,
          slug,
          price,
          status,
          stock,
          image,
          uniquePieceData: uniqueData,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (json.product?.id && (isNew || pieceId === "999901")) {
          router.replace(`/admin/pieces-uniques/${json.product.id}`);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erreur lors de l'enregistrement");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">
        Chargement de la pièce d'atelier... 🎨
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-sans pb-28 space-y-6">
      {/* Sticky Top Header Bar */}
      <div className={`sticky top-20 z-30 ${cls.cardBg} border ${cls.border} rounded-2xl p-4 shadow-sm backdrop-blur-xl flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pieces-uniques"
            className={`p-2.5 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMuted} hover:${cls.textMain} transition-colors`}
            title="Retour à la liste"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#ff4f00]">
                Éditeur Pièce Unique
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                status === "publish" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {status === "publish" ? "Publié" : "Brouillon"}
              </span>
            </div>
            <h1 className={`text-lg sm:text-xl font-black ${cls.textMain} truncate max-w-md`}>
              {name || "Nouvelle Pièce Unique"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {slug && (
            <a
              href={`/product/${slug}`}
              target="_blank"
              rel="noreferrer"
              className={`px-4 py-2 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMuted} hover:${cls.textMain} text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs`}
            >
              <span>Voir sur le site</span>
              <span>↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              saveSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-[#ff4f00]/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {saving ? (
              <span>Enregistrement...</span>
            ) : saveSuccess ? (
              <span>✓ Enregistré !</span>
            ) : (
              <span>Enregistrer la fiche</span>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: "hero", label: "1. Hero & Identité", icon: "🖼️" },
          { id: "gallery", label: "2. Galerie Photos & Vidéos", icon: "📸" },
          { id: "videoSection", label: "3. Vidéo de la Fiche", icon: "🎥" },
          { id: "savoirFaire", label: "4. Savoir-Faire Artisanal", icon: "🖐️" },
          { id: "lore", label: "5. Histoire & Lore", icon: "🛹" },
          { id: "specs", label: "6. Fiche Technique", icon: "📐" },
          { id: "ecrin", label: "7. Écrin & Protection", icon: "🎁" },
          { id: "faq", label: "8. FAQ Fait Main", icon: "💬" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === tab.id
                ? "bg-[#ff4f00] border-[#ff4f00] text-white shadow-md shadow-[#ff4f00]/20 scale-[1.02]"
                : `${cls.cardBg} ${cls.border} ${cls.textMuted} hover:${cls.textMain} hover:border-[#ff4f00]/40 shadow-xs`
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* ONGLET 1 : HERO & IDENTITÉ                                   */}
      {/* ============================================================ */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
                Informations Principales
              </h3>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Nom de la création (Titre du Hero)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} font-bold focus:border-[#ff4f00] focus:outline-none"
                  placeholder="Gribouille le Skateur – Figurine Peinte à la Main"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Slug d'accès URL (/product/[slug])
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-mono focus:border-[#ff4f00] focus:outline-none"
                    placeholder="monstre-skateur-fait-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Prix de vente (€)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} font-black focus:border-[#ff4f00] focus:outline-none"
                    placeholder="59.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Statut de publication
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-bold focus:border-[#ff4f00] focus:outline-none"
                  >
                    <option value="publish">Publié (En ligne)</option>
                    <option value="draft">Brouillon (Invisible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Stock d'exemplaires
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-bold focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
                Surimpressions du Hero
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Badge de Catégorie
                  </label>
                  <input
                    type="text"
                    value={uniqueData.hero.badge}
                    onChange={(e) =>
                      setUniqueData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, badge: e.target.value },
                      }))
                    }
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                    Badge de Disponibilité
                  </label>
                  <input
                    type="text"
                    value={uniqueData.hero.availabilityBadge}
                    onChange={(e) =>
                      setUniqueData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, availabilityBadge: e.target.value },
                      }))
                    }
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} focus:border-[#ff4f00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Accroche sous le titre
                </label>
                <textarea
                  rows={2}
                  value={uniqueData.hero.punchline}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, punchline: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} focus:border-[#ff4f00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Micro-Pastilles de réassurance (Hero bar)
                </label>
                <div className="space-y-3">
                  {uniqueData.hero.microPerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={perk.icon}
                        onChange={(e) => {
                          const next = [...uniqueData.hero.microPerks];
                          next[i].icon = e.target.value;
                          setUniqueData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, microPerks: next },
                          }));
                        }}
                        className={`w-20 ${cls.inputBg} border ${cls.border} rounded-xl text-center py-2 text-xs ${cls.textMain} focus:border-[#ff4f00] focus:outline-none`}
                        placeholder="🎨"
                      />
                      <input
                        type="text"
                        value={perk.text}
                        onChange={(e) => {
                          const next = [...uniqueData.hero.microPerks];
                          next[i].text = e.target.value;
                          setUniqueData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, microPerks: next },
                          }));
                        }}
                        className="flex-1 ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2 text-xs ${cls.textMain}"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Preview & Uploader */}
          <div className="space-y-6">
            <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain}">
                  Photo Pleine Largeur
                </h3>
                <span className="text-[10px] font-bold text-zinc-400 ${cls.badgeBg} ${cls.textMuted} px-2.5 py-0.5 rounded-full border ${cls.border}">
                  Image Principale (Hero)
                </span>
              </div>

              {/* Drop / Preview Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsHeroDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsHeroDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsHeroDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsHeroDragging(false);
                  if (e.dataTransfer?.files?.[0]) {
                    handleHeroUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border-2 transition-all group ${
                  isHeroDragging
                    ? "border-[#ff4f00] ring-4 ring-[#ff4f00]/20 scale-[1.01]"
                    : `${cls.border} hover:border-[#ff4f00]/40`
                }`}
              >
                <Image
                  src={image || "/images/produits/monstre-skateur-fait-main.jpg"}
                  alt="Aperçu image hero"
                  fill
                  className="object-cover"
                />

                {isHeroUploading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                    <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
                    <span className="text-xs font-bold text-white">Téléversement & optimisation...</span>
                  </div>
                )}

                {/* Hover overlay button to trigger upload */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={isHeroUploading}
                    className="px-4 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#ff6524] text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Changer la photo</span>
                  </button>
                  <p className="text-[11px] text-zinc-300">
                    ou glissez-déposez une image ici
                  </p>
                </div>
              </div>

              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleHeroUpload(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />

              <button
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                disabled={isHeroUploading}
                className="w-full py-2.5 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#ff4f00]" />
                <span>Téléverser un nouveau fichier image</span>
              </button>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Chemin / URL de l'image (éditable)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-mono focus:border-[#ff4f00] focus:outline-none"
                  placeholder="/images/produits/monstre-skateur-fait-main.jpg"
                />
              </div>
            </div>

            {/* 2. Vidéo de Couverture (Optionnel - Fond Hero) */}
            <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#ff4f00]" />
                  <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain}">
                    Vidéo de Couverture
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 ${cls.badgeBg} ${cls.textMuted} px-2.5 py-0.5 rounded-full border ${cls.border}">
                  Optionnel (Fond Hero)
                </span>
              </div>

              <p className="text-xs ${cls.textMuted}">
                Remplace l'image statique en haut de page par une vidéo plein écran animée en boucle, avec contrôles son et pause.
              </p>

              {uniqueData.hero?.video ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 group">
                    <video
                      src={uniqueData.hero.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-[#ff4f00] flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      <span>Vidéo Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setUniqueData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, video: "" },
                        }))
                      }
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                      title="Retirer la vidéo de couverture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => heroVideoInputRef.current?.click()}
                      disabled={isHeroVideoUploading}
                      className="flex-1 py-2 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#ff4f00] ${isHeroVideoUploading ? "animate-spin" : ""}`} />
                      <span>{isHeroVideoUploading ? "Téléversement..." : "Changer la vidéo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setUniqueData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, video: "" },
                        }))
                      }
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => heroVideoInputRef.current?.click()}
                    className="aspect-video rounded-2xl border-2 border-dashed ${cls.border} ${cls.cardBg} hover:border-[#ff4f00]/50 hover:bg-[#ff4f00]/5 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                  >
                    {isHeroVideoUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
                        <span className="text-xs font-bold text-white">Téléversement de la vidéo...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#ff4f00] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Film className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-white">Ajouter une vidéo de couverture</span>
                        <span className="text-[11px] text-zinc-400 mt-1">MP4, WEBM, MOV (jusqu'à 50 Mo)</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <input
                ref={heroVideoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleHeroVideoUpload(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Chemin / URL directe de la vidéo
                </label>
                <input
                  type="text"
                  value={uniqueData.hero?.video || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUniqueData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, video: val },
                    }));
                  }}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2 text-xs ${cls.textMain} font-mono focus:border-[#ff4f00] focus:outline-none"
                  placeholder="/uploads/hero-video.mp4 ou https://..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 2 : GALERIE PHOTOS                                    */}
      {/* ============================================================ */}
      {activeTab === "gallery" && (
        <div className="space-y-6 max-w-5xl">
          {/* Card Header Settings */}
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain}">
                Configuration de la Carte Galerie
              </h3>
              <span className="text-xs ${cls.textMuted}">
                Affichée sous le bloc « Commande d'Atelier » sur la fiche publique
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.gallery?.badge || "📸 Galerie Photos"}
                  onChange={(e) => setUniqueData(prev => ({
                    ...prev,
                    gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), badge: e.target.value }
                  }))}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Titre de la carte</label>
                <input
                  type="text"
                  value={uniqueData.gallery?.title || "Vues Détaillées"}
                  onChange={(e) => setUniqueData(prev => ({
                    ...prev,
                    gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), title: e.target.value }
                  }))}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Description / Accroche</label>
              <textarea
                rows={2}
                value={uniqueData.gallery?.description || ""}
                onChange={(e) => setUniqueData(prev => ({
                  ...prev,
                  gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), description: e.target.value }
                }))}
                className="w-full ${cls.inputBg} border ${cls.border} rounded-xl p-3 text-xs ${cls.textMain} resize-none"
                placeholder="Explorez les finitions, les coups de pinceau et la patine sous tous les angles."
              />
            </div>
          </div>

          {/* Hidden file input for single media replacement */}
          <input
            ref={replaceItemInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0] && replacingIndex !== null) {
                handleReplaceItem(replacingIndex, e.target.files[0]);
                e.target.value = "";
              }
            }}
          />

          {/* Hidden file input for batch gallery upload */}
          <input
            ref={galleryFileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleBatchUpload(e.target.files);
                e.target.value = "";
              }
            }}
          />

          {/* Feedback Messages */}
          {batchUploadSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{batchUploadSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setBatchUploadSuccessMsg("")}
                className="text-emerald-400/70 hover:text-emerald-300 text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {batchUploadErrorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-red-400 shrink-0">⚠️</span>
                <span>{batchUploadErrorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setBatchUploadErrorMsg("")}
                className="text-red-400/70 hover:text-red-300 text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* ZONE DE DÉPÔT EN LOT (DRAG & DROP PHOTOS & VIDÉOS)          */}
          {/* ============================================================ */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                handleBatchUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => {
              if (!isUploadingBatch) {
                galleryFileInputRef.current?.click();
              }
            }}
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all cursor-pointer text-center group ${
              isDragging
                ? "border-[#ff4f00] bg-[#ff4f00]/10 scale-[1.01] shadow-lg shadow-[#ff4f00]/20 ring-4 ring-[#ff4f00]/10"
                : `${cls.border} ${cls.cardBg} hover:border-[#ff4f00]/60 hover:bg-[#ff4f00]/5 shadow-xs`
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 max-w-xl mx-auto">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging
                    ? "bg-[#ff4f00] text-white scale-110 shadow-lg shadow-[#ff4f00]/50"
                    : "bg-[#ff4f00]/10 text-[#ff4f00] group-hover:scale-110 group-hover:bg-[#ff4f00]/20"
                }`}
              >
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <h4 className={`text-base sm:text-lg font-black ${cls.textMain} tracking-wide`}>
                  {isDragging
                    ? "✨ Relâchez vos photos & vidéos pour lancer l'upload !"
                    : "Ajouter des photos & vidéos en lot (Drag & Drop)"}
                </h4>
                <p className="text-xs ${cls.textMuted} mt-1 max-w-md mx-auto">
                  Prenez vos 5, 10 ou 20 photos et vidéos depuis votre bureau et <strong className="text-zinc-200">déposez-les ici</strong> d'un coup, ou cliquez pour parcourir.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryFileInputRef.current?.click();
                  }}
                  disabled={isUploadingBatch}
                  className="px-5 py-2.5 rounded-xl bg-[#ff4f00] hover:bg-[#ff6524] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#ff4f00]/30 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Choisir mes fichiers (photos & vidéos)</span>
                </button>
              </div>

              {/* Badges Features */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-zinc-400">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#ff4f00]" />
                  <span>Optimisation & compression auto</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  🎥 Vidéos : MP4, WEBM, MOV (jusqu'à 50 Mo)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  📷 Photos : JPG, PNG, WEBP, AVIF, HEIC
                </span>
              </div>
            </div>

            {/* Upload Progress Overlay / Banner */}
            {uploadProgress && (
              <div className="mt-6 pt-6 border-t border-white/10 max-w-lg mx-auto text-left">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-[#ff4f00] animate-spin" />
                    <span>
                      Upload en cours : {uploadProgress.current} / {uploadProgress.total} fichier{uploadProgress.total > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="font-mono text-[#ff4f00] font-black">
                    {uploadProgress.percent}%
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff4f00] to-amber-500 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 mt-2 truncate font-mono">
                  Envoi de : {uploadProgress.currentFileName}
                </p>
              </div>
            )}
          </div>

          {/* Photos Management */}
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} flex items-center gap-2">
                  <span>Médias de la Galerie (Photos & Vidéos)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] text-xs font-black">
                    {(uniqueData.gallery?.items || []).length}
                  </span>
                </h3>
                <p className="text-xs ${cls.textMuted} mt-0.5">
                  Chaque média dispose d'un aperçu direct, d'une légende et d'un zoom plein écran dans la visionneuse.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={isUploadingBatch}
                  className="px-3.5 py-2 rounded-xl bg-[#ff4f00] hover:bg-[#ff6524] text-white text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter en lot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUniqueData((prev) => {
                      const curGallery = prev.gallery || getDefaultUniquePieceData(name).gallery;
                      return {
                        ...prev,
                        gallery: {
                          ...curGallery,
                          items: [
                            ...curGallery.items,
                            {
                              src: image || "/images/produits/monstre-skateur-fait-main.jpg",
                              caption: `Vue détaillée #${curGallery.items.length + 1}`,
                              alt: name || "Pièce Unique",
                              type: "image",
                            },
                          ],
                        },
                      };
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Ligne photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUniqueData((prev) => {
                      const curGallery = prev.gallery || getDefaultUniquePieceData(name).gallery;
                      return {
                        ...prev,
                        gallery: {
                          ...curGallery,
                          items: [
                            ...curGallery.items,
                            {
                              src: "",
                              caption: `Vidéo atelier #${curGallery.items.length + 1}`,
                              alt: name || "Pièce Unique",
                              type: "video",
                            },
                          ],
                        },
                      };
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>+ Ligne vidéo</span>
                </button>

                {(uniqueData.gallery?.items || []).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUS les médias de la galerie ?")) {
                        setUniqueData((prev) => ({
                          ...prev,
                          gallery: {
                            ...(prev.gallery || getDefaultUniquePieceData(name).gallery),
                            items: [],
                          },
                        }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Vider toute la galerie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tout vider</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Photo / Video Cards */}
            <div className="space-y-4">
              {(uniqueData.gallery?.items || []).map((photo, pIdx) => {
                const isVid = photo.type === "video" || isVideoMedia(photo.src);
                const isCurrentHero = !isVid && image && photo.src && image === photo.src;
                const isCurrentHeroVideo = isVid && uniqueData.hero?.video && uniqueData.hero.video === photo.src;

                return (
                  <div
                    key={`gallery-item-${pIdx}`}
                    className={`p-4 rounded-2xl ${cls.statusBg} border transition-all flex flex-col md:flex-row gap-4 items-start md:items-center ${
                      isCurrentHero || isCurrentHeroVideo ? "border-[#ff4f00]/50 bg-[#ff4f00]/5 dark:bg-[#ff4f00]/10" : cls.border
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black border border-white/15 shrink-0 group">
                      {isVid ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <video
                            src={photo.src}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Film className="w-6 h-6 text-white/80" />
                          </div>
                          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-[9px] font-black text-white shadow z-10 flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" />
                            <span>Vidéo</span>
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={photo.src || "/images/produits/monstre-skateur-fait-main.jpg"}
                          alt={photo.alt || `Photo ${pIdx + 1}`}
                          fill
                          className="object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white z-10">
                        #{pIdx + 1}
                      </span>
                      {isCurrentHero && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#ff4f00] text-[9px] font-black text-white shadow z-10 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Hero</span>
                        </span>
                      )}
                      {isCurrentHeroVideo && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#ff4f00] text-[9px] font-black text-white shadow z-10 flex items-center gap-0.5">
                          <Film className="w-2.5 h-2.5" />
                          <span>Hero Vidéo</span>
                        </span>
                      )}

                      {/* Open Link overlay */}
                      <a
                        href={photo.src}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        title="Ouvrir le fichier média"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Form Inputs */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div className="sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-zinc-400">
                              Chemin / URL du fichier {isVid ? "(Vidéo)" : "(Photo)"}
                            </label>
                            {/* Toggle type badge */}
                            <button
                              type="button"
                              onClick={() => {
                                const items = [...(uniqueData.gallery?.items || [])];
                                items[pIdx] = {
                                  ...items[pIdx],
                                  type: isVid ? "image" : "video",
                                };
                                setUniqueData((prev) => ({
                                  ...prev,
                                  gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                                }));
                              }}
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                isVid
                                  ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                  : "bg-white/5 border-white/10 text-zinc-400"
                              }`}
                              title="Cliquer pour changer le type média"
                            >
                              {isVid ? "🎥 Vidéo" : "📷 Photo"}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isVid ? (
                              <>
                                {!isCurrentHeroVideo && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setUniqueData((prev) => ({
                                        ...prev,
                                        hero: { ...prev.hero, video: photo.src },
                                      }))
                                    }
                                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                    title="Définir cette vidéo comme vidéo de fond du Hero"
                                  >
                                    <Film className="w-3 h-3" />
                                    <span>Couverture Hero</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUniqueData((prev) => ({
                                      ...prev,
                                      videoSection: {
                                        ...(prev.videoSection || {}),
                                        enabled: true,
                                        videoUrl: photo.src,
                                      },
                                    }))
                                  }
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                  title="Utiliser cette vidéo dans la section vidéo dédiée de la fiche"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Vidéo Fiche</span>
                                </button>
                              </>
                            ) : (
                              !isCurrentHero && (
                                <button
                                  type="button"
                                  onClick={() => setImage(photo.src)}
                                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                  title="Définir cette photo comme image principale du Hero"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Photo Hero</span>
                                </button>
                              )
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setReplacingIndex(pIdx);
                                replaceItemInputRef.current?.click();
                              }}
                              className="text-[10px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded hover:bg-white/10"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Remplacer</span>
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={photo.src}
                          onChange={(e) => {
                            const items = [...(uniqueData.gallery?.items || [])];
                            items[pIdx] = { ...items[pIdx], src: e.target.value };
                            setUniqueData((prev) => ({
                              ...prev,
                              gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                            }));
                          }}
                          className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} font-mono"
                          placeholder="/images/produits/monstre-skateur-fait-main.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                          Légende (affichée en pastille sous le média)
                        </label>
                        <input
                          type="text"
                          value={photo.caption || ""}
                          onChange={(e) => {
                            const items = [...(uniqueData.gallery?.items || [])];
                            items[pIdx] = { ...items[pIdx], caption: e.target.value };
                            setUniqueData((prev) => ({
                              ...prev,
                              gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                            }));
                          }}
                          className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain}"
                          placeholder={isVid ? "Clip vidéo atelier 360°" : "Gros plan sur les détails"}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                          Texte alternatif (SEO / a11y)
                        </label>
                        <input
                          type="text"
                          value={photo.alt || ""}
                          onChange={(e) => {
                            const items = [...(uniqueData.gallery?.items || [])];
                            items[pIdx] = { ...items[pIdx], alt: e.target.value };
                            setUniqueData((prev) => ({
                              ...prev,
                              gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                            }));
                          }}
                          className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain}"
                          placeholder="Vue du produit"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center">
                      {pIdx > 0 && (
                        <button
                          type="button"
                          title="Monter"
                          onClick={() => {
                            const items = [...(uniqueData.gallery?.items || [])];
                            const tmp = items[pIdx - 1];
                            items[pIdx - 1] = items[pIdx];
                            items[pIdx] = tmp;
                            setUniqueData((prev) => ({
                              ...prev,
                              gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                            }));
                          }}
                          className="p-2 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-colors cursor-pointer"
                        >
                          ↑
                        </button>
                      )}
                      {pIdx < (uniqueData.gallery?.items || []).length - 1 && (
                        <button
                          type="button"
                          title="Descendre"
                          onClick={() => {
                            const items = [...(uniqueData.gallery?.items || [])];
                            const tmp = items[pIdx + 1];
                            items[pIdx + 1] = items[pIdx];
                            items[pIdx] = tmp;
                            setUniqueData((prev) => ({
                              ...prev,
                              gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                            }));
                          }}
                          className="p-2 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-colors cursor-pointer"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        title="Supprimer cette photo"
                        onClick={() => {
                          const items = (uniqueData.gallery?.items || []).filter((_, i) => i !== pIdx);
                          setUniqueData((prev) => ({
                            ...prev,
                            gallery: { ...(prev.gallery || getDefaultUniquePieceData(name).gallery), items },
                          }));
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!uniqueData.gallery?.items || uniqueData.gallery.items.length === 0) && (
                <div className="py-12 text-center ${cls.textMuted} text-xs space-y-2 border ${cls.border} rounded-2xl ${cls.statusBg}">
                  <p className="text-zinc-400 font-bold">Aucune photo dans la galerie pour l'instant.</p>
                  <p className="text-[11px] text-zinc-500">
                    Glissez vos photos dans la zone ci-dessus ou cliquez sur « Ajouter en lot » pour commencer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3 : VIDÉO DE LA FICHE (MAKING-OF / DÉMO)             */}
      {/* ============================================================ */}
      {activeTab === "videoSection" && (
        <div className="space-y-6 max-w-4xl">
          {/* Main Activation Card */}
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#ff4f00]" />
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Vidéo Dédiée dans la Fiche Produit
                  </h3>
                </div>
                <p className="text-xs ${cls.textMuted} max-w-xl">
                  Affiche une section cinéma immersive dans la fiche produit pour montrer la figurine en 360°, son making-of ou son déballage.
                </p>
              </div>

              {/* Toggle Enable */}
              <button
                type="button"
                onClick={() =>
                  setUniqueData((prev) => ({
                    ...prev,
                    videoSection: {
                      ...(prev.videoSection || {}),
                      enabled: !prev.videoSection?.enabled,
                    },
                  }))
                }
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                  uniqueData.videoSection?.enabled
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : `${cls.inputBg} ${cls.border} ${cls.textMuted} hover:${cls.textMain}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${uniqueData.videoSection?.enabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                <span>{uniqueData.videoSection?.enabled ? "Section Active sur la fiche" : "Section Désactivée"}</span>
              </button>
            </div>

            {/* Video File Uploader & URL */}
            <div className="pt-2 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Fichier Vidéo (MP4, MOV, WEBM ou lien YouTube)
                </label>
                {uniqueData.videoSection?.videoUrl && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Vidéo configurée
                  </span>
                )}
              </div>

              {/* Live Video Preview if URL exists */}
              {uniqueData.videoSection?.videoUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                    {isYouTubeUrl(uniqueData.videoSection.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(uniqueData.videoSection.videoUrl) || ""}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={uniqueData.videoSection.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setUniqueData((prev) => ({
                          ...prev,
                          videoSection: { ...(prev.videoSection || {}), videoUrl: "" },
                        }))
                      }
                      className="absolute top-3 right-3 p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                      title="Supprimer la vidéo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => videoSectionInputRef.current?.click()}
                      disabled={isVideoSectionUploading}
                      className="flex-1 py-2.5 rounded-xl ${cls.inputBg} hover:${cls.hoverRow} border ${cls.border} ${cls.textMain} text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#ff4f00] ${isVideoSectionUploading ? "animate-spin" : ""}`} />
                      <span>{isVideoSectionUploading ? "Téléversement..." : "Remplacer par un autre fichier vidéo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setUniqueData((prev) => ({
                          ...prev,
                          videoSection: { ...(prev.videoSection || {}), videoUrl: "" },
                        }))
                      }
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => videoSectionInputRef.current?.click()}
                  className="aspect-video max-h-72 rounded-2xl border-2 border-dashed border-white/15 bg-black/40 hover:border-[#ff4f00]/50 hover:bg-black/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                >
                  {isVideoSectionUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 text-[#ff4f00] animate-spin" />
                      <span className="text-xs font-bold text-white">Téléversement de la vidéo en cours...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#ff4f00]/10 text-[#ff4f00] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Film className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-bold text-white">Glissez ou cliquez pour téléverser votre vidéo</span>
                      <span className="text-xs ${cls.textMuted} mt-1">MP4, MOV, WEBM (jusqu'à 50 Mo) ou collez un lien YouTube ci-dessous</span>
                    </>
                  )}
                </div>
              )}

              <input
                ref={videoSectionInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleVideoSectionUpload(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Ou URL directe / Lien YouTube
                </label>
                <input
                  type="text"
                  value={uniqueData.videoSection?.videoUrl || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUniqueData((prev) => ({
                      ...prev,
                      videoSection: {
                        ...(prev.videoSection || {}),
                        videoUrl: val,
                        enabled: val ? true : prev.videoSection?.enabled,
                      },
                    }));
                  }}
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-mono focus:border-[#ff4f00] focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=... ou /uploads/video.mp4"
                />
              </div>
            </div>
          </div>

          {/* Texts & Features Configuration */}
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Textes de la Section Vidéo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.videoSection?.badge ?? "🎥 Making-of & Présentation"}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      videoSection: {
                        ...(prev.videoSection || {}),
                        badge: e.target.value,
                      },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                  placeholder="🎥 Making-of & Présentation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Titre</label>
                <input
                  type="text"
                  value={uniqueData.videoSection?.title ?? "Découvrez la création en mouvement"}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      videoSection: {
                        ...(prev.videoSection || {}),
                        title: e.target.value,
                      },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                  placeholder="Découvrez la création en mouvement"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Description / Histoire du clip</label>
              <textarea
                rows={3}
                value={uniqueData.videoSection?.description ?? ""}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    videoSection: {
                      ...(prev.videoSection || {}),
                      description: e.target.value,
                    },
                  }))
                }
                className="w-full ${cls.inputBg} border ${cls.border} rounded-xl p-3 text-xs ${cls.textMain} resize-none"
                placeholder="Un aperçu en direct de notre processus de sculpture et peinture..."
              />
            </div>

            {/* Highlights / Features points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold ${cls.textMuted}">
                  Points forts affichés à côté du lecteur vidéo (jusqu'à 4 points)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const cur = uniqueData.videoSection?.features || [];
                    setUniqueData((prev) => ({
                      ...prev,
                      videoSection: {
                        ...(prev.videoSection || {}),
                        features: [...cur, `Point clé #${cur.length + 1}`],
                      },
                    }));
                  }}
                  className="text-xs font-bold text-[#ff4f00] hover:underline cursor-pointer"
                >
                  + Ajouter un point
                </button>
              </div>

              <div className="space-y-2">
                {(uniqueData.videoSection?.features || [
                  "Vue 360° des finitions et des détails peints",
                  "Mise en situation réelle à l'atelier",
                  "Couleurs et vernis sous lumière naturelle",
                ]).map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <span className="text-zinc-500 font-bold text-xs">#{fIdx + 1}</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const cur = [...(uniqueData.videoSection?.features || [])];
                        cur[fIdx] = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          videoSection: {
                            ...(prev.videoSection || {}),
                            features: cur,
                          },
                        }));
                      }}
                      className="flex-1 ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain}"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = (uniqueData.videoSection?.features || []).filter((_, i) => i !== fIdx);
                        setUniqueData((prev) => ({
                          ...prev,
                          videoSection: {
                            ...(prev.videoSection || {}),
                            features: cur,
                          },
                        }));
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 4 : LE SAVOIR-FAIRE ARTISANAL                         */}
      {/* ============================================================ */}
      {activeTab === "savoirFaire" && (
        <div className="space-y-6 max-w-4xl">
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Carte Savoir-Faire (En-tête)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.savoirFaire.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      savoirFaire: { ...prev.savoirFaire, badge: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.savoirFaire.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      savoirFaire: { ...prev.savoirFaire, title: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Introduction</label>
              <textarea
                rows={2}
                value={uniqueData.savoirFaire.intro}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    savoirFaire: { ...prev.savoirFaire, intro: e.target.value },
                  }))
                }
                className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
              />
            </div>
          </div>

          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Les 4 Étapes de Fabrication
            </h3>

            <div className="space-y-4">
              {uniqueData.savoirFaire.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff4f00]/20 text-[#ff4f00] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const next = [...uniqueData.savoirFaire.steps];
                        next[idx].title = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          savoirFaire: { ...prev.savoirFaire, steps: next },
                        }));
                      }}
                      className="flex-1 ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-1.5 text-xs ${cls.textMain} font-bold"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const next = [...uniqueData.savoirFaire.steps];
                      next[idx].description = e.target.value;
                      setUniqueData((prev) => ({
                        ...prev,
                        savoirFaire: { ...prev.savoirFaire, steps: next },
                      }));
                    }}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain}"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                Citation / Mot de l'artisan en bas de carte
              </label>
              <input
                type="text"
                value={uniqueData.savoirFaire.quote}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    savoirFaire: { ...prev.savoirFaire, quote: e.target.value },
                  }))
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-amber-300 italic"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 3 : HISTOIRE & LORE DU PERSONNAGE                     */}
      {/* ============================================================ */}
      {activeTab === "lore" && (
        <div className="space-y-6 max-w-4xl">
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Histoire de la Création
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.lore.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, badge: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Nom du personnage / de l'œuvre
                </label>
                <input
                  type="text"
                  value={uniqueData.lore.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, title: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold ${cls.textMuted}">
                  Paragraphes du récit
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setUniqueData((prev) => ({
                      ...prev,
                      lore: { ...prev.lore, paragraphs: [...prev.lore.paragraphs, ""] },
                    }))
                  }
                  className="text-xs text-[#ff4f00] font-bold hover:underline"
                >
                  + Ajouter un paragraphe
                </button>
              </div>

              <div className="space-y-3">
                {uniqueData.lore.paragraphs.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const next = [...uniqueData.lore.paragraphs];
                        next[idx] = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          lore: { ...prev.lore, paragraphs: next },
                        }));
                      }}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-300"
                    />
                    {uniqueData.lore.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = uniqueData.lore.paragraphs.filter((_, i) => i !== idx);
                          setUniqueData((prev) => ({
                            ...prev,
                            lore: { ...prev.lore, paragraphs: next },
                          }));
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 text-sm"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 4 : FICHE TECHNIQUE                                   */}
      {/* ============================================================ */}
      {activeTab === "specs" && (
        <div className="space-y-6 max-w-4xl">
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Fiche Technique d'Atelier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.specs.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: { ...prev.specs, badge: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.specs.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: { ...prev.specs, title: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold ${cls.textMuted}">
                  Caractéristiques Clé / Valeur
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setUniqueData((prev) => ({
                      ...prev,
                      specs: {
                        ...prev.specs,
                        items: [...prev.specs.items, { label: "Nouvelle spec", value: "Valeur" }],
                      },
                    }))
                  }
                  className="text-xs text-[#ff4f00] font-bold hover:underline"
                >
                  + Ajouter une caractéristique
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueData.specs.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 ${cls.statusBg} border ${cls.border} rounded-xl space-y-2 relative group">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...uniqueData.specs.items];
                        next[idx].label = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-[11px] font-bold text-zinc-400 uppercase focus:outline-none focus:border-[#ff4f00]"
                      placeholder="Libellé"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const next = [...uniqueData.specs.items];
                        next[idx].value = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="w-full bg-transparent text-sm font-black text-white focus:outline-none"
                      placeholder="Valeur"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = uniqueData.specs.items.filter((_, i) => i !== idx);
                        setUniqueData((prev) => ({
                          ...prev,
                          specs: { ...prev.specs, items: next },
                        }));
                      }}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 5 : ÉCRIN & EXPÉDITION                                */}
      {/* ============================================================ */}
      {activeTab === "ecrin" && (
        <div className="space-y-6 max-w-4xl">
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain} mb-2">
              Écrin & Protection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Badge</label>
                <input
                  type="text"
                  value={uniqueData.ecrin.badge}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, badge: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Titre de la Carte</label>
                <input
                  type="text"
                  value={uniqueData.ecrin.title}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, title: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain} font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">Description</label>
              <textarea
                rows={2}
                value={uniqueData.ecrin.intro}
                onChange={(e) =>
                  setUniqueData((prev) => ({
                    ...prev,
                    ecrin: { ...prev.ecrin, intro: e.target.value },
                  }))
                }
                className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-xs ${cls.textMain}"
              />
            </div>

            <div>
              <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                Les 4 Points du Packaging
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueData.ecrin.points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 ${cls.statusBg} border ${cls.border} p-2.5 rounded-xl">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const next = [...uniqueData.ecrin.points];
                        next[idx] = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          ecrin: { ...prev.ecrin, points: next },
                        }));
                      }}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Méthode d'Expédition
                </label>
                <input
                  type="text"
                  value={uniqueData.ecrin.shippingMethod}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, shippingMethod: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2 text-xs ${cls.textMain}"
                />
              </div>

              <div>
                <label className="block text-xs font-bold ${cls.textMuted} mb-1.5">
                  Origine d'Atelier
                </label>
                <input
                  type="text"
                  value={uniqueData.ecrin.origin}
                  onChange={(e) =>
                    setUniqueData((prev) => ({
                      ...prev,
                      ecrin: { ...prev.ecrin, origin: e.target.value },
                    }))
                  }
                  className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2 text-xs ${cls.textMain} font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONGLET 6 : QUESTIONS FRÉQUENTES FAIT MAIN                    */}
      {/* ============================================================ */}
      {activeTab === "faq" && (
        <div className="space-y-6 max-w-4xl">
          <div className="${cls.cardBg} border ${cls.border} rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider ${cls.textMain}">
                  Foire Aux Questions Spécifique Fait Main
                </h3>
                <p className="text-xs ${cls.textMuted} mt-0.5">
                  Répondez précisément aux questions sur la fragilité, l'entretien et l'exclusivité.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUniqueData((prev) => ({
                    ...prev,
                    faq: {
                      ...prev.faq,
                      items: [...prev.faq.items, { q: "Nouvelle question ?", a: "Réponse..." }],
                    },
                  }))
                }
                className="px-3.5 py-2 rounded-xl bg-[#ff4f00] text-white text-xs font-bold hover:bg-[#ff6524] transition-all cursor-pointer"
              >
                + Ajouter une question
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {uniqueData.faq.items.map((item, idx) => (
                <div key={idx} className="p-4 ${cls.statusBg} border ${cls.border} rounded-xl space-y-2.5 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => {
                        const next = [...uniqueData.faq.items];
                        next[idx].q = e.target.value;
                        setUniqueData((prev) => ({
                          ...prev,
                          faq: { ...prev.faq, items: next },
                        }));
                      }}
                      className="flex-1 ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-1.5 text-xs ${cls.textMain} font-bold focus:border-[#ff4f00] focus:outline-none"
                      placeholder="Question..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = uniqueData.faq.items.filter((_, i) => i !== idx);
                        setUniqueData((prev) => ({
                          ...prev,
                          faq: { ...prev.faq, items: next },
                        }));
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 text-xs"
                      title="Supprimer la question"
                    >
                      ✕
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={(e) => {
                      const next = [...uniqueData.faq.items];
                      next[idx].a = e.target.value;
                      setUniqueData((prev) => ({
                        ...prev,
                        faq: { ...prev.faq, items: next },
                      }));
                    }}
                    className="w-full ${cls.inputBg} border ${cls.border} rounded-xl px-3 py-2 text-xs ${cls.textMain} focus:border-[#ff4f00] focus:outline-none"
                    placeholder="Réponse détaillée..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
