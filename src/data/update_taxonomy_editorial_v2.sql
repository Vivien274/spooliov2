-- ==============================================================================
-- Spoolio V2.1 — Mise à jour éditoriale & SEO de catalog_taxonomy
-- 
-- Ce script met à jour UNIQUEMENT les colonnes :
--   - subtitle
--   - description
--   - seo_title
--   - seo_description
-- 
-- Ne modifie aucun slug, nom, relation, ni statut is_active / is_indexable.
-- Ne pas exécuter automatiquement en local.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. UNIVERS (4 univers)
-- ------------------------------------------------------------------------------

-- ART TOYS & COLLECTIBLES (slug: 'art-toys', type: 'universe')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Personnages, créatures et curiosités à collectionner.',
  description = 'Des objets à exposer, manipuler et garder près de soi. Art toys, petites créatures et pièces plus étranges sorties de l’atelier.',
  seo_title = 'Art Toys & Collectibles — Spoolio',
  seo_description = 'Découvrez les art toys, créatures et curiosités Spoolio : des objets pop, décalés et fabriqués en petites séries dans notre atelier.',
  updated_at = NOW()
WHERE type = 'universe' AND slug = 'art-toys';

-- TACTILE & FOCUS (slug: 'tactile', type: 'universe')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Objets tactiles, mécaniques et satisfaisants à manipuler.',
  description = 'Clickers, fidgets et mécanismes pensés pour le geste, le mouvement et le plaisir de manipulation.',
  seo_title = 'Tactile & Focus — Fidgets et objets tactiles Spoolio',
  seo_description = 'Découvrez les clickers, fidgets et mécanismes Spoolio : des objets tactiles et mécaniques conçus autour du geste et du mouvement.',
  updated_at = NOW()
WHERE type = 'universe' AND slug = 'tactile';

-- OBJETS & DÉCO (slug: 'objets-deco', type: 'universe')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des objets utiles, décoratifs ou franchement décalés.',
  description = 'Accessoires de bureau, rangement, supports et curiosités pour apporter un peu de caractère au quotidien.',
  seo_title = 'Objets & Déco — Spoolio',
  seo_description = 'Supports, rangement, décoration et objets décalés : découvrez les créations Spoolio pour le bureau et la maison.',
  updated_at = NOW()
WHERE type = 'universe' AND slug = 'objets-deco';

-- TABLETOP (slug: 'tabletop', type: 'universe')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Objets et accessoires pour jouer autrement.',
  description = 'Tours à dés, accessoires pour cartes et petits jeux conçus pour enrichir la table sans la surcharger.',
  seo_title = 'Tabletop — Accessoires de jeu Spoolio',
  seo_description = 'Tours à dés, accessoires pour cartes et petits jeux : découvrez la sélection Tabletop imaginée par Spoolio.',
  updated_at = NOW()
WHERE type = 'universe' AND slug = 'tabletop';


-- ------------------------------------------------------------------------------
-- 2. CATÉGORIES (13 catégories actives)
-- ------------------------------------------------------------------------------

-- ART TOYS : Art toys (slug: 'art-toys', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Petites pièces à exposer, collectionner et garder sous les yeux.',
  description = 'Des personnages et objets sculpturaux à mi-chemin entre jouet, déco et pièce de collection.',
  seo_title = 'Art Toys — Spoolio',
  seo_description = 'Découvrez les art toys Spoolio : personnages, objets pop et pièces de collection fabriqués en petites séries.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'art-toys';

-- ART TOYS : Créatures & curiosités (slug: 'creatures-curiosites', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Bestioles, personnages et objets qu’on ne croise pas partout.',
  description = 'Une sélection de créatures articulées, personnages étranges et petites curiosités sorties de l’atelier.',
  seo_title = 'Créatures & curiosités — Spoolio',
  seo_description = 'Créatures articulées, personnages et curiosités : découvrez les objets les plus étranges et attachants de Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'creatures-curiosites';

-- TACTILE : Clickers (slug: 'clickers', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Un clic net. Puis encore un.',
  description = 'Des objets tactiles construits autour du plaisir mécanique du clic, du geste court et de la répétition.',
  seo_title = 'Clickers — Spoolio',
  seo_description = 'Découvrez les clickers Spoolio : objets tactiles et mécaniques à cliquer, manipuler et garder à portée de main.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'clickers';

-- TACTILE : Fidgets (slug: 'fidgets', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des objets faits pour les mains qui aiment bouger.',
  description = 'Textures, articulations, rotations et mouvements répétitifs à manipuler librement.',
  seo_title = 'Fidgets — Spoolio',
  seo_description = 'Découvrez les fidgets Spoolio : objets tactiles, articulés et sensoriels conçus pour le plaisir de manipulation.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'fidgets';

-- TACTILE : Mécanismes (slug: 'mecanismes', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Engrenages, rotations et mouvements satisfaisants.',
  description = 'Des objets où le mécanisme devient le spectacle : gyroscopes, engrenages, iris et systèmes cinétiques.',
  seo_title = 'Mécanismes — Spoolio',
  seo_description = 'Gyroscopes, engrenages et objets cinétiques : découvrez les mécanismes tactiles Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'mecanismes';

-- OBJETS & DÉCO : Décoration (slug: 'decoration', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des objets qui méritent leur place sur une étagère.',
  description = 'Vases, luminaires et curiosités décoratives imaginés pour ajouter une touche inattendue à la maison.',
  seo_title = 'Décoration — Spoolio',
  seo_description = 'Vases, luminaires et objets décoratifs : découvrez la sélection déco Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'decoration';

-- OBJETS & DÉCO : Supports (slug: 'supports', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des objets utiles qui refusent d’être banals.',
  description = 'Supports pour téléphone, manette, casque et accessoires de bureau pensés comme de vrais objets de design.',
  seo_title = 'Supports — Spoolio',
  seo_description = 'Supports pour téléphone, casque et manette : découvrez les accessoires de bureau Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'supports';

-- OBJETS & DÉCO : Rangement (slug: 'rangement', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Ranger, oui. Mais pas dans une boîte triste.',
  description = 'Boîtes, vide-poches et petits rangements qui cachent leur fonction derrière des formes plus inattendues.',
  seo_title = 'Rangement — Spoolio',
  seo_description = 'Boîtes, vide-poches et rangements originaux : découvrez les objets pratiques et décalés Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'rangement';

-- OBJETS & DÉCO : Bureau (slug: 'bureau', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des petits objets pour un bureau moins sage.',
  description = 'Pots à crayons, pancartes et accessoires conçus pour apporter du caractère à l’espace de travail.',
  seo_title = 'Objets de bureau — Spoolio',
  seo_description = 'Pots à crayons, accessoires et objets de bureau originaux fabriqués par Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'bureau';

-- OBJETS & DÉCO : Objets décalés (slug: 'objets-decales', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Utiles parfois. Étranges souvent.',
  description = 'Objets du quotidien détournés, trompe-l’œil et idées un peu absurdes assumées.',
  seo_title = 'Objets décalés — Spoolio',
  seo_description = 'Découvrez les objets décalés Spoolio : trompe-l’œil, accessoires insolites et créations inattendues.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'objets-decales';

-- TABLETOP : Tours à dés (slug: 'tours-a-des', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Faites rouler les dés avec un peu plus de panache.',
  description = 'Tours à dés classiques, compactes ou plus fantastiques pour donner du caractère à la table de jeu.',
  seo_title = 'Tours à dés — Spoolio',
  seo_description = 'Découvrez les tours à dés Spoolio : modèles classiques, pliables et fantasy pour vos parties de jeux de société.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'tours-a-des';

-- TABLETOP : Cartes & accessoires (slug: 'cartes-accessoires', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des petits outils qui rendent les parties plus agréables.',
  description = 'Supports, pinces et boîtes pour cartes pensés pour garder le jeu lisible et accessible.',
  seo_title = 'Accessoires pour cartes — Spoolio',
  seo_description = 'Supports, pinces et boîtes pour cartes : découvrez les accessoires Tabletop Spoolio.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'cartes-accessoires';

-- TABLETOP : Jeux (slug: 'jeux', type: 'category')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Petits jeux, grandes réactions.',
  description = 'Jeux d’adresse, de poche ou de démonstration à sortir rapidement autour d’une table.',
  seo_title = 'Jeux — Spoolio',
  seo_description = 'Découvrez les petits jeux Spoolio : jeux d’adresse, de poche et objets ludiques à partager.',
  updated_at = NOW()
WHERE type = 'category' AND slug = 'jeux';


-- ------------------------------------------------------------------------------
-- 3. COLLECTIONS (8 collections actives)
-- ------------------------------------------------------------------------------

-- CABINET NOIR (slug: 'cabinet-noir', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Le côté sombre du cabinet de curiosités.',
  description = 'Crânes, squelettes, créatures étranges et objets un peu macabres. Une sélection plus noire, toujours avec l’esprit Spoolio.',
  seo_title = 'Cabinet noir — Collection Spoolio',
  seo_description = 'Crânes, squelettes, créatures étranges et curiosités sombres : explorez la collection Cabinet noir de Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'cabinet-noir';

-- TACTILE LAB (slug: 'tactile-lab', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Objets conçus autour du geste, du clic et du mouvement.',
  description = 'Une sélection de clickers, fidgets et mécanismes pour celles et ceux qui aiment manipuler, tourner, presser et recommencer.',
  seo_title = 'Tactile Lab — Collection Spoolio',
  seo_description = 'Clickers, fidgets et mécanismes tactiles : explorez la collection Tactile Lab de Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'tactile-lab';

-- GADGETOIDS (slug: 'gadgetoids', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Petits robots, grosses personnalités.',
  description = 'Des personnages mécaniques transformables à collectionner, assembler et exposer.',
  seo_title = 'Gadgetoids — Collection Spoolio',
  seo_description = 'Découvrez Gadgetoids, la collection de petits robots transformables et objets de collection de Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'gadgetoids';

-- FANTASY RELICS (slug: 'fantasy-relics', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Objets échappés d’un monde fantastique.',
  description = 'Dragons, reliques, artefacts et curiosités inspirés par la fantasy, entre objet décoratif et pièce de collection.',
  seo_title = 'Fantasy Relics — Collection Spoolio',
  seo_description = 'Dragons, reliques et objets fantasy : explorez la collection Fantasy Relics de Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'fantasy-relics';

-- SOFT ILLUSION (slug: 'soft-illusion', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des objets qui semblent plus mous qu’ils ne le sont.',
  description = 'Une collection de trompe-l’œil inspirés des coussins, textiles et formes souples, entièrement revisités en objet imprimé.',
  seo_title = 'Soft Illusion — Collection Spoolio',
  seo_description = 'Découvrez Soft Illusion, une collection Spoolio de trompe-l’œil inspirés des textiles et objets souples.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'soft-illusion';

-- KRAFT ILLUSION (slug: 'kraft-illusion', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'L’apparence du papier, la solidité d’un objet.',
  description = 'Une série de trompe-l’œil inspirés du kraft, du papier froissé et des objets du quotidien.',
  seo_title = 'Kraft Illusion — Collection Spoolio',
  seo_description = 'Découvrez Kraft Illusion, la collection Spoolio inspirée du papier kraft et des effets de matière.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'kraft-illusion';

-- ATELIER MONSTERS (slug: 'atelier-monsters', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Les petites créatures sorties de l’atelier.',
  description = 'Personnages étranges, attachants et légèrement absurdes imaginés pour vivre sur une étagère, un bureau ou dans une collection.',
  seo_title = 'Atelier Monsters — Collection Spoolio',
  seo_description = 'Découvrez Atelier Monsters, la collection de personnages et petites créatures imaginées par Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'atelier-monsters';

-- CRYSTAL SETUP (slug: 'crystal-setup', type: 'collection')
UPDATE public.catalog_taxonomy
SET
  subtitle = 'Des accessoires de bureau à l’allure minérale.',
  description = 'Supports et objets inspirés du cristal, pensés pour apporter une présence sculpturale au setup.',
  seo_title = 'Crystal Setup — Collection Spoolio',
  seo_description = 'Supports et accessoires inspirés du cristal : découvrez la collection Crystal Setup de Spoolio.',
  updated_at = NOW()
WHERE type = 'collection' AND slug = 'crystal-setup';

COMMIT;
