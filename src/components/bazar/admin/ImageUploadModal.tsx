"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, AlertCircle, Check } from "lucide-react";
import { saveLocalImageBlob } from "@/lib/bazar/storage";
import { BazarScene } from "@/types/bazar";

interface ImageUploadModalProps {
  onCreated: (sceneData: Omit<BazarScene, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  onCreated,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    { name: "Table Art Toys", url: "/images/clicker_gallery_2.webp", w: 1600, h: 1067 },
    { name: "Tests Clickers", url: "/images/clicker_gallery_0.webp", w: 1200, h: 1801 },
    { name: "Atelier Clés & Supports", url: "/images/figma_keychains.jpg", w: 1024, h: 1024 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format non supporté. Veuillez choisir un fichier JPEG, PNG ou WebP.");
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("L'image est trop lourde (max 20 Mo).");
      return;
    }

    setIsProcessing(true);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const id = `scene-img-${Date.now()}`;
        let finalImageUrl = "";

        // 1. Try uploading to server (Supabase Storage / public/uploads)
        try {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.url || uploadJson.imageUrl) {
              finalImageUrl = uploadJson.url || uploadJson.imageUrl;
            }
          }
        } catch (uploadErr) {
          console.warn("Upload to server failed, falling back to local storage:", uploadErr);
        }

        // 2. Fallback to local IndexedDB if server upload was not possible
        if (!finalImageUrl) {
          finalImageUrl = await saveLocalImageBlob(id, file);
        }

        setPreviewUrl(finalImageUrl);
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        }
      } catch (err) {
        console.error("Storage error", err);
        setError("Erreur lors de l'enregistrement de l'image.");
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Impossible de lire l'image sélectionnée.");
      setIsProcessing(false);
    };
    img.src = objectUrl;
  };

  const handlePickSample = (sample: typeof sampleImages[0]) => {
    setPreviewUrl(sample.url);
    setImageDimensions({ width: sample.w, height: sample.h });
    if (!title) {
      setTitle(sample.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !imageDimensions) {
      setError("Veuillez sélectionner ou importer une photographie.");
      return;
    }

    onCreated({
      title: title.trim() || "Nouvelle scène d'atelier",
      description: description.trim() || undefined,
      imageUrl: previewUrl,
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
      status: "draft",
      sortOrder: 99,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-labelledby="upload-scene-title"
        aria-modal="true"
        className="bg-white rounded-3xl border border-[#E4E4E0] shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="upload-scene-title" className="text-xl font-black text-[#121212]">
            Créer une nouvelle scène
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Nom de la scène <span className="text-[#FF5500]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Table braderie du samedi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Description (facultative)
            </label>
            <input
              type="text"
              placeholder="ex: Photographie prise lors de notre dernier marché artisanal."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] text-sm text-[#121212] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none"
            />
          </div>

          {/* Photo Dropzone */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Photographie (JPEG, PNG, WebP)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E4E4E0] hover:border-[#FF5500] rounded-2xl p-6 text-center cursor-pointer bg-[#FAF9F6] transition-colors"
            >
              {previewUrl ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Aperçu scène"
                    className="max-h-40 mx-auto rounded-xl object-contain border border-[#E4E4E0]"
                  />
                  <div className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      Photo prête ({imageDimensions?.width} × {imageDimensions?.height} px)
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Cliquez pour changer d&apos;image
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-8 h-8 text-[#FF5500] mx-auto mb-1" />
                  <div className="text-sm font-bold text-[#121212]">
                    Choisir une photo locale
                  </div>
                  <div className="text-xs text-neutral-500">
                    Stockage 100% local dans votre navigateur (IndexedDB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample quick choices */}
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Ou choisir un exemple de l&apos;atelier :
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((s) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => handlePickSample(s)}
                  className="p-1.5 rounded-xl border border-[#E4E4E0] hover:border-[#FF5500] text-[11px] font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-all text-center truncate cursor-pointer"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E4E0] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E4E4E0] text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!previewUrl || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#e04b00] text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              {isProcessing ? "Traitement..." : "Créer la scène"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

