export interface ShippingConfig {
  freeShippingThreshold: number; // Montant min pour livraison offerte (ex: 60.00)
  relayShippingCost: number;     // Tarif livraison légère / Point Relais (ex: 3.90)
  homeShippingCost: number;      // Tarif livraison lourde / Domicile (ex: 4.90)
  pickupShippingCost: number;    // Tarif retrait atelier / Click & Collect (ex: 0.00)
  enablePromoFreeShipping: boolean; // Autoriser port offert avec code promo
  shippingNotice: string;        // Bannière / note réassurance expédition
}

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  freeShippingThreshold: 60.0,
  relayShippingCost: 3.90,
  homeShippingCost: 4.90,
  pickupShippingCost: 0.0,
  enablePromoFreeShipping: true,
  shippingNotice: "Expédition rapide sous 24/48h depuis notre atelier de Comines (59) 🇫🇷",
};
