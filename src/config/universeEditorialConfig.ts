/**
 * Spoolio V2.1 — Fallbacks éditoriaux locaux pour les Univers
 * 
 * Contenu utilisé si les champs `subtitle`, `description`, `seo_title` ou `seo_description`
 * sont vides dans la table `catalog_taxonomy` de Supabase.
 */

export interface UniverseEditorial {
  subtitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tagline?: string;
}

export const UNIVERSE_EDITORIAL_CONFIG: Record<string, UniverseEditorial> = {
  "art-toys": {
    subtitle: "Personnages, créatures et curiosités à collectionner.",
    description:
      "Des objets à exposer, manipuler et garder près de soi. Art toys, petites créatures et pièces plus étranges sorties de l’atelier.",
    seoTitle: "Art Toys & Collectibles — Spoolio",
    seoDescription:
      "Découvrez les art toys, créatures et curiosités Spoolio : des objets pop, décalés et fabriqués en petites séries dans notre atelier.",
    tagline: "Univers 01 // Art Toys & Collectibles",
  },
  "tactile": {
    subtitle: "Objets tactiles, mécaniques et satisfaisants à manipuler.",
    description:
      "Clickers, fidgets et mécanismes pensés pour le geste, le mouvement et le plaisir de manipulation.",
    seoTitle: "Tactile & Focus — Fidgets et objets tactiles Spoolio",
    seoDescription:
      "Découvrez les clickers, fidgets et mécanismes Spoolio : des objets tactiles et mécaniques conçus autour du geste et du mouvement.",
    tagline: "Univers 02 // Tactile & Focus",
  },
  "objets-deco": {
    subtitle: "Des objets utiles, décoratifs ou franchement décalés.",
    description:
      "Accessoires de bureau, rangement, supports et curiosités pour apporter un peu de caractère au quotidien.",
    seoTitle: "Objets & Déco — Spoolio",
    seoDescription:
      "Supports, rangement, décoration et objets décalés : découvrez les créations Spoolio pour le bureau et la maison.",
    tagline: "Univers 03 // Objets & Déco",
  },
  "tabletop": {
    subtitle: "Objets et accessoires pour jouer autrement.",
    description:
      "Tours à dés, accessoires pour cartes et petits jeux conçus pour enrichir la table sans la surcharger.",
    seoTitle: "Tabletop — Accessoires de jeu Spoolio",
    seoDescription:
      "Tours à dés, accessoires pour cartes et petits jeux : découvrez la sélection Tabletop imaginée par Spoolio.",
    tagline: "Univers 04 // Tabletop",
  },
};

export const UNIVERSE_SLUGS = ["art-toys", "tactile", "objets-deco", "tabletop"] as const;
export type UniverseSlug = (typeof UNIVERSE_SLUGS)[number];
