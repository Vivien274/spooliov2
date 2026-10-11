/**
 * Spoolio V2.1 — Fallback éditorial local pour les 8 Collections actives
 * Utilisé si les champs subtitle, description, seo_title ou seo_description
 * sont vides dans la table catalog_taxonomy.
 */

export interface CollectionEditorial {
  name: string;
  subtitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tagline?: string;
}

export const COLLECTION_EDITORIAL_CONFIG: Record<string, CollectionEditorial> = {
  "cabinet-noir": {
    name: "Cabinet noir",
    subtitle: "Le côté sombre du cabinet de curiosités.",
    description:
      "Crânes, squelettes, créatures étranges et objets un peu macabres. Une sélection plus noire, toujours avec l’esprit Spoolio.",
    seoTitle: "Cabinet noir — Collection Spoolio",
    seoDescription:
      "Crânes, squelettes, créatures étranges et curiosités sombres : explorez la collection Cabinet noir de Spoolio.",
    tagline: "// ÉDITION NOIRE & CURIOSITÉS MACABRES",
  },
  "tactile-lab": {
    name: "Tactile Lab",
    subtitle: "Objets conçus autour du geste, du clic et du mouvement.",
    description:
      "Une sélection de clickers, fidgets et mécanismes pour celles et ceux qui aiment manipuler, tourner, presser et recommencer.",
    seoTitle: "Tactile Lab — Collection Spoolio",
    seoDescription:
      "Clickers, fidgets et mécanismes tactiles : explorez la collection Tactile Lab de Spoolio.",
    tagline: "// LABORATOIRE TACTILE & SENSORIEL",
  },
  "gadgetoids": {
    name: "Gadgetoids",
    subtitle: "Petits robots, grosses personnalités.",
    description:
      "Des personnages mécaniques transformables à collectionner, assembler et exposer.",
    seoTitle: "Gadgetoids — Collection Spoolio",
    seoDescription:
      "Découvrez Gadgetoids, la collection de petits robots transformables et objets de collection de Spoolio.",
    tagline: "// ROBOTS & PERSONNAGES ARTICULÉS",
  },
  "fantasy-relics": {
    name: "Fantasy Relics",
    subtitle: "Objets échappés d’un monde fantastique.",
    description:
      "Dragons, reliques, artefacts et curiosités inspirés par la fantasy, entre objet décoratif et pièce de collection.",
    seoTitle: "Fantasy Relics — Collection Spoolio",
    seoDescription:
      "Dragons, reliques et objets fantasy : explorez la collection Fantasy Relics de Spoolio.",
    tagline: "// ARTEFACTS & MONDES FANTASTIQUES",
  },
  "soft-illusion": {
    name: "Soft Illusion",
    subtitle: "Des objets qui semblent plus mous qu’ils ne le sont.",
    description:
      "Une collection de trompe-l’œil inspirés des coussins, textiles et formes souples, entièrement revisités en objet imprimé.",
    seoTitle: "Soft Illusion — Collection Spoolio",
    seoDescription:
      "Découvrez Soft Illusion, une collection Spoolio de trompe-l’œil inspirés des textiles et objets souples.",
    tagline: "// TROMPE-L'ŒIL & TEXTURES SOUPLES",
  },
  "kraft-illusion": {
    name: "Kraft Illusion",
    subtitle: "L’apparence du papier, la solidité d’un objet.",
    description:
      "Une série de trompe-l’œil inspirés du kraft, du papier froissé et des objets du quotidien.",
    seoTitle: "Kraft Illusion — Collection Spoolio",
    seoDescription:
      "Découvrez Kraft Illusion, la collection Spoolio inspirée du papier kraft et des effets de matière.",
    tagline: "// PAPIER FROISSÉ & DESIGN RÉALISTE",
  },
  "atelier-monsters": {
    name: "Atelier Monsters",
    subtitle: "Les petites créatures sorties de l’atelier.",
    description:
      "Personnages étranges, attachants et légèrement absurdes imaginés pour vivre sur une étagère, un bureau ou dans une collection.",
    seoTitle: "Atelier Monsters — Collection Spoolio",
    seoDescription:
      "Découvrez Atelier Monsters, la collection de personnages et petites créatures imaginées par Spoolio.",
    tagline: "// BESTIAIRE ATYPIQUE & CRÉATURES ATELIER",
  },
  "crystal-setup": {
    name: "Crystal Setup",
    subtitle: "Des accessoires de bureau à l’allure minérale.",
    description:
      "Supports et objets inspirés du cristal, pensés pour apporter une présence sculpturale au setup.",
    seoTitle: "Crystal Setup — Collection Spoolio",
    seoDescription:
      "Supports et accessoires inspirés du cristal : découvrez la collection Crystal Setup de Spoolio.",
    tagline: "// DESIGN GÉOMÉTRIQUE & MINÉRAL",
  },
};
