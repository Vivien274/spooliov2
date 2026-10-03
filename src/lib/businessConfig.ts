/**
 * Centralized business configuration for Spoolio.fr
 * Single source of truth for company details, addresses, contacts, and canonical domain.
 */

export const BUSINESS_CONFIG = {
  name: "Spoolio",
  legalName: "Spoolio (Entreprise Individuelle Vivien Bocquelet)",
  founderName: "Vivien Bocquelet",
  address: "40 rue du Hoccart",
  postalCode: "59560",
  city: "Comines",
  country: "France",
  countryCode: "FR",
  fullAddress: "40 rue du Hoccart, 59560 Comines, France",
  email: "contact@spoolio.fr",
  contactUrl: "/contact",
  phone: "06 34 72 55 13",
  
  // NOTE METIER A CONFIRMER : 
  // La page Contact indiquait "Du Lundi au Vendredi de 9h à 17h", tandis que la page À Propos
  // mentionnait "Lundi au Samedi de 10h à 18h".
  // Par défaut, nous retenons les horaires officiels de service client déclarés dans les CGV :
  // "Du lundi au vendredi de 9h à 17h". À faire confirmer par Vivien.
  openingHoursDisplay: "Du lundi au vendredi de 9h à 17h",
  openingHoursConfirmed: false,
  openingHoursSpecification: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    }
  ],

  // Canonical Domain (Strictly with www as required by Objective 1)
  siteUrl: "https://www.spoolio.fr",
  defaultOgImage: "https://www.spoolio.fr/images/imported/Spoolio_Kit-Festival-16-scaled.webp",

  // Social networks
  socials: {
    tiktok: "https://www.tiktok.com/@spoolio.fr",
    instagram: "https://www.instagram.com/spoolio.fr/",
    facebook: "https://www.facebook.com/spoolio.fr",
  },

  // Geo coordinates for Comines
  geo: {
    latitude: 50.7333,
    longitude: 3.0000,
  }
} as const;
