# Walkthrough : Récupération, Importation et Connexion à la Base de Données o2switch

Toutes les données du site de production (`spoolio.fr`) ont été récupérées, stockées localement et synchronisées dans une base de données MySQL hébergée chez o2switch.

## Ce qui a été accompli

### 1. Extraction et sauvegarde locale des données
Le script d'importation [import-data.js](file:///Users/20015984/Documents/SpoolioV2/src/scripts/import-data.js) a récupéré et stocké dans `src/data/` :
- **Produits** (207 fiches produits complètes) dans `products.json`
- **Catégories** (20 catégories) dans `categories.json`
- **Articles de blog** (7 articles réels) dans `blog.json`
- **Pages** (31 pages de contenu : A propos, FAQ, CGV, etc.) dans `pages.json`

### 2. Téléchargement local des images
Toutes les images distantes associées aux produits, catégories, articles et pages ont été téléchargées localement dans le dossier `public/images/imported/`.
Les URLs distantes dans les fichiers JSON ont toutes été remplacées par leurs chemins locaux (ex: `/images/imported/spoolio-mon-image.webp`).

> [!NOTE]
> L'API WordPress des articles et des pages bloquait l'accès anonyme quand elle recevait l'en-tête d'authentification WooCommerce (renvoyant une erreur 401). Le script a été configuré pour désactiver cet en-tête pour ces routes publiques, ce qui a permis d'extraire la totalité des 38 articles et pages sans problème.

### 3. Connexion à la base de données o2switch avec Prisma 7
Nous avons intégré **Prisma ORM** (version 7) pour gérer la base de données MySQL d'o2switch :
- **Schéma de base de données** ([schema.prisma](file:///Users/20015984/Documents/SpoolioV2/prisma/schema.prisma)) : Définition des modèles `Product`, `ProductImage`, `Category`, `BlogPost`, et `Page` avec relations associées.
- **Client Prisma optimisé** ([prisma.ts](file:///Users/20015984/Documents/SpoolioV2/src/lib/prisma.ts)) : Utilisation du driver adapter `@prisma/adapter-mariadb` avec pool de connexions SQL.
- **Configuration** ([prisma.config.ts](file:///Users/20015984/Documents/SpoolioV2/prisma.config.ts)) : Définition de l'emplacement du schéma et chargement robuste des secrets depuis `.env.local`.

### 4. Peuplement et synchronisation de la base (Seeding)
Le script de peuplement ([seed.js](file:///Users/20015984/Documents/SpoolioV2/prisma/seed.js)) a été exécuté avec succès. Il a :
- Purgé les anciennes tables de la base o2switch.
- Résolu les conflits de slugs doublons à l'aide de filtres d'unicité dynamiques (Sets).
- Converti les structures de contenu complexes de WordPress en chaînes de texte propres.
- Inséré l'intégralité des **207 produits, 20 catégories, 7 posts de blog, 31 pages statiques et images associées** dans votre base de données o2switch (`rogi3122_spooliov2db` sur le serveur `emeraude.o2switch.net`).

### 5. Connexion des APIs Next.js à la Base de Données
Les APIs Next.js ont été adaptées pour lire directement dans la base de données :
- [route.ts (liste)](file:///Users/20015984/Documents/SpoolioV2/src/app/api/products/route.ts) : Lit et renvoie les produits depuis MySQL de manière ordonnée (date de création décroissante).
- [route.ts (slug)](file:///Users/20015984/Documents/SpoolioV2/src/app/api/products/%5Bslug%5D/route.ts) : Filtre et renvoie le produit correspondant au slug demandé depuis MySQL.
- [page.tsx (SEO)](file:///Users/20015984/Documents/SpoolioV2/src/app/product/%5Bslug%5D/page.tsx) : Génère les métadonnées SEO dynamiquement en lisant les infos produit dans la base.

### 6. Tri et affichage sur la page d'accueil
La grille de produits [SpoolioProductGrid.tsx](file:///Users/20015984/Documents/SpoolioV2/src/components/SpoolioProductGrid.tsx) récupère les produits en base et affiche les **12 produits les plus récents**.

### 7. Barre d'administration publique (Admin Toolbar)
Nous avons créé et intégré une barre d'administration contextuelle tout en haut des pages publiques :
- **Détection** : S'active automatiquement lorsque l'utilisateur accède à l'administration `/admin` (le flag `is_spoolio_admin` est alors saugardé dans le `localStorage`).
- **Édition contextuelle** : Si l'utilisateur est sur la page d'un produit (ex: `/product/chat-goofy`), la barre fait un appel en arrière-plan pour récupérer l'ID correspondant, et affiche un bouton **"Modifier ce produit"** qui redirige vers le formulaire d'édition (`/admin/products/[id]`).
- **Options d'affichage** : Possibilité de masquer temporairement la barre ou de quitter le mode admin de façon permanente.

### 8. Affichage dynamique des variantes et sélecteurs UX sur-mesure
La fiche produit publique ([ProductDetailClient.tsx](file:///Users/20015984/Documents/SpoolioV2/src/app/product/[slug]/ProductDetailClient.tsx)) a été mise à jour pour charger et restituer les variantes réelles issues d'o2switch :
- **Pastilles colorées** : Utilisées pour l'attribut `Couleur`, avec des correspondances CSS fluides et des dégradés pour les couleurs complexes de Spoolio (ex: *Bicolore bleu-violet*, *arc-en-ciel*, *phosphorescent*).
- **Sélecteurs segmentés (Toggles)** : Utilisés pour les options binaires Oui/Non ou Avec/Sans (ex: *Personnalisable*, *Boîte de stockage*).
- **Chips horizontaux** : Utilisés pour les dimensions et tailles (ex: *S*, *M*, *L (27cm)*) jusqu'à 5 options.
- **Menu déroulant stylisé** : Utilisé pour les attributs contenant plus de 5 options textuelles afin d'économiser l'espace.

### 9. Page Boutique publique (/boutique)
Création d'une page racine de catalogue e-commerce complète, optimisée pour le référencement naturel :
- **En-tête SEO** : Contient un titre principal `<h1>` et un paragraphe descriptif riche en mots-clés (impression 3D écologique, fabrication à Comines, etc.).
- **Filtres à la volée** : Barre de recherche textuelle, filtre promotion (`on_sale`), et menu de sélection de catégories généré dynamiquement à partir des produits.
- **Moteur de tri** : Tri réactif par prix (croissant/décroissant), ordre alphabétique, et nouveautés.
- **Pagination** : Grille de 12 produits avec contrôles de pagination élégants.

### 10. Module de Sécurité et Authentification Admin
Mise en place d'une sécurisation totale du dossier d'administration `/admin` :
- **Clé de chiffrement HMAC** : Utilisation d'un utilitaire cryptographique natif Web Crypto ([auth.ts](file:///Users/20015984/Documents/SpoolioV2/src/lib/auth.ts)) pour générer des tokens de session sécurisés signés, sans aucune dépendance npm.
- **Middleware serveur** ([middleware.ts](file:///Users/20015984/Documents/SpoolioV2/src/middleware.ts)) : Intercepte toutes les requêtes vers `/admin/*` (sauf `/admin/login`) pour valider la session. Bloque les accès non autorisés et redirige immédiatement vers l'écran de connexion.
- **Page de Connexion** ([page.tsx (login)](file:///Users/20015984/Documents/SpoolioV2/src/app/admin/login/page.tsx)) : Interface de login premium sombre avec saisie de mot de passe sécurisée liée à la clé `ADMIN_PASSWORD` de configuration locale.
- **Déconnexion complète** : Intégration de boutons de déconnexion dans la barre latérale admin et l'AdminToolbar publique reliés à une API de purge de cookies ([route.ts (logout)](file:///Users/20015984/Documents/SpoolioV2/src/app/api/admin/logout/route.ts)).

### 11. Gestion du Panier (Cart Drawer) et Tunnel d'Achat (Stripe Checkout)
Développement et intégration du cycle de vente de bout en bout :
- **Gestionnaire du panier (Cart Context)** ([CartContext.tsx](file:///Users/20015984/Documents/SpoolioV2/src/context/CartContext.tsx)) : Gère le panier de l'utilisateur de façon globale avec persistance automatique dans le `localStorage` (les articles et leurs variantes restent sauvegardés au rechargement).
- **Interface tiroir coulissant (Cart Drawer)** ([CartDrawer.tsx](file:///Users/20015984/Documents/SpoolioV2/src/components/CartDrawer.tsx)) : S'ouvre à droite de l'écran lors d'un ajout au panier. Permet de modifier les quantités, de supprimer des articles et de voir le total mis à jour.
- **Header connecté** : L'icône de panier du Header affiche désormais un badge avec le compte des articles réels et ouvre le tiroir panier au clic.
- **Boutons d'achat réactifs** : Les boutons « ACHETER » des grilles et « Ajouter au panier » des fiches produits ajoutent l'objet (avec la combinaison exacte des variantes choisies) et ouvrent le panier.
- **API Checkout Stripe** ([route.ts (checkout API)](file:///Users/20015984/Documents/SpoolioV2/src/app/api/checkout/route.ts)) : Route d'API qui génère les sessions de paiement Stripe sécurisées. Elle embarque un **mode simulation intelligent** pour le développement local si aucune clé Stripe n'est configurée, permettant de tester le flux complet de bout en bout sans friction.
- **Webhook de réception des paiements** ([route.ts (webhook API)](file:///Users/20015984/Documents/SpoolioV2/src/app/api/webhooks/stripe/route.ts)) : Point d'accès serveur sécurisé qui écoute l'événement `checkout.session.completed` émis par Stripe pour confirmer de façon asynchrone le succès du paiement et le traitement des commandes côté backoffice.
- **Page de succès de commande** ([page.tsx (success)](file:///Users/20015984/Documents/SpoolioV2/src/app/success/page.tsx)) : Remercie le client après paiement, affiche les informations de livraison et vide automatiquement le panier local.

## Résultats de validation
La compilation via `npm run build` réussit parfaitement. Le site Next.js affiche maintenant les vrais produits de Spoolio servis directement depuis votre base de données MySQL o2switch.
