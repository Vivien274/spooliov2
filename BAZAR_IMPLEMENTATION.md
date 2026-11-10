# LE BAZAR DE SPOOLIO — DOCUMENTATION TECHNIQUE D'IMPLÉMENTATION
**Version :** 2.1 — Prototype Local Isolé  
**Environnement :** Local uniquement (`localhost:3000`)

---

> [!CAUTION]
> **GARANTIE DE SÉCURITÉ ABSOLUE : DÉVELOPPEMENT STRICTEMENT LOCAL**
> - **Aucune écriture distante** dans Supabase PostgreSQL ou Supabase Storage.
> - **Aucun paiement Stripe réel** ni création de session de checkout distante.
> - **Aucune migration SQL distante**, aucun déploiement Vercel, aucun push Git automatique.
> - Toutes les créations, modifications, suppressions et achats sont simulés dans une couche d'abstraction locale (`IndexedDB` + `localStorage`).

---

## 1. VUE D'ENSEMBLE

**Le Bazar** réinvente le catalogue e-commerce d'atelier en faisant de la **photographie le catalogue interactif** :
- Les objets ne nécessitent pas de fiches e-commerce lourdes et fastidieuses.
- Chaque objet est repéré directement par une **zone rectangulaire** tracée sur une photo de stand ou d'atelier.
- Le visiteur touche ou survole un objet sur la photo pour découvrir son prix, afficher sa fiche produit flottante avec miniature recadrée automatiquement, et l'ajouter à un panier simulé.
- Le vendeur crée ses objets en quelques secondes en dessinant simplement des rectangles à la souris ou au doigt.

---

## 2. ROUTES D'ACCÈS LOCALES

Les deux expériences sont immédiatement accessibles sur le serveur local en cours d'exécution :

| Expérience | Route Locale | Description |
|---|---|---|
| **Boutique Publique** | [`/le-bazar`](http://localhost:3000/le-bazar) | Brocante d'atelier photographique avec zoom, pan, fiche rapide, liste synchronisée et panier simulé. |
| **Manager Vendeur (Standalone)** | [`/bazar`](http://localhost:3000/bazar) | Éditeur visuel direct avec dessin de rectangles, formulaires rapides, table braderie et import/export JSON. |
| **Spoolio Manager (Intégré)** | [`/admin/bazar`](http://localhost:3000/admin/bazar) | Même éditeur visuel intégré dans le layout d'administration Spoolio avec le menu latéral. |

---

## 3. CHOIX TECHNIQUES ET ARCHITECTURE

### 3.1 Stack Utilisée
- **Next.js 16 (App Router)** & **React 19**
- **TypeScript 5** avec typage strict
- **Tailwind CSS v4** respectant scrupuleusement la charte **Thème Clair Spoolio** :
  - Fond doux `#FAF9F6` / `#FAFAFA`
  - Cartes et panneaux blancs `#FFFFFF`
  - Textes denses `#121212` / `#0A0A0A`
  - Bordures discrètes `#E4E4E0`
  - Accents pop Orange Spoolio `#FF5500`
- **Framer Motion** & **Canvas Confetti** pour les micro-interactions et célébrations

### 3.2 Modèle de Données

```typescript
type BazarItemStatus = "available" | "reserved" | "sold";

type BazarItemCondition =
  | "prototype"
  | "end_of_series"
  | "color_test"
  | "minor_defect"
  | "other";

interface BazarItem {
  id: string;
  name: string;
  priceCents: number;      // Stocké en centimes (ex: 300 = 3,00 €)
  quantity: number;        // Stock entier
  status: BazarItemStatus; // Calculé ou forcé (sold quand quantity <= 0)
  condition: BazarItemCondition;
  description?: string;
  conditionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BazarZone {
  id: string;
  sceneId: string;
  itemId: string;
  x: number;      // 0..1 relatif à la largeur naturelle
  y: number;      // 0..1 relatif à la hauteur naturelle
  width: number;  // 0..1
  height: number; // 0..1
}

interface BazarScene {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. PERSISTANCE LOCALE & COUCHE REPOSITORY

Le repository d'abstraction (`bazarRepository`) implémente l'interface `BazarRepository` sous la forme d'un singleton réactif :
1. **Données volumineuses (Photos importées) :** stockées directement dans **IndexedDB** (`spoolio_bazar_db` -> `bazar_images`) en tant que DataURL/Blob. Aucune image n'est envoyée à un serveur distant.
2. **Métadonnées applicatives (Scènes, Objets, Zones) :** stockées dans `localStorage` sous les clés :
   - `spoolio_bazar_scenes_v1`
   - `spoolio_bazar_items_v1`
   - `spoolio_bazar_zones_v1`
3. **Synchronisation Réactive :** Le repository utilise un pattern observateur (`subscribe`). Toute modification apportée dans l'administration (ex: stock diminué dans la table braderie) est immédiatement répercutée sur la boutique publique sans rechargement de page.
4. **Import / Export JSON :** Sauvegarde et restauration complète en un clic via fichier JSON.
5. **Bouton de Réinitialisation Démo :** Rétablit en 1 clic les 3 scènes d'origine et leurs 16 objets avec leurs stocks initiaux.

---

## 5. FONCTIONNEMENT DES RECTANGLES & COORDONNÉES

- **Normalisation Indépendante de la Résolution :**  
  Toutes les coordonnées `(x, y, width, height)` sont calculées entre `0` et `1` relativement aux dimensions naturelles de l'image.
  ```typescript
  normX = clamp(rawX / containerWidth, 0, 1);
  normW = clamp(rawW / containerWidth, minDimension, 1 - normX);
  ```
- **Précision au Zoom & Redimensionnement :**  
  Que l'image soit redimensionnée, responsive (mobile/desktop) ou zoomée (jusqu'à 3.5x avec déplacement libre), les rectangles restent collés aux pixels physiques réels de la photo.
- **Poignées de Transformation (8 directions) :**  
  En mode sélection dans l'éditeur, 8 poignées visibles (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`) permettent d'ajuster les contours, et la zone centrale permet de déplacer le rectangle complet.
- **Résolution des Chevauchements :**  
  Si deux objets se trouvent très proches ou superposés, le système privilégie la zone la plus petite (la plus spécifique) contenant le point cliqué (`findBestMatchingZone`), garantissant une sélection précise.

---

## 6. RECADRAGE AUTOMATIQUE DES MINIATURES

Conformément à la consigne de performance (Section 6.5) :
- Le système ne génère pas de multiples fichiers images intermédiaires.
- Le composant `ProductCrop` utilise une fonction CSS vectorielle (`getCropImageStyles`) qui calcule le zoom et le décalage pour afficher la zone recadrée avec une marge de contexte configurable (12% à 15%) à l'intérieur d'un conteneur `overflow: hidden`.
- Une fonction Canvas (`extractCropToDataUrl`) est également fournie pour l'export physique si nécessaire.

---

## 7. FONCTIONNALITÉS CLIENT & PARCOURS D'ACHAT

1. **Hero Éditorial :** Compteurs en temps réel du nombre de pièces disponibles, scènes photographiées et bouton panier.
2. **Sélecteur de Scènes :** Galerie d'onglets visuels pour basculer facilement entre les séries d'objets.
3. **Photographie Interactive :**
   - Survol : contour orange Spoolio `#FF5500`, étiquette de prix flottante.
   - Clic / Toucher : ouverture instantanée de la fiche produit flottante et mise en surbrillance de l'objet dans la liste latérale.
   - Zoom et Déplacement : boutons `+`, `-`, réinitialisation, support tactile de glissement.
4. **Fiche Produit Flottante :**
   - Miniature automatiquement recadrée.
   - Nom, type (Prototype, Fin de série, Essai de couleur, etc.), prix et stock disponible.
   - Bouton d'ajout au panier avec retour visuel immédiat.
5. **Liste Synchronisée :**
   - Colonne à droite sur ordinateur, tiroir pliable sur mobile.
   - Sélection bidirectionnelle (clic photo -> surbrillance liste ; clic liste -> zoom/surbrillance photo).
6. **Panier Simulé & Commande :**
   - Contrôle strict des plafonds de stock (impossible d'ajouter plus que le stock disponible).
   - Validation de commande fictive décrémentant immédiatement le stock local.
   - Les objets dont le stock tombe à 0 basculent automatiquement en état **« Vendu »** avec badge grisé.
   - Célébration par pluie de confettis et génération d'un numéro de commande fictif (`BAZAR-XXXXXX`).

---

## 8. FONCTIONNALITÉS VENDEUR & ADMINISTRATION

1. **Accueil du Module :** Liste des scènes avec statut brouillon/publié, actions de duplication, suppression, modification et prévisualisation.
2. **Création d'une Scène :** Glisser-déposer de photographies locales (JPEG, PNG, WebP) enregistrées en IndexedDB.
3. **Dessin Rapide de Rectangles :** Clic-glisser pour entourer l'objet -> ouverture instantanée du formulaire rapide -> bouton « Enregistrer et ajouter un autre objet » pour enchaîner sans friction.
4. **Gestion Rapide Braderie :** Tableau condensé pour ajuster les stocks en 1 clic après un marché physique (`-1`, `+1`, `Marquer vendu`).
5. **Prévisualisation Client :** Modal fidèle permettant de tester l'expérience exacte des visiteurs.

---

## 9. ÉTAPES FUTURES POUR L'INTÉGRATION EN PRODUCTION

Lorsqu'une mise en production sera décidée, les étapes seront les suivantes :
1. **Base de données distante :** Exécuter la migration SQL des tables `bazar_scenes`, `bazar_items` et `bazar_zones` dans Supabase PostgreSQL avec leurs politiques RLS.
2. **Stockage d'images :** Remplacer le stockage `IndexedDB` par un bucket Supabase Storage public (`bazar-photos`) avec politique de redimensionnement WebP.
3. **Paiement Stripe :** Remplacer le `submitSimulatedCheckout` par l'appel à la route d'API Stripe Checkout existante (`/api/checkout`).
4. **Synchronisation panier global :** Connecter les articles du Bazar au panier principal Spoolio `CartContext` si une commande mixte (Bazar + Catalogue régulier) est souhaitée.

