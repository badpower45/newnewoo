import { query } from './database.js';

let io;

export const initializeSocket = (socketServer) => {
    io = socketServer;

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Customer joins chat
        socket.on('customer:join', ({ conversationId, customerName }) => {
            socket.join(`conversation_${conversationId}`);
            socket.conversationId = conversationId;
            console.log(`Customer ${customerName} joined conversation ${conversationId}`);
        });

        // Agent joins dashboard
        socket.on('agent:join', ({ agentId, agentName }) => {
            socket.join('agents');
            socket.agentId = agentId;
            socket.agentName = agentName;
            console.log(`Agent ${agentName} joined dashboard`);

            // Notify all agents of new agent online
            io.to('agents').emit('agent:online', { agentId, agentName });
        });

        // Agent opens specific conversation
        socket.on('conversation:open', ({ conversationId }) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`Agent ${socket.agentName} opened conversation ${conversationId}`);
        });

        // Send message
        socket.on('message:send', async ({ conversationId, senderId, senderType, message }) => {
            try {
                // Save to database
                const { rows } = await query(
                    `INSERT INTO messages (conversation_id, sender_id, sender_type, message) VALUES ($1, $2, $3, $4) RETURNING id, timestamp`,
                    [conversationId, senderId, senderType, message]
                );

                const messageData = {
                    id: rows[0].id,
                    conversationId,
                    senderId,
                    senderType,
                    message,
                    timestamp: rows[0].timestamp,
                    isRead: false
                };

                // Update conversation last message time
                await query(
                    `UPDATE conversations SET last_message_at = $1 WHERE id = $2`,
                    [rows[0].timestamp, conversationId]
                );

                // Broadcast to conversation room
                io.to(`conversation_${conversationId}`).emit('message:new', messageData);

                // If customer message, notify all agents
                if (senderType === 'customer') {
                    io.to('agents').emit('message:notification', {
                        conversationId,
                        message: messageData
                    });
                }
            } catch (error) {
                console.error('Error in message:send:', error);
            }
        });

        // Typing indicators
        socket.on('typing:start', ({ conversationId, userType, userName }) => {
            socket.to(`conversation_${conversationId}`).emit('typing:indicator', {
                userType,
                userName,
                isTyping: true
            });
        });

        socket.on('typing:stop', ({ conversationId, userType }) => {
            socket.to(`conversation_${conversationId}`).emit('typing:indicator', {
                userType,
                isTyping: false
            });
        });

        // Assign conversation to agent
        socket.on('conversation:assign', async ({ conversationId, agentId, agentName }) => {
            try {
                await query(
                    `UPDATE conversations SET agent_id = $1 WHERE id = $2`,
                    [agentId, conversationId]
                );
                io.to('agents').emit('conversation:assigned', {
                    conversationId,
                    agentId,
                    agentName
                });
            } catch (error) {
                console.error('Error assigning conversation:', error);
            }
        });

        // Mark messages as read
        socket.on('messages:markRead', async ({ conversationId }) => {
            try {
                await query(
                    `UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_type = 'customer'`,
                    [conversationId]
                );
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);
            if (socket.agentId) {
                io.to('agents').emit('agent:offline', {
                    agentId: socket.agentId,
                    agentName: socket.agentName
                });
            }
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
