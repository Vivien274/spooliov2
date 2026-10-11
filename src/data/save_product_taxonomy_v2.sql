-- =============================================================================
-- SPOOLIO V2.1 — TRANSACTION ATOMIQUE DE SAUVEGARDE PRODUCT_TAXONOMY
-- =============================================================================
-- Ce script prépare la fonction PostgreSQL RPC `save_product_taxonomy_v2`
-- pour garantir l'atomicité ACID complète lors de la sauvegarde d'un produit.
--
-- AVANTAGES :
-- 1. Atomicité : La suppression des anciennes relations et l'insertion des
--    nouvelles s'exécutent dans une seule et même transaction PostgreSQL.
-- 2. Rollback automatique : Si une insertion échoue, la suppression est
--    automatiquement annulée. Aucun produit n'est laissé orphelin.
-- 3. Validation au niveau base : Vérifie que l'univers existe et que la
--    catégorie principale appartient bien à l'univers via son parent_id.
-- 4. Sécurité : Ne touche JAMAIS aux anciennes tables (Category, WooCommerce).
--
-- STATUT : Préparé côté code. NE PAS EXÉCUTER PENDANT LA TÂCHE LOCALE.
-- À exécuter dans la console SQL Supabase lors de l'activation en production.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.save_product_taxonomy_v2(
  p_product_id INT,
  p_universe_id INT,
  p_category_id INT,
  p_collection_ids INT[] DEFAULT '{}',
  p_tag_ids INT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inserted_count INT := 0;
  v_cat_parent INT;
BEGIN
  -- 1. Validation de l'univers si fourni
  IF p_universe_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.catalog_taxonomy
      WHERE id = p_universe_id AND type = 'universe' AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Univers invalide ou inactif (id: %)', p_universe_id;
    END IF;
  END IF;

  -- 2. Validation de la catégorie principale si fournie
  IF p_category_id IS NOT NULL THEN
    SELECT parent_id INTO v_cat_parent
    FROM public.catalog_taxonomy
    WHERE id = p_category_id AND type = 'category' AND is_active = true;

    IF v_cat_parent IS NULL THEN
      RAISE EXCEPTION 'Catégorie principale invalide ou inactive (id: %)', p_category_id;
    END IF;

    -- Cohérence stricte catégorie -> univers
    IF p_universe_id IS NOT NULL AND v_cat_parent != p_universe_id THEN
      RAISE EXCEPTION 'Incohérence: la catégorie % n''appartient pas à l''univers %', p_category_id, p_universe_id;
    END IF;
  END IF;

  -- 3. Suppression atomique des relations V2.1 du produit concerné
  -- (Ne touche à AUCUNE autre table que product_taxonomy)
  DELETE FROM public.product_taxonomy
  WHERE product_id = p_product_id;

  -- 4. Insertion de la relation Univers (is_primary = false)
  IF p_universe_id IS NOT NULL THEN
    INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary)
    VALUES (p_product_id, p_universe_id, false);
    v_inserted_count := v_inserted_count + 1;
  END IF;

  -- 5. Insertion de la relation Catégorie Principale (is_primary = true)
  IF p_category_id IS NOT NULL THEN
    INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary)
    VALUES (p_product_id, p_category_id, true);
    v_inserted_count := v_inserted_count + 1;
  END IF;

  -- 6. Insertion des collections associées (is_primary = false)
  IF p_collection_ids IS NOT NULL AND array_length(p_collection_ids, 1) > 0 THEN
    INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary)
    SELECT p_product_id, unnest(p_collection_ids), false;
    v_inserted_count := v_inserted_count + array_length(p_collection_ids, 1);
  END IF;

  -- 7. Insertion des tags associés (is_primary = false)
  IF p_tag_ids IS NOT NULL AND array_length(p_tag_ids, 1) > 0 THEN
    INSERT INTO public.product_taxonomy (product_id, taxonomy_id, is_primary)
    SELECT p_product_id, unnest(p_tag_ids), false;
    v_inserted_count := v_inserted_count + array_length(p_tag_ids, 1);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'relations_count', v_inserted_count,
    'universe_id', p_universe_id,
    'category_id', p_category_id
  );
END;
$$;
