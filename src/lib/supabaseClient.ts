import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://twjqfwigssfkiwjvhpjy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientInstance) {
    if (!supabaseAnonKey) {
      console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');
    }
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

// Export singleton client for browser Realtime subscriptions & queries
export const supabase = getSupabaseBrowserClient();

// Server-side admin instance with full permissions (SERVER ONLY)
export const getSupabaseServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!serviceKey) {
    console.warn('[Supabase Server] No service role key or anon key available.');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
};
