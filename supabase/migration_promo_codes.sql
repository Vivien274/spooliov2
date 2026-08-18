-- Migration: Create promo_codes table for Spoolio cart promotion codes

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_order_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant lookup by uppercase code and status
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);

-- Enable Realtime publication on promo_codes if supabase_realtime exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'promo_codes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Insert default starter promo codes if table is empty
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES
    ('SPIN10', 'Remise de 10% gagnée à la roue de la loterie', 'percentage', 10, 0, true),
    ('FLASH20', 'Offre Flash 20% de réduction immédiate', 'percentage', 20, 15, true),
    ('BIENVENUE10', 'Code de bienvenue nouveaux clients (-10%)', 'percentage', 10, 10, true),
    ('SPOOLIO5', '5€ de réduction dès 25€ d''achat', 'fixed', 5, 25, true),
    ('FREESHIP', 'Frais de livraison offerts', 'free_shipping', 0, 15, true)
ON CONFLICT (code) DO NOTHING;
