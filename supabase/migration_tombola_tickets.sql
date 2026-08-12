-- Migration: Create tombola_tickets table and initialize 50 tickets

CREATE TABLE IF NOT EXISTS public.tombola_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number INT UNIQUE NOT NULL CHECK (ticket_number >= 1 AND ticket_number <= 50),
    buyer_name TEXT,
    buyer_email TEXT,
    buyer_phone TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries by ticket_number and status
CREATE INDEX IF NOT EXISTS idx_tombola_tickets_number ON public.tombola_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tombola_tickets_status ON public.tombola_tickets(status);

-- Enable Realtime publication on tombola_tickets table if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tombola_tickets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tombola_tickets;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Publication might not exist or user might not have superuser privileges; safe to ignore
        NULL;
END $$;

-- Insert 50 default available tickets if table is empty
INSERT INTO public.tombola_tickets (ticket_number, status)
SELECT generate_series(1, 50), 'available'
ON CONFLICT (ticket_number) DO NOTHING;
