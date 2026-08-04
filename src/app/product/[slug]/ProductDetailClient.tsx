"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnicornIcon from "@/components/UnicornIcon";
import { useCart } from "@/context/CartContext";
import { parseNoiseLevel, formatNoiseLevelText } from "@/lib/sensoryUtils";
import cartIconData from "@/components/shopping bag.json";

interface ProductDetailClientProps {
  slug: string;
}

import {
  isVideoMedia,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail
} from "@/lib/mediaUtils";
export { isVideoMedia };

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view when activeImageIndex changes
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current.children[activeImageIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [activeImageIndex]);

  const scrollThumbnails = (dir: "left" | "right") => {
    if (!thumbnailsRef.current) return;
    const distance = 220;
    thumbnailsRef.current.scrollBy({
      left: dir === "left" ? -distance : distance,
      behavior: "smooth"
    });
  };

  const handleThumbnailWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!thumbnailsRef.current) return;
    if (e.deltaY !== 0) {
      thumbnailsRef.current.scrollLeft += e.deltaY;
    }
  };

  // Real-time Manufacturing & Cut-off Countdown State
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(17, 0, 0, 0); // 17:00 cut-off time for today's print queue
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }
      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // States for interactive zoom effect (loupe)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Swipe states for mobile image gallery
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX || !product || !product.images || product.images.length <= 1) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Swipe left -> Next image
      setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Previous image
      setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

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
  const [unavailableColorNames, setUnavailableColorNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchColorsAvailability = async () => {
      try {
        const res = await fetch("/api/colors");
        if (res.ok) {
          const data = await res.json();
          const unavail = (data.colors || [])
            .filter((c: any) => !c.isAvailable)
            .map((c: any) => c.name.toLowerCase().trim());
          setUnavailableColorNames(unavail);
        }
      } catch (e) {
        console.error("Error fetching color availability:", e);
      }
    };
    fetchColorsAvailability();
  }, []);

  const isUnavailableColor = (optionName: string) => {
    if (!unavailableColorNames || unavailableColorNames.length === 0) return false;
    const normalizedOpt = optionName.toLowerCase().replace(/\u00a0/g, ' ').trim();
    return unavailableColorNames.some((uName) => {
      if (normalizedOpt === uName) return true;
      if (uName.length >= 3 && (normalizedOpt.includes(uName) || uName.includes(normalizedOpt))) return true;
      return false;
    });
  };

  // Initialize selected variations options
  useEffect(() => {
    if (product && product.attributes) {
      const attrs = Array.isArray(product.attributes)
        ? product.attributes
        : (product.attributes as any).attributes || [];
      const initialOptions: Record<string, string> = {};
      attrs.forEach((attr: any) => {
        if (attr.options && attr.options.length > 0) {
          const validOpts = attr.options
            .map((o: string) => o.replace(/\u00a0/g, ' ').trim())
            .filter((o: string) => !isUnavailableColor(o));
          initialOptions[attr.name] = validOpts.length > 0 ? validOpts[0] : attr.options[0].replace(/\u00a0/g, ' ').trim();
        }
      });
      setSelectedOptions(initialOptions);


      // Auto-switch to initial variation image if present
      const attrData = product.attributes as any;
      if (attrData && attrData.variationPrices && Array.isArray(attrData.variationPrices)) {
        const matches = attrData.variationPrices.filter((vp: any) => {
          return Object.entries(vp.combination).every(([key, value]) => {
            if (!value || String(value).trim() === "" || String(value).toLowerCase().includes("tous")) return true;
            const decodedKey = decodeHtml(key).toLowerCase().trim();
            const selectedEntry = Object.entries(initialOptions).find(([selKey]) => {
              return decodeHtml(selKey).toLowerCase().trim() === decodedKey;
            });
            if (!selectedEntry) return false;
            const selectedValue = selectedEntry[1];
            return selectedValue && decodeHtml(String(selectedValue)).toLowerCase().trim() === decodeHtml(String(value)).toLowerCase().trim();
          });
        });

        if (matches.length > 0) {
          // Sort by specificity
          matches.sort((a: any, b: any) => {
            const aSpec = Object.values(a.combination).filter(v => v && String(v).trim() !== "").length;
            const bSpec = Object.values(b.combination).filter(v => v && String(v).trim() !== "").length;
            return bSpec - aSpec;
          });

          const bestMatch = matches[0];
          if (bestMatch && bestMatch.imageSrc) {
            const imgIdx = product.images.findIndex(img => img.src === bestMatch.imageSrc);
            if (imgIdx !== -1) {
              setActiveImageIndex(imgIdx);
            }
          }
        }
      }
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
        
        // Normalize HTML entities in product attributes & variation combinations keys/values
        if (data && data.attributes) {
          try {
            let attrData = typeof data.attributes === "string"
              ? JSON.parse(data.attributes)
              : data.attributes;
            
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

            data.attributes = attrData;
          } catch (e) {
            console.error("Error parsing/normalizing product attributes in detail page:", e);
          }
        }
        
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

  const getKeywordBadge = () => {
    const categoriesText = Array.isArray(product.categories)
      ? product.categories.map(c => c.name || "").join(" ")
      : "";
    const textToCheck = `${product.name} ${categoriesText}`.toLowerCase();
    if (textToCheck.includes("goofy")) return "👀 JUGE";
    if (textToCheck.includes("marcel")) return "🐙 MARCEL";
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

  // Helper to decode WooCommerce HTML entities (like &#039;)
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

  // Extract attributes list
  const attributesList = product.attributes
    ? (Array.isArray(product.attributes)
        ? product.attributes
        : (product.attributes as any).attributes || [])
    : [];

  const firstColorAttributeName = attributesList?.find((attr: any) => {
    const nameLower = attr.name.toLowerCase();
    const controlType = attr.controlType || "default";
    
    // Explicit color swatch OR default automatic detection based on color names (excluding taille)
    return controlType === "color_swatch" || 
      (controlType === "default" && 
       (nameLower.includes("couleur") || nameLower.includes("accent") || nameLower.includes("tube") || nameLower.includes("bague")) && 
       !nameLower.includes("taille"));
  })?.name;

  // Active variation price calculation
  const getActivePriceInfo = () => {
    if (!product) return { price: "0", isVariation: false };
    const attrData = product.attributes as any;
    if (attrData && attrData.variationPrices && Array.isArray(attrData.variationPrices)) {
      // 1. Filter all matching variations
      const matches = attrData.variationPrices.filter((vp: any) => {
        return Object.entries(vp.combination).every(([key, value]) => {
          // If value is empty, it's a wildcard matching any selected option
          if (!value || String(value).trim() === "" || String(value).toLowerCase().includes("tous")) return true;
          
          // Decode both combination key and selectedOptions keys to avoid mismatch due to HTML entities (like &#039; vs ')
          const decodedKey = decodeHtml(key).toLowerCase().trim();
          
          // Find the value in selectedOptions where the decoded key matches
          const selectedEntry = Object.entries(selectedOptions).find(([selKey]) => {
            return decodeHtml(selKey).toLowerCase().trim() === decodedKey;
          });
          
          if (!selectedEntry) return false;
          
          const selectedValue = selectedEntry[1];
          return selectedValue && decodeHtml(selectedValue).toLowerCase().trim() === decodeHtml(String(value)).toLowerCase().trim();
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

  // Plausible print time based on price (approx. 12 mins per Euro, min 45 mins)
  const printTimeMin = Math.max(45, Math.round(priceNum * 12));
  const printHours = Math.floor(printTimeMin / 60);
  const printMins = printTimeMin % 60;
  const printTimeString = printHours > 0 ? `${printHours}h${printMins > 0 ? printMins : ""}` : `${printMins} min`;

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

  // Check if video is present in product gallery
  const videoMediaIndex = product?.images?.findIndex(img => isVideoMedia(img.src)) ?? -1;
  const hasVideoMedia = videoMediaIndex !== -1;

  // Sensory noise level calculation (strictly restricted to Fidgets & products with noise level property)
  const getSensoryNoiseInfo = () => {
    if (!product) return null;

    // 1. Check Categories (must contain "fidget")
    const categoryNames = Array.isArray(product.categories)
      ? product.categories.map((c) => (c.name || "").toLowerCase())
      : [];
    const isFidgetCategory = categoryNames.some((cat) => cat.includes("fidget"));

    // 2. Check Name (must contain explicit fidget product types)
    const nameLower = (product.name || "").toLowerCase();
    const isFidgetName =
      nameLower.includes("fidget") ||
      nameLower.includes("clicker") ||
      nameLower.includes("cliqueur") ||
      nameLower.includes("spinner") ||
      nameLower.includes("bague");

    // 3. Check DB sensory_noise_level property
    const rawSensoryLevel = (product as any).sensory_noise_level ?? (product as any).sensoryNoiseLevel;
    const hasRawSensoryLevel =
      rawSensoryLevel !== undefined &&
      rawSensoryLevel !== null &&
      rawSensoryLevel !== "" &&
      rawSensoryLevel !== "none" &&
      rawSensoryLevel !== "null";

    // 4. Check explicit "Bruit" attribute from product attributes list
    const noiseAttr = attributesList?.find((attr: any) => {
      const n = (attr.name || "").toLowerCase().trim();
      return n.includes("bruit") || n.includes("sonore") || n.includes("noise");
    });
    const hasNoiseAttr = Boolean(noiseAttr && noiseAttr.options && noiseAttr.options.length > 0);

    // If NONE of these 4 strict conditions are met, it is NOT a fidget -> RETURN NULL!
    if (!isFidgetCategory && !isFidgetName && !hasRawSensoryLevel && !hasNoiseAttr) {
      return null;
    }

    // 1. Process DB sensory_noise_level property if explicitly present
    if (hasRawSensoryLevel) {
      const parsed = parseNoiseLevel(rawSensoryLevel);
      if (parsed <= 3) {
        return { level: 1, label: "Discret / Silencieux", description: `Silencieux (${parsed}/10 - 0 dB) 🔇` };
      }
      if (parsed <= 6) {
        return { level: 2, label: "Bruit Modéré", description: `Frottement fluide (${parsed}/10) 🔕` };
      }
      return { level: 3, label: "Clic ASMR", description: `Stimulation sonore & tactile (${parsed}/10) 🔊` };
    }

    // 2. Process explicit "Bruit" attribute
    if (hasNoiseAttr && noiseAttr) {
      const valStr = String(noiseAttr.options[0]).toLowerCase().trim();
      const parsed = parseNoiseLevel(valStr);
      if (parsed <= 3 || valStr.includes("silenc") || valStr.includes("discret")) {
        return { level: 1, label: "Discret / Silencieux", description: "Idéal pour réunions & cours 🔇" };
      }
      if (parsed >= 7 || valStr.includes("asmr") || valStr.includes("clic") || valStr.includes("fort")) {
        return { level: 3, label: "Clic ASMR", description: "Stimulation tactile & sonore forte 🔊" };
      }
      return { level: 2, label: "Bruit Modéré", description: "Frottement fluide & satisfaisant 🔕" };
    }

    // 3. Fallback classification for fidgets based on product name keywords
    if (nameLower.includes("clicker") || nameLower.includes("cliqueur") || nameLower.includes("switch")) {
      return { level: 3, label: "Clic ASMR", description: "Stimulation tactile & sonore forte 🔊" };
    }
    if (nameLower.includes("spinner") || nameLower.includes("engrenage")) {
      return { level: 2, label: "Bruit Modéré", description: "Frottement fluide & satisfaisant 🔕" };
    }
    return { level: 1, label: "Discret / Silencieux", description: "Idéal pour réunions & cours 🔇" };
  };
  const noiseInfo = getSensoryNoiseInfo();

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
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-spoolio-orange selection:text-black">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-[#1f1f23]">
        <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 lg:py-12">
        {/* Breadcrumb Navigation (Fil d'Ariane) */}
        <nav className="flex items-center gap-1.5 text-[11px] lg:text-xs font-semibold text-gray-400 mb-3 lg:mb-8 font-sans select-none overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-white transition-colors shrink-0">
            Accueil
          </Link>
          <span className="text-gray-600 font-bold shrink-0">/</span>
          <Link href="/" className="hover:text-white transition-colors shrink-0">
            Boutique
          </Link>
          {Array.isArray(product.categories) && product.categories.length > 0 && (
            <>
              <span className="text-gray-600 font-bold shrink-0">/</span>
              <Link 
                href={`/categorie/${encodeURIComponent(product.categories[0].name)}`} 
                className="text-gray-400 hover:text-white transition-colors shrink-0 max-w-[100px] sm:max-w-none truncate"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="text-gray-600 font-bold shrink-0">/</span>
          <span className="text-white font-bold truncate">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Image Container with zoom aspect-ratio & thumbnails */}
          <div className="flex flex-col">
            <div className="relative w-screen lg:w-full left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 aspect-square rounded-none lg:rounded-2xl overflow-hidden bg-black/40 border-0 lg:border lg:border-spoolio-border p-0 lg:p-2">
              <div
                onClick={() => setIsLightboxOpen(true)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                className="relative w-full h-full rounded-none lg:rounded-xl overflow-hidden bg-spoolio-card cursor-zoom-in select-none touch-pan-y group/gallery"
              >
                {hasImage ? (
                  (() => {
                    const activeSrc = product.images[activeImageIndex]?.src || imageUrl;
                    const activeAlt = product.images[activeImageIndex]?.alt || imageAlt;
                    const isVid = isVideoMedia(activeSrc);

                    if (isVid) {
                      const ytEmbedUrl = isYouTubeUrl(activeSrc) ? getYouTubeEmbedUrl(activeSrc) : null;
                      return (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                          {ytEmbedUrl ? (
                            <iframe
                              src={ytEmbedUrl}
                              className="w-full h-full border-0 rounded-none lg:rounded-xl pointer-events-auto"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={activeSrc}
                              controls
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover rounded-none lg:rounded-xl no-invert"
                            />
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        className="w-full h-full relative transition-transform duration-300 ease-out"
                        style={{
                          transformOrigin: isZooming ? `${zoomPos.x}% ${zoomPos.y}%` : "center center",
                          transform: isZooming ? "scale(2.2)" : "scale(1)",
                        }}
                      >
                        <Image
                          src={activeSrc}
                          alt={activeAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover no-invert"
                          priority
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                    <svg className="w-16 h-16 mb-2 text-spoolio-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Spoolio 3D</span>
                  </div>
                )}

                {/* Direct image navigation arrows */}
                {hasImage && product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hidden md:flex z-20 active:scale-95"
                      title="Média précédent"
                      aria-label="Média précédent"
                    >
                      <svg className="w-5 h-5 -translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hidden md:flex z-20 active:scale-95"
                      title="Média suivant"
                      aria-label="Média suivant"
                    >
                      <svg className="w-5 h-5 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
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

                {/* Floating "Voir en mouvement" Video Action Button */}
                {hasVideoMedia && activeImageIndex !== videoMediaIndex && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(videoMediaIndex);
                    }}
                    type="button"
                    className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/85 hover:bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider border border-white/20 hover:border-[#ff4f00] backdrop-blur-md shadow-2xl transition-all hover:scale-105 active:scale-95 group/vbtn cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff4f00] group-hover/vbtn:bg-white animate-ping" />
                    <span>🎬 VOIR EN MOUVEMENT</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Grid & Scroll Controls */}
            {product.images.length > 1 && (
              <div className="relative mt-4 group/thumbs">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-[#ff4f00] text-white flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover/thumbs:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer font-bold text-lg"
                  title="Photos précédentes"
                >
                  ‹
                </button>

                {/* Thumbnail Strip */}
                <div
                  ref={thumbnailsRef}
                  onWheel={handleThumbnailWheel}
                  className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 select-none scroll-smooth touch-pan-x no-scrollbar"
                >
                  {product.images.map((img, idx) => {
                    const isVid = isVideoMedia(img.src);
                    const ytThumb = isYouTubeUrl(img.src) ? getYouTubeThumbnail(img.src) : null;
                    return (
                      <button
                        key={`${img.id}-${idx}`}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden bg-spoolio-card border transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-white scale-105 shadow-lg shadow-white/10 ring-2 ring-white/60 z-10"
                            : "border-spoolio-border hover:border-white/40 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {isVid ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-black/70">
                            {ytThumb ? (
                              <Image src={ytThumb} alt={img.alt || img.name} fill sizes="80px" unoptimized className="object-cover opacity-80 no-invert" />
                            ) : (
                              <video src={img.src} muted preload="metadata" className="w-full h-full object-cover opacity-60" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <svg className="w-7 h-7 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={img.src}
                            alt={img.alt || img.name}
                            fill
                            sizes="80px"
                            className="object-cover no-invert"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Scroll Right Button */}
                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-[#ff4f00] text-white flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover/thumbs:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer font-bold text-lg"
                  title="Photos suivantes"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Content and Options */}
          <div className="flex flex-col">
            {/* Category tag */}
            {Array.isArray(product.categories) && product.categories.length > 0 && (
              <span className="inline-flex items-center self-start text-[10px] font-black text-white bg-[#2F3CD9] px-2.5 py-1.5 rounded-lg uppercase tracking-widest mb-3.5 no-invert shadow-md shadow-[#2F3CD9]/10">
                {product.categories.map(c => c.name).join(" / ")}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-4 mb-4">
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

            {/* Sensory Noise Level Gauge (Fidgets Only) */}
            {noiseInfo && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 font-sans">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="text-base">{noiseInfo.level === 3 ? "🔊" : noiseInfo.level === 2 ? "🔕" : "🔇"}</span>
                  <span className="uppercase tracking-wider">Niveau Sonore :</span>
                  <span className="text-[#ff4f00] font-black">{noiseInfo.label}</span>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 w-24">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          bar <= noiseInfo.level
                            ? noiseInfo.level === 3
                              ? "bg-[#ff4f00] shadow-[0_0_8px_rgba(255,79,0,0.6)]"
                              : noiseInfo.level === 2
                              ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                              : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">({noiseInfo.description})</span>
                </div>
              </div>
            )}

            {/* Short Description */}
            <div
              className="text-gray-400 text-sm leading-relaxed mb-8 border-b border-spoolio-border/40 pb-6 font-sans"
              dangerouslySetInnerHTML={{ __html: product.short_description || "<p>Aucune description disponible pour ce produit.</p>" }}
            />

            {/* Print Settings Options (Dynamic attributes) */}
            {(() => {
              const selectableAttributes = attributesList.filter((attr: any) => {
                const n = (attr.name || "").toLowerCase().trim();
                if (n === "personnalisable" || n.includes("personnalisable")) return false;
                if (attr.variation === false || attr.variation === "false" || attr.isVariation === false) return false;
                return true;
              });

              if (!selectableAttributes || selectableAttributes.length === 0) return null;

              return (
                <div className="flex flex-col gap-6 mb-8">
                  {selectableAttributes.map((attr: any) => {
                    const name = attr.name;
                    const nameLower = (name || "").toLowerCase().trim();
                    if (nameLower === "personnalisable" || nameLower.includes("personnalisable")) return null;

                    const rawOptions = attr.options || [];
                    let options = Array.from(new Set<string>(rawOptions.map((opt: string) => opt.replace(/\u00a0/g, ' ').trim())))
                      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base', numeric: true }));
                    const selectedVal = selectedOptions[name];
                    const decodedName = decodeHtml(name);

                  // Helper function to update state
                  const handleSelect = (val: string) => {
                    setSelectedOptions(prev => {
                      const nextOptions = {
                        ...prev,
                        [name]: val
                      };

                      // Auto-switch image if variant has a mapped image
                      const attrData = product.attributes as any;
                      if (attrData && attrData.variationPrices && Array.isArray(attrData.variationPrices)) {
                        const matches = attrData.variationPrices.filter((vp: any) => {
                          return Object.entries(vp.combination).every(([key, value]) => {
                            if (!value || String(value).trim() === "" || String(value).toLowerCase().includes("tous")) return true;
                            const decodedKey = decodeHtml(key).toLowerCase().trim();
                            const selectedEntry = Object.entries(nextOptions).find(([selKey]) => {
                              return decodeHtml(selKey).toLowerCase().trim() === decodedKey;
                            });
                            if (!selectedEntry) return false;
                            const selectedValue = selectedEntry[1];
                            return selectedValue && decodeHtml(String(selectedValue)).toLowerCase().trim() === decodeHtml(String(value)).toLowerCase().trim();
                          });
                        });

                        if (matches.length > 0) {
                          // Sort by specificity
                          matches.sort((a: any, b: any) => {
                            const aSpec = Object.values(a.combination).filter(v => v && String(v).trim() !== "").length;
                            const bSpec = Object.values(b.combination).filter(v => v && String(v).trim() !== "").length;
                            return bSpec - aSpec;
                          });

                          const bestMatch = matches[0];
                          if (bestMatch && bestMatch.imageSrc) {
                            const imgIdx = product.images.findIndex(img => img.src === bestMatch.imageSrc);
                            if (imgIdx !== -1) {
                              setActiveImageIndex(imgIdx);
                            }
                          }
                        }
                      }

                      return nextOptions;
                    });
                  };

                  const controlType = attr.controlType || "default";

                  // Check rendering type
                  const isColor = controlType === "color_swatch" || 
                    (controlType === "default" && 
                     (nameLower.includes("couleur") || nameLower.includes("accent") || nameLower.includes("tube") || nameLower.includes("bague")) && 
                     !nameLower.includes("taille"));

                  // Filter out unavailable filaments for color options
                  if (isColor || nameLower.includes("couleur") || controlType === "color_swatch") {
                    const availableOpts = options.filter((opt) => !isUnavailableColor(opt));
                    if (availableOpts.length > 0) {
                      options = availableOpts;
                    }
                  }

                  
                  const isBinary = controlType === "default" && 
                    options.length === 2 && 
                    ((options[0].toLowerCase().includes("sans") && options[1].toLowerCase().includes("avec")) ||
                     (options[0].toLowerCase().includes("avec") && options[1].toLowerCase().includes("sans")) ||
                     (options[0].toLowerCase().includes("non") && options[1].toLowerCase().includes("oui")) ||
                     (options[0].toLowerCase().includes("oui") && options[1].toLowerCase().includes("non")));

                  const isSegmented = controlType === "segmented_control" || 
                    (controlType === "default" && !isColor && !isBinary && options.length <= 5);

                  const isDatePicker = controlType === "date_picker";

                  const isChips = controlType === "chips";

                  // 1. COLORS SELECTOR (Circle Swatches)
                  if (isColor) {
                    const getCssColor = (colorName: string) => {
                      if (!colorName) return "#ff4f00"; // safety guard
                      const cName = colorName.toLowerCase().trim();
                      const colorMap: Record<string, string> = {
                        "arc en ciel": "conic-gradient(#ff0000 0deg, #ff7f00 45deg, #ffff00 90deg, #00ff00 135deg, #0000ff 180deg, #4b0082 225deg, #8b00ff 270deg, #ff0000 360deg)",
                        "bicolore bleu-rose": "linear-gradient(135deg, #58a6ff 50%, #ff66cc 50%)",
                        "bicolore bleu clair – rose": "linear-gradient(135deg, #58a6ff 50%, #ff66cc 50%)",
                        "bicolore bleu-vert": "linear-gradient(135deg, #2563eb 50%, #2ebd59 50%)",
                        "bicolore bleu-violet mat": "linear-gradient(135deg, #2c3e50 50%, #8e44ad 50%)",
                        "bicolore bleu-violet": "linear-gradient(135deg, #00c6ff 50%, #a32eff 50%)",
                        "bicolore or-rouge": "linear-gradient(135deg, #ffd700 50%, #ff2a2a 50%)",
                        "bicolore or-argent": "linear-gradient(135deg, #ffd700 50%, #cfd9df 50%)",
                        "bicolore rose-violet": "linear-gradient(135deg, #ff66cc 50%, #a32eff 50%)",
                        "bicolore": "linear-gradient(to right, #ff4f00 50%, #a32eff 50%)",
                        "rouge feu (dégradé)": "linear-gradient(to bottom, #ff4f00, #dc2626)",
                        "feu": "radial-gradient(circle, #facc15 0%, #f97316 60%, #dc2626 100%)",
                        "noir pailleté": "linear-gradient(135deg, #151518 0%, #35353a 100%)",
                        "gris pailleté": "linear-gradient(135deg, #7f8c8d 0%, #a5b1b2 100%)",
                        "vert foncé pailleté": "linear-gradient(135deg, #114220 0%, #246d3a 100%)",
                        "argenté (reflets métal)": "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
                        "argenté": "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
                        "argent": "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
                        "bois (imitation chêne)": "#a0785a",
                        "bois": "#a0785a",
                        "imitation roche": "#8c8c82",
                        "roche": "#8c8c82",
                        "marbre": "#f5f6f8",
                        "phosphorescent": "#e0ffe0",
                        "transparent": "rgba(255, 255, 255, 0.15)",
                        "blanc": "#ffffff",
                        "noir": "#121214",
                        "gris": "#7f8c8d",
                        "beige (cacahuète)": "#c8a87a",
                        "beige": "#c8a87a",
                        "jaune soleil": "#f59e0b",
                        "jaune": "#facc15",
                        "orange pêche": "#ffb085",
                        "orange translucide": "rgba(249, 115, 22, 0.4)",
                        "orange": "#ff4f00",
                        "rose poudré": "#ffb7c5",
                        "rose pâle": "#ffd1dc",
                        "rose": "#ff66cc",
                        "rouge brique": "#9b2335",
                        "rouge": "#ff2a2a",
                        "vert fluo / pomme": "#66ff33",
                        "vert fluo": "#66ff33",
                        "vert foncé": "#134e1e",
                        "vert pâle": "#86efac",
                        "vert": "#2ebd59",
                        "violet": "#a32eff",
                        "bleu canard": "#008080",
                        "bleu marine": "#0d1b2a",
                        "bleu turquoise": "#06b6d4",
                        "bleu clair": "#58a6ff",
                        "bleu": "#005cff",
                        "marron clair": "#a0785a",
                        "marron moyen": "#7d4f35",
                        "marron foncé": "#5c3d2e",
                      };
                      for (const key of Object.keys(colorMap)) {
                        if (cName === key || cName.includes(key)) return colorMap[key];
                      }
                      return "#ff4f00"; // fallback
                    };

                    const showPaletteLink = name === firstColorAttributeName;

                    return (
                      <div key={name} className="relative flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                            {decodedName}
                          </label>
                          {showPaletteLink && (
                            <Link 
                              href="/palette-couleurs" 
                              target="_blank" 
                              className="text-[10px] text-[#ff4f00] hover:text-[#ff4f00]/80 underline font-semibold transition-colors flex items-center gap-1 font-sans"
                            >
                              🎨 Palette de couleurs
                            </Link>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === name ? null : name)}
                            type="button"
                            className={`w-full h-12 px-4 rounded-xl bg-spoolio-card border transition-all cursor-pointer text-left flex items-center justify-between focus:outline-none select-none ${
                              activeDropdown === name ? "border-[#ff4f00] ring-1 ring-[#ff4f00]/25" : "border-spoolio-border/60 hover:border-white/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Micro-bobine de la couleur sélectionnée */}
                              <div 
                                style={{ background: getCssColor(selectedVal) }} 
                                className="w-6 h-6 rounded-full border border-white/20 relative shrink-0 shadow-md"
                              >
                                <div className="absolute inset-[30%] rounded-full bg-[#111113] border border-black/35 pointer-events-none" />
                              </div>
                              <span className="text-sm font-semibold text-white truncate max-w-[220px] md:max-w-xs">{selectedVal || "Choisir une couleur..."}</span>
                            </div>
                            <svg 
                              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${activeDropdown === name ? "rotate-180 text-white" : ""}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown Options List */}
                          {activeDropdown === name && (
                            <>
                              {/* Background overlay to catch click-away events */}
                              <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                              
                              <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-spoolio-card/95 border border-spoolio-border/80 rounded-xl shadow-2xl z-50 backdrop-blur-md divide-y divide-spoolio-border/30 animate-none no-scrollbar">
                                {options.map((opt: string) => {
                                  const isOptionSelected = selectedVal === opt;
                                  const optionBg = getCssColor(opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        handleSelect(opt);
                                        setActiveDropdown(null);
                                      }}
                                      type="button"
                                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-white/[0.04] cursor-pointer text-left ${
                                        isOptionSelected ? "bg-white/[0.02]" : ""
                                      }`}
                                    >
                                      {/* Micro-bobine de l'option */}
                                      <div 
                                        style={{ background: optionBg }} 
                                        className="w-5 h-5 rounded-full border border-white/10 relative shrink-0"
                                      >
                                        <div className="absolute inset-[30%] rounded-full bg-[#111113] pointer-events-none" />
                                      </div>
                                      <span className={`text-xs font-semibold flex-1 truncate ${isOptionSelected ? "text-[#ff4f00] font-black" : "text-gray-300"}`}>
                                        {opt}
                                      </span>
                                      {isOptionSelected && (
                                        <span className="text-xs text-[#ff4f00] font-black select-none">✓</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 2. BINARY SELECTORS (Toggles "Avec" / "Sans", "Oui" / "Non")
                  if (isBinary) {
                    const sortedOptions = [...options].sort((a, b) => {
                      const aL = a.toLowerCase();
                      if (aL.includes("sans") || aL.includes("non")) return -1;
                      return 1;
                    });

                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {decodedName}
                        </label>
                        <div className="segmented-control-container inline-flex bg-spoolio-card border border-spoolio-border rounded-xl p-0.5 max-w-fit select-none">
                          {sortedOptions.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white text-black shadow-lg shadow-white/5 variant-btn-selected"
                                    : "text-gray-400 hover:text-white"
                                }`}
                                type="button"
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 3. SEGMENTED CONTROL (Onglets juxtaposés)
                  if (isSegmented) {
                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {decodedName}
                        </label>
                        <div className="segmented-control-container inline-flex bg-spoolio-card border border-spoolio-border rounded-xl p-0.5 max-w-fit select-none">
                          {options.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white text-black shadow-lg shadow-white/5 variant-btn-selected"
                                    : "text-gray-400 hover:text-white"
                                }`}
                                type="button"
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 4. CHIPS (Pastilles simples séparées)
                  if (isChips) {
                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {decodedName}
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
                                    ? "bg-white border-white text-black shadow-lg shadow-white/5 variant-btn-selected"
                                    : "bg-spoolio-card border-spoolio-border text-gray-300 hover:text-white"
                                }`}
                                type="button"
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 5. DATE PICKER
                  if (isDatePicker) {
                    return (
                      <div key={name} className="flex flex-col gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {decodedName}
                        </label>
                        <div className="relative max-w-xs">
                          <input
                            type="date"
                            value={selectedVal || ""}
                            onChange={(e) => handleSelect(e.target.value)}
                            className="w-full h-11 px-4 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-white outline-none cursor-pointer focus:border-white transition-all font-sans"
                          />
                        </div>
                      </div>
                    );
                  }

                  // 6. DEFAULT SELECT DROPDOWN
                  return (
                    <div key={name} className="flex flex-col gap-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                        {decodedName}
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
            );
          })()}



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
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  className={`flex-1 h-14 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-xl cursor-pointer text-center no-invert group ${
                    isAdded 
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 scale-[0.98]" 
                      : "bg-[#ff4f00] hover:bg-[#e04500] shadow-[#ff4f00]/25 hover:scale-[1.02]"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <span className="text-base select-none animate-bounce">✓</span>
                      Ajouté au panier !
                    </>
                  ) : (
                    <>
                      <UnicornIcon animationData={cartIconData} className="w-10 h-10 scale-[1.8]" isHovered={isButtonHovered} />
                      Ajouter au panier
                    </>
                  )}
                </button>
              )}
            </div>



            {/* Encart Fidget Sensoriel (Boussole Info - Style Néon & Fort Contraste Sombre) */}
            {Boolean((product as any).show_in_sensory_compass || (product as any).showInSensoryCompass) && (
              <div className="mt-5 p-6 rounded-3xl bg-[#16141d] border border-purple-500/30 shadow-xl shadow-purple-950/40 font-sans">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl animate-pulse">🧭</span>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                        Fidget Sensoriel Spoolio
                      </h3>
                      <p className="text-xs text-purple-300/90 font-medium">
                        Évaluation sensorielle &amp; ergonomique
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/boussole-sensorielle"
                    className="text-[11px] font-bold text-purple-200 hover:text-white bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/40 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                  >
                    <span>Boussole</span>
                    <span>→</span>
                  </Link>
                </div>

                {/* Sensory Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {/* Bruit */}
                  <div className="p-3.5 rounded-2xl bg-[#22202c] border border-purple-500/25 flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
                      Bruit :
                    </span>
                    <span className="text-xs font-black text-white">
                      {formatNoiseLevelText(parseNoiseLevel((product as any).sensory_noise_level || (product as any).sensoryNoiseLevel))}
                    </span>
                  </div>

                  {/* Compacité */}
                  <div className="p-3.5 rounded-2xl bg-[#22202c] border border-purple-500/25 flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
                      Format :
                    </span>
                    <span className="text-xs font-black text-white">
                      {((product as any).sensory_size || (product as any).sensorySize) === "pocket"
                        ? "Format Poche (1 main)"
                        : ((product as any).sensory_size || (product as any).sensorySize) === "medium"
                        ? "Moyen / Bureau"
                        : "Grand Format"}
                    </span>
                  </div>

                  {/* Manipulation */}
                  <div className="p-3.5 rounded-2xl bg-[#22202c] border border-purple-500/25 flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
                      Action :
                    </span>
                    <span className="text-xs font-black text-[#ff4f00] capitalize">
                      {(() => {
                        const cat = (product as any).sensory_category || (product as any).sensoryCategory || "manipuler";
                        const map: Record<string, string> = {
                          cliquer: "Cliquer",
                          manipuler: "Manipuler",
                          resoudre: "Résoudre",
                          caresser: "Caresser",
                          tourner: "Tourner",
                          presser: "Presser",
                        };
                        return map[cat] || cat;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Profils ciblés Badges */}
                {(() => {
                  const rawProfiles = (product as any).sensory_profiles || (product as any).sensoryProfiles;
                  const profilesList = Array.isArray(rawProfiles)
                    ? rawProfiles
                    : (typeof rawProfiles === 'string' ? rawProfiles.split(',').map((s: string) => s.trim()) : []);

                  if (profilesList.length === 0) return null;

                  const profileLabels: Record<string, { label: string; icon: string }> = {
                    tdah: { label: "TDAH & Besoins Moteurs", icon: "⚡" },
                    anxiety: { label: "Anxiété & Anti-Stress", icon: "🧘" },
                    focus: { label: "Focus & Concentration", icon: "🎯" },
                    autism: { label: "Stimulation Sensorielle TSA", icon: "🧠" },
                  };

                  return (
                    <div className="flex flex-col gap-2 pt-2 border-t border-purple-500/20">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        Recommandé pour les profils :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profilesList.map((prof: string) => {
                          const info = profileLabels[prof] || { label: prof, icon: "✨" };
                          return (
                            <span
                              key={prof}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-200 border border-purple-500/40"
                            >
                              <span>{info.icon}</span>
                              <span>{info.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Delivery Estimation & Trust Badges */}
            <div className="mt-6 space-y-5 border-t border-spoolio-border/40 pt-6">
              {/* Delivery Estimation */}
              <div className="flex items-start gap-3 text-xs text-gray-400 font-sans leading-relaxed bg-[#1b1b1f]/30 p-4 rounded-2xl border border-spoolio-border/30">
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

              {/* Loyalty Points Credit Estimation */}
              {parseFloat(currentPrice) >= 2 && (
                <div className="flex items-start gap-3 text-xs text-gray-400 font-sans leading-relaxed bg-[#ff4f00]/5 p-4 rounded-2xl border border-[#ff4f00]/25 relative overflow-hidden group select-none transition-all duration-300 hover:border-[#ff4f00]/40">
                  {/* Background light glow */}
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-[#ff4f00]/5 filter blur-[15px] pointer-events-none" />
                  <span className="text-lg shrink-0 select-none text-[#ff4f00] animate-pulse">⚡</span>
                  <div>
                    <p className="text-gray-300 font-bold">
                      Carte de fidélité : <span className="text-[#ff4f00] font-black">+{Math.floor(parseFloat(currentPrice) / 2)} points</span> sur cette commande !
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Cumule 2€ = 1 point (hors dons/livraison) et débloque tes cadeaux exclusifs à l'atelier.
                    </p>
                  </div>
                </div>
              )}

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold tracking-tight text-gray-300 font-sans">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🇫🇷</span>
                  <div>
                    <span className="block text-white">Made in France</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Hauts-de-France</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🌱</span>
                  <div>
                    <span className="block text-white">PLA Biosourcé</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Plastique d'amidon</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-spoolio-card border border-spoolio-border/30">
                  <span className="text-base select-none">🚚</span>
                  <div>
                    <span className="block text-white">Livraison Suivie</span>
                    <span className="block text-[9px] text-gray-500 font-normal">Relais & Domicile</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-spoolio-card border border-spoolio-border/30">
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

          {/* Dedicated Tags Zone inside Specifications */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 p-5 rounded-2xl bg-spoolio-card border border-spoolio-border/40 flex flex-col gap-3 font-sans">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span>🏷️</span>
                <span>Tags & Mots-clés associés :</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: any, idx: number) => {
                  const tagName = typeof tag === 'object' ? tag.name : tag;
                  if (!tagName) return null;
                  return (
                    <span
                      key={idx}
                      className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-wider select-none"
                    >
                      #{tagName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
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

            {/* Main Lightbox Image / Video */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center cursor-default"
            >
              {(() => {
                const lightboxSrc = product.images[activeImageIndex]?.src;
                const isVid = isVideoMedia(lightboxSrc);

                if (isVid) {
                  return (
                    <video
                      src={lightboxSrc}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-w-full max-h-full object-contain"
                    />
                  );
                }

                return (
                  <Image
                    src={lightboxSrc}
                    alt={product.images[activeImageIndex]?.alt || "Product image"}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                  />
                );
              })()}

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
