import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/config';

// Centralized Supabase client used by OTP/reset and attendance utilities
const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Supabase URL or anon key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
