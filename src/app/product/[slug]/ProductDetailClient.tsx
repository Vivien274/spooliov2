"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnjeuBanner from "@/components/EnjeuBanner";
import UnicornIcon from "@/components/UnicornIcon";
import { useCart } from "@/context/CartContext";
import { parseNoiseLevel, formatNoiseLevelText } from "@/lib/sensoryUtils";
import cartIconData from "@/components/shopping bag.json";
import HandmadeProductView from "@/components/HandmadeProductView";
import { Camera, Ruler, Mail, HelpCircle, X, ArrowLeft, ArrowRight, Minus, Plus, MapPin, Leaf, Gift, Truck, ShieldCheck } from "lucide-react";

interface ProductDetailClientProps {
  slug: string;
  isDraftPreview?: boolean;
  initialProduct?: Product | null;
  initialRelatedProducts?: Product[];
  initialReviews?: any[];
  breadcrumbItems?: { name: string; url: string }[];
}

import {
  isVideoMedia,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail
} from "@/lib/mediaUtils";
export { isVideoMedia };

import { useTranslation } from "@/context/LanguageContext";

export default function ProductDetailClient({
  slug,
  isDraftPreview = false,
  initialProduct = null,
  initialRelatedProducts = [],
  initialReviews = [],
  breadcrumbItems = [],
}: ProductDetailClientProps) {
  const { locale, t } = useTranslation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [includeNfcBadge, setIncludeNfcBadge] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"auto" | "handmade" | "standard">("auto");
  const mainCtaRef = useRef<HTMLDivElement>(null);

  // Scroll listener for Mobile Sticky Add-to-Cart Bar (Point 6 UX)
  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      } else {
        setShowStickyBar(window.scrollY > 500);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (product?.name) {
      const titleBase = (product as any).metaTitle || product.name;
      document.title = titleBase.includes("Spoolio") ? titleBase : `${titleBase} | Spoolio`;
    }
  }, [product]);

  const displayName = (locale === "en" && (product?.nameEn || product?.name_en))
    ? (product?.nameEn || product?.name_en)!
    : product?.name || "";

  const displayShortDesc = (locale === "en" && (product?.shortDescriptionEn || product?.short_description_en))
    ? (product?.shortDescriptionEn || product?.short_description_en)!
    : product?.short_description || "";

  const displayFullDesc = (locale === "en" && (product?.descriptionEn || product?.description_en))
    ? (product?.descriptionEn || product?.description_en)!
    : product?.description || "";

  // Force scroll to top when page loaded or product slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  const isOutOfStock = product?.stock === 0;
  const isUnavailable = product?.stock === -2;
  const isNotAvailableToBuy = isOutOfStock || isUnavailable;


  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
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

  // Keyboard navigation for Lightbox full-screen view (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isLightboxOpen || !product?.images?.length) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, product?.images?.length]);

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

  // Collapsible accordions state for mobile & hero presentation
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    specs: false,
    compass: false,
    shipping: false,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Lightbox zoom level state (Point 3 UX)
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    setLightboxZoom(1);
  }, [activeImageIndex, isLightboxOpen]);

  // Swipe states & Double tap zoom for mobile image gallery (Point 5 UX)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (!isHeroLayout && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected on mobile touch screen -> Toggle Zoom
      setIsZooming((prev) => !prev);
    }
    lastTapRef.current = now;

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
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
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

          const photoOpt = (attr.defaultOption || attr.photoOption || "").replace(/\u00a0/g, ' ').trim();
          if (photoOpt && validOpts.some((o: string) => o.toLowerCase() === photoOpt.toLowerCase())) {
            const match = validOpts.find((o: string) => o.toLowerCase() === photoOpt.toLowerCase());
            initialOptions[attr.name] = match || photoOpt;
          } else {
            initialOptions[attr.name] = validOpts.length > 0 ? validOpts[0] : attr.options[0].replace(/\u00a0/g, ' ').trim();
          }
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
    if (initialProduct && initialProduct.slug === slug) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const endpoint = isDraftPreview ? `/api/products/${slug}?status=all` : `/api/products/${slug}`;
        const res = await fetch(endpoint, { cache: "no-store" });
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
                  controlType: a.controlType || "default",
                  defaultOption: a.defaultOption || a.photoOption || ""
                })),
                variationPrices: []
              };
            } else {
              // Standard Spoolio V2 object structure normalization
              if (attrData && Array.isArray(attrData.attributes)) {
                attrData.attributes = attrData.attributes.map((a: any) => ({
                  ...a,
                  name: decodeHtml(a.name),
                  defaultOption: a.defaultOption || a.photoOption || ""
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
        const res = await fetch(`/api/products/related?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRelatedProducts(data.slice(0, 3));
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
            <div className="aspect-square w-full bg-zinc-100 rounded-2xl" />
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

  // Technical specifications defined in administration
  const rawAttributes = product.attributes as any;
  const technicalSpecs = (product as any)?.technicalSpecs || rawAttributes?.technicalSpecs || null;
  const hasDimensions = Boolean(technicalSpecs?.dimensions && technicalSpecs.dimensions.trim());
  const hasWeight = Boolean(technicalSpecs?.weight && technicalSpecs.weight.trim());
  const hasMaterial = Boolean(technicalSpecs?.material && technicalSpecs.material.trim());
  const hasOther = Boolean(technicalSpecs?.other && technicalSpecs.other.trim());
  const hasAnyTechnicalSpecs = hasDimensions || hasWeight || hasMaterial || hasOther;

  // Plausible print time based on price (approx. 12 mins per Euro, min 45 mins)
  const priceNum = parseFloat(currentPrice) || 0;
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

  // Sensory noise level calculation (strictly restricted to Fidgets & Anti-stress products)
  const getSensoryNoiseInfo = () => {
    if (!product) return null;

    // 1. Check Categories (must belong to Fidgets / Anti-stress)
    const categoryNames = Array.isArray(product.categories)
      ? product.categories.map((c) => (c.name || "").toLowerCase())
      : [];
    const isFidgetCategory = categoryNames.some(
      (cat) =>
        cat.includes("fidget") ||
        cat.includes("anti-stress") ||
        cat.includes("antistress") ||
        cat.includes("cliqueur") ||
        cat.includes("clicker")
    );

    // 2. Check Name (must contain explicit fidget keywords)
    const nameLower = (product.name || "").toLowerCase();
    const isFidgetName =
      nameLower.includes("fidget") ||
      nameLower.includes("clicker") ||
      nameLower.includes("cliqueur") ||
      nameLower.includes("spinner") ||
      (nameLower.includes("bague") && (nameLower.includes("fidget") || nameLower.includes("anti-stress")));

    // 3. Check explicit "Bruit" / "Niveau sonore" attribute from product attributes list
    const noiseAttr = attributesList?.find((attr: any) => {
      const n = (attr.name || "").toLowerCase().trim();
      return n.includes("bruit") || n.includes("sonore") || n.includes("niveau sonore") || n.includes("noise");
    });
    const hasNoiseAttr = Boolean(noiseAttr && noiseAttr.options && noiseAttr.options.length > 0);

    // Strictly check if this product is ACTUALLY a Fidget/Anti-stress product
    const isActuallyFidget = isFidgetCategory || isFidgetName || hasNoiseAttr;
    if (!isActuallyFidget) {
      return null;
    }

    // 4. Check DB sensory_noise_level property if explicitly present on this fidget
    const rawSensoryLevel = (product as any).sensory_noise_level ?? (product as any).sensoryNoiseLevel;
    const hasRawSensoryLevel =
      rawSensoryLevel !== undefined &&
      rawSensoryLevel !== null &&
      rawSensoryLevel !== "" &&
      rawSensoryLevel !== "none" &&
      rawSensoryLevel !== "null";

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

  const rawProductAttrs = useMemo(() => {
    if (!product?.attributes) return null;
    if (typeof product.attributes === "string") {
      try {
        return JSON.parse(product.attributes);
      } catch {
        return null;
      }
    }
    return product.attributes as any;
  }, [product?.attributes]);

  const isHandmadeProduct = rawProductAttrs?.template === "standard" || rawProductAttrs?.template === "hero"
    ? false
    : Boolean(
        (rawProductAttrs?.template === "handmade" && Boolean(rawProductAttrs?.uniquePieceData)) ||
        Boolean((product as any)?.attributes?.uniquePieceData) ||
        (Array.isArray(product?.categories) && product.categories.some((c: any) => 
          (c.name || "").toLowerCase().includes("fait main") || 
          (c.slug || "").includes("fait-main")
        ))
      );

  const isHeroLayout = Boolean(
    rawProductAttrs?.template === "hero" ||
    rawProductAttrs?.template === "immersive" ||
    rawProductAttrs?.template === "grand_format" ||
    rawProductAttrs?.template === "grand-format"
  );

  const isGeekOrBoardGameProduct = useMemo(() => {
    // 1. Check categories
    const categoriesList = Array.isArray(product?.categories) ? product.categories : [];
    const hasCategoryMatch = categoriesList.some((c: any) => {
      const name = (typeof c === "string" ? c : c?.name || c?.slug || "").toLowerCase().trim();
      return (
        name.includes("geek") ||
        name.includes("gaming") ||
        name.includes("jeu") ||
        name.includes("boardgame") ||
        name.includes("tabletop")
      );
    });
    if (hasCategoryMatch) return true;

    // 2. Check tags
    const tagsList = Array.isArray(product?.tags) ? product.tags : [];
    const hasTagMatch = tagsList.some((t: any) => {
      const name = (typeof t === "string" ? t : t?.name || t?.slug || "").toLowerCase().trim();
      return (
        name.includes("geek") ||
        name.includes("gaming") ||
        name.includes("jeu") ||
        name.includes("enjeu") ||
        name.includes("tabletop") ||
        name.includes("board game")
      );
    });
    if (hasTagMatch) return true;

    // 3. Check collections
    const collectionsList = Array.isArray((product as any)?.collections) ? (product as any).collections : [];
    const hasCollectionMatch = collectionsList.some((col: any) => {
      const name = (typeof col === "string" ? col : col?.name || col?.slug || "").toLowerCase().trim();
      return (
        name.includes("geek") ||
        name.includes("gaming") ||
        name.includes("jeu") ||
        name.includes("tabletop")
      );
    });
    if (hasCollectionMatch) return true;

    // 4. Targeted keyword match on name / slug (strictly targeted, avoid substring false positives like "des")
    const nameLower = (displayName || product?.name || "").toLowerCase();
    const slugLower = (slug || "").toLowerCase();
    const hasKeywordMatch =
      nameLower.includes("tour à dés") ||
      nameLower.includes("tour a des") ||
      nameLower.includes("piste de dés") ||
      nameLower.includes("piste de des") ||
      nameLower.includes("jeu de société") ||
      nameLower.includes("jeux de société") ||
      nameLower.includes("porte-cartes") ||
      nameLower.includes("porte cartes") ||
      nameLower.includes("lanceur de dés") ||
      nameLower.includes("lanceur de des") ||
      nameLower.includes("compteur de points") ||
      slugLower.includes("tour-a-des") ||
      slugLower.includes("piste-de-des") ||
      slugLower.includes("jeux-de-societe") ||
      slugLower.includes("geek");

    return hasKeywordMatch;
  }, [product, displayName, slug]);

  const activeLayout = layoutMode === "auto" ? (isHandmadeProduct ? "handmade" : "standard") : layoutMode;

  if (activeLayout === "handmade" && product) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between selection:bg-spoolio-orange selection:text-black">
        <Header />
        
        <HandmadeProductView
          product={product}
          displayName={displayName}
          displayShortDesc={displayShortDesc}
          displayFullDesc={displayFullDesc}
          currentPrice={currentPrice}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCartClick}
          isAdded={isAdded}
          onToggleStandardView={() => setLayoutMode("standard")}
          isStandardAvailable={true}
        />

        {/* Mobile Sticky Add to Cart Bar */}
        {showStickyBar && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 border-t border-white/10 p-3 sm:hidden backdrop-blur-lg flex items-center justify-between gap-3 shadow-2xl animate-fadeIn no-invert keep-white">
            <div>
              <div className="text-xs font-black text-white truncate max-w-[180px]">{displayName}</div>
              <div className={`text-sm font-extrabold ${isNotAvailableToBuy ? "text-zinc-500 line-through" : "text-[#ff4f00]"}`}>{formatPrice(currentPrice)}€</div>
            </div>
            {isNotAvailableToBuy ? (
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-wider border border-white/10 cursor-not-allowed shadow-none"
              >
                Épuisé
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="px-4 py-2.5 rounded-xl bg-[#ff4f00] text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
              >
                {isAdded ? "Ajouté !" : "Commander"}
              </button>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 w-full bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-950">
                Autres créations de l'atelier
              </h3>
              <Link href="/boutique" className="text-xs font-bold text-[#ff4f00] hover:underline">
                Voir toute la boutique →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  className="group bg-zinc-50 border border-zinc-200 rounded-2xl p-3 hover:border-[#ff4f00] hover:shadow-md transition-all block"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-100">
                    <Image
                      src={rel.images?.[0]?.src || "/images/figma_keychains.jpg"}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized={rel.images?.[0]?.src?.startsWith("data:")}
                    />
                  </div>
                  <div className="text-xs font-bold text-zinc-900 truncate">{rel.name}</div>
                  <div className="text-xs font-black text-[#ff4f00] mt-1">{formatPrice(rel.price)}€</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {isGeekOrBoardGameProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <EnjeuBanner productName={displayName || product?.name} />
          </div>
        )}
        <Footer />
      </div>
    );
  }

  const renderGalleryBlock = (isHero: boolean) => (
    <div className="flex flex-col w-full">
      <div className={`relative w-screen lg:w-full left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 overflow-hidden bg-zinc-100/70 border-b sm:border border-zinc-200/80 shadow-xs ${
        isHero
          ? "aspect-square max-h-[380px] sm:aspect-[16/10] sm:max-h-[460px] lg:aspect-auto lg:h-[68vh] lg:min-h-[460px] lg:max-h-[720px] rounded-none lg:rounded-3xl mb-3 sm:mb-4"
          : "aspect-square rounded-none lg:rounded-2xl"
      }`}>
        <div
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseMove={!isHero ? handleMouseMove : undefined}
          onMouseEnter={!isHero ? () => setIsZooming(true) : undefined}
          onMouseLeave={!isHero ? () => setIsZooming(false) : undefined}
          className={`relative w-full h-full ${isHero ? "rounded-none lg:rounded-3xl cursor-default" : "rounded-none lg:rounded-2xl cursor-zoom-in"} overflow-hidden bg-transparent select-none touch-pan-y group/gallery`}
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
                        className={`w-full h-full border-0 pointer-events-auto ${isHero ? "rounded-none lg:rounded-3xl" : "rounded-none lg:rounded-2xl"}`}
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
                        className={`w-full h-full object-cover no-invert ${isHero ? "rounded-none lg:rounded-3xl" : "rounded-none lg:rounded-2xl"}`}
                      />
                    )}
                  </div>
                );
              }

              return (
                <div
                  className={`w-full h-full relative ${!isHero ? "transition-transform duration-300 ease-out" : ""}`}
                  style={!isHero && isZooming ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: "scale(2.2)",
                  } : {
                    transformOrigin: "center center",
                    transform: "none",
                  }}
                >
                  <Image
                    src={activeSrc}
                    alt={activeAlt}
                    fill
                    sizes={isHero ? "(max-width: 1024px) 100vw, 85vw" : "(max-width: 1024px) 100vw, 50vw"}
                    className="object-cover no-invert"
                    priority
                    unoptimized={activeSrc?.startsWith("data:")}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hidden md:flex z-20 active:scale-95 cursor-pointer"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 hidden md:flex z-20 active:scale-95 cursor-pointer"
                title="Média suivant"
                aria-label="Média suivant"
              >
                <svg className="w-5 h-5 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Top-Right Fullscreen / Zoom Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-[#ff4f00] text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
            title="Agrandir en plein écran"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Agrandir</span>
          </button>

          {/* Bottom-Right Image Count Badge */}
          {hasImage && product.images.length > 1 && (
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-black/75 text-white text-[11px] font-extrabold tracking-wider border border-white/15 backdrop-blur-md select-none hidden sm:block">
              {activeImageIndex + 1} / {product.images.length}
            </div>
          )}

          {/* Bottom Center Dynamic Pagination Dots */}
          {hasImage && product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 border border-white/15 backdrop-blur-md select-none">
              {product.images.map((_, idx) => (
                <button
                  key={`dot-main-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`transition-all duration-300 cursor-pointer ${
                    activeImageIndex === idx
                      ? "w-5 h-1.5 rounded-full bg-[#ff4f00] shadow-sm shadow-[#ff4f00]/50"
                      : "w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80"
                  }`}
                  title={`Photo ${idx + 1}`}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
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
        <div className="relative mt-3 group/thumbs">
          {product.images.length >= 5 && (
            <button
              type="button"
              onClick={() => scrollThumbnails("left")}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 hover:bg-[#ff4f00] text-white flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover/thumbs:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer font-bold text-lg"
              title="Photos précédentes"
            >
              ‹
            </button>
          )}

          <div
            ref={thumbnailsRef}
            onWheel={handleThumbnailWheel}
            className={`flex gap-3 overflow-x-auto pb-2 pt-1 px-1 select-none scroll-smooth touch-pan-x no-scrollbar ${
              product.images.length < 5 ? "justify-center" : "justify-start"
            }`}
          >
            {product.images.map((img, idx) => {
              const isVid = isVideoMedia(img.src);
              const ytThumb = isYouTubeUrl(img.src) ? getYouTubeThumbnail(img.src) : null;
              return (
                <button
                  key={`${img.id}-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative ${isHero ? "w-14 h-14 sm:w-18 sm:h-18 lg:w-24 lg:h-24" : "w-16 h-16 sm:w-20 sm:h-20"} rounded-xl overflow-hidden bg-zinc-100 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-2 border-[#ff4f00] scale-105 shadow-md shadow-[#ff4f00]/20 z-10"
                      : "border border-zinc-200/80 hover:border-zinc-400 opacity-75 hover:opacity-100"
                  }`}
                >
                  {isVid ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black/70">
                      {ytThumb ? (
                        <Image src={ytThumb} alt={img.alt || img.name} fill sizes="100px" unoptimized className="object-cover opacity-80 no-invert" />
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
                      sizes="100px"
                      className="object-cover no-invert"
                      unoptimized={img.src?.startsWith("data:")}
                    />
                  )}
                </button>
              );
            })}
          </div>

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
  );

  const renderTitleAndPrice = (isHero: boolean) => (
    <div className="flex flex-col gap-3 pb-3 sm:pb-6 border-b border-zinc-100/90">
      <div className={`flex flex-col ${isHero ? "sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4" : "gap-3"}`}>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {Array.isArray(product.categories) && product.categories.length > 0 && (
            <span className="inline-flex items-center self-start text-[10px] font-black text-white bg-[#2F3CD9] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg uppercase tracking-widest no-invert shadow-sm shadow-[#2F3CD9]/10">
              {product.categories.map(c => c.name).join(" / ")}
            </span>
          )}

          <h1 className={`${isHero ? "text-xl sm:text-3xl lg:text-4xl" : "text-2xl sm:text-3xl"} font-black tracking-tight text-zinc-900 font-sans leading-tight`}>
            {displayName}
          </h1>
        </div>

        {/* Price section */}
        <div className={`flex items-baseline gap-2.5 shrink-0 ${isHero ? "sm:pt-1" : "mb-1"}`}>
          {product.on_sale && !activePriceInfo.isVariation ? (
            <>
              <span className={`${isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-2xl"} font-black text-[#ff4f00]`}>
                {formatPrice(product.sale_price || product.price)}€
              </span>
              <span className="text-sm sm:text-base text-gray-500 line-through">
                {formatPrice(product.regular_price)}€
              </span>
            </>
          ) : (
            <span className={`${isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-2xl"} font-black text-zinc-900`}>
              {formatPrice(currentPrice)}€
            </span>
          )}
        </div>
      </div>

      {/* Preuve sociale / Effet de troupeau (Neuromarketing) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs font-bold shadow-2xs">
          <span className="text-amber-500 font-black">★</span>
          <span>4.9/5</span>
          <span className="text-amber-700/40 select-none">•</span>
          <span className="text-amber-900 font-semibold">+1 200 adeptes conquis</span>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
          Fabriqué &amp; vérifié à la main à l&apos;Atelier de Comines
        </span>
      </div>
    </div>
  );

  const renderNoiseGauge = () => {
    if (!noiseInfo) return null;
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-100/70 border border-zinc-200 mb-6 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
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
    );
  };

  const renderShortDescription = () => {
    if (!displayShortDesc) return null;
    return (
      <div
        className="text-zinc-700 text-sm sm:text-base leading-relaxed p-5 sm:p-6 rounded-2xl bg-zinc-50/90 border border-zinc-200/80 font-sans shadow-2xs"
        dangerouslySetInnerHTML={{ __html: displayShortDesc }}
      />
    );
  };

  const renderDetailedDescription = () => (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
        <span className="text-xl">✨</span>
        <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-wide uppercase font-sans">
          Présentation de l'objet
        </h2>
      </div>
      <div
        className="prose text-zinc-700 max-w-none text-sm leading-relaxed font-sans flex flex-col gap-4"
        dangerouslySetInnerHTML={{
          __html: displayFullDesc || "<p>Création façonnée dans notre atelier à Comines. Chaque pièce est imprimée avec précision en PLA biosourcé, ébavurée et vérifiée à la main.</p><p>Matière issue de ressources végétales renouvelables. Conçu pour durer, résister aux manipulations du quotidien et apporter une présence singulière sur votre bureau.</p>"
        }}
      />
    </div>
  );

  const renderDynamicOptions = () => {

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

                    // Neuro-marketing : Réduction de la paralysie du choix si plus de 4 options
                    const isManyOptions = options.length > 4;
                    const favoriteOption = attr.favoriteOption || attr.popularOption || attr.defaultOption || attr.photoOption || options[0];

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
                          <div className="flex items-center gap-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 font-sans">
                              {decodedName}
                            </label>
                            {isManyOptions && (
                              <span className="text-[10px] text-zinc-400 font-normal lowercase font-sans">
                                (coup de cœur en ❤️)
                              </span>
                            )}
                          </div>
                          {showPaletteLink && (
                            <Link 
                              href="/palette-couleurs" 
                              target="_blank" 
                              className="text-[11px] text-[#ff4f00] hover:text-[#ff4f00]/80 underline font-semibold transition-colors flex items-center gap-1 font-sans"
                            >
                              🎨 Palette de couleurs
                            </Link>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === name ? null : name)}
                            type="button"
                            className={`w-full h-12 px-4 rounded-xl bg-white border transition-all cursor-pointer text-left flex items-center justify-between focus:outline-none select-none ${
                              activeDropdown === name ? "border-[#ff4f00] ring-2 ring-[#ff4f00]/20 shadow-sm" : "border-zinc-200 hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Pastille de la couleur sélectionnée (+30% plus grande, sans point noir) */}
                              <div 
                                style={{ background: getCssColor(selectedVal) }} 
                                className="w-8 h-8 rounded-full border border-black/15 relative shrink-0 shadow-xs ring-1 ring-black/5"
                              />
                              <span className={`text-sm font-bold truncate max-w-[180px] md:max-w-xs ${selectedVal ? "text-zinc-900" : "text-zinc-400 font-normal"}`}>
                                {selectedVal || "Choisir une couleur..."}
                              </span>
                              {selectedVal && isManyOptions && selectedVal.toLowerCase().trim() === favoriteOption.toLowerCase().trim() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                  ❤️ Coup de cœur
                                </span>
                              )}
                              {selectedVal && (attr.defaultOption || attr.photoOption) && (attr.defaultOption || attr.photoOption).toLowerCase().trim() === selectedVal.toLowerCase().trim() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                                  <Camera className="w-2.5 h-2.5 text-amber-600" />
                                  En photo
                                </span>
                              )}
                            </div>
                            <svg 
                              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${activeDropdown === name ? "rotate-180 text-zinc-900" : ""}`} 
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
                              
                              <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 divide-y divide-zinc-100/90 no-scrollbar">
                                {options.map((opt: string) => {
                                  const isOptionSelected = selectedVal === opt;
                                  const isPhotoOption = (attr.defaultOption || attr.photoOption || "").toLowerCase().trim() === opt.toLowerCase().trim();
                                  const isFavorite = isManyOptions && opt.toLowerCase().trim() === favoriteOption.toLowerCase().trim();
                                  const optionBg = getCssColor(opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        handleSelect(opt);
                                        setActiveDropdown(null);
                                      }}
                                      type="button"
                                      className={`w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors hover:bg-zinc-50 cursor-pointer text-left ${
                                        isOptionSelected ? "bg-orange-50/50" : ""
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {/* Pastille de l'option (+30% plus grande, sans point noir) */}
                                        <div 
                                          style={{ background: optionBg }} 
                                          className="w-7 h-7 rounded-full border border-black/15 relative shrink-0 shadow-2xs ring-1 ring-black/5"
                                        />
                                        <span className={`text-xs truncate ${isOptionSelected ? "text-[#ff4f00] font-black" : "text-zinc-700 font-medium"}`}>
                                          {opt}
                                        </span>
                                        {isFavorite && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shrink-0 shadow-2xs">
                                            ❤️ Coup de cœur
                                          </span>
                                        )}
                                        {isPhotoOption && !isFavorite && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 shrink-0">
                                            <Camera className="w-2.5 h-2.5 text-amber-700" />
                                            En photo
                                          </span>
                                        )}
                                      </div>
                                      {isOptionSelected && (
                                        <span className="text-xs text-[#ff4f00] font-black select-none shrink-0">✓</span>
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
                        <div className="segmented-control-container self-start inline-flex bg-spoolio-card border border-spoolio-border rounded-xl p-0.5 w-fit max-w-full overflow-x-auto select-none">
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
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                            {decodedName}
                          </label>
                          {isManyOptions && (
                            <span className="text-[10px] text-zinc-400 font-normal lowercase font-sans">
                              (coup de cœur en ❤️)
                            </span>
                          )}
                        </div>
                        <div className="segmented-control-container self-start inline-flex bg-spoolio-card border border-spoolio-border rounded-xl p-0.5 w-fit max-w-full overflow-x-auto select-none">
                          {options.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            const isPhotoOption = (attr.defaultOption || attr.photoOption || "").toLowerCase().trim() === opt.toLowerCase().trim();
                            const isFavorite = isManyOptions && opt.toLowerCase().trim() === favoriteOption.toLowerCase().trim();
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                  isSelected
                                    ? "bg-white text-black shadow-lg shadow-white/5 variant-btn-selected"
                                    : "text-gray-400 hover:text-white"
                                }`}
                                type="button"
                              >
                                <span>{opt}</span>
                                {isFavorite && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                    ❤️ Coup de cœur
                                  </span>
                                )}
                                {isPhotoOption && !isFavorite && (
                                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight">★ Photo</span>
                                )}
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
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                            {decodedName}
                          </label>
                          {isManyOptions && (
                            <span className="text-[10px] text-zinc-400 font-normal lowercase font-sans">
                              (coup de cœur en ❤️)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {options.map((opt: string) => {
                            const isSelected = selectedVal === opt;
                            const isPhotoOption = (attr.defaultOption || attr.photoOption || "").toLowerCase().trim() === opt.toLowerCase().trim();
                            const isFavorite = isManyOptions && opt.toLowerCase().trim() === favoriteOption.toLowerCase().trim();
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`h-10 px-4 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white border-white text-black shadow-lg shadow-white/5 variant-btn-selected"
                                    : "bg-spoolio-card border-spoolio-border text-gray-300 hover:text-white"
                                }`}
                                type="button"
                              >
                                <span>{opt}</span>
                                {isFavorite && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                    ❤️ Coup de cœur
                                  </span>
                                )}
                                {isPhotoOption && !isFavorite && (
                                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight">★ Photo</span>
                                )}
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
                            className="w-full h-11 px-4 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-zinc-900 outline-none cursor-pointer focus:border-zinc-400 transition-all font-sans"
                          />
                        </div>
                      </div>
                    );
                  }

                  // 6. DEFAULT SELECT DROPDOWN
                  return (
                    <div key={name} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                          {decodedName}
                        </label>
                        {isManyOptions && (
                          <span className="text-[10px] text-zinc-400 font-normal lowercase font-sans">
                            (coup de cœur en ❤️)
                          </span>
                        )}
                      </div>
                      <div className="relative max-w-xs">
                        <select
                          value={selectedVal || ""}
                          onChange={(e) => handleSelect(e.target.value)}
                          className="w-full h-11 px-4 text-xs font-bold bg-spoolio-card border border-spoolio-border rounded-xl text-zinc-900 outline-none cursor-pointer appearance-none focus:border-zinc-400 transition-all"
                        >
                          {options.map((opt: string) => {
                            const isPhotoOption = (attr.defaultOption || attr.photoOption || "").toLowerCase().trim() === opt.toLowerCase().trim();
                            const isFavorite = isManyOptions && opt.toLowerCase().trim() === favoriteOption.toLowerCase().trim();
                            return (
                              <option key={opt} value={opt} className="bg-white text-zinc-900">
                                {opt} {isFavorite ? "❤️ (Coup de cœur de l'Atelier)" : isPhotoOption ? "(En photo)" : ""}
                              </option>
                            );
                          })}
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
          
  };

  const renderAddToCartCta = () => (
    <div ref={mainCtaRef} className="flex items-center gap-4 max-w-2xl">
      {/* Quantity Selector */}
      <div className={`flex items-center bg-spoolio-card border border-spoolio-border rounded-xl h-14 px-3 select-none ${isNotAvailableToBuy ? "opacity-40" : ""}`}>
        <button
          type="button"
          disabled={isNotAvailableToBuy}
          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
          className={`w-8 h-8 flex items-center justify-center text-zinc-600 ${!isNotAvailableToBuy ? "hover:text-zinc-950 hover:bg-zinc-100 active:scale-95 cursor-pointer" : "cursor-not-allowed"} rounded-lg transition-all text-lg font-bold`}
          aria-label="Diminuer la quantité"
        >
          -
        </button>
        <span className="w-10 text-center font-extrabold text-base text-zinc-950 font-sans">
          {isNotAvailableToBuy ? 0 : quantity}
        </span>
        <button
          type="button"
          disabled={isNotAvailableToBuy}
          onClick={() => setQuantity(prev => prev + 1)}
          className={`w-8 h-8 flex items-center justify-center text-zinc-600 ${!isNotAvailableToBuy ? "hover:text-zinc-950 hover:bg-zinc-100 active:scale-95 cursor-pointer" : "cursor-not-allowed"} rounded-lg transition-all text-lg font-bold`}
          aria-label="Augmenter la quantité"
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
          onClick={() => {
            if (!product) return;
            addToCart({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: currentPrice.toString(),
              selectedOptions,
              image: product.images?.[0]?.src || "/images/hero_background.jpg",
            }, quantity);

            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
          }}
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
  );

  const renderSensoryCompassCard = (isEmbeddedInAccordion = false) => {
    if (!Boolean((product as any).show_in_sensory_compass || (product as any).showInSensoryCompass)) return null;

    return (
      <div className={`${isEmbeddedInAccordion ? "p-4 sm:p-6" : "p-6 sm:p-8 rounded-3xl bg-purple-50/70 border border-purple-200 shadow-xs"} font-sans`}>
        {!isEmbeddedInAccordion && (
          <div className="flex items-center justify-between border-b border-purple-200/80 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none">🧭</span>
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-wide uppercase">
                  Fidget Sensoriel Spoolio
                </h3>
                <p className="text-xs text-purple-900/80 font-medium">
                  Évaluation sensorielle &amp; ergonomique
                </p>
              </div>
            </div>
            <Link
              href="/boussole-sensorielle"
              className="text-[11px] font-bold text-purple-800 hover:text-purple-950 bg-purple-100/90 hover:bg-purple-200 border border-purple-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Boussole</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Sensory Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Bruit */}
          <div className="p-3.5 rounded-2xl bg-white border border-purple-100 flex flex-col gap-1.5 shadow-xs">
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">
              Bruit :
            </span>
            <span className="text-xs font-black text-zinc-900">
              {formatNoiseLevelText(parseNoiseLevel((product as any).sensory_noise_level || (product as any).sensoryNoiseLevel))}
            </span>
          </div>

          {/* Compacité */}
          <div className="p-3.5 rounded-2xl bg-white border border-purple-100 flex flex-col gap-1.5 shadow-xs">
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">
              Format :
            </span>
            <span className="text-xs font-black text-zinc-900">
              {((product as any).sensory_size || (product as any).sensorySize) === "pocket"
                ? "Format Poche (1 main)"
                : ((product as any).sensory_size || (product as any).sensorySize) === "medium"
                ? "Moyen / Bureau"
                : "Grand Format"}
            </span>
          </div>

          {/* Manipulation */}
          <div className="p-3.5 rounded-2xl bg-white border border-purple-100 flex flex-col gap-1.5 shadow-xs">
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">
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
            tdah: { label: "Mouvement & Agilité des Doigts", icon: "⚡" },
            anxiety: { label: "Apaisement & Rythme Répétitif", icon: "🌊" },
            focus: { label: "Focus & Attention Continue", icon: "🎯" },
            autism: { label: "Stimulation Texturée & Haptique", icon: "🧩" },
          };

          return (
            <div className="flex flex-col gap-2 pt-2 border-t border-purple-200/80">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                Sensations &amp; Usages associés :
              </span>
              <div className="flex flex-wrap gap-2">
                {profilesList.map((prof: string) => {
                  const info = profileLabels[prof] || { label: prof, icon: "✨" };
                  return (
                    <span
                      key={prof}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-purple-900 border border-purple-200 shadow-xs"
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
    );
  };

  const renderTechnicalSpecsContent = () => (
    <div className="flex flex-col gap-4 font-sans text-xs sm:text-sm">
      {!hasAnyTechnicalSpecs ? (
        <div className="p-3.5 sm:p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-zinc-700 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <span>📏</span>
            <span>Caractéristiques à la demande</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Les dimensions exactes n&apos;ont pas encore été complétées sur cette fiche. Demandez-les nous en un clic :
          </p>
          <Link
            href={`/contact?subject=specs&product=${encodeURIComponent(displayName)}&message=${encodeURIComponent(
              `Bonjour, je souhaiterais connaître les caractéristiques techniques détaillées du produit "${displayName}". Merci !`
            )}`}
            className="inline-flex items-center gap-2 self-start px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 text-white" />
            <span>Demander les infos</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {hasDimensions && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 shadow-2xs flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">📐 Dimensions</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 mt-1">{technicalSpecs.dimensions}</span>
            </div>
          )}
          {hasWeight && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 shadow-2xs flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">⚖️ Poids</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 mt-1">{technicalSpecs.weight}</span>
            </div>
          )}
          {hasMaterial && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 shadow-2xs flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">🌱 Matière</span>
              <span className="text-xs sm:text-sm font-bold text-[#ff4f00] mt-1">{technicalSpecs.material}</span>
            </div>
          )}
          {colorAttr?.options && colorAttr.options.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 shadow-2xs flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">🎨 Coloris</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 mt-1">{colorAttr.options.length} options</span>
            </div>
          )}
        </div>
      )}

      {hasOther && (
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 shadow-2xs flex flex-col gap-1 text-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">ℹ️ Conseils d&apos;usage</span>
          <span className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line">{technicalSpecs.other}</span>
        </div>
      )}

      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {product.tags.map((tag: any, idx: number) => {
            const tagName = typeof tag === 'object' ? tag.name : tag;
            if (!tagName) return null;
            return (
              <span
                key={idx}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 uppercase tracking-wider"
              >
                #{tagName}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderReassuranceBadges = (isHero: boolean) => (
    <div className={`border-t border-zinc-200/80 pt-4 sm:pt-6 ${isHero ? "space-y-4 sm:space-y-5" : "mt-6 space-y-4"}`}>
      {/* Mobile Ultra-Compact Reassurance Bar (< sm) */}
      <div className="flex sm:hidden flex-col gap-2 font-sans">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-xs text-zinc-900">
          <Truck className="w-4 h-4 text-[#ff4f00] shrink-0" strokeWidth={2.2} />
          <div className="flex flex-wrap items-center gap-x-1.5 leading-tight">
            <span className="font-bold">Livraison estimée :</span>
            <span className="text-[#ff4f00] font-black">{getDeliveryDateRange().minStr} au {getDeliveryDateRange().maxStr}</span>
            <span className="text-[10px] text-zinc-500">(24/48h)</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-zinc-800 text-center">
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg bg-white border border-zinc-200/70 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2.2} />
            <span>France</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg bg-white border border-zinc-200/70 shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.2} />
            <span>Biosourcé</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg bg-white border border-zinc-200/70 shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" strokeWidth={2.2} />
            <span>Prêt à offrir</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg bg-white border border-zinc-200/70 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" strokeWidth={2.2} />
            <span>3D Secure</span>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Full Reassurance Grid (>= sm) */}
      <div className="hidden sm:block space-y-4">
        {/* Delivery & Loyalty Row/Grid */}
        <div className={`grid grid-cols-1 ${isHero ? "md:grid-cols-2" : ""} gap-4`}>
          {/* Delivery Estimation */}
          <div className="flex items-start gap-3.5 text-xs font-sans leading-relaxed bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#ff4f00]">
              <Truck className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-zinc-900 font-bold text-sm">
                Livraison estimée : <span className="text-[#ff4f00] font-black">{getDeliveryDateRange().minStr}</span> au <span className="text-[#ff4f00] font-black">{getDeliveryDateRange().maxStr}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">
                Expédié sous 24/48h depuis notre atelier de Comines dans un emballage kraft protecteur.
              </p>
            </div>
          </div>

          {/* Loyalty Points Credit Estimation */}
          {parseFloat(currentPrice) >= 2 && (
            <div className="flex items-start gap-3.5 text-xs font-sans leading-relaxed bg-orange-50/60 p-4 rounded-2xl border border-[#ff4f00]/25 relative overflow-hidden group select-none transition-all duration-300 hover:border-[#ff4f00]/40">
              <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 text-base text-[#ff4f00]">
                ⚡
              </div>
              <div>
                <p className="text-zinc-900 font-bold text-sm">
                  Carte de fidélité : <span className="text-[#ff4f00] font-black">+{Math.floor(parseFloat(currentPrice) / 2)} points</span> sur cette commande !
                </p>
                <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">
                  Cumule 2€ = 1 point (hors dons/livraison) et débloque tes cadeaux exclusifs à l'atelier.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust Badges Grid (2 lignes aérées et sous-textes confortables) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-zinc-700 font-sans">
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 text-blue-600">
              <MapPin className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-900">Made in France</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 font-medium">Atelier à Comines (Hauts-de-France)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shrink-0 text-emerald-600">
              <Leaf className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-900">PLA Biosourcé</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 font-medium">Matière végétale (amidon de maïs)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0 text-amber-600">
              <Gift className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-900">Emballage d&apos;Atelier</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 font-medium">Papier kraft protecteur &amp; soigné</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center shrink-0 text-indigo-600">
              <Truck className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-900">Livraison Suivie</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 font-medium">Mondial Relay &amp; Colissimo</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center shrink-0 text-teal-600">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-900">Paiement 3D Secure</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 font-medium">Stripe 100% protégé &amp; chiffré</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-spoolio-bg text-white font-sans flex flex-col justify-between selection:bg-spoolio-orange selection:text-black">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-[78px] sm:pt-24 lg:pt-32 pb-12 lg:pb-16">
        {isDraftPreview && (
          <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
            <span className="text-xl shrink-0 select-none">⚠️</span>
            <div className="leading-relaxed text-zinc-900">
              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-950 font-black text-[11px] uppercase tracking-wider mr-2 align-middle">
                Aperçu Administrateur
              </span>
              <span>
                Ce produit est actuellement en <strong className="text-amber-950 font-black underline decoration-amber-400">Brouillon</strong>. Il est strictement invisible pour les visiteurs du site et les moteurs de recherche (renvoie une erreur 404).
              </span>
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation (Fil d'Ariane) - Spoolio V2.1 */}
        {(() => {
          const items =
            breadcrumbItems && breadcrumbItems.length > 0
              ? breadcrumbItems
              : [
                  { name: "Accueil", url: "/" },
                  { name: "Boutique", url: "/boutique" },
                  ...(Array.isArray(product.categories) && product.categories.length > 0
                    ? [{ name: product.categories[0].name, url: "/boutique" }]
                    : []),
                  { name: product.name, url: `/product/${slug}` },
                ];

          return (
            <nav
              aria-label="Fil d'Ariane"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-medium text-zinc-500 mb-2.5 sm:mb-4 lg:mb-8 font-sans select-none overflow-x-auto scrollbar-none whitespace-nowrap py-0.5 sm:py-1"
            >
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                  <span key={`${item.url}-${index}`} className="flex items-center gap-1.5 shrink-0">
                    {index > 0 && (
                      <span className="text-zinc-300 font-bold shrink-0 select-none">/</span>
                    )}
                    {isLast ? (
                      <span className="text-zinc-900 font-bold max-w-[180px] sm:max-w-none truncate">
                        {item.name}
                      </span>
                    ) : (
                      <Link
                        href={item.url}
                        className="text-zinc-500 hover:text-[#ff4f00] transition-colors shrink-0"
                      >
                        {item.name}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          );
        })()}

        {/* HERO XXL GRAND FORMAT (si activé sur ce produit) */}
        {isHeroLayout && (
          <div className="mb-8 lg:mb-10">
            {renderGalleryBlock(true)}
          </div>
        )}

        {isHeroLayout ? (
          /* --- LAYOUT HERO XXL : Colonne Pleine Largeur pour Titre + Variantes + Achat, puis accordéons dessous --- */
          <div className="flex flex-col w-full gap-6 sm:gap-10 mb-12 sm:mb-16">
            {/* Colonne Full Largeur : Titre + Prix + Variantes + Bouton Achat (épuré sans cadre lourd sur mobile) */}
            <div className="w-full bg-transparent sm:bg-white border-0 sm:border sm:border-zinc-200/90 rounded-none sm:rounded-3xl p-0 sm:p-8 lg:p-10 shadow-none sm:shadow-xs space-y-5 sm:space-y-8">
              {renderTitleAndPrice(true)}
              {renderNoiseGauge()}
              {renderDynamicOptions()}
              {renderAddToCartCta()}
              {renderReassuranceBadges(true)}
            </div>

            {/* Accordéons Élégants : Descriptions, Spécifications, Boussole & Fabrication */}
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {/* Accordéon 1 : Présentation de l'objet */}
              <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("description")}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans select-none hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">✨</span>
                    <span className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-wide">
                      Présentation de l'objet
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openAccordions.description ? "rotate-180 text-zinc-900" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openAccordions.description && (
                  <div className="p-4 sm:p-6 pt-2 border-t border-zinc-100 flex flex-col gap-4 font-sans text-sm leading-relaxed text-zinc-700">
                    {displayShortDesc && (
                      <div
                        className="p-3.5 sm:p-4 rounded-xl bg-zinc-50/90 border border-zinc-200/70 text-zinc-800 font-medium"
                        dangerouslySetInnerHTML={{ __html: displayShortDesc }}
                      />
                    )}
                    <div
                      className="prose text-zinc-700 max-w-none text-sm leading-relaxed font-sans flex flex-col gap-3"
                      dangerouslySetInnerHTML={{
                        __html: displayFullDesc || "<p>Création façonnée dans notre atelier à Comines. Chaque pièce est imprimée avec précision en PLA biosourcé, ébavurée et vérifiée à la main.</p><p>Matière issue de ressources végétales renouvelables. Conçu pour durer, résister aux manipulations du quotidien et apporter une présence singulière sur votre bureau.</p>"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Accordéon 2 : Spécifications techniques & Dimensions */}
              <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("specs")}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans select-none hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">📐</span>
                    <span className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-wide">
                      Caractéristiques &amp; Dimensions
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openAccordions.specs ? "rotate-180 text-zinc-900" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openAccordions.specs && (
                  <div className="p-4 sm:p-6 pt-2 border-t border-zinc-100">
                    {renderTechnicalSpecsContent()}
                  </div>
                )}
              </div>

              {/* Accordéon 3 : Boussole sensorielle (si fidget) */}
              {Boolean((product as any).show_in_sensory_compass || (product as any).showInSensoryCompass) && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/40 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("compass")}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans select-none hover:bg-purple-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🧭</span>
                      <span className="text-sm sm:text-base font-black text-purple-950 uppercase tracking-wide">
                        Évaluation Sensorielle Spoolio
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-purple-600 transition-transform duration-300 ${openAccordions.compass ? "rotate-180 text-purple-900" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openAccordions.compass && (
                    <div className="p-4 sm:p-6 pt-2 border-t border-purple-200/70">
                      {renderSensoryCompassCard(true)}
                    </div>
                  )}
                </div>
              )}

              {/* Accordéon 4 : Fabrication, Livraison & Retours */}
              <div className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans select-none hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🚚</span>
                    <span className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-wide">
                      Fabrication, Livraison &amp; Retours
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openAccordions.shipping ? "rotate-180 text-zinc-900" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openAccordions.shipping && (
                  <div className="p-4 sm:p-6 pt-2 border-t border-zinc-100 font-sans text-xs sm:text-sm text-zinc-700 space-y-3 leading-relaxed">
                    <p>
                      🏭 <strong>Atelier de fabrication :</strong> Toutes nos pièces sont imprimées avec soin en 3D dans notre atelier à <strong>Comines (Hauts-de-France)</strong>.
                    </p>
                    <p>
                      🌱 <strong>Matière végétale :</strong> Nous utilisons exclusivement du filament PLA certifié issu de ressources renouvelables (amidon de maïs, sans dérivés pétroliers toxiques).
                    </p>
                    <p>
                      🎁 <strong>Emballage &amp; Déballage :</strong> Chaque création est calée et emballée avec soin à l&apos;Atelier dans du papier kraft recyclable et protecteur, prête à s&apos;offrir ou à se faire plaisir au déballage.
                    </p>
                    <p>
                      📦 <strong>Délais d'expédition :</strong> Commande expédiée sous 24h à 48h ouvrées avec numéro de suivi (Colissimo ou Mondial Relay selon votre choix au paiement).
                    </p>
                    <p>
                      🔄 <strong>Retours simples :</strong> Vous disposez de 14 jours après réception pour nous renvoyer l'objet s'il ne vous convient pas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- LAYOUT STANDARD : 2 Colonnes classiques --- */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
            {/* Colonne Gauche : Galerie standard */}
            <div className="flex flex-col">
              {renderGalleryBlock(false)}
            </div>

            {/* Colonne Droite : Titre, Prix, Options, Panier */}
            <div className="flex flex-col">
              {renderTitleAndPrice(false)}
              {renderNoiseGauge()}
              <div
                className="text-gray-400 text-sm leading-relaxed mb-8 border-b border-spoolio-border/40 pb-6 font-sans"
                dangerouslySetInnerHTML={{ __html: displayShortDesc || "<p>Aucune description disponible pour ce produit.</p>" }}
              />
              {renderDynamicOptions()}
              <div className="mb-6">
                {renderAddToCartCta()}
              </div>
              {renderSensoryCompassCard()}
              {renderReassuranceBadges(false)}
            </div>
          </div>
        )}

        {/* Product Technical Specs Grid (uniquement en vue standard, déjà intégré dans l'accordéon en Hero) */}
        {!isHeroLayout && (
          <section className="border-t border-spoolio-border pt-12">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#ff4f00]">
                  <Ruler className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 font-sans">Spécifications du produit</h2>
              </div>
              {hasAnyTechnicalSpecs && (
                <Link
                  href={`/contact?subject=specs&product=${encodeURIComponent(displayName)}&message=${encodeURIComponent(
                    `Bonjour, j'ai une question concernant les spécifications du produit "${displayName}".`
                  )}`}
                  className="text-xs font-semibold text-[#ff4f00] hover:underline flex items-center gap-1 font-sans"
                >
                  <span>Une question ? Contacter l&apos;atelier</span>
                  <span>→</span>
                </Link>
              )}
            </div>

            {!hasAnyTechnicalSpecs ? (
              /* Bloc quand les caractéristiques ne sont pas encore renseignées */
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-sans">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                    <span>📏</span>
                    <span>Caractéristiques à la demande</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950">
                    Besoin de la taille, du poids ou d&apos;un détail précis sur ce modèle ?
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Les caractéristiques techniques détaillées (dimensions, grammage exact, étanchéité) n&apos;ont pas encore été complétées sur cette fiche. Cliquez ci-dessous pour nous demander les infos en un clic, nous vous répondons rapidement !
                  </p>
                </div>

                <Link
                  href={`/contact?subject=specs&product=${encodeURIComponent(displayName)}&message=${encodeURIComponent(
                    `Bonjour, je souhaiterais connaître les caractéristiques techniques détaillées (taille, poids, matière, étanchéité...) du produit "${displayName}". Merci !`
                  )}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-[#ff4f00] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 shrink-0 select-none font-sans"
                >
                  <Mail className="w-4 h-4 text-white" />
                  <span>Demander les caractéristiques</span>
                </Link>
              </div>
            ) : (
              /* Bloc quand au moins une caractéristique est renseignée */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
                {hasDimensions && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                      <span>📐</span>
                      <span>Taille / Dimensions</span>
                    </span>
                    <span className="text-sm font-bold text-zinc-900 break-words">{technicalSpecs.dimensions}</span>
                  </div>
                )}

                {hasWeight && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                      <span>⚖️</span>
                      <span>Poids</span>
                    </span>
                    <span className="text-sm font-bold text-zinc-900">{technicalSpecs.weight}</span>
                  </div>
                )}

                {hasMaterial && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>Matière &amp; Fabrication</span>
                    </span>
                    <span className="text-sm font-bold text-[#ff4f00] break-words">{technicalSpecs.material}</span>
                  </div>
                )}

                {colorAttr?.options && colorAttr.options.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>Coloris disponibles</span>
                    </span>
                    <span className="text-sm font-bold text-zinc-900">{colorAttr.options.length} options</span>
                  </div>
                )}

                {hasOther && (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs col-span-2 md:col-span-4 flex flex-col gap-1">
                    <span className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span>ℹ️</span>
                      <span>Spécificités &amp; Conseils d&apos;usage</span>
                    </span>
                    <span className="text-sm font-semibold text-zinc-800 leading-relaxed whitespace-pre-line">{technicalSpecs.other}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dedicated Tags Zone inside Specifications */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col gap-3 font-sans">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
                  <span>🏷️</span>
                  <span>Tags &amp; Mots-clés associés :</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any, idx: number) => {
                    const tagName = typeof tag === 'object' ? tag.name : tag;
                    if (!tagName) return null;
                    return (
                      <span
                        key={idx}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 transition-colors uppercase tracking-wider select-none"
                      >
                        #{tagName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Detailed Long Description (uniquement en mise en page standard 2 colonnes) */}
        {!isHeroLayout && (
          <section className="border-t border-spoolio-border pt-12 mt-12">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 font-sans">Description</h2>
            <div className="relative">
              <div
                className="prose text-zinc-700 max-w-none text-sm leading-relaxed font-sans flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: isDescriptionExpanded ? "1200px" : "160px",
                }}
                dangerouslySetInnerHTML={{
                  __html: displayFullDesc || "<p>Création façonnée dans notre atelier à Comines. Chaque pièce est imprimée avec précision en PLA biosourcé, ébavurée et vérifiée à la main.</p><p>Matière issue de ressources végétales renouvelables. Conçu pour durer, résister aux manipulations du quotidien et apporter une présence singulière sur votre bureau.</p>"
                }}
              />
              {/* Fade overlay mask when collapsed */}
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f9f9fb] via-[#f9f9fb]/90 to-transparent pointer-events-none" />
              )}
            </div>
            <div className="mt-4 flex justify-start">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-zinc-900 hover:text-[#ff4f00] transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-sans"
              >
                <span>{isDescriptionExpanded ? "Voir moins" : "Voir plus"}</span>
                <svg
                  className={`w-3.5 h-3.5 text-zinc-900 transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Enjeu App Companion Banner (affiché uniquement sur les produits geek & jeux de société) */}
        {isGeekOrBoardGameProduct && (
          <div className="mt-12">
            <EnjeuBanner productName={displayName || product?.name} />
          </div>
        )}

        {/* Frequently Bought Together */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-spoolio-border pt-12 mt-12">
            <h2 className="text-xl font-bold text-zinc-900 mb-8 tracking-tight font-sans">
              Souvent acheté avec
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => {
                const discountVal = p.on_sale ? Math.round(((parseFloat(p.regular_price) - parseFloat(p.price)) / parseFloat(p.regular_price)) * 100) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative w-full aspect-square bg-zinc-100">
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
                        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#ff4f00] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {p.short_description?.replace(/<[^>]*>/g, "").replace(/&rsquo;/g, "’") || "Création d'atelier Spoolio façonnée en PLA biosourcé."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-zinc-900">{parseFloat(p.price).toFixed(2)}€</span>
                          {p.on_sale && (
                            <span className="text-xs text-zinc-400 line-through">{parseFloat(p.regular_price).toFixed(2)}€</span>
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

        {/* Safety and craftsmanship reassurance notice */}
        <section className="border-t border-spoolio-border pt-12 mt-12">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start shadow-xs">
            <div className="shrink-0 select-none bg-white p-3.5 rounded-2xl border border-zinc-200 text-2xl shadow-xs">
              🛠️
            </div>
            <div className="space-y-2.5 font-sans">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-outfit">
                  Atelier Spoolio • Fabrication Française &amp; Écoresponsable
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-800">
                  🌱 100% Polymère Végétal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-semibold">
                Fabrication additive de précision à Comines (59). Objets et accessoires durables imprimés à la commande en PLA biosourcé issu d&apos;amidon de maïs.
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                <strong className="text-zinc-900 font-bold">Qualité &amp; Finitions :</strong> Chaque pièce est imprimée couche par couche avec un niveau de précision artisanal, inspectée puis préparée avec soin. Matière saine, recyclable et issue de ressources végétales renouvelables.
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                <strong className="text-zinc-700 font-medium">Recommandation d&apos;usage :</strong> Objets conçus pour le bureau, le quotidien et la manipulation tactile. En raison de pièces articulées ou de petits éléments démontables selon les modèles, ne convient pas aux enfants de moins de 36 mois sans surveillance.
              </p>
            </div>
          </div>
        </section>

        {/* Section Avis Clients */}
        {reviews.length === 0 && !loadingReviews ? (
          <section className="border-t border-zinc-200/80 pt-10 mt-12 space-y-6 font-sans">
            {/* Rappel Avis Google (Style Réassurance Home Page) */}
            <div className="reviews-gradient-container relative rounded-3xl bg-gradient-to-tr from-[#ff3c00] via-[#ff6200] to-[#e60067] p-6 sm:p-7 text-white shadow-xl shadow-[#ff4f00]/10 border border-white/10 overflow-hidden">
              {/* Soft grid background overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold font-outfit tracking-tight text-white no-invert">
                      Nos clients adorent l&apos;atelier Spoolio ⭐
                    </h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/80 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 no-invert">
                      Avis Vérifiés
                    </span>
                    <span className="inline-block text-[10px] font-bold tracking-wider text-white px-2 py-0.5 rounded-full bg-black/25 border border-white/15 no-invert">
                      4.9 / 5 sur Google
                    </span>
                  </div>
                  <p className="text-xs text-white/90 max-w-xl font-medium leading-relaxed no-invert">
                    Pas encore d&apos;avis direct sur ce modèle, mais la qualité de fabrication de notre atelier et nos finitions d&apos;impression 3D sont plébiscitées par notre communauté.
                  </p>
                </div>

                <a
                  href="https://g.page/r/CZEMl8MXwp-kEBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="google-review-btn inline-flex items-center justify-center gap-2 text-xs font-extrabold px-4 py-2.5 rounded-full bg-zinc-950 text-white hover:bg-white hover:text-zinc-950 border border-white/30 hover:border-white transition-all duration-300 shadow-md shrink-0 cursor-pointer no-invert"
                >
                  <span className="!bg-transparent text-inherit">Déposer un avis Google ✍️</span>
                </a>
              </div>

              {/* Mini-cartes témoignages Google */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: "Camille R.",
                    comment: "La boîte magique est incroyable ! Reçue rapidement avec un mot sympa. La finition de l'impression 3D est vraiment au top.",
                  },
                  {
                    name: "Romain M.",
                    comment: "Super produits et créateur très à l'écoute avec beaucoup de bienveillance. Objets 3D robustes et parfaits au quotidien.",
                  },
                  {
                    name: "Justine D.",
                    comment: "J'adore ! Le site regorge d'idées originales. Mon fils est fan de ses créations articulées. Coup de cœur garanti !",
                  },
                ].map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between"
                  >
                    <p className="text-xs text-white/95 leading-relaxed font-medium italic mb-2.5 line-clamp-3 no-invert">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/15 text-[11px]">
                      <span className="font-black text-white flex items-center gap-1 no-invert">
                        {rev.name}
                        <span className="text-[10px] text-white/80">✔️</span>
                      </span>
                      <span className="text-[#ffd166] drop-shadow-[0_0_6px_rgba(255,209,102,0.4)]">
                        ★★★★★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire de dépôt compact pleine largeur */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 tracking-tight font-sans">
                    Vous possédez déjà cet objet ? Partagez votre avis
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Votre avis sera associé à l&apos;adresse e-mail de votre commande pour être validé.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                  {/* Nom */}
                  <div className="lg:col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Ex: Hélène Felchner"
                      className="h-10 border rounded-xl px-3 outline-none transition-colors review-input text-xs w-full"
                    />
                  </div>

                  {/* Email */}
                  <div className="lg:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      E-mail de votre commande
                    </label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="Ex: client@exemple.com"
                      className="h-10 border rounded-xl px-3 outline-none transition-colors review-input text-xs w-full"
                    />
                  </div>

                  {/* Note */}
                  <div className="lg:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Note
                    </label>
                    <div className="h-10 flex items-center px-3 border border-zinc-200/80 rounded-xl bg-zinc-50/60 gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-base transition-colors cursor-pointer select-none ${
                            star <= reviewRating ? "text-[#ff4f00]" : "text-zinc-300 hover:text-zinc-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-[10px] text-zinc-500 font-bold ml-auto">{reviewRating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Commentaire + Bouton submit */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Votre commentaire
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Qu'avez-vous pensé de cet objet ? (qualité, finition, prise en main...)"
                      className="border rounded-xl p-2.5 outline-none resize-none transition-colors leading-relaxed review-input text-xs w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="sm:w-48 h-10 sm:h-[58px] shrink-0 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 review-submit-btn"
                  >
                    {submittingReview ? "Envoi..." : "Envoyer mon avis"}
                  </button>
                </div>

                {reviewSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[11px] leading-normal">
                    ✓ {reviewSuccess}
                  </div>
                )}

                {reviewError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[11px] leading-normal">
                    ⚠️ {reviewError}
                  </div>
                )}
              </form>
            </div>
          </section>
        ) : (
          <section className="border-t border-spoolio-border pt-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 font-sans">
            {/* Liste des avis (2/3 de l'espace) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight font-sans">
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
                    <span className="text-xs text-zinc-500 font-semibold">
                      {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)} sur 5 étoiles
                    </span>
                  </div>
                ) : null}
              </div>

              {loadingReviews ? (
                <div className="text-xs text-gray-500 font-medium py-6 animate-pulse">
                  Chargement des avis...
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-spoolio-card border border-spoolio-border space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-xs font-bold text-zinc-900">{rev.customerName}</span>
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
                      <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
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
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-sans">
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
        )}

        {/* Lightbox Modal (Point 3 UX) */}
        {isLightboxOpen && hasImage && (
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 bg-black/95 z-[999999] flex flex-col items-center justify-between p-0 pt-3 sm:pt-4 pb-3 sm:pb-5 backdrop-blur-md cursor-zoom-out select-none"
          >
            {/* Top Toolbar: Zoom Controls & Close Button */}
            <div className="w-full px-4 sm:px-6 z-50 flex items-center justify-between pointer-events-none shrink-0">
              {/* Zoom Controls */}
              <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto flex items-center gap-2 bg-black/85 border border-white/20 rounded-full px-3 py-1.5 backdrop-blur-md shadow-2xl text-xs text-white">
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.max(1, +(prev - 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#ff4f00] flex items-center justify-center transition-colors cursor-pointer"
                  title="Dézoomer"
                  aria-label="Dézoomer"
                >
                  <Minus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </button>
                <span className="font-mono text-xs font-bold text-gray-200 w-10 text-center select-none">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.min(3.5, +(prev + 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#ff4f00] flex items-center justify-center transition-colors cursor-pointer"
                  title="Zoomer"
                  aria-label="Zoomer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </button>
                {lightboxZoom > 1 && (
                  <button
                    type="button"
                    onClick={() => setLightboxZoom(1)}
                    className="ml-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black font-extrabold text-[10px] uppercase transition-colors cursor-pointer"
                  >
                    RAZ
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-[#ff4f00] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 backdrop-blur-md shadow-2xl"
                title="Fermer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Main Lightbox Image / Video Display Container (Plein écran 100% largeur) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full flex-1 min-h-0 flex items-center justify-center cursor-default overflow-hidden my-auto px-0"
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
                      className="w-full h-full max-h-[85vh] object-contain"
                    />
                  );
                }

                return (
                  <div
                    className="w-full h-full relative transition-transform duration-200 ease-out flex items-center justify-center"
                    style={{ transform: `scale(${lightboxZoom})` }}
                  >
                    <Image
                      src={lightboxSrc}
                      alt={product.images[activeImageIndex]?.alt || "Product image"}
                      fill
                      sizes="100vw"
                      className="w-full h-full object-contain no-invert"
                      unoptimized={lightboxSrc?.startsWith("data:")}
                      priority
                    />
                  </div>
                );
              })()}

              {/* Previous Button */}
              {product.images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 sm:left-6 md:left-8 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#ff4f00] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer select-none shadow-2xl hover:scale-105 active:scale-95"
                  title="Image précédente"
                  aria-label="Image précédente"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </button>
              )}

              {/* Next Button */}
              {product.images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 sm:right-6 md:right-8 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#ff4f00] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer select-none shadow-2xl hover:scale-105 active:scale-95"
                  title="Image suivante"
                  aria-label="Image suivante"
                >
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Fullscreen Lightbox Bottom Bar with Thumbnails & Shortcuts */}
            <div onClick={(e) => e.stopPropagation()} className="w-full px-4 pt-2 pb-1 sm:pb-2 flex flex-col items-center gap-2 sm:gap-3 select-none z-10 shrink-0">
              {product.images.length > 1 && (
                <div className="flex gap-2 max-w-2xl overflow-x-auto pb-1 px-2 no-scrollbar justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={`lightbox-thumb-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#ff4f00] ring-2 ring-[#ff4f00] scale-110"
                          : "border-white/20 opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.src} alt={img.alt || product.name} fill sizes="48px" className="object-cover no-invert" unoptimized={img.src?.startsWith("data:")} />
                    </button>
                  ))}
                </div>
              )}
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/95 border border-white/25 backdrop-blur-md shadow-2xl text-xs font-sans text-zinc-200">
                <span className="font-black text-white">{activeImageIndex + 1} / {product.images.length}</span>
                <span className="text-zinc-600 font-bold select-none">•</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-zinc-200 font-medium">
                  <span>Utilisez les flèches</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/20 border border-white/30 text-white font-mono font-bold text-[10px] shadow-xs">←</kbd>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/20 border border-white/30 text-white font-mono font-bold text-[10px] shadow-xs">→</kbd>
                  <span>ou</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/20 border border-white/30 text-white font-mono font-bold text-[10px] shadow-xs">Échap</kbd>
                  <span>pour fermer</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Add-To-Cart Bar (Point 6 UX) */}
      {product && !isNotAvailableToBuy && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-zinc-200/90 p-3 sm:hidden transition-transform duration-300 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] ${
            showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            {/* Image + Title + Price */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                <Image
                  src={product.images[0]?.src || "/images/figma_keychains.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="44px"
                  unoptimized={product.images[0]?.src?.startsWith("data:")}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-zinc-950 truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-xs font-mono font-black text-[#ff4f00]">
                  {currentPrice}€
                </span>
              </div>
            </div>

            {/* Quick CTA Button */}
            <button
              onClick={handleAddToCartClick}
              className={`h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md active:scale-95 no-invert keep-white ${
                isAdded
                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                  : "bg-[#ff4f00] hover:bg-[#e04500] text-white shadow-[#ff4f00]/30"
              }`}
            >
              <span>{isAdded ? "✓ Ajouté !" : "Ajouter au panier"}</span>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
