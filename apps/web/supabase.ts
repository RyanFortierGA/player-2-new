import { createClient } from '@supabase/supabase-js';

const config = useRuntimeConfig();
const supabaseUrl = (config.public as any).supabaseUrl as string | undefined;
const supabaseAnonKey = (config.public as any).supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    detectSessionInUrl: false,
  },
});


