export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const DEFAULT_PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: "Spoolio | Fidgets Sensoriels & Objets Fun Imprimés en 3D",
    description: "Boutique française de fidgets sensoriels, accessoires et décoration imprimés en 3D à Comines. Conçus en PLA biodégradable 🌱",
    keywords: "fidgets 3d, impression 3d france, fidgets tdah, spoolio, comines",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  boutique: {
    title: "La Boutique Spoolio | Objets Fun & Utiles Imprimés en 3D",
    description: "Parcourez notre collection d'objets uniques imprimés en 3D de haute qualité. Fidgets, décoration insolite et gadgets fun.",
    keywords: "boutique 3d, fidget spinner, anti stress, deco originale",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  tombola: {
    title: "Tombola Spoolio 🎟️ | Tente ta chance et gagne des lots 3D exclusifs",
    description: "Participe à la Tombola Spoolio ! Choisis tes cases sur la grille et tente de remporter un pack complet de fidgets sensoriels.",
    keywords: "tombola 3d, jeu concours spoolio, lot fidgets",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  "boussole-sensorielle": {
    title: "Boussole Sensorielle TDAH & Autisme | Spoolio",
    description: "Trouvez le fidget parfait selon vos besoins sensoriels (besoin de pression, de bruit, de mouvement ou de stimulation visuelle).",
    keywords: "boussole sensorielle, fidget tdah, autisme, anti stress",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  "pochette-surprise": {
    title: "Pochette Surprise Spoolio 🎁 | Mystère & Fidgets 3D",
    description: "Craquez pour la Pochette Surprise Spoolio ! Recevez un assortiment mystère d'objets imprimés en 3D.",
    keywords: "pochette surprise, blind box 3d, mystere fidget",
    ogImage: "/images/pochette-kraft.jpg",
    noIndex: false
  },
  "createur-cliqueur": {
    title: "Créateur de Cliqueur Personnalisé 🖱️ | Spoolio",
    description: "Concevez votre cliqueur Fidget sur-mesure ! Choisissez les couleurs, le type de switch mécanique et le fini.",
    keywords: "cliqueur 3d, fidget switch mecanique, cliqueur personnalise",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  "a-propos": {
    title: "À Propos de Spoolio | Fabrication Artisanale 3D en France 🇫🇷",
    description: "Découvrez l'histoire de Spoolio, atelier d'impression 3D basé à Comines. Notre mission : concevoir des objets sensoriels.",
    keywords: "histoire spoolio, impression 3d comines, fabricant français 3d",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  liens: {
    title: "Hub de Liens Spoolio 🔗 | TikTok, Insta, Boutique & Offres",
    description: "Retrouvez tous les liens officiels de Spoolio : TikTok, Instagram, boutique en ligne, boussole sensorielle.",
    keywords: "spoolio tiktok, instagram spoolio, liens spoolio",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  },
  faq: {
    title: "Foire Aux Questions (FAQ) | Spoolio",
    description: "Des questions sur la livraison, les matériaux PLA ou le suivi de commande ? Retrouvez toutes les réponses dans notre FAQ.",
    keywords: "faq spoolio, livraison mondial relay, materiau pla",
    ogImage: "/images/imported/Spoolio_Kit-Festival-16-scaled.webp",
    noIndex: false
  }
};
