"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "../../AdminThemeContext";
import WysiwygEditor from "@/components/WysiwygEditor";
import { parseNoiseLevel, formatNoiseLevelText } from "@/lib/sensoryUtils";
import { isVideoMedia, isYouTubeUrl, getYouTubeThumbnail } from "@/lib/mediaUtils";
import { computeSeoScore } from "@/lib/seoUtils";

const CATEGORIES = [
  "Accessoires & Petits Objets",
  "Animaux & Figurines",
  "Les Fidgets",
  "Geek & Gaming",
  "Jeux & Activités",
  "Les Gadgetoïds",
];

interface ProductData {
  id?: number;
  name: string;
  nameEn?: string;
  slug: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  tags: string[];
  price: string;
  salePrice: string;
  productType: string;
  status: string;
  stock: number;
  metaTitle: string;
  metaTitleEn?: string;
  metaDescription: string;
  metaDescriptionEn?: string;
  showInSensoryCompass?: boolean;
  sensoryNoiseLevel?: string;
  sensorySize?: string;
  sensoryCategory?: string;
  sensoryProfiles?: string[];
  images: { id: number; src: string; alt: string }[];
  variations: { attribute: string; values: string; price: string }[];
  attributes?: {
    attributes: { name: string; options: string[]; controlType?: string }[];
    variationPrices: { combination: Record<string, string>; price: string; imageSrc?: string }[];
  };
}

interface Props {
  productId: string;
  isNew: boolean;
}

function SectionCard({ title, icon, children, cardBg, border, textMain }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
  cardBg: string; border: string; textMain: string;
}) {
  return (
    <div className={`${cardBg} border ${border} rounded-3xl p-6 flex flex-col gap-5 transition-colors`}>
      <div className={`flex items-center gap-3 pb-4 border-b ${border}`}>
        <span className="text-[#ff4f00]">{icon}</span>
        <h2 className={`text-sm font-bold ${textMain} uppercase tracking-widest font-antonio`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", inputBg, border, textMain, textMuted }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
  inputBg: string; border: string; textMain: string; textMuted: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold ${textMuted} uppercase tracking-wider`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBg} border ${border} rounded-xl px-4 py-2.5 text-sm ${textMain} placeholder-gray-400 focus:outline-none focus:border-[#2F3CD9]/50 transition-colors`}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 4, inputBg, border, textMain, textMuted }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
  inputBg: string; border: string; textMain: string; textMuted: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold ${textMuted} uppercase tracking-wider`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputBg} border ${border} rounded-xl px-4 py-2.5 text-sm ${textMain} placeholder-gray-400 focus:outline-none focus:border-[#2F3CD9]/50 transition-colors resize-none leading-relaxed`}
      />
    </div>
  );
}

export default function ProductFormClient({ productId, isNew }: Props) {
  const { cls, theme } = useAdminTheme();
  const router = useRouter();
  const [loadingProduct, setLoadingProduct] = useState<boolean>(!isNew);
  const [form, setForm] = useState<ProductData>({
    name: "",
    nameEn: "",
    slug: "",
    shortDescription: "",
    shortDescriptionEn: "",
    description: "",
    descriptionEn: "",
    category: "",
    tags: [],
    price: "",
    salePrice: "",
    productType: "simple",
    status: "draft",
    stock: -1,
    metaTitle: "",
    metaTitleEn: "",
    metaDescription: "",
    metaDescriptionEn: "",
    images: [],
    variations: [],
    attributes: { attributes: [], variationPrices: [] },
  });
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeImageDropdownIdx, setActiveImageDropdownIdx] = useState<number | null>(null);

  const slugify = (str: string): string => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  };

  // Predefined attributes & dynamic categories states
  const [predefinedAttributes, setPredefinedAttributes] = useState<{ id: number; name: string; values: string; controlType?: string }[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchPredefined = async () => {
      try {
        const res = await fetch("/api/admin/attributes");
        if (res.ok) {
          const data = await res.json();
          setPredefinedAttributes(data.attributes || []);
        }
      } catch (e) {
        console.error("Failed to load preset attributes:", e);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          setDynamicCategories(data.categories || []);
        }
      } catch (e) {
        console.error("Failed to load dynamic categories:", e);
      }
    };

    const fetchProductDetails = async () => {
      if (isNew) return;
      try {
        const res = await fetch(`/api/admin/products?id=${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            const normalizedProduct = { ...data.product };
            if (normalizedProduct.attributes) {
              try {
                let attrData = typeof normalizedProduct.attributes === "string"
                  ? JSON.parse(normalizedProduct.attributes)
                  : normalizedProduct.attributes;
                
                const decodeHtml = (str: string) => {
                  if (!str) return "";
                  return str
                    .replace(/&#039;/g, "'")
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&nbsp;/g, " ");
                };

                // Convert flat WooCommerce attributes array to Spoolio V2 object structure
                if (attrData && Array.isArray(attrData)) {
                  attrData = {
                    attributes: attrData.map((a: any) => ({
                      name: decodeHtml(a.name || ""),
                      options: a.options || (a.values ? a.values.split(",").map((v: string) => v.trim()) : []),
                      controlType: a.controlType || "default"
                    })),
                    variationPrices: []
                  };
                } else {
                  // Standard Spoolio V2 object structure normalization
                  if (attrData && Array.isArray(attrData.attributes)) {
                    attrData.attributes = attrData.attributes.map((a: any) => ({
                      ...a,
                      name: decodeHtml(a.name)
                    }));
                  }

                  if (attrData && Array.isArray(attrData.variationPrices)) {
                    attrData.variationPrices = attrData.variationPrices.map((vp: any) => {
                      const normCombination: Record<string, string> = {};
                      Object.entries(vp.combination || {}).forEach(([key, val]) => {
                        normCombination[decodeHtml(key)] = decodeHtml(String(val));
                      });
                      return { ...vp, combination: normCombination };
                    });
                  }
                }

                normalizedProduct.attributes = attrData;
              } catch (e) {
                console.error("Error parsing/normalizing product attributes in admin:", e);
              }
            }

            // Extract single category name string from categories array relation
            if (typeof normalizedProduct.category === "string" && normalizedProduct.category !== "") {
              // Already set as a string by the api
            } else if (normalizedProduct.categories && normalizedProduct.categories.length > 0) {
              normalizedProduct.category = normalizedProduct.categories[0].name || "";
            } else {
              normalizedProduct.category = "";
            }

            // Normalize sensory fields for Admin Form hydration
            normalizedProduct.showInSensoryCompass = typeof normalizedProduct.showInSensoryCompass === "boolean"
              ? normalizedProduct.showInSensoryCompass
              : Boolean(normalizedProduct.show_in_sensory_compass);
            normalizedProduct.sensoryNoiseLevel = normalizedProduct.sensoryNoiseLevel || normalizedProduct.sensory_noise_level || "silent";
            normalizedProduct.sensorySize = normalizedProduct.sensorySize || normalizedProduct.sensory_size || "pocket";
            normalizedProduct.sensoryCategory = normalizedProduct.sensoryCategory || normalizedProduct.sensory_category || "manipuler";
            normalizedProduct.sensoryProfiles = Array.isArray(normalizedProduct.sensoryProfiles) && normalizedProduct.sensoryProfiles.length > 0
              ? normalizedProduct.sensoryProfiles
              : (normalizedProduct.sensory_profiles
                  ? (Array.isArray(normalizedProduct.sensory_profiles) ? normalizedProduct.sensory_profiles : String(normalizedProduct.sensory_profiles).split(',').map((s: string) => s.trim()))
                  : []);

            setForm(normalizedProduct);
          }
        } else {
          alert("Erreur lors de la récupération des détails du produit.");
        }
      } catch (e) {
        console.error("Failed to load product details:", e);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchPredefined();
    fetchCategories();
    fetchProductDetails();
  }, [productId, isNew]);

  // Image upload states & ref
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas toBlob returned null"));
              }
            },
            "image/webp",
            0.82
          );
        };
        img.onerror = () => reject(new Error("Failed to load image element"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File) => {
    // Maximum direct upload size limit for serverless HTTP POST requests (4.5MB)
    const MAX_FILE_SIZE_MB = 4.5;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(
        `⚠️ Fichier trop volumineux (${fileSizeMB} Mo)\n\n` +
        `Pour des raisons de limites serveur (Vercel / Next.js), le téléversement direct est limité à ${MAX_FILE_SIZE_MB} Mo par fichier.\n\n` +
        `Solutions pour votre vidéo :\n` +
        `1. Compressez la vidéo sous ${MAX_FILE_SIZE_MB} Mo (ex: avec Handbrake, CapCut ou Clideo — une vidéo web courte 720p pèse généralement 2-3 Mo).\n` +
        `2. Ou hébergez la vidéo sur YouTube, Cloudinary, Vercel Blob ou un Drive, puis utilisez l'option "+ Ajouter par URL".`
      );
      return;
    }

    setIsUploadingImage(true);
    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        const webpBlob = await convertToWebP(file);
        fileToUpload = new File([webpBlob], `${file.name.split(".")[0] || "image"}_optimized.webp`, {
          type: "image/webp"
        });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      const responseText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        // Response wasn't valid JSON (e.g. plain text or HTML error from server proxy)
      }

      if (res.ok && data?.imageUrl) {
        const newImage = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          src: data.imageUrl,
          alt: form.name || "Média produit"
        };
        setForm(prev => ({ ...prev, images: [...prev.images, newImage] }));
      } else {
        let errorMsg = data?.error;
        if (!errorMsg) {
          if (res.status === 413 || responseText.includes("Request Entity Too Large")) {
            errorMsg = "Le fichier dépasse la limite serveur de 4,5 Mo pour l'import direct. Veuillez la compresser sous 4 Mo ou utiliser l'option '+ Ajouter par URL'.";
          } else {
            errorMsg = `Erreur serveur (${res.status}) : ${responseText.slice(0, 150) || 'Erreur inconnue'}`;
          }
        }
        alert(`Erreur d'upload : ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Upload media error:", err);
      alert(`Erreur lors du traitement du média : ${err.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (id: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
  };

  const seoScore = computeSeoScore(form);
  const seoColor = seoScore >= 75 ? "#059669" : seoScore >= 50 ? "#f59e0b" : "#dc2626";

  const set = <K extends keyof ProductData>(key: K) => (value: ProductData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addTag = (rawInput?: string) => {
    const textToProcess = rawInput !== undefined ? rawInput : newTag;
    if (!textToProcess || !textToProcess.trim()) return;

    // Split by commas, semicolons, pipes, or newlines
    const candidateTags = textToProcess
      .split(/[,;\n|]+/)
      .map(t => t.trim().replace(/^["']|["']$/g, ""))
      .filter(t => t.length > 0);

    if (candidateTags.length === 0) return;

    const updatedTags = [...form.tags];
    let addedCount = 0;

    for (const tag of candidateTags) {
      if (!updatedTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        updatedTags.push(tag);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      set("tags")(updatedTags);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => set("tags")(form.tags.filter((t) => t !== tag));

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [aiSeoAdvice, setAiSeoAdvice] = useState<string[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiUse, setAiUse] = useState<string>("");
  const [aiTarget, setAiTarget] = useState<string>("");
  const [aiFeatures, setAiFeatures] = useState<string>("");
  const [aiDetails, setAiDetails] = useState<string>("");

  const handleTranslateProduct = async () => {
    if (!form.name.trim()) {
      alert("Veuillez saisir au moins le nom du produit avant de lancer la traduction.");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch("/api/admin/translate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          shortDescription: form.shortDescription,
          description: form.description,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(prev => ({
          ...prev,
          nameEn: data.nameEn || prev.nameEn,
          shortDescriptionEn: data.shortDescriptionEn || prev.shortDescriptionEn,
          descriptionEn: data.descriptionEn || prev.descriptionEn,
          metaTitleEn: data.metaTitleEn || prev.metaTitleEn,
          metaDescriptionEn: data.metaDescriptionEn || prev.metaDescriptionEn
        }));
        alert("✨ Traduction anglaise générée avec succès par l'IA !");
      } else {
        alert(data.error || "Erreur lors de la traduction.");
      }
    } catch (e) {
      alert("Erreur réseau lors de la communication avec l'API de traduction.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.name.trim()) {
      alert("Veuillez saisir le nom du produit avant de lancer la génération.");
      return;
    }
    setIsGenerating(true);
    setIsAiModalOpen(false); // Close the modal upon starting generation
    try {
      const res = await fetch("/api/admin/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          shortDescription: form.shortDescription,
          category: form.category,
          aiUse,
          aiTarget,
          aiFeatures,
          aiDetails
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(prev => ({
          ...prev,
          description: data.description || prev.description,
          metaTitle: data.seoTitle || prev.metaTitle,
          metaDescription: data.seoMetaDesc || prev.metaDescription
        }));
        if (data.seoAdvice) {
          setAiSeoAdvice(data.seoAdvice);
        }
      } else {
        alert(data.error || "Erreur de génération.");
      }
    } catch (e) {
      alert("Erreur réseau lors de la communication avec l'API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addVariation = () =>
    set("variations")([...form.variations, { attribute: "", values: "", price: "" }]);

  const updateVariation = (idx: number, field: keyof typeof form.variations[0], value: string) => {
    const updated = form.variations.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    set("variations")(updated);
  };

  const handleSave = async () => {
    const targetId = isNew ? "new" : (form.id || productId);
    if (!targetId) {
      alert("Impossible de sauvegarder un nouveau produit pour l'instant (ID manquant).");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        if (isNew && data.product) {
          router.push(`/admin/products/${data.product.id || data.product.slug}`);
        } else {
          router.refresh();
        }
        setTimeout(() => setSaved(false), 2500);
      } else {
        const errorData = await res.json();
        alert(`Erreur lors de la sauvegarde : ${errorData.error || 'Erreur'}${errorData.details ? ` (${errorData.details})` : ''}`);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Erreur réseau lors de la sauvegarde : ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-sans">
        <div className={`text-xs ${cls.textMuted} uppercase tracking-widest font-black animate-pulse`}>
          Chargement du produit... 📦
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>
              {isNew ? "Nouveau produit" : form.name || "Modifier le produit"}
            </h1>
            {!isNew && (
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                form.status === "publish"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              }`}>
                {form.status === "publish" ? "Publié" : "Brouillon"}
              </span>
            )}
          </div>
          <p className={`text-sm ${cls.textMuted}`}>
            {isNew ? "Renseignez les informations du nouveau produit." : `ID #${form.id} · /${form.slug}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={form.status}
            onChange={(e) => set("status")(e.target.value)}
            className={`${cls.cardBg} border ${cls.border} text-sm ${cls.textMuted} rounded-xl px-3 py-2 focus:outline-none cursor-pointer`}
          >
            <option value="draft">Brouillon</option>
            <option value="publish">Publier</option>
          </select>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
              isSaving
                ? "bg-[#2F3CD9] text-white opacity-90 cursor-wait shadow-md"
                : saved
                ? "bg-emerald-500 text-white"
                : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5"
            }`}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sauvegarde en cours...</span>
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sauvegardé</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Sauvegarder</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - main form */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Informations de base */}
            <SectionCard
              title="Informations de base"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              <InputField
                label="Nom du produit"
                value={form.name}
                onChange={(v) => {
                  set("name")(v);
                  set("slug")(slugify(v));
                }}
                placeholder="Ex: Fidget Iris Mécanique"
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Slug (URL)</label>
                <div className={`flex items-center gap-2 ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5`}>
                  <span className={`text-xs ${cls.textFaint}`}>spoolio.fr/product/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => set("slug")(e.target.value)}
                    className={`flex-1 bg-transparent text-sm ${cls.textMain} focus:outline-none`}
                    placeholder="badge-nfc-goofy"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category")(e.target.value)}
                  className={`${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} focus:outline-none focus:border-[#2F3CD9]/50 transition-colors cursor-pointer`}
                >
                  <option value="">— Choisir une catégorie —</option>
                  {dynamicCategories.length > 0 ? (
                    dynamicCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  ) : (
                    CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
                </select>
                {(() => {
                  const isFidgetCat = (form.category || "").toLowerCase().includes("fidget");
                  if (!isFidgetCat) return null;

              return (
                <SectionCard
                  title="Boussole Sensorielle & Critères Fidgets"
                  icon={<span className="text-lg">🧭</span>}
                  cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
                >
                  {/* Checkbox Visibilité */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      id="showInSensoryCompass"
                      checked={!!form.showInSensoryCompass}
                      onChange={(e) => setForm(prev => ({ ...prev, showInSensoryCompass: e.target.checked }))}
                      className="w-5 h-5 accent-[#ff4f00] rounded cursor-pointer"
                    />
                    <label htmlFor="showInSensoryCompass" className="flex flex-col cursor-pointer">
                      <span className={`text-sm font-bold ${cls.textMain}`}>Afficher ce produit dans la Boussole Sensorielle 🧭</span>
                      <span className={`text-xs ${cls.textMuted}`}>Active la recommandation interactive pour les visiteurs cherchant des fidgets</span>
                    </label>
                  </div>

                  {/* Critères Sensoriels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">

                    {/* Niveau de Bruit (Barre de Slide) */}
                    <div className="flex flex-col gap-2.5 sm:col-span-2 bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider flex items-center gap-2`}>
                          <span>🔊 Niveau de Bruit (Crans de 1 à 10) :</span>
                        </label>
                        <span className="font-extrabold text-sm text-[#ff4f00]">
                          {formatNoiseLevelText(parseNoiseLevel(form.sensoryNoiseLevel))}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={parseNoiseLevel(form.sensoryNoiseLevel)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm(prev => ({ ...prev, sensoryNoiseLevel: val }));
                        }}
                        className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4f00]"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-neutral-400 px-1 pt-1 select-none">
                        <span className="cursor-pointer hover:text-white" onClick={() => setForm(prev => ({ ...prev, sensoryNoiseLevel: "1" }))}>1 (Silencieux)</span>
                        <span className="cursor-pointer hover:text-white" onClick={() => setForm(prev => ({ ...prev, sensoryNoiseLevel: "5" }))}>5 (Clic doux)</span>
                        <span className="cursor-pointer hover:text-white" onClick={() => setForm(prev => ({ ...prev, sensoryNoiseLevel: "10" }))}>10 (Ultra sonore)</span>
                      </div>
                    </div>

                    {/* Compacité / Format (Segmented Control) */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Compacité / Format 📏</label>
                      <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                        {[
                          { id: "pocket", icon: "📏", label: "Poche / Porte-clé", sub: "1 main discret" },
                          { id: "medium", icon: "🖥️", label: "Moyen / Bureau", sub: "Main complète" },
                          { id: "large", icon: "🤲", label: "Grand Format", sub: "Deux mains" },
                        ].map((item) => {
                          const isSelected = (form.sensorySize || "pocket") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, sensorySize: item.id }))}
                              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer text-center select-none ${
                                isSelected
                                  ? "bg-[#ff4f00] text-white font-extrabold shadow-md shadow-[#ff4f00]/30"
                                  : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-bold">{item.icon} {item.label}</span>
                              <span className="text-[10px] opacity-80 mt-0.5">{item.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Type de manipulation (Segmented Control) */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Type de manipulation sensorielle 🤲</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                        {[
                          { id: "cliquer", icon: "🎯", label: "Cliquer" },
                          { id: "manipuler", icon: "🌀", label: "Manipuler" },
                          { id: "resoudre", icon: "🧩", label: "Résoudre" },
                          { id: "tourner", icon: "🔄", label: "Tourner / Spinner" },
                          { id: "presser", icon: "🧽", label: "Presser / Antistress" },
                          { id: "toucher", icon: "✨", label: "Toucher / Texture" },
                        ].map((item) => {
                          const isSelected = (form.sensoryCategory || "cliquer") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, sensoryCategory: item.id }))}
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer text-xs font-bold select-none ${
                                isSelected
                                  ? "bg-[#2F3CD9] text-white font-extrabold shadow-md shadow-[#2F3CD9]/30"
                                  : "text-neutral-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Profils & Besoins */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Besoins & Profils ciblés 🧠</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "tdah", label: "TDAH (Hyperactivité & Besoins moteurs)" },
                          { id: "anxiety", label: "Anxiété & Anti-stress" },
                          { id: "focus", label: "Focus & Concentration intense" },
                          { id: "autism", label: "Autisme & Stimulation sensorielle (TSA)" },
                        ].map((profile) => {
                          const currentProfiles = Array.isArray(form.sensoryProfiles) ? form.sensoryProfiles : [];
                          const isChecked = currentProfiles.includes(profile.id);

                          return (
                            <label key={profile.id} className="flex items-center gap-2 text-xs cursor-pointer select-none bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...currentProfiles, profile.id]
                                    : currentProfiles.filter((p: string) => p !== profile.id);
                                  setForm(prev => ({ ...prev, sensoryProfiles: updated }));
                                }}
                                className="w-4 h-4 accent-[#ff4f00] rounded"
                              />
                              <span className={cls.textMain}>{profile.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              );
            })()}
              </div>
            </SectionCard>

            {/* 2. Descriptions */}
            <SectionCard
              title="Descriptions"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Description courte</label>
                <WysiwygEditor
                  value={form.shortDescription}
                  onChange={(v) => set("shortDescription")(v)}
                  placeholder="Une phrase accrocheuse de présentation du produit…"
                  theme={theme}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Description longue</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.name.trim()) {
                        alert("Veuillez saisir le nom du produit avant de lancer la génération.");
                        return;
                      }
                      setIsAiModalOpen(true);
                    }}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isGenerating ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      )}
                    </svg>
                    {isGenerating ? "Optimisation..." : "Optimiser avec l'IA (SEO)"}
                  </button>
                </div>
                <WysiwygEditor
                  value={form.description}
                  onChange={(v) => set("description")(v)}
                  placeholder="Description détaillée du produit, matériaux, usage, dimensions…"
                  theme={theme}
                />
                <p className={`text-[11px] ${cls.textFaint}`}>{form.description.replace(/<[^>]+>/g, "").length} caractères</p>
              </div>
            </SectionCard>

            {/* 2b. Traduction Anglaise (EN 🇬🇧) */}
            <SectionCard
              title="Traduction Anglaise (EN 🇬🇧)"
              icon={<span className="text-base">🇬🇧</span>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Version Anglaise pour l'International</span>
                  <span className={`text-[11px] ${cls.textFaint}`}>Renseignez les équivalents anglais ou laissez l'IA tout traduire en 1 clic.</span>
                </div>
                <button
                  type="button"
                  onClick={handleTranslateProduct}
                  disabled={isTranslating}
                  className="flex items-center gap-1.5 text-xs font-black text-white bg-[#2F3CD9] hover:bg-[#2F3CD9]/80 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#2F3CD9]/20 disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 ${isTranslating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isTranslating ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                  </svg>
                  {isTranslating ? "Traduction en cours..." : "✨ Traduire en Anglais avec l'IA"}
                </button>
              </div>

              <InputField
                label="Nom du produit (EN)"
                value={form.nameEn || ""}
                onChange={(v) => set("nameEn")(v)}
                placeholder="Ex: Mechanical Iris Fidget"
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Description courte (EN)</label>
                <WysiwygEditor
                  value={form.shortDescriptionEn || ""}
                  onChange={(v) => set("shortDescriptionEn")(v)}
                  placeholder="Catchy product short summary in English..."
                  theme={theme}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${cls.textMuted} uppercase tracking-wider`}>Description longue (EN)</label>
                <WysiwygEditor
                  value={form.descriptionEn || ""}
                  onChange={(v) => set("descriptionEn")(v)}
                  placeholder="Detailed English product description, material info..."
                  theme={theme}
                />
              </div>

              <InputField
                label="SEO Meta Title (EN)"
                value={form.metaTitleEn || ""}
                onChange={(v) => set("metaTitleEn")(v)}
                placeholder="English SEO Title"
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />

              <TextareaField
                label="SEO Meta Description (EN)"
                value={form.metaDescriptionEn || ""}
                onChange={(v) => set("metaDescriptionEn")(v)}
                placeholder="English Google search result description..."
                rows={2}
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />
            </SectionCard>

            {/* 3. Photos & Vidéos */}
            <SectionCard
              title="Photos & Vidéos"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(uploadImage);
                }}
                multiple
                accept="image/*,video/*,.mp4,.webm,.mov"
                className="hidden"
              />

              {/* Media grid (Photos + Vidéos) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.images.map((img, idx) => {
                  const isVid = isVideoMedia(img.src);
                  const ytThumb = isYouTubeUrl(img.src) ? getYouTubeThumbnail(img.src) : null;
                  const isCover = idx === 0;

                  const setAsCover = (index: number) => {
                    if (index === 0) return;
                    setForm(prev => {
                      const newImages = [...prev.images];
                      const [selected] = newImages.splice(index, 1);
                      newImages.unshift(selected);
                      return { ...prev, images: newImages };
                    });
                  };

                  const moveMedia = (from: number, to: number) => {
                    if (to < 0 || to >= form.images.length) return;
                    setForm(prev => {
                      const newImages = [...prev.images];
                      const [moved] = newImages.splice(from, 1);
                      newImages.splice(to, 0, moved);
                      return { ...prev, images: newImages };
                    });
                  };

                  return (
                    <div
                      key={img.id}
                      className={`relative aspect-square rounded-xl overflow-hidden ${cls.inputBg} border transition-all group ${
                        isCover ? "border-[#ff4f00] ring-2 ring-[#ff4f00]/30 shadow-md" : cls.border
                      }`}
                    >
                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold bg-[#ff4f00] text-white rounded-full shadow-lg z-20 uppercase tracking-widest flex items-center gap-1 no-invert">
                          ⭐ Couverture
                        </span>
                      )}

                      {/* Thumbnail Content */}
                      {isVid ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                          {ytThumb ? (
                            <Image src={ytThumb} alt={img.alt || "Vidéo YouTube"} fill unoptimized className="object-cover opacity-75" />
                          ) : (
                            <video src={img.src} muted className="object-cover w-full h-full opacity-60" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-xl">🎥</span>
                          </div>
                        </div>
                      ) : (
                        <Image src={img.src} alt={img.alt || "Média"} fill className="object-cover" />
                      )}

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2 z-10 select-none">
                        {/* Top bar overlay: Set Cover or Cover indicator */}
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => setAsCover(idx)}
                            className="w-full py-1 text-[10px] font-bold bg-[#ff4f00] hover:bg-[#e04500] text-white rounded-lg transition-colors cursor-pointer shadow flex items-center justify-center gap-1"
                          >
                            <span>⭐ Image de couverture</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                            Image principale
                          </span>
                        )}

                        {/* Center overlay: Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeImage(img.id);
                          }}
                          className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                          title="Supprimer ce média"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Bottom bar overlay: Move Left / Move Right */}
                        <div className="flex items-center gap-1.5">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveMedia(idx, idx - 1)}
                              className="px-2 py-0.5 text-[9px] font-bold bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
                              title="Déplacer vers la gauche"
                            >
                              ◀
                            </button>
                          )}
                          {idx < form.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveMedia(idx, idx + 1)}
                              className="px-2 py-0.5 text-[9px] font-bold bg-white/10 hover:bg-white/20 text-white rounded transition-colors cursor-pointer"
                              title="Déplacer vers la droite"
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Drag and Drop dropzone slot */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(uploadImage);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer select-none ${
                    isDragOver 
                      ? "border-[#2F3CD9] bg-[#2F3CD9]/5 text-[#2F3CD9] scale-98"
                      : `${theme === "dark" ? "border-[#2a2a35] hover:border-[#2F3CD9]/40" : "border-gray-300 hover:border-[#2F3CD9]/40"} ${cls.textFaint} hover:text-[#2F3CD9]`
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <svg className="w-6 h-6 animate-spin text-[#2F3CD9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-[#2F3CD9]">Téléversement...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xl">🎥 📸</span>
                      <span className="text-[10px] font-semibold text-center px-2">Photos &amp; Vidéos</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5">
                <p className={`text-[11px] ${cls.textFaint} flex items-center gap-1.5`}>
                  <svg className="w-3.5 h-3.5 text-[#2F3CD9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Accepte les fichiers images (PNG, JPG, WebP) et les vidéos (MP4, WebM, MOV).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const videoUrl = prompt("Saisissez l'URL de la vidéo (ex: https://.../demo.mp4 ou YouTube) :");
                    if (videoUrl && videoUrl.trim()) {
                      const newMedia = {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        src: videoUrl.trim(),
                        alt: form.name || "Vidéo démonstration"
                      };
                      setForm(prev => ({ ...prev, images: [...prev.images, newMedia] }));
                    }
                  }}
                  className="text-[11px] font-bold text-[#ff4f00] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>+ Ajouter par URL (Vidéo / Image)</span>
                </button>
              </div>
            </SectionCard>

            {/* 4. Prix & Type */}
            <SectionCard
              title="Prix & Type de produit"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              {/* Toggle */}
              <div className={`flex ${cls.inputBg} border ${cls.border} rounded-xl p-1 w-fit`}>
                {[{ value: "simple", label: "Produit simple" }, { value: "variable", label: "Avec variations" }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set("productType")(opt.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      form.productType === opt.value
                        ? "bg-[#2F3CD9] text-white"
                        : `${cls.textFaint} hover:${cls.textMuted}`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.productType === "simple" && (
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Prix normal (€)" value={form.price} onChange={(v) => set("price")(v)} placeholder="12.00" type="number" inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted} />
                  <InputField label="Prix remisé (€)" value={form.salePrice} onChange={(v) => set("salePrice")(v)} placeholder="Laisser vide si pas de promo" type="number" inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted} />
                </div>
              )}

              {form.productType === "variable" && (
                <div className="flex flex-col gap-5">
                  {/* Section 1 : Attributs du produit */}
                  <div className={`flex flex-col gap-3 p-4 rounded-2xl ${cls.inputBg} border ${cls.border}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h4 className={`text-xs font-bold ${cls.textMain} uppercase tracking-wider`}>Attributs Globaux (ex: Couleur A, Taille...)</h4>
                      
                      <div className="flex items-center gap-3">
                        {predefinedAttributes.length > 0 && (
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              const attr = predefinedAttributes.find(a => a.id.toString() === val);
                              if (attr) {
                                const name = attr.name;
                                const options = attr.values.split(",").map(o => o.trim()).filter(Boolean);
                                const controlType = attr.controlType || "default";
                                const attrs = form.attributes?.attributes || [];
                                
                                if (attrs.some(a => a.name.toLowerCase() === name.toLowerCase())) {
                                  alert("Cet attribut est déjà présent sur le produit.");
                                  e.target.value = "";
                                  return;
                                }

                                set("attributes")({
                                  attributes: [...attrs, { name, options, controlType }],
                                  variationPrices: form.attributes?.variationPrices || []
                                });
                              }
                              e.target.value = "";
                            }}
                            className={`h-8 border rounded-lg px-2 text-[10px] outline-none ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#ff4f00] cursor-pointer`}
                            defaultValue=""
                          >
                            <option value="">⚡ Charger prédéfini...</option>
                            {predefinedAttributes.map((attr) => (
                              <option key={attr.id} value={attr.id}>
                                {attr.name} ({attr.values.split(",").length} val.)
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt("Nom de l'attribut (ex: Taille) :");
                            if (name) {
                              const optionsStr = prompt("Options séparées par des virgules (ex: S, M, L) :");
                              const options = optionsStr ? optionsStr.split(",").map(o => o.trim()).filter(Boolean) : [];
                              const attrs = form.attributes?.attributes || [];
                              set("attributes")({
                                attributes: [...attrs, { name, options, controlType: "default" }],
                                variationPrices: form.attributes?.variationPrices || []
                              });
                            }
                          }}
                          className="text-[11px] font-bold text-[#ff4f00] hover:underline cursor-pointer"
                        >
                          + Créer manuellement
                        </button>
                      </div>
                    </div>

                    {(form.attributes?.attributes || []).length === 0 ? (
                      <p className={`text-xs ${cls.textFaint} text-center py-2`}>Aucun attribut défini pour ce produit.</p>
                    ) : (
                      <div className="flex flex-col gap-3.5">
                        {(form.attributes?.attributes || []).map((attr, aIdx) => (
                          <div key={aIdx} className={`flex flex-col gap-3 p-3.5 rounded-2xl border ${cls.border} ${theme === "dark" ? "bg-white/[0.02]" : "bg-gray-50"}`}>
                            {/* Header row: Editable Name & Delete */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                                <span className={`text-xs font-bold ${cls.textMuted} shrink-0 uppercase tracking-wider`}>Nom :</span>
                                <input
                                  type="text"
                                  value={attr.name}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    const oldName = attr.name;
                                    const newAttrs = [...(form.attributes?.attributes || [])];
                                    newAttrs[aIdx] = { ...newAttrs[aIdx], name: newName };

                                    // Rename key in variationPrices combinations if changed
                                    const newVarPrices = (form.attributes?.variationPrices || []).map((vp) => {
                                      const combination = { ...vp.combination };
                                      if (oldName in combination && oldName !== newName) {
                                        combination[newName] = combination[oldName];
                                        delete combination[oldName];
                                      }
                                      return { ...vp, combination };
                                    });

                                    set("attributes")({
                                      attributes: newAttrs,
                                      variationPrices: newVarPrices
                                    });
                                  }}
                                  placeholder="Nom de l'attribut (ex: Couleur, Taille)"
                                  className={`px-3 py-1.5 text-xs font-bold border rounded-xl ${cls.inputBg} ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9]/50 flex-1`}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const attrs = form.attributes?.attributes || [];
                                  set("attributes")({
                                    attributes: attrs.filter((_, idx) => idx !== aIdx),
                                    variationPrices: form.attributes?.variationPrices || []
                                  });
                                }}
                                className="text-red-400 hover:text-red-500 transition-colors text-xs font-bold cursor-pointer shrink-0"
                              >
                                Supprimer
                              </button>
                            </div>
                            
                            {/* Editable Options / Values line */}
                            <div className="flex flex-col gap-1.5">
                              <label className={`text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>
                                Valeurs / Options (séparées par des virgules) :
                              </label>
                              <input
                                type="text"
                                value={attr.options.join(", ")}
                                onChange={(e) => {
                                  const optionsStr = e.target.value;
                                  const newOptions = optionsStr.split(",").map(s => s.trim());
                                  const newAttrs = [...(form.attributes?.attributes || [])];
                                  newAttrs[aIdx] = { ...newAttrs[aIdx], options: newOptions };

                                  set("attributes")({
                                    attributes: newAttrs,
                                    variationPrices: form.attributes?.variationPrices || []
                                  });
                                }}
                                placeholder="Ex: Rouge, Bleu, Vert, Jaune"
                                className={`px-3 py-1.5 text-xs border rounded-xl ${cls.inputBg} ${cls.border} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9]/50`}
                              />
                            </div>

                            {/* Control Type Selector */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className={`text-[10px] font-semibold ${cls.textMuted}`}>Affichage :</span>
                              <select
                                value={attr.controlType || "default"}
                                onChange={(e) => {
                                  const newAttrs = [...(form.attributes?.attributes || [])];
                                  newAttrs[aIdx] = { ...newAttrs[aIdx], controlType: e.target.value };
                                  set("attributes")({
                                    attributes: newAttrs,
                                    variationPrices: form.attributes?.variationPrices || []
                                  });
                                }}
                                className={`h-8 text-[11px] border rounded-lg px-2 bg-spoolio-card ${cls.border} ${cls.textMain} outline-none focus:border-[#2F3CD9]/50 cursor-pointer`}
                              >
                                <option value="default">Défaut (automatique)</option>
                                <option value="color_swatch">Color Swatch (Bobine de couleur)</option>
                                <option value="segmented_control">Segmented Control (Onglets)</option>
                                <option value="chips">Chips (Pastilles simples)</option>
                                <option value="dropdown">Dropdown (Liste déroulante)</option>
                                <option value="date_picker">Date Picker (Sélecteur de date)</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2 : Variations de prix spécifiques */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <h4 className={`text-xs font-bold ${cls.textMain} uppercase tracking-wider`}>Prix des Variations Spécifiques</h4>
                        <p className={`text-[11px] ${cls.textMuted}`}>Définissez des prix différents pour des combinaisons d'options.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const attrs = form.attributes?.attributes || [];
                          if (attrs.length === 0) {
                            alert("Veuillez d'abord définir au moins un attribut avec des options.");
                            return;
                          }
                          const defaultComb: Record<string, string> = {};
                          attrs.forEach(a => {
                            defaultComb[a.name] = "";
                          });
                          const vPrices = form.attributes?.variationPrices || [];
                          set("attributes")({
                            attributes: attrs,
                            variationPrices: [...vPrices, { combination: defaultComb, price: "" }]
                          });
                        }}
                        className="text-xs font-bold text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                      >
                        + Ajouter une variation de prix
                      </button>
                    </div>

                    {(form.attributes?.variationPrices || []).length === 0 ? (
                      <p className={`text-sm ${cls.textFaint} text-center py-4 bg-black/10 rounded-2xl border ${cls.border}`}>
                        Aucun prix spécifique défini. Toutes les combinaisons utiliseront le prix de base.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {(form.attributes?.variationPrices || []).map((vPrice, vpIdx) => (
                          <div key={vpIdx} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl ${cls.cardBg} border ${cls.border}`}>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              {(form.attributes?.attributes || []).map((attr) => (
                                <div key={attr.name} className="flex flex-col gap-1">
                                  <label className="text-[10px] text-white font-semibold uppercase tracking-wider">
                                    {attr.name.replace(/&#039;/g, "'").replace(/&#39;/g, "'")}
                                  </label>
                                  <select
                                    value={vPrice.combination[attr.name] || ""}
                                    onChange={(e) => {
                                      const vPrices = [...(form.attributes?.variationPrices || [])];
                                      vPrices[vpIdx] = {
                                        ...vPrices[vpIdx],
                                        combination: {
                                          ...vPrices[vpIdx].combination,
                                          [attr.name]: e.target.value
                                        }
                                      };
                                      set("attributes")({
                                        attributes: form.attributes?.attributes || [],
                                        variationPrices: vPrices
                                      });
                                    }}
                                    className={`bg-transparent border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"} text-sm ${cls.textMain} pb-1 focus:outline-none focus:border-[#2F3CD9]/50 cursor-pointer`}
                                  >
                                    <option value="" className={theme === "dark" ? "bg-[#131316]" : "bg-white"}>
                                      Tous / N'importe lequel
                                    </option>
                                    {attr.options.map(opt => (
                                      <option key={opt} value={opt} className={theme === "dark" ? "bg-[#131316]" : "bg-white"}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>

                            <div className="w-full sm:w-28 flex flex-col gap-1">
                              <label className="text-[10px] text-white font-semibold uppercase tracking-wider">Prix (€)</label>
                              <input
                                type="number"
                                placeholder={form.price || "12.00"}
                                value={vPrice.price}
                                onChange={(e) => {
                                  const vPrices = [...(form.attributes?.variationPrices || [])];
                                  vPrices[vpIdx] = {
                                    ...vPrices[vpIdx],
                                    price: e.target.value
                                  };
                                  set("attributes")({
                                    attributes: form.attributes?.attributes || [],
                                    variationPrices: vPrices
                                  });
                                }}
                                  className={`bg-transparent border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"} text-sm ${cls.textMain} pb-1 focus:outline-none focus:border-[#2F3CD9]/50`}
                              />
                            </div>

                            {/* Image liée */}
                            <div className="relative w-full sm:w-20 flex flex-col gap-1">
                              <label className="text-[10px] text-white font-semibold uppercase tracking-wider">Image</label>
                              <div className="relative">
                                {vPrice.imageSrc ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveImageDropdownIdx(activeImageDropdownIdx === vpIdx ? null : vpIdx)}
                                    className={`relative w-9 h-9 rounded-lg overflow-hidden border ${cls.border} hover:border-[#ff4f00] transition-colors cursor-pointer`}
                                  >
                                    <img
                                      src={vPrice.imageSrc}
                                      alt="Variante"
                                      className="object-cover w-full h-full"
                                    />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setActiveImageDropdownIdx(activeImageDropdownIdx === vpIdx ? null : vpIdx)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-dashed ${cls.border} text-gray-500 hover:text-white hover:border-white/30 transition-colors text-xs font-bold cursor-pointer`}
                                  >
                                    +
                                  </button>
                                )}

                                {activeImageDropdownIdx === vpIdx && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setActiveImageDropdownIdx(null)} 
                                    />
                                    <div className={`absolute bottom-full left-0 mb-2 z-50 w-56 max-h-48 overflow-y-auto p-2 rounded-xl border ${cls.border} ${cls.cardBg} shadow-2xl flex flex-wrap gap-2`}>
                                      {form.images.length === 0 ? (
                                        <p className="text-[10px] text-gray-500 w-full text-center py-2">Aucune image disponible.</p>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const vPrices = [...(form.attributes?.variationPrices || [])];
                                              vPrices[vpIdx] = {
                                                ...vPrices[vpIdx],
                                                imageSrc: undefined
                                              };
                                              set("attributes")({
                                                attributes: form.attributes?.attributes || [],
                                                variationPrices: vPrices
                                              });
                                              setActiveImageDropdownIdx(null);
                                            }}
                                            className="w-full text-left text-[10px] text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer mb-1 border-none bg-transparent font-semibold"
                                          >
                                            ❌ Supprimer l'image
                                          </button>
                                          {form.images.map((img) => (
                                            <button
                                              key={img.id}
                                              type="button"
                                              onClick={() => {
                                                const vPrices = [...(form.attributes?.variationPrices || [])];
                                                vPrices[vpIdx] = {
                                                  ...vPrices[vpIdx],
                                                  imageSrc: img.src
                                                };
                                                set("attributes")({
                                                  attributes: form.attributes?.attributes || [],
                                                  variationPrices: vPrices
                                                });
                                                setActiveImageDropdownIdx(null);
                                              }}
                                              className={`relative w-10 h-10 rounded-lg overflow-hidden border cursor-pointer hover:scale-105 transition-transform ${
                                                vPrice.imageSrc === img.src ? "border-[#ff4f00]" : "border-transparent"
                                              }`}
                                            >
                                              <img
                                                src={img.src}
                                                alt={img.alt || "Miniature"}
                                                className="object-cover w-full h-full"
                                              />
                                            </button>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const vPrices = form.attributes?.variationPrices || [];
                                set("attributes")({
                                  attributes: form.attributes?.attributes || [],
                                  variationPrices: vPrices.filter((_, idx) => idx !== vpIdx)
                                });
                              }}
                              className="self-end sm:self-center p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                {/* Toggle Limiter le stock */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-semibold ${cls.textMain} uppercase tracking-wider`}>Stock limité à XX exemplaires</span>
                    <span className={`text-[11px] ${cls.textMuted}`}>Par défaut, le produit est fabriqué à la demande. Cochez cette case pour imposer une limite exacte.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.stock >= 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          set("stock")(10); // default limited quantity
                        } else {
                          set("stock")(-1); // fabricated on demand / unlimited
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F3CD9]"></div>
                  </label>
                </div>

                {/* If stock limit is enabled (stock >= 0) */}
                {form.stock >= 0 ? (
                  <InputField
                    label="Nombre d'exemplaires maximum"
                    value={String(form.stock)}
                    onChange={(v) => set("stock")(parseInt(v) || 0)}
                    type="number"
                    placeholder="Ex: 5"
                    inputBg={cls.inputBg}
                    border={cls.border}
                    textMain={cls.textMain}
                    textMuted={cls.textMuted}
                  />
                ) : (
                  /* If on-demand / unlimited (stock < 0) */
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-semibold ${cls.textMain} uppercase tracking-wider`}>Disponible à la vente</span>
                      <span className={`text-[11px] ${cls.textMuted}`}>Fabriqué à la demande. Décocher pour marquer le produit comme temporairement indisponible.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.stock === -1}
                        onChange={(e) => {
                          if (e.target.checked) {
                            set("stock")(-1); // available
                          } else {
                            set("stock")(0); // mark unavailable
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F3CD9]"></div>
                    </label>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 5. Tags */}
            <SectionCard
              title="Tags produit"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              <div className="flex flex-col gap-1.5">
                <p className={`text-xs ${cls.textMuted}`}>Les tags permettent aux clients de naviguer et filtrer les produits.</p>
                <div className="p-2.5 rounded-xl bg-[#2F3CD9]/10 border border-[#2F3CD9]/30 text-[11px] text-[#2F3CD9] font-medium flex items-start gap-2">
                  <span className="text-base">✨</span>
                  <span><strong>Astuce rapide :</strong> Collez directement toute votre liste de tags séparés par des virgules ou retours à la ligne, ils seront <strong>découpés et créés automatiquement !</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(",") || val.includes(";") || val.includes("\n") || val.includes("|")) {
                      addTag(val);
                    } else {
                      setNewTag(val);
                    }
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData("text");
                    if (pastedText && (pastedText.includes(",") || pastedText.includes(";") || pastedText.includes("\n") || pastedText.includes("|"))) {
                      e.preventDefault();
                      addTag(pastedText);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Coller ou saisir des tags (ex: tag1, tag2, tag3)…"
                  className={`flex-1 ${cls.inputBg} border ${cls.border} rounded-xl px-4 py-2.5 text-sm ${cls.textMain} placeholder-gray-400 focus:outline-none focus:border-[#2F3CD9]/50 transition-colors`}
                />
                <button
                  onClick={() => addTag()}
                  className="px-4 py-2.5 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-white/5"
                >
                  Ajouter
                </button>
              </div>
            </SectionCard>

            {/* 6. SEO */}
            <SectionCard
              title="SEO & Référencement"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              cardBg={cls.cardBg} border={cls.border} textMain={cls.textMain}
            >
              {/* Score indicator */}
              <div className={`flex items-center gap-4 p-4 ${cls.inputBg} border ${cls.border} rounded-2xl`}>
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke={theme === "dark" ? "#1e1e2a" : "#e2e2ea"} strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke={seoColor} strokeWidth="3"
                      strokeDasharray={`${(seoScore / 100) * 87.96} 87.96`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color: seoColor }}>
                    {seoScore}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${cls.textMain}`}>Score SEO : {seoScore}/100</p>
                  <p className={`text-xs ${cls.textMuted} mt-0.5`}>
                    {seoScore >= 75 ? "🟢 Excellent ! Ce produit est bien optimisé." : seoScore >= 50 ? "🟡 Correct. Enrichissez les descriptions." : "🔴 Faible. Remplissez tous les champs."}
                  </p>
                </div>
              </div>

              {/* Checklist d'Optimisation SEO */}
              <div className="flex flex-col gap-2 pt-2.5 border-t border-white/5 text-[11px] font-sans">
                <span className={`font-semibold ${cls.textMuted} uppercase tracking-wider text-[10px]`}>Checklist d'Optimisation</span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={form.name.length >= 10 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {form.name.length >= 10 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Nom du produit de taille suffisante (&gt;= 10 car.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={form.shortDescription.replace(/<[^>]+>/g, "").length >= 50 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {form.shortDescription.replace(/<[^>]+>/g, "").length >= 50 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Description courte assez riche (&gt;= 50 car.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={form.description.replace(/<[^>]+>/g, "").length >= 200 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {form.description.replace(/<[^>]+>/g, "").length >= 200 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Description longue détaillée (&gt;= 200 car.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(form.metaTitle || "").length >= 30 && (form.metaTitle || "").length <= 60 ? "text-emerald-400 font-bold" : "text-yellow-500 font-bold"}>
                      {(form.metaTitle || "").length >= 30 && (form.metaTitle || "").length <= 60 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Titre SEO optimal (entre 30 et 60 car.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(form.metaDescription || "").length >= 100 && (form.metaDescription || "").length <= 160 ? "text-emerald-400 font-bold" : "text-yellow-500 font-bold"}>
                      {(form.metaDescription || "").length >= 100 && (form.metaDescription || "").length <= 160 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Méta description optimale (entre 100 et 160 car.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={form.tags.length >= 3 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {form.tags.length >= 3 ? "✓" : "✗"}
                    </span>
                    <span className={cls.textMuted}>Au moins 3 tags pour le maillage (actuel : {form.tags.length})</span>
                  </div>
                </div>
              </div>

              {/* AI SEO Recommendations */}
              {aiSeoAdvice.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col gap-1 text-[11px] font-sans">
                  <span className={`font-bold flex items-center gap-1 ${cls.textMain}`}>💡 Conseils personnalisés de l'IA :</span>
                  <ul className="list-disc pl-4 space-y-1 text-gray-400 mt-1">
                    {aiSeoAdvice.map((advice, idx) => (
                      <li key={idx}>{advice}</li>
                    ))}
                  </ul>
                </div>
              )}

              <InputField
                label={`Meta title (${form.metaTitle.length}/60 car.)`}
                value={form.metaTitle}
                onChange={(v) => set("metaTitle")(v)}
                placeholder="Titre SEO de la page produit"
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />
              <TextareaField
                label={`Meta description (${form.metaDescription.length}/160 car.)`}
                value={form.metaDescription}
                onChange={(v) => set("metaDescription")(v)}
                placeholder="Description affichée dans les résultats Google…"
                rows={3}
                inputBg={cls.inputBg} border={cls.border} textMain={cls.textMain} textMuted={cls.textMuted}
              />

              {/* Google preview */}
              {(form.metaTitle || form.metaDescription) && (
                <div className="bg-white rounded-xl p-4 border border-[#e2e2e9]">
                  <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Aperçu Google</p>
                  <p className="text-[#1a0dab] text-base font-medium leading-snug hover:underline cursor-pointer">
                    {form.metaTitle || form.name || "Titre du produit"}
                  </p>
                  <p className="text-[#006621] text-xs mt-0.5">spoolio.fr › product › {form.slug || "slug"}</p>
                  <p className="text-[#545454] text-sm mt-1 leading-snug line-clamp-2">
                    {form.metaDescription || "Description du produit…"}
                  </p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right column - sticky sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Product summary card */}
            <div className={`${cls.cardBg} border ${cls.border} rounded-3xl p-5 sticky top-6 space-y-4 transition-colors`}>
              <h3 className={`text-xs font-bold ${cls.textMuted} uppercase tracking-widest`}>Récapitulatif</h3>

              {form.images[0] && (
                <div className={`relative aspect-square rounded-2xl overflow-hidden ${cls.inputBg} border ${cls.border}`}>
                  <Image src={form.images[0].src} alt={form.images[0].alt} fill className="object-cover" />
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Nom</span>
                  <span className={`font-semibold ${cls.textMain} truncate max-w-[140px]`}>{form.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Catégorie</span>
                  <span className={`${cls.textMain}`}>{form.category || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Prix</span>
                  <div className="text-right">
                    {form.salePrice ? (
                      <>
                        <span className="text-[#2F3CD9] font-bold">{form.salePrice} €</span>
                        <span className={`${cls.textMuted} line-through text-xs ml-1`}>{form.price} €</span>
                      </>
                    ) : (
                      <span className={`font-bold ${cls.textMain}`}>{form.price || "—"} {form.price && "€"}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Stock</span>
                  <span className={`font-bold ${
                    form.stock === -1
                      ? "text-emerald-400"
                      : form.stock === -2
                      ? "text-orange-400"
                      : form.stock === 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}>
                    {form.stock === -1
                      ? "Illimité"
                      : form.stock === -2
                      ? "Indisponible"
                      : form.stock === 0
                      ? "Rupture"
                      : `${form.stock} unités`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Type</span>
                  <span className={`${cls.textMain} capitalize`}>{form.productType === "simple" ? "Simple" : "Avec variations"}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${cls.textMuted}`}>Tags</span>
                  <span className={`${cls.textMain}`}>{form.tags.length} tag{form.tags.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* SEO mini score */}
              <div className={`pt-3 border-t ${cls.border}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${cls.textMuted}`}>Score SEO</span>
                  <span className="text-xs font-bold" style={{ color: seoColor }}>{seoScore}/100</span>
                </div>
                <div className={`h-1.5 ${theme === "dark" ? "bg-[#1e1e2a]" : "bg-gray-150"} rounded-full overflow-hidden`}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${seoScore}%`, background: seoColor }} />
                </div>
              </div>

              {/* Link to front-end product page */}
              {!isNew && form.slug && (
                <a
                  href={`/product/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border ${cls.border} text-xs font-semibold ${cls.textMuted} hover:${cls.textMain} ${theme === "dark" ? "hover:border-white/20" : "hover:border-gray-400"} transition-all`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Voir sur le site
                </a>
              )}
            </div>
          </div>
        </div>

        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`${cls.cardBg} border ${cls.border} rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[90vh]`}>
              {/* Header */}
              <div className={`p-6 border-b ${cls.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#2F3CD9]/10 text-[#2F3CD9] rounded-xl">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${cls.textMain}`}>Optimisation avec l'IA</h3>
                    <p className={`text-[11px] ${cls.textMuted}`}>Guidez l'IA pour obtenir une description humaine et percutante.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className={`p-1.5 rounded-lg hover:${theme === "dark" ? "bg-white/10" : "bg-gray-100"} transition-colors ${cls.textMuted}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Questions Form */}
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>1. À quoi sert ce produit ? (Usage & Utilité)</label>
                  <textarea
                    value={aiUse}
                    onChange={(e) => setAiUse(e.target.value)}
                    placeholder="Ex: Ranger des bobines de PLA verticalement, caler un smartphone sur un bureau…"
                    rows={2}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl border ${cls.border} ${cls.inputBg} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9] transition-all resize-none`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>2. Quels sont ses principaux points forts ? (Caractéristiques clés)</label>
                  <textarea
                    value={aiFeatures}
                    onChange={(e) => setAiFeatures(e.target.value)}
                    placeholder="Ex: Stable et robuste, impression éco-responsable locale, design minimaliste et industriel…"
                    rows={2}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl border ${cls.border} ${cls.inputBg} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9] transition-all resize-none`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>3. Pour qui est-il idéal ? (Cible / Public)</label>
                  <textarea
                    value={aiTarget}
                    onChange={(e) => setAiTarget(e.target.value)}
                    placeholder="Ex: Les makers d'impression 3D, les personnes voulant un bureau bien rangé, les geeks…"
                    rows={2}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl border ${cls.border} ${cls.inputBg} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9] transition-all resize-none`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] font-bold ${cls.textMuted} uppercase tracking-wider`}>4. Y a-t-il des détails spécifiques ou précautions ? (Optionnel)</label>
                  <textarea
                    value={aiDetails}
                    onChange={(e) => setAiDetails(e.target.value)}
                    placeholder="Ex: Ne pas laisser en plein soleil (>60°C), compatible avec toutes les marques de bobines standard…"
                    rows={2}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl border ${cls.border} ${cls.inputBg} ${cls.textMain} focus:outline-none focus:border-[#2F3CD9] transition-all resize-none`}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`p-6 border-t ${cls.border} flex items-center justify-end gap-3`}>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border ${cls.border} ${cls.textMuted} hover:${cls.textMain} hover:${theme === "dark" ? "bg-white/5" : "bg-gray-50"} transition-all cursor-pointer`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2F3CD9] hover:bg-[#202bb8] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#2F3CD9]/20"
                >
                  Générer la description 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
