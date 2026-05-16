import { createClient } from '@supabase/supabase-js';

function readEnvValue(key) {
  return process.env[key];
}

const supabaseUrl = readEnvValue('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
