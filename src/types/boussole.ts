export interface FidgetProduct {
  id: string;
  slug?: string;
  name: string;
  category: 'cliquer' | 'manipuler' | 'resoudre' | 'caresser' | 'tourner' | 'presser';
  description: string;
  price: string;
  wooCommerceUrl: string;
  imageUrl: string;
  noiseLevel: 'silent' | 'low' | 'medium' | 'high';
  size: 'pocket' | 'medium' | 'large';
  profiles: Array<'tdah' | 'anxiety' | 'autism' | 'focus'>;
}

export type SensoryCategory = 'cliquer' | 'manipuler' | 'resoudre' | 'caresser' | 'tourner' | 'presser';
