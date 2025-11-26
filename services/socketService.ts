import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `http://${window.location.hostname}:3001`;

class SocketService {
    private socket: Socket | null = null;
    private connected: boolean = false;
    private currentConversationId: number | null = null;
    private currentCustomerName: string | null = null;

    connect() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('✅ Socket connected');

            // Re-join conversation if we were in one
            if (this.currentConversationId && this.currentCustomerName) {
                console.log('🔄 Re-joining conversation after connection...');
                this.joinAsCustomer(this.currentConversationId, this.currentCustomerName);
            }
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.currentConversationId = null;
            this.currentCustomerName = null;
        }
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
