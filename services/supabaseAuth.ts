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
  // Register with email/password
  signUp: async (email: string, password: string, metadata?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    birthDate?: string;
  }) => {
    const fullName = metadata?.name || `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          first_name: metadata?.firstName || '',
          last_name: metadata?.lastName || '',
          name: fullName || '',
          phone: metadata?.phone || '',
          birth_date: metadata?.birthDate || '',
          role: 'customer'
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Send password reset email
  sendResetEmail: async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || defaultResetRedirect()
    });
    if (error) throw error;
    return true;
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // Resend email verification
  resendVerification: async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: '' // Will use current user's email
    });
    if (error) throw error;
    return true;
  },

  // Get session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: defaultAuthRedirect(),
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

  // Facebook OAuth
  signInWithFacebook: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: defaultAuthRedirect(),
        flowType: 'pkce'
      }
    });
    if (error) throw error;
    return data;
  },

  // Exchange code for session (OAuth callback)
  exchangeCodeForSession: async (code: string | null) => {
    if (!code) return null;
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  },

  // Handle OAuth callback
  getOrExchangeSessionFromCallback: async (code: string | null) => {
    if (code) {
      return supabaseAuth.exchangeCodeForSession(code);
    }

    if (typeof window !== 'undefined') {
      const hasHashTokens = window.location.hash?.includes('access_token');
      if (hasHashTokens) {
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

    return supabaseAuth.getSession();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
