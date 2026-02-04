import { supabase, cachedQuery, debouncedSubscription, clearCache } from './supabaseClient';

export interface ChatMessage {
    id: number;
    conversation_id: number;
    sender_id: number | null;
    sender_type: 'customer' | 'agent' | 'bot';
    message: string;
    timestamp: string;
    is_read: boolean;
}

export interface ChatConversation {
    id: number;
    customer_id: number | null;
    customer_name: string;
    agent_id: number | null;
    status: 'active' | 'closed' | 'pending';
    created_at: string;
    last_message_at: string;
}

class SupabaseChatService {
    private conversationId: number | null = null;
    private messageSubscription: any = null;
    private lastSendMap = new Map<string, { content: string; sentAt: number; promise: Promise<ChatMessage | null> }>();

    // إنشاء محادثة جديدة أو الحصول على محادثة موجودة
    async getOrCreateConversation(customerId: number | null, customerName: string): Promise<ChatConversation | null> {
        try {
    // ⚡ البحث عن محادثة نشطة موجودة لهذا العميل (with caching)
            if (customerId) {
                const cacheKey = `conversation:${customerId}`;
                const result = await cachedQuery(
                    cacheKey,
                    async () => {
                        const { data: existingConv, error: findError } = await supabase
                            .from('conversations')
                            .select('id, customer_id, customer_name, agent_id, status, created_at, last_message_at')
                            .eq('customer_id', customerId)
                            .eq('status', 'active')
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single();
                        return { data: existingConv, error: findError };
                    },
                    2 * 60 * 1000 // 2 دقائق
                );

                const { data: existingConv, error: findError } = result;

                if (existingConv && !findError) {
                    this.conversationId = existingConv.id;
                    return existingConv as ChatConversation;
                }
            }

            // إنشاء محادثة جديدة
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert({
                    customer_id: customerId,
                    customer_name: customerName,
                    status: 'active',
                    last_message_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating conversation:', createError);
                return null;
            }

            this.conversationId = newConv.id;

            // ⚡ Clear cache للمحادثة الجديدة
            if (customerId) {
                clearCache(`conversation:${customerId}`);
            }

            // إضافة رسالة ترحيب تلقائية
            await this.sendMessage(newConv.id, null, 'bot', 
                "أهلاً بك في خدمة عملاء علوش ماركت! 🍊\nازاي نقدر نساعدك النهاردة؟"
            );

            return newConv as ChatConversation;
        } catch (error) {
            console.error('Error in getOrCreateConversation:', error);
            return null;
        }
    }

    // إرسال رسالة
    async sendMessage(
        conversationId: number,
        senderId: number | null,
        senderType: 'customer' | 'agent' | 'bot',
        message: string
    ): Promise<ChatMessage | null> {
        try {
            const normalized = message.trim().replace(/\s+/g, ' ').toLowerCase();
            const key = `${conversationId}:${senderType}:${senderId ?? 'null'}`;
            const now = Date.now();
            const lastSend = this.lastSendMap.get(key);
            if (lastSend && lastSend.content === normalized && now - lastSend.sentAt < 2000) {
                return lastSend.promise;
            }

            const sendPromise = (async () => {
                const { data, error } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_id: senderId,
                        sender_type: senderType,
                        message: message,
                        timestamp: new Date().toISOString(),
                        is_read: senderType === 'bot' ? true : false
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error sending message:', error);
                    return null;
                }

                // تحديث last_message_at في المحادثة
                await supabase
                    .from('conversations')
                    .update({ last_message_at: new Date().toISOString() })
                    .eq('id', conversationId);

                return data as ChatMessage;
            })();

            this.lastSendMap.set(key, { content: normalized, sentAt: now, promise: sendPromise });

            const result = await sendPromise;
            if (!result && this.lastSendMap.get(key)?.promise === sendPromise) {
                this.lastSendMap.delete(key);
            }
            return result;
        } catch (error) {
            console.error('Error in sendMessage:', error);
            return null;
        }
    }

    // ⚡ الحصول على رسائل المحادثة (optimized with pagination)
    async getMessages(conversationId: number, limit: number = 50): Promise<ChatMessage[]> {
        try {
            // ⚡ OPTIMIZED: حدد columns و limit
            const { data, error } = await supabase
                .from('messages')
                .select('id, conversation_id, sender_id, sender_type, message, timestamp, is_read')
                .eq('conversation_id', conversationId)
                .order('timestamp', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('Error fetching messages:', error);
                return [];
            }

            return data as ChatMessage[];
        } catch (error) {
            console.error('Error in getMessages:', error);
            return [];
        }
    }

    // ⚡ الاشتراك في الرسائل الجديدة باستخدام Supabase Realtime (with debouncing)
    subscribeToMessages(conversationId: number, userId: number | string | null, callback: (message: ChatMessage) => void) {
        // إلغاء الاشتراك السابق إن وجد
        this.unsubscribeFromMessages();

        const filter = userId !== null && userId !== ''
            ? `receiver_id=eq.${userId}`
            : `conversation_id=eq.${conversationId}`;

        // ⚡ OPTIMIZED: Debounced callback لتقليل عدد الـ updates
        const debouncedCallback = debouncedSubscription(
            `messages:${conversationId}`,
            callback,
            300 // 300ms debounce
        );

        this.messageSubscription = supabase
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter
                }, 
                (payload) => {
                    debouncedCallback(payload.new as ChatMessage);
                }
            )
            .subscribe();

        return this.messageSubscription;
    }

    // إلغاء الاشتراك
    unsubscribeFromMessages() {
        if (this.messageSubscription) {
            supabase.removeChannel(this.messageSubscription);
            this.messageSubscription = null;
        }
    }

    // تحديث حالة قراءة الرسائل
    async markMessagesAsRead(conversationId: number) {
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('sender_type', 'agent');
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    // إغلاق المحادثة
    async closeConversation(conversationId: number) {
        try {
            await supabase
                .from('conversations')
                .update({ status: 'closed' })
                .eq('id', conversationId);
        } catch (error) {
            console.error('Error closing conversation:', error);
        }
    }

    // الحصول على جميع المحادثات (للأدمن)
    async getAllConversations(status?: string): Promise<ChatConversation[]> {
        try {
            let query = supabase
                .from('conversations')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching conversations:', error);
                return [];
            }

            return data as ChatConversation[];
        } catch (error) {
            console.error('Error in getAllConversations:', error);
            return [];
        }
    }

    // تخصيص محادثة لموظف
    async assignConversation(conversationId: number, agentId: number) {
        try {
            const { error } = await supabase
                .from('conversations')
                .update({ agent_id: agentId })
                .eq('id', conversationId);

            if (error) {
                console.error('Error assigning conversation:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in assignConversation:', error);
            return false;
        }
    }

    // البحث في الرسائل
    async searchMessages(query: string): Promise<ChatMessage[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .ilike('message', `%${query}%`)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error searching messages:', error);
                return [];
            }

            return data as ChatMessage[];
        } catch (error) {
            console.error('Error in searchMessages:', error);
            return [];
        }
    }

    // الحصول على عدد المحادثات النشطة
    async getActiveConversationsCount(): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            if (error) {
                console.error('Error counting conversations:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Error in getActiveConversationsCount:', error);
            return 0;
        }
    }
}

export const supabaseChatService = new SupabaseChatService();
