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
    // PKCE: code in query → exchange for session (stores it automatically)
    if (code) {
      return supabaseAuth.exchangeCodeForSession(code);
    }

    // Implicit flow (hash tokens) fallback: parse hash, set session manually
    if (typeof window !== 'undefined') {
      const hasHashTokens = window.location.hash?.includes('access_token');
      if (code || hasHashTokens) {
        const hash = window.location.hash.replace(/^#/, '');
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          return data.session;
        }
      }
    }

    // Fallback: use existing session if present
    return supabaseAuth.getSession();
  }
};
