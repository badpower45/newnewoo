import { supabase } from './supabaseClient';

/**
 * Supabase Blocking Service
 * Integrates with Supabase functions and RLS policies
 */

export interface BlockStatus {
  isBlocked: boolean;
  blockReason?: string;
  blockedAt?: string;
  bannedUntil?: string;
  banType?: 'permanent' | 'temporary' | 'expired';
  daysRemaining?: number;
}

export interface BlockedAttempt {
  userEmail: string;
  userId?: number;
  ipAddress?: string;
  attemptType: 'login' | 'register' | 'api_call';
  blockReason?: string;
  userAgent?: string;
}

export const supabaseBlockingService = {
  /**
   * Check if user is blocked by email
   */
  checkIfBlocked: async (email: string): Promise<BlockStatus> => {
    try {
      const { data, error } = await supabase.rpc('is_user_blocked', {
        user_email: email
      });

      if (error) {
        console.error('❌ Error checking block status:', error);
        return { isBlocked: false };
      }

      if (!data || data.length === 0) {
        return { isBlocked: false };
      }

      const blockInfo = data[0];
      const isBlocked = blockInfo.is_blocked === true;
      const bannedUntil = blockInfo.banned_until;
      
      // Check if temporary ban expired
      if (isBlocked && bannedUntil) {
        const expiryDate = new Date(bannedUntil);
        const now = new Date();
        
        if (expiryDate <= now) {
          // Ban expired
          return {
            isBlocked: false,
            banType: 'expired'
          };
        }
        
        // Calculate remaining days
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          isBlocked: true,
          blockReason: blockInfo.block_reason,
          blockedAt: blockInfo.blocked_at,
          bannedUntil: blockInfo.banned_until,
          banType: 'temporary',
          daysRemaining
        };
      }

      return {
        isBlocked,
        blockReason: blockInfo.block_reason,
        blockedAt: blockInfo.blocked_at,
        bannedUntil: blockInfo.banned_until,
        banType: bannedUntil ? 'temporary' : 'permanent'
      };
    } catch (err) {
      console.error('❌ Error in checkIfBlocked:', err);
      return { isBlocked: false };
    }
  },

  /**
   * Block user by email (Admin only)
   */
  blockUser: async (
    email: string,
    reason: string,
    adminId?: number,
    banDurationDays?: number
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('block_user_by_email', {
        target_email: email,
        reason: reason,
        admin_id: adminId || null,
        ban_duration_days: banDurationDays || null
      });

      if (error) {
        console.error('❌ Error blocking user:', error);
        return {
          success: false,
          message: 'Failed to block user',
          error: error.message
        };
      }

      return data as { success: boolean; message: string };
    } catch (err: any) {
      console.error('❌ Error in blockUser:', err);
      return {
        success: false,
        message: 'Failed to block user',
        error: err.message
      };
    }
  },

  /**
   * Unblock user by email
   */
  unblockUser: async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('unblock_user_by_email', {
        target_email: email
      });

      if (error) {
        console.error('❌ Error unblocking user:', error);
        return {
          success: false,
          message: 'Failed to unblock user',
          error: error.message
        };
      }

      return data as { success: boolean; message: string };
    } catch (err: any) {
      console.error('❌ Error in unblockUser:', err);
      return {
        success: false,
        message: 'Failed to unblock user',
        error: err.message
      };
    }
  },

  /**
   * Log blocked attempt
   */
  logBlockedAttempt: async (attempt: BlockedAttempt): Promise<{ success: boolean }> => {
    try {
      const { data, error } = await supabase.rpc('log_blocked_attempt', {
        p_user_email: attempt.userEmail,
        p_user_id: attempt.userId || null,
        p_ip_address: attempt.ipAddress || null,
        p_attempt_type: attempt.attemptType,
        p_block_reason: attempt.blockReason || null,
        p_user_agent: attempt.userAgent || navigator.userAgent
      });

      if (error) {
        console.error('❌ Error logging blocked attempt:', error);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('❌ Error in logBlockedAttempt:', err);
      return { success: false };
    }
  },

  /**
   * Get blocked users report
   */
  getBlockedUsersReport: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('blocked_users_report')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching blocked users report:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('❌ Error in getBlockedUsersReport:', err);
      return [];
    }
  },

  /**
   * Get blocked attempts history
   */
  getBlockedAttempts: async (email?: string, limit: number = 50): Promise<any[]> => {
    try {
      let query = supabase
        .from('blocked_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(limit);

      if (email) {
        query = query.eq('user_email', email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching blocked attempts:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('❌ Error in getBlockedAttempts:', err);
      return [];
    }
  },

  /**
   * Auto-unblock expired temporary bans
   */
  autoUnblockExpired: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const { data, error } = await supabase.rpc('auto_unblock_expired_bans');

      if (error) {
        console.error('❌ Error auto-unblocking:', error);
        return { success: false, count: 0 };
      }

      return { success: true, count: data as number };
    } catch (err) {
      console.error('❌ Error in autoUnblockExpired:', err);
      return { success: false, count: 0 };
    }
  },

  /**
   * Get user IP address
   */
  getUserIP: async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (err) {
      console.error('❌ Error getting IP:', err);
      return null;
    }
  }
};

export default supabaseBlockingService;
