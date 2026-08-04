"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "../../AdminThemeContext";

interface Attribute {
  id: number;
  name: string;
  values: string;
  controlType: string;
}

export default function AdminAttributesPage() {
  const { cls, theme } = useAdminTheme();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState<string>("");
  const [values, setValues] = useState<string>("");
  const [controlType, setControlType] = useState<string>("dropdown");
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attributes");
      if (res.ok) {
        const data = await res.json();
        setAttributes(data.attributes || []);
      } else {
        setErrorMsg("Impossible de récupérer les attributs.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEdit = editingId !== null;
    const url = "/api/admin/attributes";
    const method = isEdit ? "PUT" : "POST";
    const bodyPayload = isEdit
      ? { id: editingId, name: name.trim(), values: values.trim(), controlType }
      : { name: name.trim(), values: values.trim(), controlType };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(isEdit ? "Attribut modifié avec succès !" : "Attribut ajouté avec succès !");
        handleCancelEdit();
        fetchAttributes();
      } else {
        setErrorMsg(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (attr: Attribute) => {
    setEditingId(attr.id);
    setName(attr.name);
    setValues(attr.values);
    setControlType(attr.controlType || "dropdown");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setValues("");
    setControlType("dropdown");
  };

  const handleDeleteAttribute = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet attribut prédéfini ?")) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/attributes?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Attribut supprimé avec succès !");
        if (editingId === id) handleCancelEdit();
        fetchAttributes();
      } else {
        setErrorMsg(data.error || "La suppression a échoué.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin/products" className={`text-xs ${cls.textMuted} hover:text-white transition-colors`}>
              &larr; Retour Produits
            </Link>
          </div>
          <h1 className={`text-3xl font-black font-antonio uppercase tracking-tight ${cls.textMain}`}>Attributs Prédéfinis 🛠️</h1>
          <p className={`text-sm ${cls.textMuted} mt-1`}>
            Gérez des groupes d'attributs réutilisables (ex: Couleurs, Tailles) pour les charger d'un clic dans vos produits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form panel */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border ${cls.border} ${cls.cardBg} space-y-4 transition-colors duration-300`}>
          <div>
            <h3 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>
              {editingId !== null ? "Modifier l'Attribut" : "Nouvel Attribut"}
            </h3>
            <p className={`text-xs ${cls.textMuted} mt-0.5`}>
              {editingId !== null ? "Éditez les valeurs existantes." : "Créez une liste d'attributs réutilisables."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Nom de l'attribut *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Couleurs, Tailles"
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9]`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                  Valeurs par défaut *
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/colors?availableOnly=true");
                      if (res.ok) {
                        const data = await res.json();
                        const colorNames = (data.colors || []).map((c: any) => c.name);
                        if (colorNames.length > 0) {
                          setValues(colorNames.join(", "));
                        }
                      }
                    } catch (e) {
                      console.error("Error fetching available colors:", e);
                    }
                  }}
                  className="text-[9px] font-bold text-[#ff4f00] hover:underline flex items-center gap-1"
                >
                  ⚡ Importer couleurs disponibles (Palette)
                </button>
              </div>
              <textarea
                required
                rows={4}
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder="Ex: Noir, Blanc, Rouge, Bleu pailleté, Vert sapin (séparez par des virgules)"
                className={`border rounded-xl p-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] resize-none leading-relaxed`}
              />
              <span className={`text-[9px] ${cls.textFaint} mt-0.5 leading-normal`}>
                Saisissez les différentes options séparées par des virgules.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-black uppercase tracking-wider ${cls.textFaint}`}>
                Type de contrôle d'affichage
              </label>
              <select
                value={controlType}
                onChange={(e) => setControlType(e.target.value)}
                className={`h-10 border rounded-xl px-3 outline-none transition-colors ${cls.inputBg} ${cls.border} ${cls.textMain} focus:border-[#2F3CD9] cursor-pointer`}
              >
                <option value="dropdown">Dropdown (Liste déroulante)</option>
                <option value="color_swatch">Color Swatch (Bobine de couleur)</option>
                <option value="segmented_control">Segmented Control (Onglets)</option>
                <option value="chips">Chips (Pastilles ordinaires)</option>
                <option value="date_picker">Date Picker (Sélecteur de date)</option>
              </select>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-normal">
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-normal">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex gap-2">
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`flex-1 h-10 flex items-center justify-center border ${cls.border} ${cls.textMain} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:bg-white/5`}
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 flex items-center justify-center text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white hover:bg-white/90 disabled:opacity-50 shadow-md shadow-white/5"
              >
                {submitting ? "Sauvegarde..." : editingId !== null ? "Enregistrer" : "Ajouter ➕"}
              </button>
            </div>
          </form>
        </div>

        {/* List panel */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${cls.border} ${cls.cardBg} space-y-4 transition-colors duration-300`}>
          <h3 className={`text-sm font-bold ${cls.textMain} uppercase tracking-widest font-antonio`}>Attributs réutilisables</h3>

          {loading ? (
            <div className={`text-xs ${cls.textMuted} italic py-8 text-center animate-pulse`}>
              Chargement des attributs...
            </div>
          ) : attributes.length === 0 ? (
            <div className={`text-xs ${cls.textMuted} italic py-8 text-center`}>
              Aucun attribut prédéfini enregistré.
            </div>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr) => (
                <div
                   key={attr.id}
                   className={`p-4 rounded-2xl border ${cls.border} ${cls.inputBg} flex items-start justify-between gap-4`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${cls.textMain}`}>{attr.name}</span>
                      <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-md bg-white/5 border border-white/10 text-gray-400 font-mono">
                        {attr.controlType || "dropdown"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attr.values.split(",").map(v => v.trim()).filter(Boolean).map((val, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-white/5 border border-white/10 text-white"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartEdit(attr)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${cls.border} ${cls.cardBg} text-gray-300 hover:text-white transition-all cursor-pointer font-bold`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
