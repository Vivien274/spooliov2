/**
 * Spoolio Navigation Configuration V2.1
 * Architecture centralisée du header, du mega-menu et du menu mobile.
 */

export interface NavCategory {
  label: string;
  href: string;
  badge?: string;
}

export interface NavUnivers {
  id: string;
  label: string;
  href: string;
  shortDesc?: string;
  iconName?: "Sparkles" | "Zap" | "Palette" | "Dices";
  categories: NavCategory[];
}

export type CollectionIconName =
  | "Moon"
  | "MousePointerClick"
  | "Bot"
  | "Shield"
  | "Eye"
  | "Package"
  | "Ghost"
  | "Gem";

export interface NavCollection {
  id: string;
  label: string;
  href: string;
  tagline: string;
  badge?: string;
  iconName?: CollectionIconName;
}

export interface MainNavItem {
  id: string;
  label: string;
  href: string;
  hasDropdown: boolean;
  type: "shop" | "link" | "collections" | "workshop";
  badge?: string;
}

/**
 * Entrées principales de la barre de navigation desktop
 */
export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    id: "boutique",
    label: "Boutique",
    href: "/boutique",
    hasDropdown: true,
    type: "shop",
  },
  {
    id: "nouveautes",
    label: "Nouveautés",
    href: "/nouveautes",
    hasDropdown: false,
    type: "link",
  },
  {
    id: "blind-bags",
    label: "Blind Bags",
    href: "/blind-bags",
    hasDropdown: false,
    type: "link",
  },
  {
    id: "collections",
    label: "Collections",
    href: "/collections",
    hasDropdown: true,
    type: "collections",
  },
  {
    id: "atelier",
    label: "L'Atelier",
    href: "/a-propos",
    hasDropdown: true,
    type: "workshop",
  },
];

/**
 * Mega-Menu Boutique : 4 Univers & Catégories
 */
export const SHOP_UNIVERSES: NavUnivers[] = [
  {
    id: "art-toys",
    label: "Art Toys & Collectibles",
    href: "/art-toys",
    shortDesc: "Personnages & curiosités",
    iconName: "Sparkles",
    categories: [
      { label: "Art toys", href: "/art-toys/art-toys" },
      { label: "Créatures & curiosités", href: "/art-toys/creatures-curiosites" },
      { label: "Cabinet noir", href: "/collections/cabinet-noir" },
    ],
  },
  {
    id: "tactile",
    label: "Tactile & Focus",
    href: "/tactile",
    shortDesc: "Objets tactiles & mécaniques",
    iconName: "Zap",
    categories: [
      { label: "Clickers", href: "/tactile/clickers" },
      { label: "Fidgets", href: "/tactile/fidgets" },
      { label: "Mécanismes", href: "/tactile/mecanismes" },
    ],
  },
  {
    id: "objets-deco",
    label: "Objets & Déco",
    href: "/objets-deco",
    shortDesc: "Design & quotidien",
    iconName: "Palette",
    categories: [
      { label: "Décoration", href: "/objets-deco/decoration" },
      { label: "Supports", href: "/objets-deco/supports" },
      { label: "Rangement", href: "/objets-deco/rangement" },
      { label: "Bureau", href: "/objets-deco/bureau" },
      { label: "Objets décalés", href: "/objets-deco/objets-decales" },
    ],
  },
  {
    id: "tabletop",
    label: "Tabletop",
    href: "/tabletop",
    shortDesc: "Jeux & accessoires",
    iconName: "Dices",
    categories: [
      { label: "Tours à dés", href: "/tabletop/tours-a-des" },
      { label: "Cartes & accessoires", href: "/tabletop/cartes-accessoires" },
      { label: "Jeux", href: "/tabletop/jeux" },
    ],
  },
];

/**
 * Dropdown Collections : 8 collections thématiques
 */
export const COLLECTIONS_LIST: NavCollection[] = [
  {
    id: "cabinet-noir",
    label: "Cabinet noir",
    href: "/collections/cabinet-noir",
    tagline: "Édition dark & matières sombres",
    badge: "Capsule",
    iconName: "Moon",
  },
  {
    id: "tactile-lab",
    label: "Tactile Lab",
    href: "/collections/tactile-lab",
    tagline: "Exploration haptique & clickers de précision",
    iconName: "MousePointerClick",
  },
  {
    id: "gadgetoids",
    label: "Gadgetoids",
    href: "/collections/gadgetoids",
    tagline: "Compagnons mécaniques & robots rétro",
    iconName: "Bot",
  },
  {
    id: "fantasy-relics",
    label: "Fantasy Relics",
    href: "/collections/fantasy-relics",
    tagline: "Reliques, artefacts & légendes 3D",
    iconName: "Shield",
  },
  {
    id: "soft-illusion",
    label: "Soft Illusion",
    href: "/collections/soft-illusion",
    tagline: "Trompe-l'œil & textures souples",
    iconName: "Eye",
  },
  {
    id: "kraft-illusion",
    label: "Kraft Illusion",
    href: "/collections/kraft-illusion",
    tagline: "Esthétique brute & papier plissé",
    iconName: "Package",
  },
  {
    id: "atelier-monsters",
    label: "Atelier Monsters",
    href: "/collections/atelier-monsters",
    tagline: "Mascottes articulées & créatures",
    iconName: "Ghost",
  },
  {
    id: "crystal-setup",
    label: "Crystal Setup",
    href: "/collections/crystal-setup",
    tagline: "Translucidité géométrique & reflets",
    iconName: "Gem",
  },
];

/**
 * Dropdown L'Atelier : Pages institutionnelles & support
 */
export const WORKSHOP_PAGES = [
  {
    label: "Histoire & Savoir-faire",
    href: "/a-propos",
    desc: "Création, fabrication & coulisses de l'atelier",
    iconName: "Palette" as const,
  },
  {
    label: "Blog de l'Atelier",
    href: "/blog",
    desc: "Guides 3D, coulisses & neuroergonomie",
    iconName: "BookOpen" as const,
  },
  {
    label: "FAQ & Contact",
    href: "/faq",
    desc: "Questions fréquentes, retraits & SAV",
    iconName: "HelpCircle" as const,
  },
  {
    label: "Espace Professionnels",
    href: "/pro",
    desc: "Commandes volumiques, B2B & sur-mesure",
    iconName: "Building2" as const,
  },
];

/**
 * Carte éditoriale du mega-menu Boutique
 */
export const EDITORIAL_MEGA_CARD = {
  badge: "CONCEPT STORE ATELIER",
  title: "SPOOLIO — CABINET DE CURIOSITÉS",
  description: "Des objets qu'on manipule, collectionne et garde sur le bureau.",
  ctaLabel: "DÉCOUVRIR LA BOUTIQUE",
  ctaHref: "/boutique",
  imageSrc: "/images/marcel_octopus.jpg",
};
