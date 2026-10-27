import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://twjqfwigssfkiwjvhpjy.supabase.co';
// Clé JWT factice pour éviter tout crash au build time quand les variables d'environnement manquent
const DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_build_mode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DUMMY_KEY;

let clientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Using build-safe fallback.');
    }
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

// Lazy proxy for supabase singleton to avoid early initialization crashes and initialize on demand
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowserClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Server-side admin instance with full permissions (SERVER ONLY)
export const getSupabaseServerClient = () => {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DUMMY_KEY;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[Supabase Server] No service role key or anon key available. Using build-safe fallback.');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
};

