export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const DEFAULT_PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: "Spoolio | Art Toys, Objets Tactiles & Curiosités en Impression 3D",
    description: "Objets design, art toys et curiosités tactiles fabriqués en petites séries dans notre atelier de Comines. Matière biosourcée & finitions soignées.",
    keywords: "art toys 3d, objets tactiles, impression 3d france, spoolio, comines, clickers mecaniques",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  boutique: {
    title: "La Boutique Spoolio | Art Toys, Objets Tactiles & Tabletop",
    description: "Explorez nos collections d'art toys, clickers mécaniques, curiosités de bureau et accessoires de jeux fabriqués dans notre atelier français.",
    keywords: "boutique 3d, art toys france, clicker mecanique, deco bureau, tabletop 3d",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  tombola: {
    title: "Tombola Spoolio 🎟️ | Tente ta chance et gagne des lots 3D exclusifs",
    description: "Participe à la Tombola Spoolio ! Choisis tes cases sur la grille et tente de remporter des créations exclusives d'atelier.",
    keywords: "tombola 3d, jeu concours spoolio, lot 3d atelier",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  "boussole-sensorielle": {
    title: "Boussole Sensorielle | Explorez Vos Sensations Tactiles | Spoolio",
    description: "Trouvez votre objet tactile idéal selon vos sensations recherchées : clic mécanique net, glisse fluide, relief texturé ou mouvement continu.",
    keywords: "boussole sensorielle, objet tactile, clicker haptique, stimulation tactile, fidget adulte",
    ogImage: "/images/seo-default-spoolio.png",
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
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  "a-propos": {
    title: "À Propos de Spoolio | Fabrication Artisanale 3D en France 🇫🇷",
    description: "Découvrez l'histoire de Spoolio, atelier d'impression 3D basé à Comines. Notre mission : concevoir des objets sensoriels.",
    keywords: "histoire spoolio, impression 3d comines, fabricant français 3d",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  liens: {
    title: "Hub de Liens Spoolio 🔗 | TikTok, Insta, Boutique & Offres",
    description: "Retrouvez tous les liens officiels de Spoolio : TikTok, Instagram, boutique en ligne, boussole sensorielle.",
    keywords: "spoolio tiktok, instagram spoolio, liens spoolio",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  faq: {
    title: "Foire Aux Questions (FAQ) | Spoolio",
    description: "Des questions sur la livraison, les matériaux PLA ou le suivi de commande ? Retrouvez toutes les réponses dans notre FAQ.",
    keywords: "faq spoolio, livraison mondial relay, materiau pla",
    ogImage: "/images/seo-default-spoolio.png",
    noIndex: false
  },
  "jeux-de-societe": {
    title: "Jeux de Société & App Enjeu 🎲 | Accessoires 3D & Soirées Jeux Spoolio",
    description: "Boostez vos soirées jeux de société avec nos accessoires 3D (tours à dés, pinces à cartes, compteurs) et découvrez Enjeu, l'application compagnon gratuite de calcul de score et paris amicaux.",
    keywords: "jeux de societe, accessoires jeux 3d, tour a de 3d, porte cartes, enjeu app, calcul score jeux de societe, spoolio",
    ogImage: "/images/enjeu/1.png",
    noIndex: false
  }
};
