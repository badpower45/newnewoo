import { supabase } from './supabaseClient';

const defaultResetRedirect = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/reset-password`;
  }
  return undefined;
};

const defaultAuthRedirect = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return undefined;
};

export const supabaseAuth = {
  sendEmailOtp: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
    return true;
  },
  verifyEmailOtp: async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    return data;
  },
  sendResetEmail: async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || defaultResetRedirect()
    });
    if (error) throw error;
    return true;
  },
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: defaultAuthRedirect(),
        // Use PKCE flow so we receive a `code` in the callback (matches AuthCallbackPage logic)
        flowType: 'pkce',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    if (error) throw error;
    return data;
  },
  exchangeCodeForSession: async (code: string | null) => {
    if (!code) return null;
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  },
  getOrExchangeSessionFromCallback: async (code: string | null) => {
    // Try to pull session from URL (works for PKCE code or implicit hash tokens)
    if (typeof window !== 'undefined') {
      const hasHashTokens = window.location.hash?.includes('access_token');
      if (code || hasHashTokens) {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) throw error;
        return data.session;
      }
    }
    // Fallback: use existing session if present
    return supabaseAuth.getSession();
  }
};
