/**
 * Spoolio V2.1 — Fallback éditorial local pour les 13 Catégories actives
 * Utilisé si les champs subtitle, description, seo_title ou seo_description
 * sont vides dans la table catalog_taxonomy.
 */

export interface CategoryEditorial {
  subtitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tagline?: string;
}

export const CATEGORY_EDITORIAL_CONFIG: Record<string, CategoryEditorial> = {
  // ART TOYS
  "art-toys": {
    subtitle: "Petites pièces à exposer, collectionner et garder sous les yeux.",
    description:
      "Des personnages et objets sculpturaux à mi-chemin entre jouet, déco et pièce de collection.",
    seoTitle: "Art Toys — Spoolio",
    seoDescription:
      "Découvrez les art toys Spoolio : personnages, objets pop et pièces de collection fabriqués en petites séries.",
    tagline: "// ART TOYS & ÉDITIONS LIMITÉES",
  },
  "creatures-curiosites": {
    subtitle: "Bestioles, personnages et objets qu’on ne croise pas partout.",
    description:
      "Une sélection de créatures articulées, personnages étranges et petites curiosités sorties de l’atelier.",
    seoTitle: "Créatures & curiosités — Spoolio",
    seoDescription:
      "Créatures articulées, personnages et curiosités : découvrez les objets les plus étranges et attachants de Spoolio.",
    tagline: "// CRÉATURES & CURIOSITÉS ATELIER",
  },

  // TACTILE
  "clickers": {
    subtitle: "Un clic net. Puis encore un.",
    description:
      "Des objets tactiles construits autour du plaisir mécanique du clic, du geste court et de la répétition.",
    seoTitle: "Clickers — Spoolio",
    seoDescription:
      "Découvrez les clickers Spoolio : objets tactiles et mécaniques à cliquer, manipuler et garder à portée de main.",
    tagline: "// CLICKERS & SWITCHES MÉCANIQUES",
  },
  "fidgets": {
    subtitle: "Des objets faits pour les mains qui aiment bouger.",
    description:
      "Textures, articulations, rotations et mouvements répétitifs à manipuler librement.",
    seoTitle: "Fidgets — Spoolio",
    seoDescription:
      "Découvrez les fidgets Spoolio : objets tactiles, articulés et sensoriels conçus pour le plaisir de manipulation.",
    tagline: "// FIDGETS & GESTE QUOTIDIEN",
  },
  "mecanismes": {
    subtitle: "Engrenages, rotations et mouvements satisfaisants.",
    description:
      "Des objets où le mécanisme devient le spectacle : gyroscopes, engrenages, iris et systèmes cinétiques.",
    seoTitle: "Mécanismes — Spoolio",
    seoDescription:
      "Gyroscopes, engrenages et objets cinétiques : découvrez les mécanismes tactiles Spoolio.",
    tagline: "// MÉCANISMES & CINÉTIQUE",
  },

  // OBJETS & DÉCO
  "decoration": {
    subtitle: "Des objets qui méritent leur place sur une étagère.",
    description:
      "Vases, luminaires et curiosités décoratives imaginés pour ajouter une touche inattendue à la maison.",
    seoTitle: "Décoration — Spoolio",
    seoDescription:
      "Vases, luminaires et objets décoratifs : découvrez la sélection déco Spoolio.",
    tagline: "// DÉCORATION & OBJETS SCULPTURAUX",
  },
  "supports": {
    subtitle: "Des objets utiles qui refusent d’être banals.",
    description:
      "Supports pour téléphone, manette, casque et accessoires de bureau pensés comme de vrais objets de design.",
    seoTitle: "Supports — Spoolio",
    seoDescription:
      "Supports pour téléphone, casque et manette : découvrez les accessoires de bureau Spoolio.",
    tagline: "// SUPPORTS & ACCESSOIRES SETUP",
  },
  "rangement": {
    subtitle: "Ranger, oui. Mais pas dans une boîte triste.",
    description:
      "Boîtes, vide-poches et petits rangements qui cachent leur fonction derrière des formes plus inattendues.",
    seoTitle: "Rangement — Spoolio",
    seoDescription:
      "Boîtes, vide-poches et rangements originaux : découvrez les objets pratiques et décalés Spoolio.",
    tagline: "// RANGEMENT & BOÎTES MALINES",
  },
  "bureau": {
    subtitle: "Des petits objets pour un bureau moins sage.",
    description:
      "Pots à crayons, pancartes et accessoires conçus pour apporter du caractère à l’espace de travail.",
    seoTitle: "Objets de bureau — Spoolio",
    seoDescription:
      "Pots à crayons, accessoires et objets de bureau originaux fabriqués par Spoolio.",
    tagline: "// BUREAU & ORGANISATION SETUP",
  },
  "objets-decales": {
    subtitle: "Utiles parfois. Étranges souvent.",
    description:
      "Objets du quotidien détournés, trompe-l’œil et idées un peu absurdes assumées.",
    seoTitle: "Objets décalés — Spoolio",
    seoDescription:
      "Découvrez les objets décalés Spoolio : trompe-l’œil, accessoires insolites et créations inattendues.",
    tagline: "// OBJETS DÉCALÉS & TROMPE-L'ŒIL",
  },

  // TABLETOP
  "tours-a-des": {
    subtitle: "Faites rouler les dés avec un peu plus de panache.",
    description:
      "Tours à dés classiques, compactes ou plus fantastiques pour donner du caractère à la table de jeu.",
    seoTitle: "Tours à dés — Spoolio",
    seoDescription:
      "Découvrez les tours à dés Spoolio : modèles classiques, pliables et fantasy pour vos parties de jeux de société.",
    tagline: "// TOURS À DÉS & ROLLS PARFAITS",
  },
  "cartes-accessoires": {
    subtitle: "Des petits outils qui rendent les parties plus agréables.",
    description:
      "Supports, pinces et boîtes pour cartes pensés pour garder le jeu lisible et accessible.",
    seoTitle: "Accessoires pour cartes — Spoolio",
    seoDescription:
      "Supports, pinces et boîtes pour cartes : découvrez les accessoires Tabletop Spoolio.",
    tagline: "// CARTES & ACCESSOIRES GAMING",
  },
  "jeux": {
    subtitle: "Petits jeux, grandes réactions.",
    description:
      "Jeux d’adresse, de poche ou de démonstration à sortir rapidement autour d’une table.",
    seoTitle: "Jeux — Spoolio",
    seoDescription:
      "Découvrez les petits jeux Spoolio : jeux d’adresse, de poche et objets ludiques à partager.",
    tagline: "// JEUX COMPLETS & CASSE-TÊTES",
  },
};
