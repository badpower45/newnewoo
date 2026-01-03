// Helper functions للتحقق من البلوك
import { supabase } from './supabaseClient';

export interface BlockCheckResult {
  isBlocked: boolean;
  reason?: string;
  expiresAt?: string;
  message?: string;
}

export const blockingService = {
  // التحقق من البلوك بالإيميل أو الموبايل
  checkIfBlocked: async (email?: string, phone?: string): Promise<BlockCheckResult> => {
    try {
      // استدعاء الـ function في الداتابيز
      const { data, error } = await supabase.rpc('is_user_blocked', {
        p_email: email || null,
        p_phone: phone || null
      });

      if (error) {
        console.error('Error checking block status:', error);
        return { isBlocked: false };
      }

      if (data === true) {
        // Get block details
        const { data: blockData, error: blockError } = await supabase
          .from('blocked_users')
          .select('reason, expires_at, notes')
          .or(`email.eq.${email || ''},phone.eq.${phone || ''}`)
          .eq('is_active', true)
          .single();

        if (!blockError && blockData) {
          const expiryMessage = blockData.expires_at 
            ? `حتى تاريخ ${new Date(blockData.expires_at).toLocaleDateString('ar-EG')}`
            : 'بشكل دائم';
          
          return {
            isBlocked: true,
            reason: blockData.reason,
            expiresAt: blockData.expires_at,
            message: `تم حظر هذا الحساب ${expiryMessage}. السبب: ${blockData.reason}`
          };
        }

        return {
          isBlocked: true,
          message: 'تم حظر هذا الحساب من استخدام النظام'
        };
      }

      return { isBlocked: false };
    } catch (error) {
      console.error('Block check error:', error);
      return { isBlocked: false };
    }
  },

  // تسجيل محاولة فاشلة
  logBlockedAttempt: async (
    email?: string,
    phone?: string,
    ipAddress?: string,
    attemptType: 'register' | 'login' = 'register',
    reason?: string
  ) => {
    try {
      await supabase.rpc('log_blocked_attempt', {
        p_email: email || null,
        p_phone: phone || null,
        p_ip: ipAddress || null,
        p_type: attemptType,
        p_reason: reason || null
      });
    } catch (error) {
      console.error('Error logging blocked attempt:', error);
    }
  },

  // الحصول على الـ IP الحالي
  getUserIP: async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  },

  // حظر مستخدم جديد (للأدمن فقط)
  blockUser: async (
    email?: string,
    phone?: string,
    reason: string = 'مخالفة شروط الاستخدام',
    blockedBy: string = 'admin',
    expiresAt?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .insert({
          email,
          phone,
          reason,
          blocked_by: blockedBy,
          expires_at: expiresAt || null,
          notes,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // إلغاء حظر مستخدم
  unblockUser: async (email?: string, phone?: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .or(`email.eq.${email || ''},phone.eq.${phone || ''}`)
        .eq('is_active', true);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  // الحصول على قائمة المستخدمين المحظورين (للأدمن)
  getBlockedUsers: async (activeOnly: boolean = true) => {
    try {
      let query = supabase
        .from('blocked_users')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  },

  // تنظيف البلوكات المنتهية
  cleanupExpiredBlocks: async () => {
    try {
      await supabase.rpc('cleanup_expired_blocks');
      return true;
    } catch (error) {
      console.error('Error cleaning up expired blocks:', error);
      return false;
    }
  }
};
