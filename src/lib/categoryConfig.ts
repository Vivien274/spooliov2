
export interface CategorySEOConfig {
  slug: string;
  name: string;
  aliases: string[];
  dbCategoryNames: string[];
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  choiceCriteria: { title: string; description: string }[];
  spoolioAdvantages: { title: string; description: string }[];
  editorialLinks: { label: string; href: string; description: string }[];
}

export const CATEGORIES_CONFIG: Record<string, CategorySEOConfig> = {
  fidgets: {
    slug: "fidgets",
    name: "Fidgets",
    aliases: ["fidget", "anti-stress", "fidgets-sensoriels", "fidgets-silencieux"],
    dbCategoryNames: ["Fidgets"],
    h1: "Fidgets sensoriels et objets de manipulation imprimés en 3D",
    metaTitle: "Fidgets sensoriels imprimés en 3D | Spoolio",
    metaDescription: "Découvrez nos fidgets sensoriels, cliqueurs mécaniques et objets de manipulation imprimés en 3D à Comines. Fabrication artisanale à la commande.",
    intro: "Conçus pour occuper les mains et répondre au besoin de manipulation tactile, nos fidgets sensoriels Spoolio allient ergonomie, résistance et finitions soignées. Chaque pièce est imprimée en 3D à Comines en PLA biosourcé.",
    choiceCriteria: [
      {
        title: "Discrétion sonore (École & Bureau)",
        description: "Optez pour nos modèles rotatifs silencieux ou glisseurs discrets conçus pour une utilisation tactile sans bruit gênant.",
      },
      {
        title: "Sensations tactiles & Textures",
        description: "Explorez des retours mécaniques variés : clics nets de switch, surfaces texturées ou mouvements articulés fluides.",
      },
      {
        title: "Robustesse & Ergonomie",
        description: "Format pocket compact pensé pour être glissé dans une poche ou un sac, conçu pour résister aux manipulations quotidiennes.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Matière PLA biosourcée",
        description: "Imprimés en PLA biosourcé d'origine végétale.",
      },
      {
        title: "Atelier local à Comines (59)",
        description: "Fabrication artisanale dans le Nord de la France, réalisée à la commande.",
      },
      {
        title: "Créations originales",
        description: "Designs Spoolio conçus et testés en atelier pour une prise en main ergonomique.",
      },
    ],
    editorialLinks: [
      {
        label: "Boussole Sensorielle Spoolio",
        href: "/boussole-sensorielle",
        description: "Trouvez facilement le fidget adapté à votre profil de manipulation tactile.",
      },
      {
        label: "Studio Créateur de Cliqueur",
        href: "/createur-cliqueur",
        description: "Personnalisez votre switch mécanique et vos couleurs en 3D sur mesure.",
      },
      {
        label: "Pourquoi l'impression 3D chez Spoolio ?",
        href: "/blog/pourquoi-l-impression-3d-magie-envers-du-decor-chez-spoolio",
        description: "Découvrez les coulisses de notre atelier et nos engagements éco-responsables.",
      },
    ],
  },

  "geek-gaming": {
    slug: "geek-gaming",
    name: "Geek / Gaming",
    aliases: ["geek", "gaming", "geek-gaming", "geek %2f gaming"],
    dbCategoryNames: ["Geek / Gaming", "Geek %2F Gaming"],
    h1: "Accessoires gaming et supports de bureau imprimés en 3D",
    metaTitle: "Accessoires Gaming & Setup 3D | Spoolio",
    metaDescription: "Supports de manette, rangements de câbles et accessoires gaming imprimés en 3D en France. Optimisez votre setup de jeu avec Spoolio.",
    intro: "Améliorez votre espace de jeu et votre setup informatique avec nos accessoires gaming imprimés en 3D. Des supports de manettes ergonomiques aux rangements malins, chaque accessoire combine robustesse, praticité et look moderne.",
    choiceCriteria: [
      {
        title: "Compatibilité universelle",
        description: "Supports étudiés pour accueillir les manettes Xbox, PlayStation, Switch et casques audio gaming du marché.",
      },
      {
        title: "Gain de place & Cable Management",
        description: "Libérez votre bureau grâce à des fixations et guides de câbles élégants et discrets.",
      },
      {
        title: "Stabilité & Finition",
        description: "Bases lestées ou patins antidérapants pour maintenir votre matériel gamer en toute sécurité.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Ajustement soigné",
        description: "Conception mécanique étudiée pour un maintien stable de vos périphériques de jeu.",
      },
      {
        title: "Coloris personnalisables",
        description: "Assortissez vos accessoires aux couleurs de votre setup ou de vos touches de clavier.",
      },
      {
        title: "Production française",
        description: "Fabriqué localement à la commande dans notre atelier de Comines (Nord).",
      },
    ],
    editorialLinks: [
      {
        label: "Découvrir la boutique Spoolio",
        href: "/boutique",
        description: "Parcourez l'ensemble des créations 3D pour gamers et passionnés d'informatique.",
      },
      {
        label: "Créer un cliqueur personnalisé",
        href: "/createur-cliqueur",
        description: "Montez votre propre porte-clés à switch mécanique gamer personnalisé.",
      },
    ],
  },

  "animaux-figurines": {
    slug: "animaux-figurines",
    name: "Animaux & Figurines",
    aliases: ["animaux", "figurines", "animaux-figurines", "animaux %26 figurines"],
    dbCategoryNames: ["Animaux & Figurines", "Animaux &amp; Figurines", "Figurines"],
    h1: "Figurines et créatures articulées imprimées en 3D en France",
    metaTitle: "Figurines & Créatures articulées 3D | Spoolio",
    metaDescription: "Dragons flexibles, animaux articulés et figurines de collection imprimés en 3D en France. Matière biosourcée et mouvements fluides.",
    intro: "Entrez dans l'univers fantastique de nos figurines imprimées en 3D. Dotées d'articulations 'print-in-place' conçues directement d'une seule pièce sans colle ni vis, nos créatures et animaux bougent avec une fluidité fascinante.",
    choiceCriteria: [
      {
        title: "Taille et échelle",
        description: "Du format poche à emporter partout aux grandes pièces maîtresses d'exposition pour décorer une étagère.",
      },
      {
        title: "Effet de matière & Reflets",
        description: "Finitions bicolores, irisées ou soyeuses mettant en valeur chaque écaille et chaque mouvement.",
      },
      {
        title: "Manipulation sensorielle",
        description: "Le cliquetis d'ondulation et le relief texturé procurent un retour tactile immédiat.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Articulations intégrées",
        description: "Zéro assemblage fragile : tout est imprimé en un bloc robuste et durable.",
      },
      {
        title: "Matière biosourcée",
        description: "Fabriqué en PLA issu de ressources végétales renouvelables.",
      },
      {
        title: "Atelier artisanal",
        description: "Contrôle qualité individuel de chaque articulation avant expédition.",
      },
    ],
    editorialLinks: [
      {
        label: "Boussole Sensorielle",
        href: "/boussole-sensorielle",
        description: "Trouvez la figurine ou le fidget adapté à votre sensibilité tactile.",
      },
      {
        label: "Pochettes surprises 3D",
        href: "/pochette-surprise",
        description: "Offrez un pack découverte surprise réunissant créatures et fidgets Spoolio.",
      },
    ],
  },

  accessoires: {
    slug: "accessoires",
    name: "Accessoires",
    aliases: ["accessoire", "accessoires-3d"],
    dbCategoryNames: ["Accessoires"],
    h1: "Accessoires utiles et objets malins imprimés en 3D",
    metaTitle: "Accessoires malins & pratiques en 3D | Spoolio",
    metaDescription: "Accessoires du quotidien, supports ergonomiques et gadgets pratiques imprimés en 3D en France. Des créations ingénieuses pour vous simplifier la vie.",
    intro: "La technologie d'impression 3D au service de votre quotidien : découvrez notre gamme d'accessoires pratiques, robustes et écologiques, conçus pour apporter une réponse ingénieuse à chaque petit besoin de tous les jours.",
    choiceCriteria: [
      {
        title: "Praticité immédiate",
        description: "Objets prêts à l'emploi conçus pour résoudre un besoin précis : maintien, support ou transport.",
      },
      {
        title: "Légèreté & Solidité",
        description: "Structure interne optimisée en nid d'abeille garantissant légèreté et haute résistance mécanique.",
      },
      {
        title: "Matériaux durables",
        description: "Conçu pour durer sans se déformer avec le temps ni fragilité prématurée.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Fabrication locale",
        description: "Fabriqué à Comines dans le Nord en PLA biosourcé.",
      },
      {
        title: "Fabrication à la demande",
        description: "Pas de gaspillage ni de stock dormant : chaque pièce est produite avec soin.",
      },
      {
        title: "Solutions sur mesure",
        description: "Designs testés dans des conditions réelles pour un usage fiable et durable.",
      },
    ],
    editorialLinks: [
      {
        label: "En savoir plus sur notre atelier",
        href: "/a-propos",
        description: "Découvrez notre histoire, notre vision et nos méthodes de fabrication.",
      },
      {
        label: "Toute la boutique Spoolio",
        href: "/boutique",
        description: "Parcourez notre collection complète d'objets imprimés en 3D.",
      },
    ],
  },

  "porte-cles": {
    slug: "porte-cles",
    name: "Porte clés",
    aliases: ["porte-cle", "porte-clef", "porte-cles", "porte clés"],
    dbCategoryNames: ["Porte clés"],
    h1: "Porte-clés originaux et miniatures imprimés en 3D",
    metaTitle: "Porte-clés originaux imprimés en 3D | Spoolio",
    metaDescription: "Porte-clés design, miniatures articulées et cliqueurs nomades imprimés en 3D en France. L'idée cadeau originale et abordable.",
    intro: "Emportez un concentré de créativité partout avec vous ! Nos porte-clés imprimés en 3D combinent humour, design et textures agréables. Parfaits comme petit cadeau ou pour personnaliser vos clés et sacs.",
    choiceCriteria: [
      {
        title: "Nomade & Compact",
        description: "Dimensions légères pour ne pas alourdir votre trousseau de clés.",
      },
      {
        title: "Attache sécurisée",
        description: "Anneaux renforcés et liaisons solides testées pour un usage quotidien intensif.",
      },
      {
        title: "Idée cadeau accessible",
        description: "Une attention originale et personnalisée à petit prix pour faire plaisir à coup sûr.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Fabrication française",
        description: "Chaque porte-clé est produit dans notre atelier des Hauts-de-France.",
      },
      {
        title: "PLA biosourcé",
        description: "Matériau d'origine végétale imprimé localement dans notre atelier.",
      },
      {
        title: "Finitions manuelles soignées",
        description: "Ébavurage et contrôle qualité individuel avant expédition.",
      },
    ],
    editorialLinks: [
      {
        label: "Créer un cliqueur porte-clés",
        href: "/createur-cliqueur",
        description: "Assemblez votre porte-clé switch mécanique aux couleurs de votre choix.",
      },
      {
        label: "Médaillons connectés SOS pour animaux",
        href: "/medaillon-nfc-chien-chat",
        description: "Protégez vos compagnons à 4 pattes avec un médaillon NFC résistant.",
      },
    ],
  },

  "jeux-activites": {
    slug: "jeux-activites",
    name: "Jeux & activités",
    aliases: ["jeux-de-societe", "jeux", "activites", "jeux-activites", "jeux & activités"],
    dbCategoryNames: ["Jeux & activités", "Jeux &amp; activités"],
    h1: "Accessoires pour jeux de société et loisirs imprimés en 3D",
    metaTitle: "Jeux de société & Accessoires 3D | Spoolio",
    metaDescription: "Pistes de dés, compteurs de score, tours à dés et accessoires pour jeux de société imprimés en 3D en France. Sublimez vos soirées jeux.",
    intro: "Donnez une nouvelle dimension à vos soirées jeux de plateau et jeux de cartes avec nos accessoires 3D. Précision des lancers, rangements de pions et compteurs de points conçus par des passionnés pour des joueurs exigeants.",
    choiceCriteria: [
      {
        title: "Ergonomie de jeu",
        description: "Optimisez la lisibilité sur la table et évitez que les dés ne renversent le plateau de jeu.",
      },
      {
        title: "Rangement rapide",
        description: "Accessoires compartimentés pour réduire le temps de mise en place de vos parties.",
      },
      {
        title: "Esthétique thématique",
        description: "Finitions et motifs immersifs (médiéval, spatial, fantastique) en accord avec vos jeux favoris.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Conçu pour les joueurs",
        description: "Éléments testés en conditions réelles de partie pour une efficacité maximale.",
      },
      {
        title: "Matière robuste",
        description: "PLA biosourcé robuste conçu pour résister aux manipulations régulières.",
      },
      {
        title: "Atelier Made in France",
        description: "Fabrication locale et soignée à Comines.",
      },
    ],
    editorialLinks: [
      {
        label: "Découvrir la page Jeux de société",
        href: "/jeux-de-societe",
        description: "Retrouvez tous nos accessoires de jeu et l'application web Spoolio Enjeu.",
      },
      {
        label: "Tous nos objets imprimés en 3D",
        href: "/boutique",
        description: "Visitez le catalogue complet de nos créations artisanales.",
      },
    ],
  },

  decoration: {
    slug: "decoration",
    name: "Décoration",
    aliases: ["deco", "decoration-3d"],
    dbCategoryNames: ["Décoration"],
    h1: "Objets de décoration design imprimés en 3D en France",
    metaTitle: "Décoration & Objets design 3D | Spoolio",
    metaDescription: "Vases géométriques, sculptures modernes et objets déco imprimés en 3D en France en PLA biosourcé. Donnez du style à votre intérieur.",
    intro: "Rehaussez votre intérieur avec des pièces décoratives aux géométries audacieuses impossibles à obtenir par les méthodes de fabrication traditionnelles. Des créations légères, raffinées et respectueuses de l'environnement.",
    choiceCriteria: [
      {
        title: "Harmonie des couleurs",
        description: "Large palette de teintes : tons pastels apaisants, finitions mates soyeuses ou reflets métallisés.",
      },
      {
        title: "Dimensions adaptées",
        description: "Pensé pour trouver naturellement sa place sur une étagère, un meuble de salon ou un bureau.",
      },
      {
        title: "Entretien facile",
        description: "Nettoyage rapide d'un coup de chiffon doux sans altérer les reliefs de surface.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Zéro gaspillage de matière",
        description: "L'impression 3D dépose uniquement le filament nécessaire, sans chutes polluantes.",
      },
      {
        title: "Artisanat du Nord",
        description: "Conçu et fabriqué localement avec passion à Comines.",
      },
      {
        title: "Matière d'origine végétale",
        description: "Objets imprimés en PLA issu de ressources végétales renouvelables.",
      },
    ],
    editorialLinks: [
      {
        label: "Boutique complète Spoolio",
        href: "/boutique",
        description: "Explorez nos nouveautés et créations déco exclusives.",
      },
      {
        label: "À propos de notre atelier",
        href: "/a-propos",
        description: "Découvrez notre engagement pour une fabrication locale et durable.",
      },
    ],
  },

  "boite-sac-cadeau": {
    slug: "boite-sac-cadeau",
    name: "Boites, sacs & emballages",
    aliases: ["boites-rangement", "boites", "emballages", "boite-sac-cadeau"],
    dbCategoryNames: ["Boites, sacs & emballages", "Boites, sacs &amp; emballages"],
    h1: "Boîtes et rangements modulaires imprimés en 3D",
    metaTitle: "Boîtes & Rangements modulaires 3D | Spoolio",
    metaDescription: "Boîtes secrètes, rangements de bureau et coffrets cadeaux imprimés en 3D en France. Organisez votre quotidien avec ingéniosité.",
    intro: "Organisez vos petits objets précieux, vos cartes ou vos bijoux avec nos boîtes et modules de rangement imprimés en 3D. Mécanismes de fermeture à vis, clips ou couvercles coulissants aux ajustements millimétrés.",
    choiceCriteria: [
      {
        title: "Volume utile",
        description: "Choisissez le litrage adapté à vos accessoires (cartes, jetons, trombones, clés USB).",
      },
      {
        title: "Type de fermeture",
        description: "Fermeture vissée hermétique ou couvercle coulissant pour un accès rapide.",
      },
      {
        title: "Prêt à offrir",
        description: "Des coffrets originaux qui font office d'emballage cadeau réutilisable à l'infini.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Ajustement soigné",
        description: "Ajustement précis des pièces garantissant une ouverture et fermeture fluide.",
      },
      {
        title: "Matière biosourcée",
        description: "Objets imprimés en PLA d'origine végétale.",
      },
      {
        title: "Fabrication à Comines",
        description: "Chaque boîte est produite et assemblée sur place dans le Nord.",
      },
    ],
    editorialLinks: [
      {
        label: "Pochettes surprises Spoolio",
        href: "/pochette-surprise",
        description: "Découvrez nos assortiments surprises prêts à offrir.",
      },
      {
        label: "Boutique Spoolio",
        href: "/boutique",
        description: "Retrouvez tous nos modèles et rangements en stock.",
      },
    ],
  },

  bijoux: {
    slug: "bijoux",
    name: "Bijoux",
    aliases: ["bijou", "bijoux-3d"],
    dbCategoryNames: ["Bijoux"],
    h1: "Bijoux fantaisie et créations légères imprimés en 3D",
    metaTitle: "Bijoux fantaisie imprimés en 3D | Spoolio",
    metaDescription: "Boucles d'oreilles et bijoux géométriques ultra-légers imprimés en 3D en France. Confort absolu et matière végétale.",
    intro: "Laissez-vous séduire par l'incroyable légèreté de nos bijoux imprimés en 3D. Grâce aux propriétés du PLA biosourcé, nos boucles d'oreilles et pendentifs se portent toute la journée sans aucune sensation de lourdeur.",
    choiceCriteria: [
      {
        title: "Poids plume",
        description: "Moins de quelques grammes par boucle d'oreille pour un confort d'oreille optimal.",
      },
      {
        title: "Attaches hypoallergéniques",
        description: "Apprêts compatibles avec les peaux sensibles pour un port sans irritation.",
      },
      {
        title: "Motifs géométriques exclusifs",
        description: "Des designs fins et aérés impossibles à réaliser avec des matières classiques.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Légèreté et confort",
        description: "Bijoux légers imprimés en PLA d'origine végétale.",
      },
      {
        title: "Finition artisanale",
        description: "Chaque bijou est soigneusement vérifié et assemblé à la main.",
      },
      {
        title: "Création française",
        description: "Conçu et fabriqué localement à Comines (59).",
      },
    ],
    editorialLinks: [
      {
        label: "Toute la boutique Spoolio",
        href: "/boutique",
        description: "Explorez nos collections cadeaux et accessoires.",
      },
      {
        label: "Cartes cadeaux Spoolio",
        href: "/carte-cadeau",
        description: "Offrez le choix parmi toutes nos créations avec une carte cadeau.",
      },
    ],
  },

  "pochettes-surprise": {
    slug: "pochettes-surprise",
    name: "Pochettes surprise",
    aliases: ["pochette-surprise", "surprise", "mystery-box"],
    dbCategoryNames: ["Pochettes surprise"],
    h1: "Pochettes surprises et packs mystères d'atelier Spoolio",
    metaTitle: "Pochettes surprises 3D & Packs mystère | Spoolio",
    metaDescription: "Pochettes surprises et assortiments mystères de fidgets et créations 3D fabriqués en France. L'expérience cadeau ludique et économique.",
    intro: "Envie d'une surprise totale ou d'un cadeau amusant ? Nos pochettes surprises réunissent une sélection exclusive de fidgets, figurines articulées et créations d'atelier à un tarif avantageux. Chaque ouverture est une fête !",
    choiceCriteria: [
      {
        title: "Effet découverte garanti",
        description: "Un assortiment varié de créations aux couleurs et textures surprenantes.",
      },
      {
        title: "Valeur supérieure au prix",
        description: "Chaque pochette contient des objets dont la valeur cumulée dépasse largement le prix affiché.",
      },
      {
        title: "Pour petits et grands",
        description: "Des surprises ludiques adaptées à tous les amateurs d'objets imprimés en 3D.",
      },
    ],
    spoolioAdvantages: [
      {
        title: "Créations 100% atelier",
        description: "Uniquement des pièces imprimées avec passion dans notre atelier de Comines.",
      },
      {
        title: "Anti-gaspillage",
        description: "Valorise nos séries limitées et variations de teintes exclusives.",
      },
      {
        title: "Matière PLA biosourcée",
        description: "Créations imprimées en polymère végétal biosourcé.",
      },
    ],
    editorialLinks: [
      {
        label: "Page dédiée Pochettes Surprises",
        href: "/pochette-surprise",
        description: "Commandez directement votre pack surprise en ligne.",
      },
      {
        label: "Calendrier de l'Avent Spoolio",
        href: "/calendrier-avent",
        description: "24 créations 3D surprises à déballer jour après jour.",
      },
    ],
  },
};

/**
 * Find matching Category Config by clean slug, alias, or raw category name
 */
export function findCategoryConfig(input: string): CategorySEOConfig | null {
  if (!input) return null;
  const normalized = decodeURIComponent(input).trim().toLowerCase();

  // 1. Direct match on key
  if (CATEGORIES_CONFIG[normalized]) {
    return CATEGORIES_CONFIG[normalized];
  }

  // 2. Match on aliases or dbCategoryNames
  for (const config of Object.values(CATEGORIES_CONFIG)) {
    if (config.slug === normalized) return config;
    if (config.aliases.some((a) => a.toLowerCase() === normalized)) return config;
    if (config.dbCategoryNames.some((c) => c.toLowerCase() === normalized)) return config;
  }

  return null;
}
