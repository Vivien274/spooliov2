import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://twjqfwigssfkiwjvhpjy.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3anFmd2lnc3Nma2l3anZocGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0ODAzMTUsImV4cCI6MjEwMDA1NjMxNX0.iR_dLN38cIbEJm_gZenPEqkGidl4WgLdfZ94XNuCfdY';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey);
  }
  return clientInstance;
}

// Export singleton client for browser Realtime subscriptions & queries
export const supabase = getSupabaseBrowserClient();

// Server-side admin instance with full permissions
export const getSupabaseServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
};
