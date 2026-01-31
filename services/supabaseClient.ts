import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/config';

// Centralized Supabase client used by OTP/reset and attendance utilities
const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;
const hasSupabase = Boolean(url && anonKey);

if (!hasSupabase) {
  console.warn('Supabase URL or anon key is missing. Supabase features will be disabled.');
}

// Avoid runtime crash when env vars are missing by using a safe placeholder.
const safeUrl = hasSupabase ? url : 'http://localhost:54321';
const safeAnonKey = hasSupabase ? anonKey : 'anon-key-missing';

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
