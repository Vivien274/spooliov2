"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnicornIcon from "@/components/UnicornIcon";
import { useCart } from "@/context/CartContext";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  // Force scroll to top when page loaded or product slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  const isOutOfStock = product?.stock === 0;
  const isUnavailable = product?.stock === -2;
  const isNotAvailableToBuy = isOutOfStock || isUnavailable;


  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [reviewName, setReviewName] = useState<string>("");
  const [reviewEmail, setReviewEmail] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Initialize selected variations options
  useEffect(() => {
    if (product && product.attributes) {
      const attrs = Array.isArray(product.attributes)
        ? product.attributes
        : (product.attributes as any).attributes || [];
      const initialOptions: Record<string, string> = {};
      attrs.forEach((attr: any) => {
        if (attr.options && attr.options.length > 0) {
          initialOptions[attr.name] = attr.options[0].replace(/\u00a0/g, ' ').trim();
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);


  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}?t=${Date.now()}`);
        if (!res.ok) {
          throw new Error("Produit introuvable");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Impossible de charger les détails du produit");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const filtered = data
              .filter((p: Product) => p.slug !== slug)
              .slice(0, 3);
            setRelatedProducts(filtered);
          }
        }
      } catch (e) {
        console.error("Error fetching related products:", e);
      }
    }
    if (product) {
      fetchRelated();
      fetchReviews(product.id);
      setActiveImageIndex(0);
    }
  }, [product, slug]);

  const fetchReviews = async (productId: number) => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error("Error loading reviews:", e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmittingReview(true);
    setReviewSuccess(null);
    setReviewError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName,
          email: reviewEmail,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess(data.message || "Avis soumis avec succès !");
        setReviewName("");
        setReviewEmail("");
        setReviewRating(5);
        setReviewComment("");
        // Reload reviews list
        await fetchReviews(product.id);
      } else {
        setReviewError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setReviewError("Impossible de se connecter au serveur.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-spoolio-bg text-gray-100 flex flex-col justify-between py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-pulse">
          <div className="h-6 w-24 bg-spoolio-card border border-spoolio-border rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square w-full bg-spoolio-card border border-spoolio-border rounded-xl" />
            <div className="flex flex-col gap-6">
              <div className="h-4 w-1/4 bg-spoolio-card border border-spoolio-border rounded" />
              <div className="h-10 w-3/4 bg-spoolio-card border border-spoolio-border rounded" />
              <div className="h-6 w-1/3 bg-spoolio-card border border-spoolio-border rounded" />
              <div className="h-24 w-full bg-spoolio-card border border-spoolio-border rounded" />
              <div className="h-12 w-full bg-spoolio-card border border-spoolio-border rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-spoolio-bg text-gray-100 flex flex-col items-center justify-center p-6">
        <div className="bg-spoolio-card border border-spoolio-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <span className="text-4xl mb-4 block">🔍</span>
          <h1 className="text-xl font-bold mb-2">Produit Introuvable</h1>
          <p className="text-gray-400 mb-6 text-sm">Le produit que vous cherchez n'existe pas ou a été retiré.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 font-bold text-black bg-spoolio-orange hover:bg-spoolio-orange/90 rounded-lg transition-colors cursor-pointer shadow-lg shadow-spoolio-orange/15"
          >
            Retourner à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product.images[0]?.src || "";
  const imageAlt = product.images[0]?.alt || product.name;
  const hasImage = !!imageUrl;

  // Neuromarketing Keyword Badge mapping
  const getKeywordBadge = () => {
    const textToCheck = `${product.name} ${product.categories.map(c => c.name).join(" ")}`.toLowerCase();
    if (textToCheck.includes("goofy")) return "👀 JUGE";
    if (textToCheck.includes("marcel")) return "🐙 MARCEL";
    if (textToCheck.includes("fidget")) return "🌀 APPAREIL";
    if (textToCheck.includes("clavier")) return "⌨️ CLICK";
    if (textToCheck.includes("nfc")) return "📱 SCAN";
    return null;
  };
  const keywordBadge = getKeywordBadge();

  // Discount percentage calculation
  const getDiscountPercentage = () => {
    if (!product.on_sale) return null;
    const regular = parseFloat(product.regular_price);
    const sale = parseFloat(product.sale_price || product.price);
    if (regular && sale && regular > sale) {
      return Math.round(((regular - sale) / regular) * 100);
    }
    return null;
  };
  const discount = getDiscountPercentage();

  // Price formatting
  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Extract attributes list
  const attributesList = product.attributes
    ? (Array.isArray(product.attributes)
        ? product.attributes
        : (product.attributes as any).attributes || [])
    : [];

  // Active variation price calculation
  const getActivePriceInfo = () => {
    if (!product) return { price: "0", isVariation: false };
    const attrData = product.attributes as any;
    if (attrData && attrData.variationPrices && Array.isArray(attrData.variationPrices)) {
      // 1. Filter all matching variations
      const matches = attrData.variationPrices.filter((vp: any) => {
        return Object.entries(vp.combination).every(([key, value]) => {
          // If value is empty, it's a wildcard matching any selected option
          if (!value || String(value).trim() === "") return true;
          const selected = selectedOptions[key];
          return selected && selected.toLowerCase().trim() === String(value).toLowerCase().trim();
        });
      });

      if (matches.length > 0) {
        // 2. Sort by specificity (number of non-empty constraints) descending
        matches.sort((a: any, b: any) => {
          const aSpecificity = Object.values(a.combination).filter(v => v && String(v).trim() !== "").length;
          const bSpecificity = Object.values(b.combination).filter(v => v && String(v).trim() !== "").length;
          return bSpecificity - aSpecificity;
        });

        const bestMatch = matches[0];
        if (bestMatch && bestMatch.price) {
          return { price: bestMatch.price, isVariation: true };
        }
      }
    }
    return { price: product.price, isVariation: false };
  };
  const activePriceInfo = getActivePriceInfo();
  const currentPrice = activePriceInfo.price;

  // Extract sizes dynamically from attributes
  const sizeAttr = attributesList.find((a: any) => a.name.toLowerCase().includes("taille") || a.name.toLowerCase().includes("longueur"));
  const sizesText = sizeAttr?.options ? sizeAttr.options.join(", ") : "Taille unique";

  // Extract colors dynamically from attributes
  const colorAttr = attributesList.find((a: any) => 
    a.name.toLowerCase().includes("couleur") || 
    a.name.toLowerCase().includes("tube") || 
    a.name.toLowerCase().includes("bague") || 
    a.name.toLowerCase().includes("accent") || 
    a.name.toLowerCase().includes("serpent") || 
    a.name.toLowerCase().includes("oeuf")
  );
  const colorsCount = colorAttr?.options ? `${colorAttr.options.length} coloris` : "Coloris unique";

  // Estimate weight based on price
  const priceNum = parseFloat(currentPrice);
  const estimatedWeight = priceNum < 10 ? "~20g à 40g" : priceNum < 20 ? "~40g à 80g" : "~80g à 150g";

  const getDeliveryDateRange = () => {
    const today = new Date();
    
    // Delivery window: 3 to 5 business days
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 6);
    
    const formatOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const minStr = minDelivery.toLocaleDateString("fr-FR", formatOptions);
    const maxStr = maxDelivery.toLocaleDateString("fr-FR", formatOptions);
    
    return { minStr, maxStr };
  };

  const handleAddToCartClick = () => {
    if (!product || isNotAvailableToBuy) return;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      selectedOptions: selectedOptions,
      image: product.images[0]?.src || ""
    }, quantity);
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-spoolio-orange selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12">
        {/* Breadcrumb Navigation (Fil d'Ariane) */}
        <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-gray-400 mb-8 font-sans select-none">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <span className="text-gray-600 font-bold">/</span>
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Boutique
          </Link>
          {product.categories && product.categories.length > 0 && (
            <>
              <span className="text-gray-600 font-bold">/</span>
              <Link 
                href={`/categorie/${encodeURIComponent(product.categories[0].name)}`} 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="text-gray-600 font-bold">/</span>
          <span className="text-white font-black truncate max-w-[200px] md:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Column: Image Container with zoom aspect-ratio & thumbnails */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/40 border border-spoolio-border p-2 animate-none">
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full h-full rounded-xl overflow-hidden bg-spoolio-card cursor-zoom-in"
              >
                {hasImage ? (
                  <Image
                    src={product.images[activeImageIndex]?.src || imageUrl}
                    alt={product.images[activeImageIndex]?.alt || imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-105 no-invert"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                    <svg className="w-16 h-16 mb-2 text-spoolio-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Spoolio 3D</span>
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.on_sale && (
                    <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold bg-[#ff4f00] text-white rounded-md shadow-lg shadow-[#ff4f00]/20 uppercase tracking-wide">
                      {discount ? `-${discount}%` : "PROMO"}
                    </span>
                  )}
                  {keywordBadge && (
                    <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-extrabold bg-[#2a2a32]/95 text-gray-200 border border-spoolio-border rounded-md backdrop-blur-md shadow-md uppercase tracking-widest no-invert">
                      {keywordBadge}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Grid */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 select-none no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-spoolio-card border transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-white scale-105 shadow-md shadow-white/5"
                        : "border-spoolio-border hover:border-white/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || img.name}
                      fill
                      sizes="80px"
                      className="object-cover no-invert"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Content and Options */}
          <div className="flex flex-col">
            {/* Category tag */}
            {product.categories.length > 0 && (
              <span className="text-xs font-bold text-[#2F3CD9] uppercase tracking-widest mb-2">
                {product.categories.map(c => c.name).join(" / ")}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-4 mb-6">
              {product.on_sale && !activePriceInfo.isVariation ? (
                <>
                  <span className="text-2xl font-black text-[#ff4f00]">
                    {formatPrice(product.sale_price || product.price)}€
                  </span>
                  <span className="text-base text-gray-500 line-through">
                    {formatPrice(product.regular_price)}€
                  </span>
                </>
              ) : (
                <span className="text-2xl font-black text-white">
                  {formatPrice(currentPrice)}€
                </span>
              )}
            </div>

            {/* Short Description */}
            <div
              className="text-gray-400 text-sm leading-relaxed mb-8 border-b border-spoolio-border/40 pb-6 font-sans"
              dangerouslySetInnerHTML={{ __html: product.short_description || "<p>Aucune description disponible pour ce produit.</p>" }}
            />

            {/* Print Settings Options (Dynamic attributes) */}
            {attributesList && attributesList.length > 0 && (
              <div className="flex flex-col gap-6 mb-8">
                {attributesList.map((attr: any) => {
                  const name = attr.name;
                  const nameLower = name.toLowerCase();
                  const rawOptions = attr.options || [];
                  const options = Array.from(new Set<string>(rawOptions.map((opt: string) => opt.replace(/\u00a0/g, ' ').trim())));
                  const selectedVal = selectedOptions[name];

                  // Helper function to update state
                  const handleSelect = (val: string) => {
                    setSelectedOptions(prev => ({
                      ...prev,
                      [name]: val
                    }));
                  };

                  // 1. COLORS SELECTOR (Circle Swatches)
                  const isColor = nameLower.includes("couleur") || nameLower.includes("tube") || nameLower.includes("bague") || nameLower.includes("accent") || nameLower.includes("serpent") || nameLower.includes("oeuf");
                  
                  if (isColor) {
                    const getCssColor = (colorName: string) => {
                      const cName = colorName.toLowerCase().trim();
                      const colorMap: Record<string, string> = {
                        "blanc": "#ffffff",
                        "noir": "#121214",
                        "noir pailleté": "linear-gradient(135deg, #121214 0%, #34343a 100%)",
                        "argenté": "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
                        "argent": "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
                        "doré": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                        "doré brillant": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                        "bleu": "#005cff",
                        "bleu clair": "#58a6ff",
                        "bleu marine": "#0d1b2a",
                        "jaune": "#f7eb12",
                        "rouge": "#ff2a2a",
                        "rouge brillant": "linear-gradient(135deg, #ff2a2a 0%, #b30000 100%)",
                        "orange": "#ff4f00",
                        "orange / rouge brillant": "linear-gradient(135deg, #ff4f00 0%, #ff2a2a 100%)",
                        "rose": "#ff66cc",
                        "rose poudré": "#ffb7c5",
                        "rose pâle": "#ffd1dc",
                        "vert": "#2ebd59",
                        "vert fluo / pomme": "#66ff33",
                        "vert foncé": "#134e1e",
                        "vert menthe": "#a2f2c8",
                        "violet": "#a32eff",
                        "phosphorescent": "linear-gradient(135deg, #e0ffe0 0%, #a0ffa0 100%)",
                        "transparent": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)",
                        "bicolore or-rouge": "linear-gradient(135deg, #ffd700 0%, #ff0000 100%)",
                        "bicolore bleu-violet": "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
                        "arc en ciel": "linear-gradient(135deg, #ff0000 0%, #ff7f00 15%, #ffff00 30%, #00ff00 50%, #0000ff 65%, #4b0082 80%, #9400d3 100%)",
                      };
                      for (const key of Object.keys(colorMap)) {
                        if (cName.includes(key)) return colorMap[key];
                      }
                      return "#ff4f00"; // fallback
                    };

                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {name}
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          {options.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            const bg = getCssColor(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                style={{ background: bg }}
                                className={`w-8 h-8 rounded-full border border-white/20 transition-all cursor-pointer relative ${
                                  isSelected
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110"
                                    : "hover:scale-105 opacity-80 hover:opacity-100"
                                } ${opt.toLowerCase().includes("phospho") ? "animate-pulse" : ""}`}
                                title={opt}
                              />
                            );
                          })}
                        </div>
                        <div className="text-[10px] text-gray-400 font-sans min-h-[14px]">
                          {selectedVal}
                        </div>
                      </div>
                    );
                  }

                  // 2. BINARY SELECTORS (Toggles "Avec" / "Sans", "Oui" / "Non")
                  const isBinary = options.length === 2 && 
                    ((options[0].toLowerCase().includes("sans") && options[1].toLowerCase().includes("avec")) ||
                     (options[0].toLowerCase().includes("avec") && options[1].toLowerCase().includes("sans")) ||
                     (options[0].toLowerCase().includes("non") && options[1].toLowerCase().includes("oui")) ||
                     (options[0].toLowerCase().includes("oui") && options[1].toLowerCase().includes("non")));

                  if (isBinary) {
                    const sortedOptions = [...options].sort((a, b) => {
                      const aL = a.toLowerCase();
                      if (aL.includes("sans") || aL.includes("non")) return -1;
                      return 1;
                    });

                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {name}
                        </label>
                        <div className="inline-flex bg-spoolio-card border border-spoolio-border rounded-xl p-0.5 max-w-fit select-none">
                          {sortedOptions.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white text-black shadow-lg shadow-white/5"
                                    : "text-gray-400 hover:text-white"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 3. SIZE OR SHORT LISTS (Chips Selector - max 5 options)
                  if (options.length <= 5) {
                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {name}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {options.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`h-10 px-4 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white border-white text-black shadow-lg shadow-white/5"
                                    : "bg-spoolio-card border-spoolio-border text-gray-300 hover:text-white"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 4. LARGE OPTIONS LISTS (Custom Select Dropdown - > 5 options)
                  return (
                    <div key={name} className="flex flex-col gap-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                        {name}
                      </label>
                      <div className="relative max-w-xs">
                        <select
                          value={selectedVal || ""}
                          onChange={(e) => handleSelect(e.target.value)}
                          className="w-full h-11 px-4 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-white outline-none cursor-pointer appearance-none focus:border-white transition-all"
                        >
                          {options.map((opt: string) => (
                            <option key={opt} value={opt} className="bg-[#131316]">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Call to action with Quantity Selector */}
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className={`flex items-center bg-spoolio-card border border-spoolio-border rounded-xl h-14 px-3 select-none ${isNotAvailableToBuy ? "opacity-40" : ""}`}>
                <button
                  disabled={isNotAvailableToBuy}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className={`w-8 h-8 flex items-center justify-center text-gray-400 ${!isNotAvailableToBuy ? "hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer" : "cursor-not-allowed"} rounded-lg transition-all text-lg font-bold`}
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-white font-sans">
                  {isNotAvailableToBuy ? 0 : quantity}
                </span>
                <button
                  disabled={isNotAvailableToBuy}
                  onClick={() => setQuantity(prev => prev + 1)}
                  className={`w-8 h-8 flex items-center justify-center text-gray-400 ${!isNotAvailableToBuy ? "hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer" : "cursor-not-allowed"} rounded-lg transition-all text-lg font-bold`}
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              {isNotAvailableToBuy ? (
                <button
                  disabled
                  className="flex-1 h-14 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed text-center no-invert"
                >
                  {isOutOfStock ? "Rupture de stock" : "Indisponible"}
                </button>
              ) : (
                <button
                  onClick={handleAddToCartClick}
                  className="flex-1 h-14 flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#ff4f00] hover:bg-[#e04500] rounded-xl transition-all duration-300 shadow-xl shadow-[#ff4f00]/25 hover:scale-[1.02] cursor-pointer text-center no-invert group"
                >
                  <UnicornIcon animationData={null} className="w-5 h-5" />
                  Ajouter au panier
                </button>
              )}
            </div>

            {/* Delivery Estimation & Trust Badges */}
            <div className="mt-6 space-y-5 border-t border-spoolio-border/40 pt-5">
              {/* Delivery Estimation */}
              <div className="flex items-start gap-3 text-xs text-gray-400 font-sans leading-relaxed bg-[#1b1b1f]/30 p-3.5 rounded-2xl border border-spoolio-border/30">
                <span className="text-lg shrink-0 select-none">📦</span>
                <div>
                  <p className="text-gray-300 font-bold">
                    Livraison estimée : <span className="text-[#ff4f00] font-black">{getDeliveryDateRange().minStr}</span> au <span className="text-[#ff4f00] font-black">{getDeliveryDateRange().maxStr}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Expédié sous 24/48h depuis notre atelier de Comines (Mondial Relay & Colissimo).
                  </p>
                </div>
              </div>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold tracking-tight text-gray-300 font-sans">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🇫🇷</span>
                  <div>
                    <span className="block text-white">Made in France</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Hauts-de-France</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🌱</span>
                  <div>
                    <span className="block text-white">PLA Biosourcé</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Plastique d'amidon</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🚚</span>
                  <div>
                    <span className="block text-white">Livraison Suivie</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Relais & Domicile</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">💳</span>
                  <div>
                    <span className="block text-white">Paiement 3D Secure</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Stripe 100% protégé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Technical Specs Grid */}
        <section className="border-t border-spoolio-border pt-12">
          <h2 className="text-xl font-bold text-white mb-6">Spécifications du produit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
            <div className="p-4 rounded-xl bg-spoolio-card border border-spoolio-border">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Dimensions / Tailles</span>
              <span className="text-sm font-bold text-gray-200 truncate block" title={sizesText}>{sizesText}</span>
            </div>
            <div className="p-4 rounded-xl bg-spoolio-card border border-spoolio-border">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Couleurs</span>
              <span className="text-sm font-bold text-gray-200">{colorsCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-spoolio-card border border-spoolio-border">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Poids estimé</span>
              <span className="text-sm font-bold text-gray-200">{estimatedWeight}</span>
            </div>
            <div className="p-4 rounded-xl bg-spoolio-card border border-spoolio-border">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Matière & Fabrication</span>
              <span className="text-sm font-bold text-[#ff4f00]">PLA Bio 🇫🇷 Comines</span>
            </div>
          </div>
        </section>

        {/* Blue Gift Promo Banner */}
        <section className="mt-12 bg-[#2F3CD9] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl shadow-[#2F3CD9]/15 border border-white/5 no-invert">
          <div className="flex items-center gap-4">
            <span className="text-3xl animate-bounce shrink-0 select-none">🎁</span>
            <div className="flex flex-col">
              <h4 className="text-base font-extrabold tracking-tight uppercase font-sans keep-white">
                Cadeau offert dans votre colis !
              </h4>
              <p className="text-xs text-white/95 font-sans mt-0.5 leading-relaxed keep-white">
                À partir de 20€ d'achat, on glisse une surprise exclusive imprimée en 3D dans votre commande.
              </p>
            </div>
          </div>
          <div className="text-xs font-black tracking-widest bg-black/20 uppercase px-4 py-2 rounded-full font-sans select-none shrink-0 border border-white/10 keep-white">
            Dès 20€ d'achat
          </div>
        </section>

        {/* Detailed Long Description */}
        <section className="border-t border-spoolio-border pt-12 mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Description</h2>
          <div className="relative">
            <div
              className="prose prose-invert text-gray-300 max-w-none text-sm leading-relaxed font-sans flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: isDescriptionExpanded ? "1200px" : "160px",
              }}
              dangerouslySetInnerHTML={{
                __html: product.description || "<p>Ce produit haut de gamme Spoolio est entièrement conçu et fabriqué localement à Comines. Grâce à la précision de nos imprimantes 3D (Berthe, Philomène, Ursule, Godelaine et Claudine), chaque couche est déposée de manière optimale pour un rendu esthétique et une solidité à toute épreuve.</p><p>Le PLA utilisé pour l'impression est d'origine biologique (amidon de maïs), biodégradable et respectueux de l'environnement.</p>"
              }}
            />
            {/* Fade overlay mask when collapsed */}
            {!isDescriptionExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            )}
          </div>
          <div className="mt-4 flex justify-start">
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs font-bold text-white hover:text-[#ff4f00] transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>{isDescriptionExpanded ? "Voir moins" : "Voir plus"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Frequently Bought Together */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-spoolio-border pt-12 mt-12">
            <h2 className="text-xl font-bold text-white mb-8 tracking-tight font-sans">
              Souvent acheté avec
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => {
                const discountVal = p.on_sale ? Math.round(((parseFloat(p.regular_price) - parseFloat(p.price)) / parseFloat(p.regular_price)) * 100) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group bg-spoolio-card border border-spoolio-border rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-square bg-black/20">
                      {p.images[0] && (
                        <Image
                          src={p.images[0].src}
                          alt={p.images[0].alt || p.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] no-invert"
                        />
                      )}
                      {p.on_sale && (
                        <span className="absolute top-4 left-4 inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-extrabold bg-[#ff4f00] text-white rounded-md shadow-md">
                          {discountVal ? `-${discountVal}%` : "PROMO"}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#ff4f00] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {p.short_description?.replace(/<[^>]*>/g, "").replace(/&rsquo;/g, "’") || "Un superbe accessoire Spoolio fabriqué en PLA écologique."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-white">{parseFloat(p.price).toFixed(2)}€</span>
                          {p.on_sale && (
                            <span className="text-xs text-gray-500 line-through">{parseFloat(p.regular_price).toFixed(2)}€</span>
                          )}
                        </div>
                        <span className="text-xs text-[#ff4f00] font-bold group-hover:underline flex items-center gap-1">
                          Voir le produit &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Safety and conformity notice */}
        <section className="border-t border-spoolio-border pt-12 mt-12">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start">
            <span className="text-3xl shrink-0 select-none bg-amber-500/10 p-3 rounded-2xl border border-amber-500/15">⚠️</span>
            <div className="space-y-2 font-sans">
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-400">
                Note importante de sécurité & conformité
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Afin de maintenir nos prix accessibles, nos objets et fidgets 3D ne subissent pas les tests de laboratoire requis pour l'obtention de la certification CE (dont le coût s'élève à 1500 € par modèle). 
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Par conséquent, nos créations sont réglementairement adaptées et recommandées exclusivement aux personnes de <strong>plus de 14 ans</strong>. Chaque utilisateur reste pleinement responsable de son achat, de son utilisation et de la supervision associée.
              </p>
            </div>
          </div>
        </section>

        {/* Section Avis Clients */}
        <section className="border-t border-spoolio-border pt-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Liste des avis (2/3 de l'espace) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight font-sans">
                Avis Clients ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-[#ff4f00]">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
                      return (
                        <span key={idx} className="text-sm select-none">
                          {idx < Math.round(avg) ? "★" : "☆"}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">
                    {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)} sur 5 étoiles
                  </span>
                </div>
              ) : null}
            </div>

            {loadingReviews ? (
              <div className="text-xs text-gray-500 font-medium py-6 animate-pulse">
                Chargement des avis...
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-spoolio-card border border-spoolio-border text-center text-xs text-gray-500 leading-relaxed">
                Aucun avis n'a été publié pour ce produit. Soyez le premier à donner votre avis !
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-spoolio-card border border-spoolio-border space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="block text-xs font-bold text-white">{rev.customerName}</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          Publié le {new Date(rev.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex text-[#ff4f00]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} className="text-xs select-none">
                            {idx < rev.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire de dépôt (1/3 de l'espace) */}
          <div className="bg-spoolio-card border border-spoolio-border rounded-3xl p-6 h-fit space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Déposer un avis
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                Votre avis doit être associé à l'adresse e-mail utilisée lors de votre commande pour être validé.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Ex: Hélène Felchner"
                  className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  E-mail de votre commande
                </label>
                <input
                  type="email"
                  required
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="Ex: client@exemple.com"
                  className="h-10 border rounded-xl px-3 outline-none transition-colors review-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Note
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-lg transition-colors cursor-pointer select-none ${
                        star <= reviewRating ? "text-[#ff4f00]" : "text-gray-600 hover:text-gray-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Votre commentaire
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Qu'avez-vous pensé de cet objet ?"
                  className="border rounded-xl p-3 outline-none resize-none transition-colors leading-relaxed review-input"
                />
              </div>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] leading-normal">
                  ✓ {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px] leading-normal">
                  ⚠️ {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full h-11 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 review-submit-btn"
              >
                {submittingReview ? "Envoi..." : "Envoyer mon avis"}
              </button>
            </form>
          </div>
        </section>

        {/* Lightbox Modal */}
        {isLightboxOpen && hasImage && (
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-2xl font-bold select-none border border-white/5"
            >
              &times;
            </button>

            {/* Main Lightbox Image */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center cursor-default"
            >
              <Image
                src={product.images[activeImageIndex]?.src}
                alt={product.images[activeImageIndex]?.alt || "Product image"}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />

              {/* Previous Button */}
              {product.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer text-xl font-bold select-none"
                >
                  &#8592;
                </button>
              )}

              {/* Next Button */}
              {product.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer text-xl font-bold select-none"
                >
                  &#8594;
                </button>
              )}
            </div>

            {/* Active count indicator */}
            <div className="mt-4 text-xs font-semibold text-gray-400 font-sans select-none">
              {activeImageIndex + 1} / {product.images.length}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
