"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  Camera,
  ExternalLink,
  Search,
  Upload,
  Link2,
} from "lucide-react";
import {
  BazarItem,
  BazarItemCondition,
  BazarItemStatus,
  BazarScene,
  BazarZone,
} from "@/types/bazar";
import { ProductCrop } from "../client/ProductCrop";
import { saveLocalImageBlob } from "@/lib/bazar/storage";

interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  images?: { src?: string }[];
}

interface QuickItemFormProps {
  scene: BazarScene;
  zone: BazarZone;
  existingItem?: BazarItem | null;
  onSave: (itemData: Omit<BazarItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onSaveAndNext: (itemData: Omit<BazarItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onDeleteZone: () => Promise<void>;
  onDeleteItem?: () => Promise<void>;
  onClose: () => void;
}

export const QuickItemForm: React.FC<QuickItemFormProps> = ({
  scene,
  zone,
  existingItem,
  onSave,
  onSaveAndNext,
  onDeleteZone,
  onDeleteItem,
  onClose,
}) => {
  const [name, setName] = useState(existingItem?.name || "");
  const [priceEuros, setPriceEuros] = useState<string>(
    existingItem ? (existingItem.priceCents / 100).toString() : "3"
  );
  const [quantity, setQuantity] = useState<number>(existingItem ? existingItem.quantity : 1);
  const [condition, setCondition] = useState<BazarItemCondition>(
    existingItem?.condition || "end_of_series"
  );
  const [status, setStatus] = useState<BazarItemStatus>(existingItem?.status || "available");
  const [description, setDescription] = useState(existingItem?.description || "");
  const [conditionNotes, setConditionNotes] = useState(existingItem?.conditionNotes || "");
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    existingItem?.additionalImages || []
  );
  const [linkedProductSlug, setLinkedProductSlug] = useState<string>(
    existingItem?.linkedProductSlug || ""
  );
  const [linkedProductName, setLinkedProductName] = useState<string>(
    existingItem?.linkedProductName || ""
  );
  const [linkedProductPrice, setLinkedProductPrice] = useState<string>(
    existingItem?.linkedProductPrice || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Shop catalog product search
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const extraPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setPriceEuros((existingItem.priceCents / 100).toString());
      setQuantity(existingItem.quantity);
      setCondition(existingItem.condition);
      setStatus(existingItem.status);
      setDescription(existingItem.description || "");
      setConditionNotes(existingItem.conditionNotes || "");
      setAdditionalImages(existingItem.additionalImages || []);
      setLinkedProductSlug(existingItem.linkedProductSlug || "");
      setLinkedProductName(existingItem.linkedProductName || "");
      setLinkedProductPrice(existingItem.linkedProductPrice || "");
    }
  }, [existingItem]);

  // Fetch shop products for linking
  const fetchCatalog = async () => {
    if (catalogProducts.length > 0) return;
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setCatalogProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Failed to load catalog products", e);
    }
  };

  const handleAddExtraPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const id = `bazar-extra-${Date.now()}`;
      const dataUrl = await saveLocalImageBlob(id, file);
      setAdditionalImages((prev) => [...prev, dataUrl].slice(0, 3));
    } catch (err) {
      console.error("Failed to upload extra photo", err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemoveExtraPhoto = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectCatalogProduct = (prod: CatalogProduct) => {
    setLinkedProductSlug(prod.slug);
    setLinkedProductName(prod.name);
    setLinkedProductPrice(prod.price);
    setIsSearchOpen(false);
    setSearchProductQuery("");
  };

  const handleUnlinkProduct = () => {
    setLinkedProductSlug("");
    setLinkedProductName("");
    setLinkedProductPrice("");
  };

  const filteredCatalog = catalogProducts
    .filter((p) =>
      p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchProductQuery.toLowerCase())
    )
    .slice(0, 6);

  const getPayload = (): Omit<BazarItem, "id" | "createdAt" | "updatedAt"> => {
    const parsedPrice = parseFloat(priceEuros.replace(",", "."));
    const priceCents = isNaN(parsedPrice) ? 300 : Math.round(parsedPrice * 100);
    const validQty = Math.max(0, quantity);
    const derivedStatus = validQty === 0 ? "sold" : status;

    return {
      name: name.trim() || "Objet sans nom",
      priceCents,
      quantity: validQty,
      condition,
      status: derivedStatus,
      description: description.trim() || undefined,
      conditionNotes: conditionNotes.trim() || undefined,
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
      linkedProductSlug: linkedProductSlug.trim() || undefined,
      linkedProductName: linkedProductName.trim() || undefined,
      linkedProductPrice: linkedProductPrice.trim() || undefined,
    };
  };

  const handleSimpleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(getPayload());
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    try {
      await onSaveAndNext(getPayload());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="quick-form-title"
      aria-modal="true"
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#E4E4E0] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#E4E4E0] bg-[#FAF9F6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
          <h2 id="quick-form-title" className="text-base font-bold text-[#121212]">
            {existingItem ? "Modifier l'objet" : "Nouvel objet détecté"}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSimpleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Automatic Crop Preview Box */}
        <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E4E4E0] flex items-center gap-3">
          <ProductCrop
            imageUrl={scene.imageUrl}
            zone={zone}
            alt="Aperçu recadré"
            className="w-16 h-16 rounded-xl border border-[#E4E4E0] shadow-2xs"
            paddingRatio={0.15}
          />
          <div className="flex-1 min-w-0 text-xs">
            <span className="font-bold text-[#121212] block">Recadrage principal automatique</span>
            <span className="text-neutral-500">
              Généré depuis le rectangle tracé sur la photographie.
            </span>
          </div>
        </div>

        {/* Photos supplémentaires (Détails / Défauts) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Photos supplémentaires ({additionalImages.length}/3)</span>
            </label>
            <span className="text-[11px] text-neutral-400">Facultatif</span>
          </div>

          <input
            ref={extraPhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAddExtraPhoto}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            {additionalImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative w-14 h-14 rounded-xl border border-[#E4E4E0] overflow-hidden group bg-neutral-100 shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Détail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExtraPhoto(idx)}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Supprimer cette photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {additionalImages.length < 3 && (
              <button
                type="button"
                onClick={() => extraPhotoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-[#E4E4E0] hover:border-[#FF5500] hover:bg-orange-50/50 text-neutral-400 hover:text-[#FF5500] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer text-[10px] font-semibold"
                title="Ajouter une photo de détail ou de défaut"
              >
                <Plus className="w-4 h-4" />
                <span>Photo</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Ajoutez 1 ou 2 photos pour montrer un défaut précis, le verso ou un gros plan.
          </p>
        </div>

        {/* Lien vers un produit de la boutique Spoolio */}
        <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Lier à un produit de la boutique</span>
            </label>
            <span className="text-[10px] text-neutral-400">Optionnel</span>
          </div>

          {linkedProductSlug ? (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-orange-200 shadow-2xs">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#121212] truncate">
                  {linkedProductName || linkedProductSlug}
                </div>
                <div className="text-[11px] text-neutral-500">
                  Version officielle en boutique • {linkedProductPrice ? `${linkedProductPrice} €` : "Voir page"}
                </div>
              </div>
              <button
                type="button"
                onClick={handleUnlinkProduct}
                className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Dissocier ce produit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher dans la boutique (ex: caméléon)..."
                  value={searchProductQuery}
                  onFocus={() => {
                    fetchCatalog();
                    setIsSearchOpen(true);
                  }}
                  onChange={(e) => {
                    setSearchProductQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4E4E0] text-xs bg-white text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
                />
              </div>

              {isSearchOpen && searchProductQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E0] rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-[#E4E4E0]">
                  {filteredCatalog.map((prod) => (
                    <button
                      type="button"
                      key={prod.id}
                      onClick={() => handleSelectCatalogProduct(prod)}
                      className="w-full p-2.5 text-left text-xs hover:bg-orange-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-semibold text-[#121212] truncate">
                        {prod.name}
                      </span>
                      <span className="font-bold text-[#FF5500] shrink-0 ml-2">
                        {prod.price} €
                      </span>
                    </button>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <div className="p-3 text-center text-xs text-neutral-400">
                      Aucun produit trouvé dans le catalogue.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-[11px] text-neutral-500">
            Affiche un bouton « Découvrir la version standard en boutique » sur la fiche pour valoriser le prix réduit du modèle d&apos;atelier.
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Nom de l&apos;objet <span className="text-[#FF5500]">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="ex: Caméléon vert aimanté"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
          />
        </div>

        {/* Price & Quantity Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Prix (€) <span className="text-[#FF5500]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="5.00"
                value={priceEuros}
                onChange={(e) => setPriceEuros(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E4E4E0] text-sm font-bold text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
              />
              <span className="absolute right-3 top-2.5 text-neutral-400 font-bold text-sm">
                €
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Quantité <span className="text-[#FF5500]">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm font-bold text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
            />
          </div>
        </div>

        {/* Condition Type */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Type d&apos;objet
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as BazarItemCondition)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] bg-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
          >
            <option value="minor_defect">Petit défaut d&apos;impression</option>
            <option value="end_of_series">Fin de série</option>
            <option value="prototype">Prototype d&apos;atelier</option>
            <option value="color_test">Essai de couleur</option>
            <option value="other">Pièce unique / Autre</option>
          </select>
        </div>

        {/* Availability Status */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Disponibilité
          </label>
          <select
            value={quantity === 0 ? "sold" : status}
            onChange={(e) => setStatus(e.target.value as BazarItemStatus)}
            disabled={quantity === 0}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] bg-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none disabled:bg-neutral-100"
          >
            <option value="available">Disponible à la vente</option>
            <option value="reserved">Réservé</option>
            <option value="sold">Vendu / Épuisé</option>
          </select>
          {quantity === 0 && (
            <span className="text-[11px] text-amber-700 mt-1 block">
              Automatiquement marqué comme vendu car le stock est à 0.
            </span>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Description courte (facultative)
          </label>
          <input
            type="text"
            placeholder="ex: Corps souple entièrement articulé avec pattes aimantées."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
          />
        </div>

        {/* Condition Notes (defect details) */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Précision sur le défaut ou l&apos;état
          </label>
          <input
            type="text"
            placeholder="ex: Légère bavure sous le ventre, aimant néodyme parfait."
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
          />
        </div>

        {/* Actions Bar */}
        <div className="pt-4 border-t border-[#E4E4E0] space-y-2.5">
          <button
            type="button"
            onClick={handleSaveAndNext}
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer et ajouter un autre objet</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-xl bg-[#121212] hover:bg-neutral-800 text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
            <button
              type="button"
              onClick={onDeleteZone}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer la zone</span>
            </button>

            {existingItem && onDeleteItem && (
              <button
                type="button"
                onClick={onDeleteItem}
                className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Supprimer l&apos;objet
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
