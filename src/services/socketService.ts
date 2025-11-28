import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

class SocketService {
    private socket: Socket | null = null;
    private eventListeners: Map<string, Function[]> = new Map();

    connect() {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket.io connected:', this.socket?.id);
            this.reattachListeners();
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket.io disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private reattachListeners() {
        if (!this.socket) return;

        this.eventListeners.forEach((listeners, event) => {
            listeners.forEach(listener => {
                this.socket?.on(event, listener as any);
            });
        });
    }

    // Event listeners
    on(event: string, callback: Function) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);

        if (this.socket) {
            this.socket.on(event, callback as any);
        }
    }

    off(event: string, callback?: Function) {
        if (callback) {
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
            this.socket?.off(event, callback as any);
        } else {
            this.eventListeners.delete(event);
            this.socket?.off(event);
        }
    }

    // Customer methods
    joinAsCustomer(conversationId: string, customerName: string) {
        this.socket?.emit('customer:join', { conversationId, customerName });
    }

    // Agent methods
    joinAsAgent(agentId: string, agentName: string) {
        this.socket?.emit('agent:join', { agentId, agentName });
    }

    openConversation(conversationId: string) {
        this.socket?.emit('conversation:open', { conversationId });
    }

    assignConversation(conversationId: string, agentId: string, agentName: string) {
        this.socket?.emit('conversation:assign', { conversationId, agentId, agentName });
    }

    // Message methods
    sendMessage(conversationId: string, senderId: string | null, senderType: 'customer' | 'agent', message: string) {
        this.socket?.emit('message:send', {
            conversationId,
            senderId,
            senderType,
            message
        });
    }

    // Typing indicators
    startTyping(conversationId: string, userType: 'customer' | 'agent', userName: string) {
        this.socket?.emit('typing:start', { conversationId, userType, userName });
    }

    stopTyping(conversationId: string, userType: 'customer' | 'agent') {
        this.socket?.emit('typing:stop', { conversationId, userType });
    }

    // Mark messages as read
    markMessagesAsRead(conversationId: string) {
        this.socket?.emit('messages:markRead', { conversationId });
    }

    // Check connection status
    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
