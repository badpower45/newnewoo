import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../src/config';

class SocketService {
    private socket: Socket | null = null;
    private connected: boolean = false;
    private connecting: boolean = false;
    private disabled: boolean = false;
    private currentConversationId: number | null = null;
    private currentCustomerName: string | null = null;
    private trackingOrderId: number | null = null;
    private driverId: number | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;

    connect() {
        // Don't try to connect if disabled or already connecting/connected
        if (this.disabled || this.socket || this.connecting) return;

        this.connecting = true;

        // ✅ Get auth token for authenticated socket connections
        const token = localStorage.getItem('token');

        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 10000,
            transports: ['polling', 'websocket'],
            // ✅ Send auth token with connection
            auth: token ? { token } : undefined
        });

        this.socket.on('connect', () => {
            this.connected = true;
            this.connecting = false;
            this.reconnectAttempts = 0;
            console.log('✅ Socket connected');

            // Re-join conversation if we were in one
            if (this.currentConversationId && this.currentCustomerName) {
                console.log('🔄 Re-joining conversation after connection...');
                this.joinAsCustomer(this.currentConversationId, this.currentCustomerName);
            }
            
            // Re-join order tracking if we were tracking
            if (this.trackingOrderId) {
                this.trackOrder(this.trackingOrderId, 0);
            }
            
            // Re-join as driver if we were connected
            if (this.driverId) {
                this.joinAsDriver(this.driverId, 0);
            }
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            this.connecting = false;
            this.reconnectAttempts++;
            
            // Disable socket after max attempts to prevent spam
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.warn('⚠️ Socket.io not available on this server. Using Supabase Realtime instead.');
                this.disabled = true;
                this.disconnect();
            } else {
                console.warn(`Socket connection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} failed`);
            }
        });
    }

    isConnected(): boolean {
        return this.connected && !this.disabled;
    }

    isDisabled(): boolean {
        return this.disabled;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.currentConversationId = null;
            this.currentCustomerName = null;
            this.trackingOrderId = null;
            this.driverId = null;
        }
    }

    // =============================================
    // Delivery Driver Events
    // =============================================
    
    // السائق يسجل دخوله
    joinAsDriver(driverId: number, userId: number) {
        this.driverId = driverId;
        this.socket?.emit('driver:join', { driverId, userId });
    }
    
    // تحديث موقع السائق
    updateDriverLocation(driverId: number, lat: number, lng: number, orderId?: number) {
        this.socket?.emit('driver:location', { driverId, lat, lng, orderId });
    }
    
    // =============================================
    // Order Tracking Events (للعميل)
    // =============================================
    
    // بدء تتبع الطلب
    trackOrder(orderId: number, userId: number) {
        this.trackingOrderId = orderId;
        this.socket?.emit('order:track', { orderId, userId });
    }
    
    // إيقاف تتبع الطلب
    untrackOrder(orderId: number, userId: number) {
        this.trackingOrderId = null;
        this.socket?.emit('order:untrack', { orderId, userId });
    }
    
    // =============================================
    // Distributor Events
    // =============================================
    
    // الموزع يسجل دخوله
    joinAsDistributor(distributorId: number, branchId: number) {
        this.socket?.emit('distributor:join', { distributorId, branchId });
    }

    // Customer joins conversation
    joinAsCustomer(conversationId: number, customerName: string) {
        this.currentConversationId = conversationId;
        this.currentCustomerName = customerName;
        this.socket?.emit('customer:join', { conversationId, customerName });
    }

    // Agent joins dashboard
    joinAsAgent(agentId: number, agentName: string) {
        this.socket?.emit('agent:join', { agentId, agentName });
    }

    // Open conversation (agent)
    openConversation(conversationId: number) {
        this.socket?.emit('conversation:open', { conversationId });
    }

    // Send message
    sendMessage(conversationId: number, senderId: number | null, senderType: 'customer' | 'agent', message: string) {
        this.socket?.emit('message:send', {
            conversationId,
            senderId,
            senderType,
            message
        });
    }

    // Typing indicators
    startTyping(conversationId: number, userType: string, userName: string) {
        this.socket?.emit('typing:start', { conversationId, userType, userName });
    }

    stopTyping(conversationId: number, userType: string) {
        this.socket?.emit('typing:stop', { conversationId, userType });
    }

    // Assign conversation
    assignConversation(conversationId: number, agentId: number, agentName: string) {
        this.socket?.emit('conversation:assign', { conversationId, agentId, agentName });
    }

    // Mark messages as read
    markMessagesAsRead(conversationId: number) {
        this.socket?.emit('messages:markRead', { conversationId });
    }

    // Event listeners
    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    isConnected() {
        return this.connected;
    }
}

export const socketService = new SocketService();
