/**
 * Données mockées isolées pour la page Cabinet de Curiosités & Desk Setup Haut de Gamme
 * Route : /curiosites
 * 100 % LOCAL - Aucune mutation ni requête Supabase
 */

export interface HeroData {
  surtitre: string;
  h1: string;
  pitch: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  imageUrl: string;
  imageAlt: string;
  atelierNote: string;
}

export interface DropSpec {
  label: string;
  val: string;
}

export interface ActiveDrop {
  badge: string;
  title: string;
  subtitle: string;
  specs: DropSpec[];
  price: string;
  stockRemaining: number;
  totalStock: number;
  imageUrl: string;
  galleryImages: { url: string; alt: string; label: string }[];
  editionNumber: string;
}

export interface PortalUniverse {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  categoryFilter: string;
  count: string;
}

export interface CuratedItem {
  id: string;
  title: string;
  collectionTag: string;
  materialTag: string;
  price: string;
  imageUrl: string;
  category: "art-toys" | "hardware" | "desk-setup" | "play";
  badge?: string;
  statusNote?: string;
}

export interface ManifestoPoint {
  index: string;
  title: string;
  desc: string;
  highlight?: string;
}

export interface ManifestoData {
  title: string;
  subtitle: string;
  points: ManifestoPoint[];
  charterPledge: string;
}

/* =========================================================================
   1. HERO DATA
   ========================================================================= */
export const heroData: HeroData = {
  surtitre: "CABINET DE CURIOSITÉS CONTEMPORAIN",
  h1: "Objets tactiles, art toys et mécanique d'atelier.",
  pitch:
    "Des pièces singulières façonnées à Comines en polymère végétal. Pensées pour habiller le bureau et stimuler les mains.",
  ctaPrimary: {
    label: "DÉCOUVRIR LE DERNIER DROP",
    href: "#dernier-drop",
  },
  ctaSecondary: {
    label: "PARCOURIR LE CATALOGUE",
    href: "#selection",
  },
  imageUrl: "/images/produits/monstre-skateur-fait-main.jpg",
  imageAlt: "Kurb Monster sculpture d'atelier en polymère végétal posée en studio",
  atelierNote: "COMINES (59) // SÉRIE 2026 // TIRAGE RAISONNÉ",
};

/* =========================================================================
   2. ACTIVE DROP DATA
   ========================================================================= */
export const activeDrop: ActiveDrop = {
  badge: "DROP 01 // SÉRIE LIMITÉE",
  title: "KURB MONSTERS — MONSTRES DE BITUME",
  subtitle:
    "Mauvais caractère, allure brute : une sculpture d'atelier pensée pour les setups exigeants.",
  specs: [
    { label: "MATIÈRE", val: "100 % polymère végétal (PLA maïs)" },
    { label: "FINITION", val: "100% peint à la main et vernis au vernis polyuréthane" },
    { label: "ORIGINE", val: "Atelier Spoolio, Comines (59)" },
    { label: "STATUT", val: "Tirage d'atelier" },
  ],
  price: "32,00 €",
  stockRemaining: 7,
  totalStock: 30,
  imageUrl: "/images/produits/monstre-skateur-fait-main.jpg",
  galleryImages: [
    {
      url: "/images/produits/monstre-skateur-fait-main.jpg",
      alt: "Kurb Monster vue d'ensemble atelier",
      label: "VUE 01 // ENSEMBLE",
    },
    {
      url: "/images/produits/monstre-skateur-macro-visage.jpg",
      alt: "Kurb Monster macro expression et bouche",
      label: "VUE 02 // DÉTAIL VISAGE",
    },
    {
      url: "/images/produits/monstre-skateur-macro-skate.jpg",
      alt: "Kurb Monster macro grip skate et mécanique",
      label: "VUE 03 // GRIP & ROUES",
    },
  ],
  editionNumber: "07/30 EXEMPLAIRES",
};

/* =========================================================================
   3. FOUR PORTALS DATA
   ========================================================================= */
export const fourPortals: PortalUniverse[] = [
  {
    id: "art-toys",
    code: "01 //",
    title: "POCHETTES SURPRISES",
    subtitle: "Silhouettes urbaines, monstres de bitume et Blind Bags kraft.",
    imageUrl: "/images/pochette-kraft-studio-gen.png",
    categoryFilter: "art-toys",
    count: "12 PIÈCES",
  },
  {
    id: "hardware",
    code: "02 //",
    title: "HARDWARE TACTILE & FOCUS",
    subtitle: "Clickers mécaniques ASMR, sliders magnétiques et switchs d'atelier.",
    imageUrl: "/images/clicker_gallery_0.jpg",
    categoryFilter: "hardware",
    count: "18 PIÈCES",
  },
  {
    id: "desk-setup",
    code: "03 //",
    title: "DESK SETUP & ATELIER",
    subtitle: "Vides-poches brutaux, supports industriels et boîtes secrètes.",
    imageUrl: "/images/imported/Spoolio-crane-dragon-vide-poche-12-scaled.webp",
    categoryFilter: "desk-setup",
    count: "15 PIÈCES",
  },
  {
    id: "play",
    code: "04 //",
    title: "TABLETOP & PLAY",
    subtitle: "Accessoires de plateau épurés, tours à dés et matériel de jeu.",
    imageUrl: "/images/imported/Spoolio-tour-a-de-pont-levis-1-scaled.webp",
    categoryFilter: "play",
    count: "14 PIÈCES",
  },
];

/* =========================================================================
   4. CURATED SELECTION DATA
   ========================================================================= */
export const curatedSelection: CuratedItem[] = [
  {
    id: "clicker-switch-brown",
    title: "Clicker Mécanique Switch Tactile",
    collectionTag: "HARDWARE TACTILE",
    materialTag: "PLA MAÏS • COMINES",
    price: "14,00 €",
    imageUrl: "/images/clicker_gallery_1.jpg",
    category: "hardware",
    badge: "BESTSELLER ATELIER",
    statusNote: "Switch lubrifié à la main",
  },
  {
    id: "kurb-monster-single",
    title: "Kurb Monster — Monstre de Bitume",
    collectionTag: "ART TOYS",
    materialTag: "PLA MAÏS • COMINES",
    price: "32,00 €",
    imageUrl: "/images/produits/monstre-skateur-macro-visage.jpg",
    category: "art-toys",
    badge: "DROP 01 EN COURS",
    statusNote: "Finition peinture acrylique",
  },
  {
    id: "crane-vide-poche",
    title: "Crâne Dragon Vide-Poche Brutaliste",
    collectionTag: "DESK SETUP",
    materialTag: "PLA MAÏS • COMINES",
    price: "28,00 €",
    imageUrl: "/images/imported/Spoolio-crane-dragon-vide-poche-12-scaled.webp",
    category: "desk-setup",
    badge: "DESIGN SIGNATURE",
    statusNote: "Texture minérale matte",
  },
  {
    id: "tour-pont-levis",
    title: "Tour à Dés Pont-Levis Tactique",
    collectionTag: "TABLETOP & PLAY",
    materialTag: "PLA MAÏS • COMINES",
    price: "24,00 €",
    imageUrl: "/images/imported/Spoolio-tour-a-de-pont-levis-1-scaled.webp",
    category: "play",
    badge: "MÉCANIQUE ACTIVE",
    statusNote: "Pont articulé sans vis",
  },
  {
    id: "support-industriel",
    title: "Support Smartphone Industriel Articulé",
    collectionTag: "DESK SETUP",
    materialTag: "PLA MAÏS • COMINES",
    price: "19,00 €",
    imageUrl: "/images/imported/Spoolio-SupportSmartphonearticule-industriel-11-scaled.webp",
    category: "desk-setup",
    statusNote: "Grip antidérapant intégré",
  },
  {
    id: "fidget-engrenage",
    title: "Fidget Mécanique Double Engrenage",
    collectionTag: "HARDWARE TACTILE",
    materialTag: "PLA MAÏS • COMINES",
    price: "12,00 €",
    imageUrl: "/images/imported/Spoolio_Fidget-Engrenage-1.jpeg",
    category: "hardware",
    statusNote: "Roulement haute fluidité",
  },
  {
    id: "pince-cartes",
    title: "Pince Monolithique Présentoir de Cartes",
    collectionTag: "TABLETOP & PLAY",
    materialTag: "PLA MAÏS • COMINES",
    price: "9,50 €",
    imageUrl: "/images/imported/Spoolio-pince-cartes-1-scaled.webp",
    category: "play",
    statusNote: "Rainurage précis anti-rayures",
  },
  {
    id: "blind-bag-kraft",
    title: "Blind Bag Kraft Mystère — Édition Spoolio",
    collectionTag: "ART TOYS",
    materialTag: "PLA MAÏS • COMINES",
    price: "15,00 €",
    imageUrl: "/images/pochette-kraft-studio-gen.png",
    category: "art-toys",
    badge: "SURPRISE ATELIER",
    statusNote: "Sceau kraft cousu main",
  },
];

/* =========================================================================
   5. MANIFESTO DATA
   ========================================================================= */
export const manifestoData: ManifestoData = {
  title: "LE MANIFESTE D'ATELIER",
  subtitle: "Une philosophie de fabrication mesurée face au tout-jetable.",
  points: [
    {
      index: "01",
      title: "Comines, Hauts-de-France",
      desc: "Production locale raisonnée et impression à la commande dans notre atelier nordiste. Chaque pièce porte l'empreinte de nos buses et de notre contrôle qualité unitaire.",
      highlight: "Circuits ultra-courts",
    },
    {
      index: "02",
      title: "100 % Végétal",
      desc: "Polymère biosourcé issu d'amidon de maïs, fini mat dense, sans pétrole. Une matière noble, chaude au toucher et pensée pour durer des années sur votre desk.",
      highlight: "Zéro pétrochimie",
    },
    {
      index: "03",
      title: "Zéro Surstock",
      desc: "Chaque pièce est façonnée pour un bureau, pas pour dormir dans un hangar. Tirages limités, numérotés et créations exclusives réservées aux passionnés d'objets tangibles.",
      highlight: "Séries numérotées",
    },
  ],
  charterPledge:
    "Objets de collection pour adultes et bureaux exigeants. Conçus avec respect, rigueur mécanique et passion du bel objet.",
};
