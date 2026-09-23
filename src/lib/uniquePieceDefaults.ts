export interface UniquePieceGalleryItem {
  src: string;
  caption?: string;
  alt?: string;
}

export interface UniquePieceData {
  hero: {
    badge: string;
    availabilityBadge: string;
    punchline: string;
    microPerks: Array<{ icon: string; text: string }>;
  };
  gallery: {
    badge: string;
    title: string;
    description: string;
    items: UniquePieceGalleryItem[];
  };
  savoirFaire: {
    badge: string;
    title: string;
    intro: string;
    steps: Array<{ stepNumber: number; title: string; description: string }>;
    quote: string;
  };
  lore: {
    badge: string;
    title: string;
    paragraphs: string[];
  };
  specs: {
    badge: string;
    title: string;
    items: Array<{ label: string; value: string }>;
  };
  ecrin: {
    badge: string;
    title: string;
    intro: string;
    points: string[];
    origin: string;
    shippingMethod: string;
  };
  faq: {
    badge: string;
    title: string;
    items: Array<{ q: string; a: string }>;
  };
}

export function getDefaultUniquePieceData(productName: string = "Pièce Unique"): UniquePieceData {
  return {
    hero: {
      badge: "Édition Atelier Spoolio • Fait Main",
      availabilityBadge: "Pièce Unique en Stock (1 seul dispo)",
      punchline: "Imprimé en 3D haute définition, entièrement préparé et peint au pinceau dans notre atelier à Comines (Nord).",
      microPerks: [
        { icon: "palette", text: "Peint à la main" },
        { icon: "shield", text: "Vernis protecteur satiné" },
        { icon: "mappin", text: "Atelier de Comines" },
      ],
    },
    gallery: {
      badge: "Galerie Photos",
      title: "Vues Détaillées",
      description: "",
      items: [
        {
          src: "/images/produits/monstre-skateur-fait-main.jpg",
          caption: "Vue principale – Figurine sur son établi d'atelier",
          alt: "Figurine peinte à la main sur établi de découpe",
        },
        {
          src: "/images/produits/monstre-skateur-macro-visage.jpg",
          caption: "Macro visage – Regard espiègle & peinture de précision",
          alt: "Détail macro du visage et des yeux peints à la main",
        },
        {
          src: "/images/produits/monstre-skateur-macro-skate.jpg",
          caption: "Macro skateboard – Plateau street & roues sculptées",
          alt: "Détail macro du plateau de skateboard",
        },
        {
          src: "/images/imported/Spoolio_Monstre-A-Peindre-1-scaled.jpeg",
          caption: "Étape d'atelier – Tirage brut en impression 3D avant ponçage & peinture",
          alt: "Tirage brut en impression 3D avant travail manuel",
        },
      ],
    },
    savoirFaire: {
      badge: "Atelier Français",
      title: "Le Savoir-Faire Artisanal",
      intro: "Chaque figurine nécessite plusieurs heures de travail minutieux. Voici les 4 étapes qui donnent vie à cette création :",
      steps: [
        {
          stepNumber: 1,
          title: "Impression 3D Haute Précision",
          description: "8 heures d'extrusion lente à 0.12 mm par couche pour restituer la texture du sweat et du plateau.",
        },
        {
          stepNumber: 2,
          title: "Ponçage Manuel & Ébavurage",
          description: "Préparation manuelle au papier de carrossier grain 400 puis 800 pour gommer les lignes d'impression.",
        },
        {
          stepNumber: 3,
          title: "Peint à la Main",
          description: "Peinture réalisée au pinceau à main levée en plusieurs passages soignés (teinte bordeaux, pantalon, yeux et langue).",
        },
        {
          stepNumber: 4,
          title: "Vernis Protecteur Satiné",
          description: "Finition protectrice anti-UV et résistante aux manipulations quotidiennes sur votre bureau.",
        },
      ],
      quote: "« Deux figurines ne sont jamais 100% identiques : chaque coup de pinceau en fait une œuvre singulière. »",
    },
    lore: {
      badge: "L'Histoire de la Création",
      title: productName || "Gribouille le Skateur",
      paragraphs: [
        "Né d’un croquis spontané sur un coin d’établi dans notre atelier de Comines, ce personnage est le garnement intrépide de Spoolio.",
        "Avec son regard espiègle, ses finitions soignées et son caractère affirmé, il incarne l’esprit fun, rebelle et créatif de l'artisanat 3D.",
        "Il trônera fièrement sur votre bureau, votre étagère de collection ou votre setup gaming.",
      ],
    },
    specs: {
      badge: "Fiche Technique & Matériaux",
      title: "Caractéristiques & Entretien",
      items: [
        { label: "Hauteur Totale", value: "13,5 cm" },
        { label: "Planche / Base", value: "11 x 4,5 cm" },
        { label: "Poids Estimé", value: "~145 grammes" },
        { label: "Matériau", value: "PLA Biosourcé + Peint à la main" },
        { label: "Temps d'Atelier", value: "~3h30 de travail manuel" },
        { label: "Entretien", value: "Chiffon microfibre sec" },
      ],
    },
    ecrin: {
      badge: "Protection Renforcée",
      title: "Un Écrin Spécial pour une Pièce d'Art",
      intro: "Une figurine peinte à la main requiert une attention toute particulière lors de son voyage. Votre colis comprend :",
      points: [
        "Boîte kraft rigide Spoolio renforcée",
        "Calage individuel anti-chocs sur-mesure",
        "Certificat numéroté signé par l'artisan",
        "Pack de stickers exclusifs Spoolio offert",
      ],
      origin: "Comines, France",
      shippingMethod: "Expédition Colissimo Suivi ou Mondial Relay",
    },
    faq: {
      badge: "FAQ Fait Main",
      title: "Vos Questions",
      items: [
        {
          q: "La peinture est-elle fragile ?",
          a: "La figurine est protégée avec un vernis protecteur satiné (anti-UV et résistant aux manipulations). Elle peut être manipulée sans risque mais reste un objet d'art à manipuler avec soin.",
        },
        {
          q: "Les roues du skate tournent-elles ?",
          a: "Non, les roues sont solidement fixées au plateau afin de garantir une stabilité parfaite lorsqu'elle est posée sur un meuble ou bureau.",
        },
        {
          q: "Puis-je demander des couleurs personnalisées ?",
          a: "Plutôt non : il s'agit de créations artistiques conçues comme des pièces uniques d'atelier. Sauf cas très rares (dans ce cas vous pouvez me contacter via la page Contact pour en discuter), ces figurines restent des pièces uniques non déclinables.",
        },
      ],
    },
  };
}
