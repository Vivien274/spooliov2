-- SPOOLIO V2.1 : MIGRATION AUTOMATIQUE DU CATALOGUE DEPUIS LE GOOGLE SHEET
-- Date: 2026-10-27
-- Produits actifs insérés dans public.product_taxonomy: 134

BEGIN;

-- Caméléon aimanté (ID: 7217, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7217;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7217, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7217, 6, true);

-- Porte-clé glace (ID: 9337, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9337;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9337, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9337, 6, true);

-- Goofy — La petite bestiole qui te juge du regard 👀 (ID: 12, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 12;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12, 6, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12, 29, false);

-- Robot articulé "Dummy" (ID: 8010, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 8010;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8010, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8010, 6, true);

-- Glace "art-toy" à assembler (ID: 9313, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 9313;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9313, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9313, 5, true);

-- Lampe Dragon (ID: 11813, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11813;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11813, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11813, 11, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11813, 26, false);

-- Gadgetoids™ – Robots Tech Transformables (ID: 12377, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 12377;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12377, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12377, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12377, 25, false);

-- Pack Collection Gadgetoids – Série 01 (ID: 12422, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 12422;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12422, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12422, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12422, 25, false);

-- Bonhomme Rock (ID: 7214, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7214;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7214, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7214, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7214, 29, false);

-- Pieuvre articulée réaliste (ID: 7696, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7696;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7696, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7696, 6, true);

-- Chien façon "ballon" (ID: 8638, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8638;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8638, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8638, 6, true);

-- Petit bonhomme plante (ID: 8779, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8779;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8779, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8779, 5, true);

-- Squelette de scorpion articulé (ID: 9563, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9563;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9563, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9563, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9563, 23, false);

-- Main coupée articulée (ID: 9663, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9663;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9663, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9663, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9663, 23, false);

-- Le Poussin Gore (ID: 9672, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9672;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9672, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9672, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9672, 23, false);

-- Porte-clé astronaute squelette (ID: 9685, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9685;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9685, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9685, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9685, 23, false);

-- Squelette de dragon articulé (ID: 9692, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9692;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9692, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9692, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9692, 23, false);

-- Squelette de serpent articulé (ID: 9704, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9704;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9704, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9704, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9704, 23, false);

-- Animal vaudou tricoté (ID: 9711, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9711;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9711, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9711, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9711, 23, false);

-- Crâne de dinosaure XXL (ID: 9730, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9730;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9730, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9730, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9730, 23, false);

-- Grenouille articulée XL (ID: 10787, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10787;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10787, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10787, 6, true);

-- Pochette Surprise Spoolio — 3 Créations d'Atelier (ID: 13, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 13;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13, 5, true);

-- Pochette Surprise Spoolio — 5 Créations d'Atelier (ID: 14, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 14;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (14, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (14, 5, true);

-- Pochette Surprise Spoolio — 10 Créations Collector (ID: 15, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 15;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (15, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (15, 5, true);

-- Kratch Le Skateur — Édition Atelier (ID: 16, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 16;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (16, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (16, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (16, 29, false);

-- Crank Le Cyclope — Édition Atelier (ID: 17, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 17;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (17, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (17, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (17, 29, false);

-- Dozy Le Rêveur — Édition Atelier (ID: 18, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 18;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (18, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (18, 5, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (18, 29, false);

-- Hache Runique des Anciens (ID: 11860, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11860;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11860, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11860, 6, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11860, 26, false);

-- Mini Crâne Enchanté (ID: 11898, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11898;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11898, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11898, 6, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11898, 26, false);

-- Plateau "Welcome Summer" (ID: 9267, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 9267;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9267, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9267, 11, true);

-- Serre tête personnalisable (ID: 10797, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10797;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10797, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10797, 15, true);

-- Vase Saint Valentin (ID: 11766, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11766;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11766, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11766, 11, true);

-- Médaillon NFC pour chien et chat (ID: 12673, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 12673;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12673, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12673, 16, true);

-- Porte-clé NFC SOS enfant (ID: 12713, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 12713;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12713, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12713, 16, true);

-- Kit Festival : 6 objets pour survivre à ton été (ID: 13146, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 13146;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13146, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13146, 17, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13146, 31, false);

-- Support de casque "Cristal" (ID: 8514, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8514;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8514, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8514, 12, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8514, 30, false);

-- Mini casier vestiaire (ID: 7196, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7196;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7196, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7196, 13, true);

-- Boîte canette cachette secrète (ID: 7985, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7985;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7985, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7985, 13, true);

-- Support de stylo sucette (ID: 8628, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 8628;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8628, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8628, 12, true);

-- Support de manette "Cristal" (ID: 8661, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 8661;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8661, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8661, 12, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8661, 30, false);

-- Support de téléphone "Chaise" (ID: 10083, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 10083;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10083, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10083, 12, true);

-- Pot à crayon froissé (ID: 10086, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 10086;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10086, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10086, 14, true);

-- Boite à bijoux "chaton" (ID: 11361, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11361;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11361, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11361, 13, true);

-- Carte cadeau Spoolio (ID: 11781, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11781;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11781, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11781, 18, true);

-- Support de téléphone industriel (ID: 13167, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 13167;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13167, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (13167, 12, true);

-- Tirelire Cartoon (ID: 7193, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7193;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7193, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7193, 13, true);

-- Feu de camp bougie (ID: 7355, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7355;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7355, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7355, 11, true);

-- Pot à crayon serpent (ID: 7356, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7356;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7356, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7356, 14, true);

-- Boite "Poisson Globe" (ID: 8464, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8464;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8464, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8464, 13, true);

-- Lanterne décorative "Pixel" (ID: 8633, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8633;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8633, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8633, 11, true);

-- Support de manette "Coussin" (ID: 8669, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8669;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8669, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8669, 12, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8669, 27, false);

-- Support de manette "Tentacule" (ID: 8707, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8707;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8707, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8707, 12, true);

-- Bloc porte - tube de peinture (ID: 8915, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8915;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8915, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8915, 15, true);

-- Support de téléphone - coussin (ID: 8928, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8928;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8928, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8928, 12, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8928, 27, false);

-- Oeuf de serpent / dragon (ID: 6986, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 6986;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6986, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6986, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6986, 26, false);

-- Bloc porte – morceau de fromage (ID: 8949, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8949;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8949, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8949, 15, true);

-- Alien articulé (ID: 7199, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7199;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7199, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7199, 6, true);

-- Oeuf rotatif 10cm (ID: 7200, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7200;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7200, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7200, 15, true);

-- Sarcophage / Tombeau (ID: 7201, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7201;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7201, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7201, 6, true);

-- Momie articulée (ID: 7202, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7202;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7202, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7202, 6, true);

-- Pack Momie / Sarcophage (ID: 7203, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7203;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7203, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7203, 5, true);

-- Boite cryogénique (ID: 7204, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7204;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7204, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7204, 6, true);

-- Pack Alien / Capsule (ID: 7211, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7211;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7211, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7211, 5, true);

-- Cactus à cure-dents (ID: 9303, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9303;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9303, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9303, 15, true);

-- Cacatapulte : la catapulte à caca d'imprimante (ID: 7252, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7252;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7252, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7252, 22, true);

-- Astronaute articulé (ID: 7291, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7291;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7291, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7291, 6, true);

-- Caisse pliable (ID: 7308, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7308;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7308, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7308, 6, true);

-- Vide poche pastèque (ID: 9351, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9351;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9351, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9351, 13, true);

-- Porte-encens Donut (ID: 9421, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9421;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9421, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9421, 11, true);

-- Plateau - Café Tartine (ID: 9431, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9431;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9431, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9431, 11, true);

-- Petit dragon articulé (ID: 7681, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7681;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7681, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7681, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7681, 26, false);

-- Grand dragon articulé (ID: 7682, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7682;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7682, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7682, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7682, 26, false);

-- Petite dragonette articulée (ID: 7691, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7691;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7691, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7691, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7691, 26, false);

-- Mugspot - Protège ton canapé (ID: 9463, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9463;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9463, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9463, 15, true);

-- Petit zombie articulé (ID: 7720, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7720;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7720, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7720, 7, true);

-- Pistolet à disques (ID: 7736, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7736;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7736, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7736, 22, true);

-- Squelette articulé (ID: 7765, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7765;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7765, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7765, 7, true);

-- Support smartphone ondulé (ID: 9483, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9483;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9483, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9483, 12, true);

-- Pack serpent / oeuf (ID: 8177, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8177;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8177, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8177, 5, true);

-- T-Rex articulé râleur (ID: 8313, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8313;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8313, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8313, 6, true);

-- Araignée articulée (ID: 8323, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8323;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8323, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8323, 6, true);

-- Tasse géante pour canette (ID: 9536, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9536;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9536, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9536, 15, true);

-- Kit chasse aux trésor : spécial Pâques 🐰✨ (ID: 8373, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8373;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8373, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8373, 22, true);

-- Vase "Twist" (ID: 9924, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9924;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9924, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9924, 11, true);

-- Pancarte personnalisable (ID: 10085, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10085;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10085, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10085, 14, true);

-- Vide poche "coussin" (ID: 10088, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10088;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10088, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10088, 13, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10088, 27, false);

-- Pot à crayons kraft (ID: 10735, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10735;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10735, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10735, 14, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10735, 28, false);

-- Vase effet Kraft (ID: 10748, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10748;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10748, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10748, 11, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10748, 28, false);

-- ♻️ Les Objets Recyclés Spoolio (ID: 10830, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10830;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10830, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10830, 19, true);

-- Vide-poche tête de dragon (ID: 11906, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11906;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11906, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11906, 13, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11906, 26, false);

-- Boîte grand crayon (ID: 8885, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8885;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8885, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8885, 13, true);

-- Boites animaux Kawaii (ID: 11959, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11959;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11959, 3, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11959, 13, true);

-- Fidget "Faux tissus" (ID: 2, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 2;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (2, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (2, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (2, 24, false);

-- Fidget Gyroscope Cinétique (ID: 6, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 6;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (6, 24, false);

-- Fidget Iris Mécanique (ID: 7, Statut: HERO)
DELETE FROM public.product_taxonomy WHERE product_id = 7;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7, 24, false);

-- Fidget type "Tangle" (ID: 3, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 3;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (3, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (3, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (3, 24, false);

-- Fidget rotatif XXL (ID: 4, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 4;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (4, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (4, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (4, 24, false);

-- Hand Spinner "Roue" (ID: 5, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 5;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (5, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (5, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (5, 24, false);

-- Fidget Pop-It Infini (ID: 8, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 8;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8, 24, false);

-- Fidget Bague à engrenages planétaires (ID: 9, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 9;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9, 24, false);

-- Clicker cactus (ID: 7213, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7213;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7213, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7213, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7213, 24, false);

-- Caca fidget (ID: 7314, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7314;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7314, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7314, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7314, 24, false);

-- Fidget spinner engrenages (ID: 7315, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7315;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7315, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7315, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7315, 24, false);

-- Clicker - Mug Chocolat chaud (ID: 7351, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7351;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7351, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7351, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7351, 24, false);

-- Porte-clés clavier mécanique (ID: 7769, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 7769;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7769, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7769, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7769, 24, false);

-- Clicker "Mini Trône" (ID: 10094, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 10094;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10094, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10094, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10094, 24, false);

-- Fidget boule piquante (ID: 11026, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11026;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11026, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11026, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11026, 24, false);

-- Fidget bague rotative (ID: 11035, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11035;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11035, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11035, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11035, 24, false);

-- Fidget mécanique à engrenages (ID: 11051, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11051;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11051, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11051, 10, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11051, 24, false);

-- Fidget cube articulé (ID: 11057, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11057;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11057, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11057, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11057, 24, false);

-- Fidget "Twist" (ID: 11074, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11074;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11074, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11074, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11074, 24, false);

-- Porte-clés clavier mécanique "Premium" (ID: 7933, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 7933;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7933, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7933, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (7933, 24, false);

-- Clicker citrouille d'halloween (ID: 9678, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 9678;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9678, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9678, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (9678, 23, false);

-- Le Crâne Moustachu (ID: 10010, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10010;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10010, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10010, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10010, 23, false);

-- Clicker coeur (ID: 11738, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11738;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11738, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11738, 8, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11738, 24, false);

-- Fidget coeur (ID: 11765, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11765;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11765, 2, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11765, 9, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11765, 24, false);

-- Tour à dé compacte & pliante (ID: 10937, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 10937;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10937, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10937, 20, true);

-- Tour à dé médiévale (ID: 12029, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 12029;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12029, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12029, 20, true);

-- Tour à dé - la classique (ID: 10, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 10;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10, 20, true);

-- Dragon ailé (ID: 10760, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10760;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10760, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10760, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10760, 26, false);

-- Dragon cristal (ID: 10774, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10774;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10774, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10774, 7, true);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10774, 26, false);

-- Tour à dé tronc d'arbre féerique (ID: 11, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11, 20, true);

-- Crabe articulé (ID: 10826, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 10826;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10826, 1, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (10826, 6, true);

-- Support de cartes de jeu (ID: 11795, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11795;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11795, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11795, 21, true);

-- Igloo polaire – Diorama de la banquise (ID: 11407, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11407;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11407, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11407, 22, true);

-- Pack banquise (ID: 11479, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11479;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11479, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11479, 22, true);

-- Décor forêt – diorama modulable (ID: 11583, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11583;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11583, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11583, 22, true);

-- Kit animaux de la forêt (ID: 11633, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11633;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11633, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11633, 22, true);

-- Pack chien de traineau (ID: 11684, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 11684;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11684, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11684, 22, true);

-- Pince pour cartes de jeu (ID: 11801, Statut: KEEP)
DELETE FROM public.product_taxonomy WHERE product_id = 11801;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11801, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (11801, 21, true);

-- Boîte Magique – Le petit tour qui bluffe tout le monde (ID: 12050, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 12050;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12050, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (12050, 22, true);

-- Jeu façon "Tetris" en équilibre (ID: 8482, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8482;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8482, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8482, 22, true);

-- Jeu de morpion "toilettes" (ID: 8502, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8502;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8502, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8502, 22, true);

-- Boîte pour cartes de collection (ID: 8611, Statut: REWORK)
DELETE FROM public.product_taxonomy WHERE product_id = 8611;
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8611, 4, false);
INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary) VALUES (8611, 21, true);

COMMIT;