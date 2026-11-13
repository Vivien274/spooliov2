-- Migration: Create packs and pack_components tables for Spoolio
-- Prepared for production execution upon explicit validation.
-- DO NOT RUN ON REMOTE SUPABASE WITHOUT VALIDATION.

CREATE TABLE IF NOT EXISTS public.packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    short_description TEXT,
    description TEXT,
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_quantity INT,
    display_order INT NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'bundles',
    packaging_type TEXT NOT NULL DEFAULT 'boite_kraft' CHECK (packaging_type IN ('pochette_kraft', 'boite_kraft', 'custom')),
    packaging_notes TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pack_components (
    id TEXT PRIMARY KEY,
    pack_id TEXT NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    product_id INT NOT NULL,
    variant TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_packs_slug ON public.packs(slug);
CREATE INDEX IF NOT EXISTS idx_packs_status ON public.packs(status);
CREATE INDEX IF NOT EXISTS idx_packs_category ON public.packs(category);
CREATE INDEX IF NOT EXISTS idx_pack_components_pack_id ON public.pack_components(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_components_product_id ON public.pack_components(product_id);

-- Optional: Enable Realtime if publication exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.packs;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

