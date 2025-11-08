import { createClient } from '@supabase/supabase-js';

export function useSupabaseClient() {
  const config = useRuntimeConfig();
  const url = config.public.supabaseUrl as string | undefined;
  const anonKey = config.public.supabaseAnonKey as string | undefined;

  if (!url || !anonKey) {
    // eslint-disable-next-line no-console
    console.warn('[Supabase] Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(url || '', anonKey || '');
}


